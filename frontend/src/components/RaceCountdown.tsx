import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { racesApi } from '@/lib/api';

interface Race {
  id: string;
  name: string;
  date: string;
  location: string | null;
  description: string | null;
  participantsCount: string | null;
  color: string;
  isActive: boolean;
  createdAt: string;
}

// Helper function to get race date as Date object
const parseRaceDate = (dateString: string | null) => {
  if (!dateString) return null;
  return new Date(dateString);
};

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const RaceCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: TimeLeft }>({});
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch races from database
  useEffect(() => {
    const fetchRaces = async () => {
      try {
        setLoading(true);
        const upcomingRaces = await racesApi.getUpcomingRaces();
        setRaces(upcomingRaces);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch races:', err);
        setError('Failed to load races');
      } finally {
        setLoading(false);
      }
    };

    fetchRaces();
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (races.length === 0) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const newTimeLeft: { [key: string]: TimeLeft } = {};

      races.forEach(race => {
        const raceDate = parseRaceDate(race.date);
        if (!raceDate) return;
        
        const distance = raceDate.getTime() - now;
        
        if (distance > 0) {
          newTimeLeft[race.name] = {
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
          };
        }
      });

      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, [races]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('sv-SE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Show loading or error state
  if (loading) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-blue-200">Laddar kommande lopp...</p>
        </div>
      </section>
    );
  }

  if (error || races.length === 0) {
    return (
      <section className="py-16 px-4 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-blue-200">Inga kommande lopp att visa för tillfället.</p>
        </div>
      </section>
    );
  }

  // Get the next race (earliest date)
  const now = new Date().getTime();
  const futureRaces = races.filter(race => {
    const raceDate = parseRaceDate(race.date);
    return raceDate && raceDate.getTime() > now;
  });
  const nextRace = futureRaces.sort((a, b) => {
    const dateA = parseRaceDate(a.date);
    const dateB = parseRaceDate(b.date);
    if (!dateA || !dateB) return 0;
    return dateA.getTime() - dateB.getTime();
  })[0];

  if (!nextRace || !timeLeft[nextRace.name]) {
    return null;
  }

  const countdown = timeLeft[nextRace.name];

  return (
    <section className="py-16 px-4 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/20"></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-400/10 rounded-full blur-xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-400/5 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-yellow-500/20 text-yellow-300 border-yellow-500/30 px-4 py-2">
            Nästa stora lopp
          </Badge>
          
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            {nextRace.name}
          </h2>
          <p className="text-xl text-blue-100 mb-6">{nextRace.description || 'Ett kommande lopp'}</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-200 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{parseRaceDate(nextRace.date) ? formatDate(parseRaceDate(nextRace.date)!) : 'Datum ej angivet'}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>{nextRace.location || 'Plats ej angiven'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>{nextRace.participantsCount || 'Deltagare'}</span>
            </div>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
            <CardContent className="p-6">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {countdown.days}
              </div>
              <div className="text-blue-200 text-sm uppercase tracking-wide">
                Dagar
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
            <CardContent className="p-6">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {countdown.hours}
              </div>
              <div className="text-blue-200 text-sm uppercase tracking-wide">
                Timmar
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
            <CardContent className="p-6">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {countdown.minutes}
              </div>
              <div className="text-blue-200 text-sm uppercase tracking-wide">
                Minuter
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-center">
            <CardContent className="p-6">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                {countdown.seconds}
              </div>
              <div className="text-blue-200 text-sm uppercase tracking-wide">
                Sekunder
              </div>
            </CardContent>
          </Card>
        </div>

        {/* All Upcoming Races */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8 text-blue-100">
            Kommande svenska lopp 2025
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {futureRaces.map((race, index) => (
              <Card key={race.name} className="bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className={`inline-flex p-2 rounded-lg bg-gradient-to-r ${race.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">{race.name}</h4>
                  <p className="text-blue-200 text-sm mb-3">{race.description || 'Kommande lopp'}</p>
                  <div className="space-y-2 text-sm text-blue-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{parseRaceDate(race.date) ? formatDate(parseRaceDate(race.date)!) : 'Datum ej angivet'}</span>
                    </div>
                      <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{race.location || 'Plats ej angiven'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{race.participantsCount || 'Deltagare'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {futureRaces.length === 0 && (
            <div className="text-center">
              <p className="text-blue-200">Inga kommande lopp att visa för tillfället.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RaceCountdown;