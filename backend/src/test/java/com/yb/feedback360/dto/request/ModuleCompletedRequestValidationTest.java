package com.yb.feedback360.dto.request;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Validation tests for ModuleCompletedRequest (contrat du webhook).
 *
 * Utilise un vrai Validator (Hibernate Validator) — contrairement au facade test qui le
 * mocke — pour vérifier que les champs obligatoires (dont module.type, rendu requis)
 * sont bien rejetés, et qu'un payload complet passe.
 */
class ModuleCompletedRequestValidationTest {

    private static ValidatorFactory factory;
    private static Validator validator;

    @BeforeAll
    static void init() {
        factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @AfterAll
    static void close() {
        factory.close();
    }

    private ModuleCompletedRequest.UserPayload user() {
        return new ModuleCompletedRequest.UserPayload(7L, "alice@x.com", "Alice Martin");
    }

    private ModuleCompletedRequest.ModulePayload module(ModuleCompletedRequest.ModuleTypePayload type) {
        return new ModuleCompletedRequest.ModulePayload(3L, "React", type);
    }

    private ModuleCompletedRequest valid() {
        return new ModuleCompletedRequest(
                user(),
                module(new ModuleCompletedRequest.ModuleTypePayload(1L, "E-learning")),
                new ModuleCompletedRequest.ParcoursPayload(2L, "Parcours"),
                new ModuleCompletedRequest.PopulationPayload(4L, "Population"));
    }

    /** Un payload complet ne produit aucune violation. */
    @Test
    void validRequest_hasNoViolations() {
        assertTrue(validator.validate(valid()).isEmpty());
    }

    /** module.type absent -> une violation sur le chemin "module.type". */
    @Test
    void missingModuleType_isRejected() {
        ModuleCompletedRequest req = new ModuleCompletedRequest(
                user(),
                module(null), // pas de type
                new ModuleCompletedRequest.ParcoursPayload(2L, "Parcours"),
                new ModuleCompletedRequest.PopulationPayload(4L, "Population"));

        Set<ConstraintViolation<ModuleCompletedRequest>> violations = validator.validate(req);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("module.type")));
    }

    /** Email invalide -> une violation sur le chemin "user.email". */
    @Test
    void invalidEmail_isRejected() {
        ModuleCompletedRequest req = new ModuleCompletedRequest(
                new ModuleCompletedRequest.UserPayload(7L, "not-an-email", "Alice Martin"),
                module(new ModuleCompletedRequest.ModuleTypePayload(1L, "E-learning")),
                new ModuleCompletedRequest.ParcoursPayload(2L, "Parcours"),
                new ModuleCompletedRequest.PopulationPayload(4L, "Population"));

        Set<ConstraintViolation<ModuleCompletedRequest>> violations = validator.validate(req);

        assertTrue(violations.stream()
                .anyMatch(v -> v.getPropertyPath().toString().equals("user.email")));
    }
}
