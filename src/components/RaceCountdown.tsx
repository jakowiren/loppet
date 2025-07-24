import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';

interface Race {
  name: string;
  date: Date;
  location: string;
  description: string;
  participants: string;
  color: string;
}

// Helper function to get current Swedish time
const getSwedishTime = () => {
  return new Date().toLocaleString("en-US", {timeZone: "Europe/Stockholm"});
};

// Helper function to create Swedish timezone dates
const createSwedishDate = (dateString: string) => {
  // Parse the date string and create a date in Swedish timezone
  const date = new Date(dateString);
  return date;
};

const UPCOMING_RACES: Race[] = [
  {
    name: "Vasaloppet 2025",
    date: createSwedishDate('2025-03-02T09:00:00+01:00'), // CET
    location: "Sälen - Mora",
    description: "Världens äldsta skidlopp och det med flest deltagare",
    participants: "15,800 åkare",
    color: "from-blue-600 to-cyan-600"
  },
  {
    name: "Vätternrundan 2025",
    date: createSwedishDate('2025-06-14T22:00:00+02:00'), // CEST
    location: "Motala",
    description: "Världens största motionslopp på cykel - 315 km runt Vättern",
    participants: "22,000 cyklister",
    color: "from-green-600 to-emerald-600"
  },
  {
    name: "Ironman Kalmar 2025",
    date: createSwedishDate('2025-08-16T07:00:00+02:00'), // CEST
    location: "Kalmar",
    description: "Sveriges enda Ironman på full distans",
    participants: "2,850 atleter",
    color: "from-orange-600 to-red-600"
  }
];

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const RaceCountdown = () => {
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: TimeLeft }>({});
  const [currentSwedishTime, setCurrentSwedishTime] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      // Get current time in Swedish timezone
      const swedishDate = new Date().toLocaleString("en-US", {timeZone: "Europe/Stockholm"});
      const now = new Date(swedishDate).getTime();
      
      // Update current Swedish time display
      const timeString = new Date().toLocaleString('sv-SE', {
        timeZone: 'Europe/Stockholm',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      setCurrentSwedishTime(timeString);

      const newTimeLeft: { [key: string]: TimeLeft } = {};

      UPCOMING_RACES.forEach(race => {
        const distance = race.date.getTime() - now;
        
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
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('sv-SE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get the next race (earliest date) using Swedish timezone
  const currentSwedishTimeMs = new Date(new Date().toLocaleString("en-US", {timeZone: "Europe/Stockholm"})).getTime();
  const futureRaces = UPCOMING_RACES.filter(race => race.date.getTime() > currentSwedishTimeMs);
  const nextRace = futureRaces.sort((a, b) => a.date.getTime() - b.date.getTime())[0];

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
          
          {/* Swedish Time Display */}
          {currentSwedishTime && (
            <div className="mb-4">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-4 py-2">
                <Clock className="h-4 w-4 text-blue-200" />
                <span className="text-sm text-blue-200">
                  Svensk tid: {currentSwedishTime}
                </span>
              </div>
            </div>
          )}
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            {nextRace.name}
          </h2>
          <p className="text-xl text-blue-100 mb-6">{nextRace.description}</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-200 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{formatDate(nextRace.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>{nextRace.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>{nextRace.participants}</span>
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
                  <p className="text-blue-200 text-sm mb-3">{race.description}</p>
                  <div className="space-y-2 text-sm text-blue-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(race.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{race.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>{race.participants}</span>
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