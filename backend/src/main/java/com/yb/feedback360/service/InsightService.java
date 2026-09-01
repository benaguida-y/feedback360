package com.yb.feedback360.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yb.feedback360.domain.enums.FeedbackStatus;
import com.yb.feedback360.dto.response.ModuleInsightsResponse;
import com.yb.feedback360.dto.response.ModuleOptionResponse;
import com.yb.feedback360.dto.response.SentimentBreakdown;
import com.yb.feedback360.repository.FeedbackRepository;
import com.yb.feedback360.repository.ModuleFormationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

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

    private final FeedbackRepository feedbackRepository;
    private final ModuleFormationRepository moduleFormationRepository;
    private final RestClient rest;
    private final String apiKey;
    private final String model;

    public InsightService(FeedbackRepository feedbackRepository,
                          ModuleFormationRepository moduleFormationRepository,
                          @Value("${groq.api-key:}") String apiKey,
                          @Value("${groq.model:llama-3.3-70b-versatile}") String model,
                          @Value("${groq.base-url:https://api.groq.com/openai/v1}") String baseUrl) {
        this.feedbackRepository = feedbackRepository;
        this.moduleFormationRepository = moduleFormationRepository;
        this.apiKey = apiKey;
        this.model = model;
        this.rest = RestClient.builder().baseUrl(baseUrl).build();
    }

    // Liste des modules (id + titre) pour le selecteur de la page.
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
        if (apiKey == null || apiKey.isBlank()) {
            return mock(comments);              // pas de cle -> synthese simulee
        }
        try {
            return callGroq(comments);
        } catch (RuntimeException e) {
            // Isolation : si l'IA echoue (rate limit, reseau...), on ne casse rien.
            return new ModuleInsightsResponse(false, comments.size(), null, null, List.of());
        }
    }

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

        Map<String, Object> resp = rest.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + apiKey)
                .body(body)
                .retrieve()
                .body(Map.class);

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

    // Synthese simulee quand aucune cle Groq n'est configuree (demo/offline).
    private ModuleInsightsResponse mock(List<String> comments) {
        int n = comments.size();
        int pos = (int) Math.round(n * 0.6);
        int neg = (int) Math.round(n * 0.15);
        return new ModuleInsightsResponse(true, n,
                "(Démo) Retours globalement positifs : contenu clair et formateur apprécié ; "
                        + "quelques remarques sur le rythme et le besoin de plus d'exemples pratiques.",
                new SentimentBreakdown(pos, n - pos - neg, neg),
                List.of("Contenu clair", "Rythme", "Plus d'exemples", "Bon formateur"));
    }
}