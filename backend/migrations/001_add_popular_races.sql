-- Migration: Add popular Swedish races for 2025-2026
-- Created: 2025-09-12
-- Description: Adds 6 popular Swedish races covering the next 6 months

INSERT INTO races (name, description, date, location, participants_count, registration_url, color, is_active) VALUES
(
    'TCS Lidingöloppet 2025',
    'Världens största terränglopp med 30 km genom Lidingös vackra natur. En del av En Svensk Klassiker.',
    '2025-09-27 10:00:00+00:00'::timestamptz,
    'Lidingö, Stockholm',
    '45000',
    'https://www.lidingoloppet.se/',
    '#FF6B35',
    true
),
(
    'Göteborg Marathon 2025',
    'En av Sveriges mest populära maraton genom Göteborgs gater och parker.',
    '2025-10-11 12:00:00+00:00'::timestamptz,
    'Göteborg',
    '8000',
    'https://goteborgvarvet.se/',
    '#2E8B57',
    true
),
(
    'Stockholm Marathon 2025',
    'Löp genom Sveriges vackra huvudstad på denna platta och snabba bana genom alla Stockholms sju stadsdelar.',
    '2025-11-08 12:00:00+00:00'::timestamptz,
    'Stockholm',
    '15000',
    'https://www.stockholmmarathon.se/',
    '#4169E1',
    true
),
(
    'Vasaloppet Vintervecka 2026',
    'Världens största längdskidåkning med huvudloppet Vasaloppet 90 km från Sälen till Mora. En del av En Svensk Klassiker.',
    '2026-03-01 08:00:00+00:00'::timestamptz,
    'Sälen till Mora, Dalarna',
    '15800',
    'https://www.vasaloppet.se/',
    '#8B4513',
    true
),
(
    'IRONMAN Kalmar 2025',
    'Fullständig Ironman-distans med simning i Kalmarssund, cykling genom svensk natur och löpning genom Kalmars historiska centrum.',
    '2025-08-16 07:00:00+00:00'::timestamptz,
    'Kalmar',
    '2500',
    'https://www.ironman.com/kalmar',
    '#DC143C',
    true
),
(
    'Vansbrosimningen 2025',
    '75-årsjubileum av Sveriges klassiska frisimning genom Vanån och Västerdalälven. En del av En Svensk Klassiker.',
    '2025-07-05 10:00:00+00:00'::timestamptz,
    'Vansbro, Dalarna',
    '8000',
    'https://vansbrosimningen.se/',
    '#20B2AA',
    true
);