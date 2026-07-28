package com.yb.feedback360.config;

import com.yb.feedback360.dto.response.CollaboratorProgressResponse;
import com.yb.feedback360.dto.response.ModuleStatsResponse;
import org.hibernate.cfg.AvailableSettings;
import org.springframework.boot.hibernate.autoconfigure.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;

/**
 * Spring Boot ne déclare à Hibernate que les @Entity, @Embeddable et @MappedSuperclass.
 * Les DTO annotés @Imported doivent donc être ajoutés à la main à l'unité de persistance
 * pour pouvoir être instanciés par leur nom simple dans une requête JPQL.
 */
@Configuration
public class HibernateImportedTypesConfig implements HibernatePropertiesCustomizer {
    public void customize(Map<String, Object> hibernateProperties) {
        hibernateProperties.put(AvailableSettings.LOADED_CLASSES, List.of(ModuleStatsResponse.class,
                CollaboratorProgressResponse.class));
    }
}
