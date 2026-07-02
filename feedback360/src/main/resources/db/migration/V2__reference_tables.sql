CREATE TABLE parcours (
    parcours_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    external_parcours_id BIGINT       NOT NULL UNIQUE,
    name                 VARCHAR(255) NOT NULL
);

CREATE TABLE population (
    population_id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    external_population_id BIGINT       NOT NULL UNIQUE,
    name                   VARCHAR(255) NOT NULL
);
