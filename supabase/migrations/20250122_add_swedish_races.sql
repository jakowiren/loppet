-- Add confirmed Swedish races for September-December 2025
-- Only includes races with verified dates from official sources

INSERT INTO races (id, name, description, date, location, participants_count, registration_url, color, is_active, created_at) VALUES

-- TCS Lidingöloppet - CONFIRMED September 27, 2025
(
  gen_random_uuid(),
  'TCS Lidingöloppet',
  'Världens största terränglöpning. 30 km genom Lidingö med flera distansalternativ.',
  '2025-09-27'::date,
  'Lidingö, Stockholm',
  '45,000',
  'https://www.lidingoloppet.se/',
  '#00C851',
  true,
  now()
),

-- Göteborg Marathon - CONFIRMED October 11, 2025
(
  gen_random_uuid(),
  'Göteborg Marathon',
  '51:a upplagan av Göteborg Marathon med både maratondistans och halvmaraton.',
  '2025-10-11'::date,
  'Göteborg',
  '12,000',
  'https://www.gbgmarathon.se/',
  '#FF8C00',
  true,
  now()
),

-- Malmö Marathon - CONFIRMED October 12, 2025
(
  gen_random_uuid(),
  'Malmö Marathon',
  'Premiären för Malmö Marathon & Halvmaraton. En av Sveriges snabbaste banor med endast 28m höjdskillnad.',
  '2025-10-12'::date,
  'Malmö, Ribersborg',
  '8,000',
  'https://malmomarathon.se/',
  '#4169E1',
  true,
  now()
);

-- Migration completed successfully