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
            "formation", "cours", "session", "vraiment", "assez", "chaque");

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
    // ANALYSE LOCALE : sentiment par lexique + themes par frequence de mots.
    // Aucun appel externe -> fonctionne partout, sans cle ni reseau.
    // ---------------------------------------------------------------------
    private ModuleInsightsResponse analyzeLocally(List<String> comments) {
        int positive = 0, negative = 0, neutral = 0;
        Map<String, Integer> wordCounts = new HashMap<>();

        for (String comment : comments) {
            int score = 0;
            for (String token : tokenize(comment)) {
                if (POSITIVE.contains(token)) score++;
                if (NEGATIVE.contains(token)) score--;
                if (token.length() >= 4 && !STOPWORDS.contains(token)
                        && !POSITIVE.contains(token) && !NEGATIVE.contains(token)) {
                    wordCounts.merge(token, 1, Integer::sum);
                }
            }
            if (score > 0) positive++;
            else if (score < 0) negative++;
            else neutral++;
        }

        List<String> themes = wordCounts.entrySet().stream()
                .filter(e -> e.getValue() >= 2)                 // au moins 2 occurrences
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(5)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

        String summary = buildSummary(comments.size(), positive, neutral, negative, themes);
        return new ModuleInsightsResponse(true, comments.size(), summary,
                new SentimentBreakdown(positive, neutral, negative), themes);
    }

    private String buildSummary(int total, int pos, int neu, int neg, List<String> themes) {
        String tone;
        if (pos >= neg * 2 && pos > neu) tone = "des retours majoritairement positifs";
        else if (neg >= pos * 2 && neg > neu) tone = "des retours plutot critiques";
        else if (neu >= pos && neu >= neg) tone = "des retours nuances (avis partages)";
        else tone = "des retours globalement equilibres";

        StringBuilder sb = new StringBuilder();
        sb.append(total).append(" commentaire").append(total > 1 ? "s" : "")
                .append(" analyse").append(total > 1 ? "s" : "")
                .append(" : ").append(tone).append(" (")
                .append(pos).append(" positif").append(pos > 1 ? "s" : "").append(", ")
                .append(neu).append(" neutre").append(neu > 1 ? "s" : "").append(", ")
                .append(neg).append(" negatif").append(neg > 1 ? "s" : "").append(").");
        if (!themes.isEmpty()) {
            sb.append(" Themes recurrents : ").append(String.join(", ", themes)).append(".");
        }
        return sb.toString();
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