import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRaces() {
  const races = [
    {
      name: 'TCS Lidingöloppet 2025',
      description: 'Världens största terränglopp med 30 km genom Lidingös vackra natur. En del av En Svensk Klassiker.',
      date: new Date('2025-09-27T10:00:00.000Z'),
      location: 'Lidingö, Stockholm',
      participantsCount: '45000',
      registrationUrl: 'https://www.lidingoloppet.se/',
      color: '#FF6B35',
      isActive: true,
    },
    {
      name: 'Göteborg Marathon 2025',
      description: 'En av Sveriges mest populära maraton genom Göteborgs gator och parker.',
      date: new Date('2025-10-11T12:00:00.000Z'),
      location: 'Göteborg',
      participantsCount: '8000',
      registrationUrl: 'https://goteborgvarvet.se/',
      color: '#2E8B57',
      isActive: true,
    },
    {
      name: 'Stockholm Marathon 2025',
      description: 'Löp genom Sveriges vackra huvudstad på denna platta och snabba bana genom alla Stockholms sju stadsdelar.',
      date: new Date('2025-11-08T12:00:00.000Z'),
      location: 'Stockholm',
      participantsCount: '15000',
      registrationUrl: 'https://www.stockholmmarathon.se/',
      color: '#4169E1',
      isActive: true,
    },
    {
      name: 'Vasaloppet Vintervecka 2026',
      description: 'Världens största längdskidåkning med huvudloppet Vasaloppet 90 km från Sälen till Mora. En del av En Svensk Klassiker.',
      date: new Date('2026-03-01T08:00:00.000Z'),
      location: 'Sälen till Mora, Dalarna',
      participantsCount: '15800',
      registrationUrl: 'https://www.vasaloppet.se/',
      color: '#8B4513',
      isActive: true,
    },
    {
      name: 'IRONMAN Kalmar 2025',
      description: 'Fullständig Ironman-distans med simning i Kalmarssund, cykling genom svensk natur och löpning genom Kalmars historiska centrum.',
      date: new Date('2025-08-16T07:00:00.000Z'),
      location: 'Kalmar',
      participantsCount: '2500',
      registrationUrl: 'https://www.ironman.com/kalmar',
      color: '#DC143C',
      isActive: true,
    },
    {
      name: 'Vansbrosimningen 2025',
      description: '75-årsjubileum av Sveriges klassiska frisimning genom Vanån och Västerdalälven. En del av En Svensk Klassiker.',
      date: new Date('2025-07-05T10:00:00.000Z'),
      location: 'Vansbro, Dalarna',
      participantsCount: '8000',
      registrationUrl: 'https://vansbrosimningen.se/',
      color: '#20B2AA',
      isActive: true,
    },
  ];

  for (const race of races) {
    await prisma.race.create({
      data: race,
    });
  }

  console.log('Successfully seeded races!');
}

seedRaces()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });