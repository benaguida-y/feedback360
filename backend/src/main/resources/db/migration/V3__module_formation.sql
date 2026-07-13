CREATE TABLE module_formation (
    module_id     BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title         VARCHAR(255)  NOT NULL,
    description   VARCHAR(1000),
    category      VARCHAR(255),
    source        VARCHAR(255),
    parcours_id   BIGINT NOT NULL REFERENCES parcours(parcours_id),
    population_id BIGINT NOT NULL REFERENCES population(population_id)
);