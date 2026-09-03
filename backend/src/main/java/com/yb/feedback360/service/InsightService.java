package com.yb.feedback360.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.dto.response.ModuleInsightsResponse;
import com.yb.feedback360.dto.response.ModuleOptionResponse;
import com.yb.feedback360.dto.response.SentimentBreakdown;
import com.yb.feedback360.repository.FeedbackRepository;
import com.yb.feedback360.repository.ModuleFormationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InsightService {

    // ObjectMapper "maison" (Jackson 2) juste pour parser la reponse JSON de l'IA.
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private static final String SYSTEM_PROMPT = """
        Tu es un analyste RH. On te fournit des commentaires de collaborateurs sur un module de formation.
        Reponds UNIQUEMENT avec un objet JSON valide (aucun texte autour) de la forme :
        {"summary":"<resume en 2-3 phrases des points forts et faibles recurrents, en francais>",
         "sentiment":{"positive":<entier>,"neutral":<entier>,"negative":<entier>},
         "themes":["<theme court>","..."]}
        Le total positive+neutral+negative doit egaler le nombre de commentaires fournis. Maximum 5 themes.
        """;

    // Lexiques FR (accents retires pour matcher le texte normalise).
    private static final Set<String> POSITIVE = Set.of(
            "clair", "claire", "excellent", "excellente", "super", "bien", "utile", "interessant",
            "interessante", "pertinent", "pertinente", "efficace", "bon", "bonne", "apprecie",
            "appreciee", "top", "parfait", "parfaite", "genial", "geniale", "enrichissant",
            "enrichissante", "complet", "complete", "pedagogue", "pedagogique", "qualite",
            "recommande", "satisfait", "satisfaite", "agreable", "dynamique", "motivant",
            "passionnant", "structure", "structuree", "concret", "concrete", "pratique", "fluide");

    private static final Set<String> NEGATIVE = Set.of(
            "trop", "ennuyeux", "ennuyeuse", "confus", "confuse", "difficile", "complique",
            "compliquee", "manque", "insuffisant", "insuffisante", "decevant", "decevante",
            "decu", "decue", "mauvais", "mauvaise", "faible", "lent", "lente", "inutile",
            "dommage", "probleme", "bug", "incomprehensible", "superficiel", "superficielle",
            "brouillon", "charge", "chargee", "dense", "fatigant", "fatigante", "rapide", "court");

    private static final Set<String> STOPWORDS = Set.of(
            "le", "la", "les", "un", "une", "des", "de", "du", "et", "ou", "au", "aux", "en", "dans",
            "sur", "pour", "par", "avec", "sans", "ce", "cet", "cette", "ces", "qui", "que", "quoi",
            "dont", "est", "sont", "etait", "ete", "tres", "plus", "moins", "mal", "son", "sa",
            "ses", "mon", "ma", "mes", "ton", "ta", "tes", "leur", "leurs", "nous", "vous", "ils",
            "elles", "elle", "cela", "fait", "faire", "etre", "avoir", "mais", "donc", "car", "aussi",
            "comme", "tout", "toute", "tous", "toutes", "meme", "peu", "ici", "module",
            "formation", "cours", "session", "vraiment", "assez", "chaque", "cetait", "etaient");

    private final FeedbackRepository feedbackRepository;
    private final ModuleFormationRepository moduleFormationRepository;
    private final RestClient rest;
    private final String apiKey;
    private final String model;
    private final String completionsUrl;

    public InsightService(FeedbackRepository feedbackRepository,
                          ModuleFormationRepository moduleFormationRepository,
                          @Value("${groq.api-key:}") String apiKey,
                          @Value("${groq.model:openai/gpt-oss-20b}") String model,
                          @Value("${groq.base-url:https://api.groq.com/openai/v1}") String baseUrl) {
        this.feedbackRepository = feedbackRepository;
        this.moduleFormationRepository = moduleFormationRepository;
        this.apiKey = apiKey;
        this.model = model;
        String base = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        this.completionsUrl = base + "/chat/completions";
        this.rest = RestClient.builder().build();
    }

    public List<ModuleOptionResponse> moduleOptions() {
        return moduleFormationRepository.findAll().stream()
                .map(m -> new ModuleOptionResponse(m.getModuleId(), m.getTitle()))
                .sorted(Comparator.comparing(ModuleOptionResponse::title, String.CASE_INSENSITIVE_ORDER))
                .toList();
    }

    public ModuleInsightsResponse forModule(Long moduleId) {
        List<String> comments = feedbackRepository.findCommentsByModule(moduleId, FeedbackStatus.SUBMITTED);
        if (comments.isEmpty()) {
            return new ModuleInsightsResponse(true, 0, "Aucun commentaire soumis pour ce module.",
                    new SentimentBreakdown(0, 0, 0), List.of());
        }
        // Si une cle Groq est configuree ET joignable, on tente l'IA ; sinon analyse locale.
        if (apiKey != null && !apiKey.isBlank()) {
            try {
                return callGroq(comments);
            } catch (RuntimeException e) {
                System.out.println("[INSIGHTS] Groq indisponible, bascule analyse locale : " + e.getMessage());
            }
        }
        return analyzeLocally(comments);
    }

    // ---------------------------------------------------------------------
    // ANALYSE LOCALE : sentiment par lexique + themes forts/faibles par frequence.
    // Aucun appel externe -> fonctionne partout, sans cle ni reseau.
    // ---------------------------------------------------------------------
    private ModuleInsightsResponse analyzeLocally(List<String> comments) {
        int positive = 0, negative = 0, neutral = 0;
        Map<String, Integer> allWords = new HashMap<>();
        Map<String, Integer> posWords = new HashMap<>();
        Map<String, Integer> negWords = new HashMap<>();

        for (String comment : comments) {
            int score = 0;
            List<String> meaningful = new ArrayList<>();
            for (String token : tokenize(comment)) {
                if (POSITIVE.contains(token)) score++;
                else if (NEGATIVE.contains(token)) score--;
                else if (token.length() >= 4 && !STOPWORDS.contains(token)) {
                    meaningful.add(token);
                    allWords.merge(token, 1, Integer::sum);
                }
            }
            Map<String, Integer> bucket = score > 0 ? posWords : (score < 0 ? negWords : null);
            if (bucket != null) {
                for (String w : meaningful) bucket.merge(w, 1, Integer::sum);
            }
            if (score > 0) positive++;
            else if (score < 0) negative++;
            else neutral++;
        }

        List<String> themes = topWords(allWords, 5, 2);
        if (themes.isEmpty()) themes = topWords(allWords, 5, 1);
        List<String> strengths = topWords(posWords, 3, 1);
        List<String> improvements = topWords(negWords, 3, 1);

        String summary = buildSummary(comments.size(), positive, neutral, negative, strengths, improvements);
        return new ModuleInsightsResponse(true, comments.size(), summary,
                new SentimentBreakdown(positive, neutral, negative), themes);
    }

    private List<String> topWords(Map<String, Integer> counts, int limit, int min) {
        return counts.entrySet().stream()
                .filter(e -> e.getValue() >= min)
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    private String buildSummary(int total, int pos, int neu, int neg,
                                List<String> strengths, List<String> improvements) {
        int posPct = pct(pos, total), neuPct = pct(neu, total), negPct = pct(neg, total);

        String tone;
        if (pos >= neg * 2 && pos >= neu) tone = "une perception globalement positive";
        else if (neg >= pos * 2 && neg >= neu) tone = "une perception plutôt critique";
        else if (neu > pos && neu > neg) tone = "des avis partagés, sans tendance nette";
        else tone = "des retours contrastés";

        StringBuilder sb = new StringBuilder();
        sb.append("Sur ").append(total).append(" commentaire").append(total > 1 ? "s" : "")
                .append(" analysé").append(total > 1 ? "s" : "")
                .append(", les retours traduisent ").append(tone)
                .append(" (").append(posPct).append(" % positifs, ")
                .append(neuPct).append(" % neutres, ").append(negPct).append(" % négatifs). ");

        if (!strengths.isEmpty()) {
            sb.append("Les collaborateurs saluent particulièrement ")
                    .append(joinNatural(strengths)).append(". ");
        } else if (pos > 0) {
            sb.append("Une partie des collaborateurs exprime sa satisfaction. ");
        }

        if (!improvements.isEmpty()) {
            sb.append("À l'inverse, plusieurs retours pointent ")
                    .append(joinNatural(improvements))
                    .append(improvements.size() > 1 ? " comme axes d'amélioration. " : " comme axe d'amélioration. ");
        } else if (neg > 0) {
            sb.append("Quelques avis plus réservés méritent une attention particulière. ");
        }

        if (pos >= neg * 2 && pos >= neu) {
            sb.append("Dans l'ensemble, le module est bien reçu et peut être maintenu en l'état.");
        } else if (neg >= pos) {
            sb.append("Il serait pertinent de revoir ces points pour renforcer la satisfaction des participants.");
        } else {
            sb.append("Un suivi ciblé sur ces thèmes permettrait de consolider l'appréciation du module.");
        }
        return sb.toString();
    }

    private int pct(int part, int total) {
        return total == 0 ? 0 : Math.round(part * 100f / total);
    }

    private String joinNatural(List<String> items) {
        if (items.size() == 1) return items.get(0);
        return String.join(", ", items.subList(0, items.size() - 1)) + " et " + items.get(items.size() - 1);
    }

    // Minuscule + retrait des accents + split sur tout ce qui n'est pas lettre.
    private List<String> tokenize(String text) {
        String normalized = Normalizer.normalize(text.toLowerCase(Locale.FRENCH), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return Arrays.stream(normalized.split("[^a-z]+"))
                .filter(t -> !t.isBlank())
                .toList();
    }

    // ---------------------------------------------------------------------
    // Appel Groq (utilise seulement si une cle est presente et le reseau ouvert).
    // ---------------------------------------------------------------------
    @SuppressWarnings("unchecked")
    private ModuleInsightsResponse callGroq(List<String> comments) {
        String userContent = "Commentaires (" + comments.size() + ") :\n- " + String.join("\n- ", comments);

        Map<String, Object> body = Map.of(
                "model", model,
                "temperature", 0.3,
                "response_format", Map.of("type", "json_object"),
                "messages", List.of(
                        Map.of("role", "system", "content", SYSTEM_PROMPT),
                        Map.of("role", "user", "content", userContent)));

        String payload;
        try {
            payload = MAPPER.writeValueAsString(body);
        } catch (Exception e) {
            throw new RuntimeException("Serialisation requete Groq echouee", e);
        }

        ResponseEntity<String> response;
        try {
            response = rest.post()
                    .uri(completionsUrl)
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .body(payload)
                    .retrieve()
                    .toEntity(String.class);
        } catch (Exception e) {
            throw new RuntimeException("Appel Groq echoue (" + completionsUrl + ") : " + e.getMessage(), e);
        }

        String raw = response.getBody();
        if (raw == null || raw.isBlank()) {
            throw new RuntimeException("Reponse Groq vide (status " + response.getStatusCode() + ")");
        }

        Map<String, Object> resp;
        try {
            resp = MAPPER.readValue(raw, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Reponse Groq illisible : " + raw, e);
        }

        List<Map<String, Object>> choices = (List<Map<String, Object>>) resp.get("choices");
        String content = (String) ((Map<String, Object>) choices.get(0).get("message")).get("content");

        Map<String, Object> parsed;
        try {
            parsed = MAPPER.readValue(content, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Reponse IA illisible", e);
        }

        Map<String, Object> s = (Map<String, Object>) parsed.getOrDefault("sentiment", Map.of());
        SentimentBreakdown sentiment = new SentimentBreakdown(
                toInt(s.get("positive")), toInt(s.get("neutral")), toInt(s.get("negative")));
        List<String> themes = (List<String>) parsed.getOrDefault("themes", List.of());

        return new ModuleInsightsResponse(true, comments.size(),
                String.valueOf(parsed.getOrDefault("summary", "")), sentiment, themes);
    }

    private int toInt(Object o) {
        return o instanceof Number n ? n.intValue() : 0;
    }
}