package com.yb.feedback360.controller;

import com.yb.feedback360.config.SecurityConfig;
import com.yb.feedback360.dto.response.FeedbackDetailResponse;
import com.yb.feedback360.service.FeedbackService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Web-layer tests for FeedbackController.submit.
 *
 * @WebMvcTest starts ONLY the web slice (this controller + JSON + validation +
 * security), not the whole app and no database. The service is replaced by a
 * @MockitoBean so we test the HTTP contract in isolation:
 *   - is the request authenticated?
 *   - does @Valid reject a bad body with 400?
 *   - is the JWT subject passed to the service as the userId?
 *
 * We @Import the real SecurityConfig so the actual security rules apply. That config
 * needs a JwtDecoder bean and the webhook api-key property, which we supply below.
 */
@WebMvcTest(FeedbackController.class)
@Import(SecurityConfig.class)
@TestPropertySource(properties = "feedback360.webhook.api-key=test-key")
class FeedbackControllerTest {

    @Autowired
    MockMvc mockMvc; // lets us fire fake HTTP requests without a running server

    @MockitoBean
    FeedbackService feedbackService; // faked: we assert how the controller calls it

    @MockitoBean
    JwtDecoder jwtDecoder; // required by SecurityConfig's resource server; unused thanks to jwt() below

    /**
     * Valid body + authenticated user -> 200, and the JWT subject (501) is what the
     * controller passes to the service as userId.
     */
    @Test
    void submit_returns200_andPassesJwtSubjectAsUserId() throws Exception {
        FeedbackDetailResponse detail =
                new FeedbackDetailResponse(1L, "SUBMITTED", "Java Basics", Instant.now(), 4.5, "Great");
        // stub: when called with userId 501 and feedbackId 1, return our detail
        when(feedbackService.submitFeedback(eq(501L), eq(1L), any())).thenReturn(detail);

        mockMvc.perform(post("/api/feedbacks/1/submit")
                        // jwt() injects a fake authenticated token with subject "501"
                        .with(jwt().jwt(j -> j.subject("501")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"globalScore\":4.5,\"comment\":\"Great\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUBMITTED"));
    }

    /**
     * Missing globalScore -> @Valid fails -> 400 Bad Request (handled before the
     * service is ever called).
     */
    @Test
    void submit_returns400_whenScoreMissing() throws Exception {
        mockMvc.perform(post("/api/feedbacks/1/submit")
                        .with(jwt().jwt(j -> j.subject("501")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"comment\":\"no score\"}"))
                .andExpect(status().isBadRequest());
    }

    /**
     * No token at all -> the resource server rejects it with 401 Unauthorized.
     */
    @Test
    void submit_returns401_whenNoToken() throws Exception {
        mockMvc.perform(post("/api/feedbacks/1/submit")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"globalScore\":4.5,\"comment\":\"x\"}"))
                .andExpect(status().isUnauthorized());
    }
}
