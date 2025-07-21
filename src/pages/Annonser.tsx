import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import AdCard from "@/components/AdCard";

const RACE_TYPES = [
  "Alla typer",
  "Triathlon",
  "Vasaloppet",
  "Vätternrundan", 
  "Ironman",
  "Cykelrace",
  "Löpning",
  "Simning"
];

const CATEGORIES = [
  "Alla kategorier",
  "Cyklar",
  "Kläder",
  "Skor",
  "Tillbehör",
  "Klockor",
  "Hjälmar",
  "Vätskor & Nutrition"
];

const CONDITIONS = [
  "Alla skick",
  "Nytt",
  "Som nytt",
  "Mycket bra",
  "Bra",
  "Acceptabelt"
];

const PRICE_RANGES = [
  "Alla priser",
  "Under 500 kr",
  "500 - 1 000 kr",
  "1 000 - 5 000 kr",
  "5 000 - 10 000 kr",
  "10 000 - 20 000 kr",
  "Över 20 000 kr"
];

const MOCK_ADS = [
  {
    id: "1",
    title: "Trek Speed Concept - Timetrial cykel",
    price: 45000,
    location: "Stockholm",
    postedDate: "2025-01-15",
    category: "Cyklar",
    raceType: "Triathlon",
    condition: "Mycket bra",
    images: ["/api/placeholder/300/200"],
    description: "Professionell timetrial cykel i utmärkt skick. Perfekt för triathlon och tempo-race.",
    seller: {
      name: "Magnus L.",
      rating: 4.8
    }
  },
  {
    id: "2", 
    title: "Zone3 Wetsuit - Herr Medium",
    price: 2800,
    location: "Göteborg",
    postedDate: "2025-01-14",
    category: "Kläder",
    raceType: "Triathlon",
    condition: "Som nytt",
    images: ["/api/placeholder/300/200"],
    description: "Knappt använd våtdräkt från Zone3. Storlek M. Perfekt för öppet vatten.",
    seller: {
      name: "Anna S.",
      rating: 4.9
    }
  },
  {
    id: "3",
    title: "Salomon S/LAB Sense 8 - Löpskor",
    price: 1200,
    location: "Malmö",
    postedDate: "2025-01-13",
    category: "Skor",
    raceType: "Löpning",
    condition: "Bra",
    images: ["/api/placeholder/300/200"],
    description: "Trailskor i bra skick. Perfekta för långa distanser i naturen.",
    seller: {
      name: "Erik M.",
      rating: 4.7
    }
  },
  {
    id: "4",
    title: "Garmin Forerunner 945 - GPS Klocka",
    price: 6500,
    location: "Uppsala",
    postedDate: "2025-01-12",
    category: "Klockor",
    raceType: "Triathlon",
    condition: "Mycket bra",
    images: ["/api/placeholder/300/200"],
    description: "Komplett triathlon-klocka med alla funktioner. Inklusive originalladdare.",
    seller: {
      name: "Lisa K.",
      rating: 5.0
    }
  },
  {
    id: "5",
    title: "Specialized Tarmac SL7 - Racercykel",
    price: 32000,
    location: "Lund",
    postedDate: "2025-01-11",
    category: "Cyklar",
    raceType: "Cykelrace",
    condition: "Som nytt",
    images: ["/api/placeholder/300/200"],
    description: "Nästan ny racercykel i toppskick. Shimano Ultegra Di2 växlar.",
    seller: {
      name: "Johan P.",
      rating: 4.6
    }
  },
  {
    id: "6",
    title: "POC Ventral Air SPIN - Hjälm",
    price: 1800,
    location: "Västerås",
    postedDate: "2025-01-10",
    category: "Hjälmar",
    raceType: "Cykelrace",
    condition: "Mycket bra",
    images: ["/api/placeholder/300/200"],
    description: "Aerodynamisk hjälm för racing. Storlek M. Mycket luftig och bekväm.",
    seller: {
      name: "Sara W.",
      rating: 4.8
    }
  }
];

const Annonser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRaceType, setSelectedRaceType] = useState("Alla typer");
  const [selectedCategory, setSelectedCategory] = useState("Alla kategorier");
  const [selectedCondition, setSelectedCondition] = useState("Alla skick");
  const [selectedPriceRange, setSelectedPriceRange] = useState("Alla priser");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const handleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const filteredAds = MOCK_ADS.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ad.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRaceType = selectedRaceType === "Alla typer" || ad.raceType === selectedRaceType;
    const matchesCategory = selectedCategory === "Alla kategorier" || ad.category === selectedCategory;
    const matchesCondition = selectedCondition === "Alla skick" || ad.condition === selectedCondition;
    
    return matchesSearch && matchesRaceType && matchesCategory && matchesCondition;
  });

  const clearFilters = () => {
    setSelectedRaceType("Alla typer");
    setSelectedCategory("Alla kategorier");
    setSelectedCondition("Alla skick");
    setSelectedPriceRange("Alla priser");
    setSearchTerm("");
  };

  const activeFiltersCount = [selectedRaceType, selectedCategory, selectedCondition, selectedPriceRange]
    .filter(filter => !filter.startsWith("Alla")).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Annonser för svenska lopp
          </h1>
          <p className="text-gray-600">
            Hitta begagnad utrustning för triathlon, Vasaloppet, Vätternrundan och andra svenska lopp
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Sök efter utrustning..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedRaceType} onValueChange={setSelectedRaceType}>
              <SelectTrigger>
                <SelectValue placeholder="Lopptype" />
              </SelectTrigger>
              <SelectContent>
                {RACE_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedCondition} onValueChange={setSelectedCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Skick" />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map(condition => (
                  <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {filteredAds.length} annonser hittades
              </span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary">
                  {activeFiltersCount} filter aktiva
                </Badge>
              )}
            </div>
            
            {activeFiltersCount > 0 && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Rensa filter
              </Button>
            )}
          </div>
        </div>

        {/* Ad Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAds.map(ad => (
            <AdCard
              key={ad.id}
              ad={ad}
              onFavorite={handleFavorite}
              isFavorited={favorites.has(ad.id)}
            />
          ))}
        </div>

        {filteredAds.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Inga annonser hittades</h3>
              <p>Prova att ändra dina sökkriterier eller filter</p>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Rensa alla filter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Annonser;