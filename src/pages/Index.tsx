
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, TrendingUp, Users, Shield, ArrowRight, Bike, Clock, MapPin, Waves, Mountain, Zap, User, Activity, Target, ChevronDown, Calendar, Users as UsersIcon } from "lucide-react";
import AdCard from "@/components/AdCard";
import RaceCountdown from "@/components/RaceCountdown";
import VideoBackground from "@/components/VideoBackground";

// Placeholder ads removed - will be populated from backend API
const FEATURED_ADS: any[] = [];

const RACE_CATEGORIES = [
  { name: "Triathlon", icon: Waves, count: 156, gradient: "from-blue-500 to-cyan-500" },
  { name: "Vasaloppet", icon: Mountain, count: 89, gradient: "from-purple-500 to-pink-500" },
  { name: "Vätternrundan", icon: Bike, count: 143, gradient: "from-green-500 to-emerald-500" },
  { name: "Löpning", icon: Activity, count: 234, gradient: "from-orange-500 to-red-500" },
  { name: "Cykelrace", icon: Zap, count: 178, gradient: "from-yellow-500 to-orange-500" },
  { name: "Simning", icon: Target, count: 67, gradient: "from-indigo-500 to-blue-500" }
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
      {/* Hero Section with Video Background */}
      <section className="relative py-20 px-4 overflow-hidden min-h-[80vh] flex items-center">
        <VideoBackground
          videoSources={[
            { src: "/background.mp4", type: "video/mp4" },
            { src: "/background.mov", type: "video/quicktime" }
          ]}
          fallbackImage="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
          className="absolute inset-0"
        >
          {/* Video overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/70 to-blue-700/80 z-10"></div>
          
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20 z-15">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-400/20 rounded-full blur-lg animate-pulse delay-1000"></div>
            <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-cyan-400/15 rounded-full blur-md animate-pulse delay-2000"></div>
            <div className="absolute bottom-40 right-1/3 w-20 h-20 bg-white/5 rounded-full blur-lg animate-pulse delay-500"></div>
          </div>
        </VideoBackground>
        
        <div className="relative z-30 max-w-6xl mx-auto text-center">
          <div className="mb-12 pt-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              Svenska loppmarknaden
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-12 leading-relaxed">
              Köp och sälj begagnad utrustning för triathlon, Vasaloppet, Vätternrundan och andra svenska lopp
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link to="/annonser">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg min-w-[200px]">
                  <Search className="mr-3 h-6 w-6" />
                  Sök annonser
                </Button>
              </Link>
              <Link to="/skapa-annons">
                <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold min-w-[200px]">
                  Skapa annons
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Small text with bouncing arrow - moved up to prevent overlap */}
          <div className="text-center mb-8">
            <p className="text-blue-100 text-lg mb-2">Är du redo för nästa lopp?</p>
            <ChevronDown className="h-6 w-6 text-yellow-400 mx-auto animate-bounce" />
          </div>
        </div>
      </section>
      {/* Race Countdown */}
      <RaceCountdown />

      {/* Race Categories */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Populära loppkategorier
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hitta utrustning specifikt för ditt lopp
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {RACE_CATEGORIES.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link key={category.name} to="/annonser">
                  <Card className="hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group border-0 overflow-hidden">
                    <CardContent className="p-6 text-center relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                      <div className="relative z-10">
                        <div className={`inline-flex p-3 rounded-full bg-gradient-to-br ${category.gradient} mb-3`}>
                          <IconComponent className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors mb-1">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {category.count} annonser
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Ads */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Utvalda annonser
              </h2>
              <p className="text-gray-600">
                Högkvalitativ utrustning från verifierade säljare
              </p>
            </div>
            <Link to="/annonser">
              <Button variant="outline" className="hidden sm:flex items-center gap-2">
                Visa alla
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {FEATURED_ADS.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {FEATURED_ADS.map(ad => (
                  <AdCard key={ad.id} ad={ad} />
                ))}
              </div>
              
              <div className="text-center mt-8 sm:hidden">
                <Link to="/annonser">
                  <Button variant="outline" className="flex items-center gap-2 mx-auto">
                    Visa alla annonser
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Inga annonser att visa än
                </h3>
                <p className="text-gray-600 mb-6">
                  Bli först med att publicera din utrustning på Sveriges nya loppmarknad
                </p>
                <Link to="/skapa-annons">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Skapa första annonsen
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-20 left-20 w-3 h-3 bg-blue-300 rounded-full opacity-30"></div>
          <div className="absolute top-40 right-40 w-2 h-2 bg-purple-300 rounded-full opacity-25"></div>
          <div className="absolute bottom-32 left-1/3 w-4 h-4 bg-cyan-300 rounded-full opacity-20"></div>
          <div className="absolute bottom-20 right-20 w-2 h-2 bg-blue-400 rounded-full opacity-35"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Varför välja Loppet?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Sveriges första marketplace specialiserad på lopputrustning
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group">
              <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Lokala leveranser
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Snabba leveranser inom Sverige. Inga långa väntetider från utlandet. Stöd svenska atlet-communityn.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="group">
              <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Specialiserad kunskap
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Fokus på svenska lopp betyder bättre matchning och expertis. Vi förstår vad svenska atleter behöver.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="group">
              <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white">
                <CardContent className="p-8 text-center">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Säsongsfokus
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Hitta rätt utrustning vid rätt tidpunkt för kommande lopp. Perfekt timing för svenska säsonger.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Stats moved here */}
          <div className="mt-16">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-900 shadow-lg">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold">1,200+</div>
                  <div className="text-gray-600">Aktiva annonser</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-900 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold">3,500+</div>
                  <div className="text-gray-600">Registrerade användare</div>
                </CardContent>
              </Card>
              <Card className="bg-white/80 backdrop-blur-sm border-gray-200 text-gray-900 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Shield className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-gray-600">Säkra transaktioner</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Redo att börja handla?
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 leading-relaxed">
            Gå med i Sveriges största community för lopputrustning idag
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/annonser">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 hover:scale-105 transition-all duration-300 px-10 py-4 text-lg font-semibold shadow-xl">
                Börja handla
              </Button>
            </Link>
            <Link to="/skapa-annons">
              <Button size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 hover:scale-105 transition-all duration-300 px-10 py-4 text-lg font-semibold">
                Sälj din utrustning
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
