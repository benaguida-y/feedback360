-- ============================================================================
--  Feedback360 — Reset + jeu de donnees de demonstration
-- ----------------------------------------------------------------------------
--  Ce script :
--    1) VIDE la base (sauf le/les compte(s) ADMIN et la table des roles),
--    2) INJECTE de fausses donnees actives (managers, collaborateurs, modules,
--       parcours, populations, ~270 feedbacks varies) pour demontrer les listes,
--       la pagination, les filtres et les graphes.
--
--  Les faux comptes sont ACTIFS + ACTIVES (mot de passe partage : Demo1234),
--  donc connectables pour montrer un dashboard rempli.
--
--  A relancer avant chaque presentation. Tes vraies donnees de demo (creation
--  de comptes, activation par e-mail...) se font PAR-DESSUS, a la main.
--
--  Lancer :  psql -h localhost -U feedback360 -d feedback360 -f reset_and_seed.sql
-- ============================================================================

BEGIN;

-- 1) ----- RESET : on efface tout ce qui reference des users/modules d'abord ---
DELETE FROM feedback;
DELETE FROM notification;
DELETE FROM integration_log;
DELETE FROM module_formation;
DELETE FROM parcours;
DELETE FROM population;
-- On garde le(s) vrai(s) compte(s) ADMIN, on supprime tous les autres utilisateurs.
-- L'admin de DEMO est aussi supprime ici car il est recree plus bas (script rejouable).
DELETE FROM app_user
 WHERE role_id <> (SELECT role_id FROM role WHERE name = 'ADMIN')
    OR external_user_id = 4999;   -- l'admin de demo (recree plus bas)

-- 2) ----- Parcours & populations (tables de reference) ------------------------
INSERT INTO parcours (external_parcours_id, name) VALUES
  (1001, 'TalentUp'), (1002, 'Onboarding'), (1003, 'Cloud Journey'), (1004, 'Data Track');

INSERT INTO population (external_population_id, name) VALUES
  (2001, 'Java'), (2002, 'Data'), (2003, 'Cloud'), (2004, 'Web');

-- 3) ----- 12 modules, repartis sur les parcours/populations -------------------
INSERT INTO module_formation (external_module_id, title, category, parcours_id, population_id)
SELECT 3000 + g,
       (ARRAY['Java Basics','Spring Boot','SQL Fundamentals','React Essentials',
              'Docker 101','Kubernetes','AWS Cloud','Data Modeling',
              'Python for Data','Git & CI','Angular','Node.js'])[g],
       (ARRAY['E-learning','Virtual class','Workshop','Self-study'])[1 + (g % 4)],
       (SELECT parcours_id   FROM parcours   ORDER BY parcours_id   OFFSET (g % 4) LIMIT 1),
       (SELECT population_id FROM population ORDER BY population_id OFFSET (g % 4) LIMIT 1)
FROM generate_series(1, 12) AS g;

-- Pools de noms partages (35 x 35 = 1225 combinaisons). Le random() est place dans
-- le SELECT d'une sous-requete sur generate_series -> evalue PAR LIGNE (des noms varies).
-- Les e-mails gardent un suffixe .m<g>/.c<g> -> toujours uniques meme si 2 noms coincident.
-- 4) ----- 8 managers ----------------------------------------------------------
INSERT INTO app_user (external_user_id, first_name, last_name, email, department, password_hash, role_id, active)
SELECT 5000 + s.g, s.fn, s.ln,
       lower(replace(s.fn || '.' || s.ln, ' ', '') || '.m' || s.g || '@capgemini.com'),
       (ARRAY['Java','Data','Cloud','Web'])[1 + (s.g % 4)],
       '$2b$10$jKpkGF3Q7AgFykcsVqdwtOhRKwynQDiIi6So6ykSOqMxSe/TQqGHS',  -- Demo1234
       2, true
FROM (
  SELECT g,
     (ARRAY['Alice','Adam','Amine','Bob','Camille','Chloe','David','Emma','Farid','Gina','Hugo','Ines',
            'Jules','Julien','Karim','Lea','Leila','Lucas','Manon','Marc','Mehdi','Nabil','Nadia','Omar',
            'Paul','Quentin','Rania','Reda','Salma','Sami','Sarah','Sofia','Tina','Yasmine','Zineb'])[1 + floor(random() * 35)] AS fn,
     (ARRAY['Martin','Bernard','Durand','Dubois','Moreau','Laurent','Simon','Michel','Leroy','Roux',
            'David','Bertrand','Morel','Fournier','Girard','Bonnet','Dupont','Lambert','Fontaine','Rousseau',
            'Benali','El Amrani','Tazi','Bennani','Idrissi','Alaoui','Cherkaoui','Berrada','Fassi','Sabri',
            'Petit','Garnier','Faure','Blanc','Nadeau'])[1 + floor(random() * 35)] AS ln
  FROM generate_series(1, 8) AS g
) AS s;

-- 5) ----- 60 collaborateurs ---------------------------------------------------
INSERT INTO app_user (external_user_id, first_name, last_name, email, department, password_hash, role_id, active)
SELECT 6000 + s.g, s.fn, s.ln,
       lower(replace(s.fn || '.' || s.ln, ' ', '') || '.c' || s.g || '@capgemini.com'),
       (ARRAY['Java','Data','Cloud','Web'])[1 + (s.g % 4)],
       '$2b$10$jKpkGF3Q7AgFykcsVqdwtOhRKwynQDiIi6So6ykSOqMxSe/TQqGHS',  -- Demo1234
       3, true
FROM (
  SELECT g,
     (ARRAY['Alice','Adam','Amine','Bob','Camille','Chloe','David','Emma','Farid','Gina','Hugo','Ines',
            'Jules','Julien','Karim','Lea','Leila','Lucas','Manon','Marc','Mehdi','Nabil','Nadia','Omar',
            'Paul','Quentin','Rania','Reda','Salma','Sami','Sarah','Sofia','Tina','Yasmine','Zineb'])[1 + floor(random() * 35)] AS fn,
     (ARRAY['Martin','Bernard','Durand','Dubois','Moreau','Laurent','Simon','Michel','Leroy','Roux',
            'David','Bertrand','Morel','Fournier','Girard','Bonnet','Dupont','Lambert','Fontaine','Rousseau',
            'Benali','El Amrani','Tazi','Bennani','Idrissi','Alaoui','Cherkaoui','Berrada','Fassi','Sabri',
            'Petit','Garnier','Faure','Blanc','Nadeau'])[1 + floor(random() * 35)] AS ln
  FROM generate_series(1, 60) AS g
) AS s;

-- 5b) ----- 4 comptes de demo FIXES (vrais noms, mot de passe : Demo1234) -------
--     Un par role + un collaborateur avec un E-MAIL REEL pour tester les envois.
INSERT INTO app_user (external_user_id, first_name, last_name, email, department, password_hash, role_id, active) VALUES
  (4999, 'Sarah',   'Bennani',   'sarah.bennani@capgemini.com',   'IT',
         '$2b$10$jKpkGF3Q7AgFykcsVqdwtOhRKwynQDiIi6So6ykSOqMxSe/TQqGHS', 1, true),
  (5999, 'Youssef', 'El Fassi',  'youssef.elfassi@capgemini.com', 'Data',
         '$2b$10$jKpkGF3Q7AgFykcsVqdwtOhRKwynQDiIi6So6ykSOqMxSe/TQqGHS', 2, true),
  (6999, 'Amine',   'Tazi',      'amine.tazi@capgemini.com',      'Java',
         '$2b$10$jKpkGF3Q7AgFykcsVqdwtOhRKwynQDiIi6So6ykSOqMxSe/TQqGHS', 3, true),
  (6998, 'Youssef', 'Benaguida', 'tsubject610@gmail.com',         'Java',
         '$2b$10$jKpkGF3Q7AgFykcsVqdwtOhRKwynQDiIi6So6ykSOqMxSe/TQqGHS', 3, true);

-- 6) ----- Feedbacks : ~50% des paires (collaborateur x module) ----------------
--    Statut aleatoire (biaise vers SUBMITTED). Seuls les SUBMITTED ont note+commentaire.
INSERT INTO feedback (user_id, module_id, status, global_score, comment, created_at, reminder_count)
SELECT s.user_id, s.module_id, s.status,
       CASE WHEN s.status = 'SUBMITTED'
            THEN (1 + floor(random() * 5))::double precision END,
       CASE WHEN s.status = 'SUBMITTED'
            THEN (ARRAY['Tres bon module','Contenu clair','Un peu rapide','A approfondir',
                        'Excellent formateur','Manque d''exemples','Parfait pour debuter',
                        'Assez theorique','Bien structure','Rythme ideal'])[1 + floor(random() * 10)] END,
       now() - (floor(random() * 90) || ' days')::interval,
       0
FROM (
  -- Le statut est tire dans le SELECT de cette sous-requete -> evalue par ligne.
  SELECT u.user_id, m.module_id,
         (ARRAY['SUBMITTED','SUBMITTED','SUBMITTED','NOT_SUBMITTED','IN_PROGRESS'])[1 + floor(random() * 5)] AS status
  FROM app_user u
  JOIN module_formation m ON true
  WHERE u.role_id = 3
    AND u.external_user_id <> 6998   -- ce compte a des feedbacks garantis (voir 6b)
    AND random() < 0.5
) AS s;

-- 6b) ----- Feedbacks GARANTIS pour le compte a e-mail reel (tsubject610) -------
--     Deux NOT_SUBMITTED a relancer + un IN_PROGRESS + deux SUBMITTED notes,
--     pour tester la fonctionnalite d'envoi d'e-mail (relance) vers une vraie boite.
INSERT INTO feedback (user_id, module_id, status, global_score, comment, created_at, reminder_count)
SELECT (SELECT user_id FROM app_user WHERE external_user_id = 6998),
       m.module_id, v.status, v.score, v.comment, now() - (v.days || ' days')::interval, 0
FROM (VALUES
   (3001, 'NOT_SUBMITTED', NULL::double precision, NULL::text,        30),
   (3002, 'NOT_SUBMITTED', NULL::double precision, NULL::text,        12),
   (3003, 'IN_PROGRESS',   NULL::double precision, NULL::text,         5),
   (3004, 'SUBMITTED',     5::double precision,    'Excellent module', 20),
   (3005, 'SUBMITTED',     4::double precision,    'Tres bien',         40)
) AS v(ext_mod, status, score, comment, days)
JOIN module_formation m ON m.external_module_id = v.ext_mod;

-- 7) ----- Recap ---------------------------------------------------------------
SELECT
  (SELECT count(*) FROM app_user WHERE role_id = 2) AS managers,
  (SELECT count(*) FROM app_user WHERE role_id = 3) AS collaborateurs,
  (SELECT count(*) FROM module_formation)           AS modules,
  (SELECT count(*) FROM feedback)                   AS feedbacks,
  (SELECT count(*) FROM feedback WHERE status='SUBMITTED')     AS soumis,
  (SELECT count(*) FROM feedback WHERE status='IN_PROGRESS')   AS en_cours,
  (SELECT count(*) FROM feedback WHERE status='NOT_SUBMITTED') AS en_attente;

COMMIT;
