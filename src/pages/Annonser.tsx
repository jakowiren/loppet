import { useState, useEffect } from "react";
import { adsApi } from "@/lib/api";
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
  "Vätskor & Nutrition",
  "Annat"
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


const Annonser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRaceType, setSelectedRaceType] = useState("Alla typer");
  const [selectedCategory, setSelectedCategory] = useState("Alla kategorier");
  const [selectedCondition, setSelectedCondition] = useState("Alla skick");
  const [selectedPriceRange, setSelectedPriceRange] = useState("Alla priser");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [ads, setAds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setIsLoading(true);

        const response = await adsApi.getAds({
          search: searchTerm || undefined,
          raceType: selectedRaceType !== "Alla typer" ? selectedRaceType : undefined,
          category: selectedCategory !== "Alla kategorier" ? selectedCategory : undefined,
          condition: selectedCondition !== "Alla skick" ? selectedCondition : undefined,
          priceRange: selectedPriceRange !== "Alla priser" ? selectedPriceRange : undefined,
        });

        setAds(response.ads);
      } catch (error) {
        console.error('Error fetching ads:', error);
        setAds([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAds();
  }, [searchTerm, selectedRaceType, selectedCategory, selectedCondition, selectedPriceRange]);

  const handleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const filteredAds = ads;

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
                {isLoading ? 'Laddar...' : filteredAds.length === 0 ? 'Inga annonser uppe' : `${filteredAds.length} annonser hittades`}
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

        {!isLoading && filteredAds.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Filter className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Inga annonser uppe</h3>
              <p>Bli först med att publicera din utrustning</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Annonser;