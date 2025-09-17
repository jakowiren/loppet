import { useState, useEffect } from "react";
import { adsApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import AdCard from "@/components/AdCard";
import MessageDialog from "@/components/MessageDialog";

const CATEGORIES = [
  "Alla kategorier",
  "Cyklar",
  "Kläder",
  "Skor",
  "Tillbehör",
  "Klockor",
  "Hjälmar",
  "Nutrition",
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

const BIKE_SIZE_BUCKETS = [
  "XXXS (<45)",
  "XXS (45-47)",
  "XS (48-50)",
  "S (50-52)",
  "M (53-55)",
  "L (56-58)",
  "XL (59-62)",
  "XXL (>63)",
  "XXXL"
];
const BIKE_SIZE_CODES = ["XXXS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];
const BIKE_BRANDS = [
  "Trek", "Specialized", "Cannondale", "Bianchi", "Colnago", "Cervélo", "Scott", "Giant", "Cube", "Orbea", "Annat"
];
const CLOTHING_SIZES = [
  "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"
];
const CLOTHING_BRANDS = [
  "Castelli", "Gore Wear", "Assos", "Pearl Izumi", "Rapha", "Santini", "Endura", "Craft", "2XU", "Annat"
];
const SHOE_SIZES = [
  "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"
];
const SHOE_BRANDS = [
  "Sidi", "Shimano", "Giro", "Specialized", "Fizik", "Bontrager", "Pearl Izumi", "Salomon", "Asics", "Nike", "Adidas", "Annat"
];
const HELMET_SIZES = [
  "XS", "S", "M", "L", "XL", "XXL"
];
const HELMET_BRANDS = [
  "Giro", "Bell", "Specialized", "Kask", "POC", "Bontrager", "Lazer", "Scott", "ABUS", "Annat"
];
const WATCH_BRANDS = [
  "Garmin", "Wahoo", "Polar", "Suunto", "Coros", "Apple", "Fitbit", "Samsung", "Annat"
];
const WATCH_SIZES = [
  "Small", "Medium", "Large"
];
const LOCATIONS = [
  "Stockholm", "Göteborg", "Malmö", "Uppsala", "Linköping", "Västerås", "Örebro", "Norrköping",
  "Helsingborg", "Jönköping", "Umeå", "Lund", "Borås", "Sundsvall", "Gävle"
];

const Annonser = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Alla kategorier");
  const [selectedCondition, setSelectedCondition] = useState("Alla skick");
  const [ads, setAds] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageDialog, setMessageDialog] = useState<{
    open: boolean;
    adId: string;
    adTitle: string;
    sellerName: string;
  }>({
    open: false,
    adId: '',
    adTitle: '',
    sellerName: ''
  });
  const [selectedBikeSize, setSelectedBikeSize] = useState("Alla storlekar");
  const [selectedBikeBrand, setSelectedBikeBrand] = useState("Alla märken");
  const [selectedLocation, setSelectedLocation] = useState("Alla orter");
  const [selectedClothingSize, setSelectedClothingSize] = useState("Alla storlekar");
  const [selectedClothingBrand, setSelectedClothingBrand] = useState("Alla märken");
  const [selectedShoeSize, setSelectedShoeSize] = useState("Alla storlekar");
  const [selectedShoeBrand, setSelectedShoeBrand] = useState("Alla märken");
  const [selectedHelmetBrand, setSelectedHelmetBrand] = useState("Alla märken");
  const [selectedHelmetSize, setSelectedHelmetSize] = useState("Alla storlekar");
  const [selectedWatchBrand, setSelectedWatchBrand] = useState("Alla märken");
  const [selectedWatchSize, setSelectedWatchSize] = useState("Alla storlekar");


  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [histogram, setHistogram] = useState<number[]>([]);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        setIsLoading(true);
        const response = await adsApi.getAds({
          search: searchTerm || undefined,
          category: selectedCategory !== "Alla kategorier" ? selectedCategory : undefined,
          condition: selectedCondition !== "Alla skick" ? selectedCondition : undefined,
          location: selectedLocation !== "Alla orter" ? selectedLocation : undefined,
          bikeSize: selectedCategory === "Cyklar" && selectedBikeSize !== "Alla storlekar" ? selectedBikeSize : undefined,
          bikeBrand: selectedCategory === "Cyklar" && selectedBikeBrand !== "Alla märken" ? selectedBikeBrand : undefined,
          clothingSize: selectedCategory === "Kläder" && selectedClothingSize !== "Alla storlekar" ? selectedClothingSize : undefined,
          clothingBrand: selectedCategory === "Kläder" && selectedClothingBrand !== "Alla märken" ? selectedClothingBrand : undefined,
          shoeSize: selectedCategory === "Skor" && selectedShoeSize !== "Alla storlekar" ? selectedShoeSize : undefined,
          shoeBrand: selectedCategory === "Skor" && selectedShoeBrand !== "Alla märken" ? selectedShoeBrand : undefined,
          helmetSize: selectedCategory === "Hjälmar" && selectedHelmetSize !== "Alla storlekar" ? selectedHelmetSize : undefined,
          helmetBrand: selectedCategory === "Hjälmar" && selectedHelmetBrand !== "Alla märken" ? selectedHelmetBrand : undefined,
          watchSize: selectedCategory === "Klockor" && selectedWatchSize !== "Alla storlekar" ? selectedWatchSize : undefined,
          watchBrand: selectedCategory === "Klockor" && selectedWatchBrand !== "Alla märken" ? selectedWatchBrand : undefined,
        });
        setAds(response.data.ads);
      } catch (error) {
        console.error('Error fetching ads:', error);
        setAds([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAds();
  }, [
    searchTerm, selectedCategory, selectedCondition,
    selectedBikeSize, selectedBikeBrand, selectedLocation, 
    selectedClothingSize, selectedClothingBrand,
    selectedShoeSize, selectedShoeBrand,
    selectedHelmetSize, selectedHelmetBrand,
    selectedWatchSize, selectedWatchBrand,
  ]);

  // Update dynamic min/max price and histogram
  useEffect(() => {
    if (ads.length > 0) {
      const prices = ads.map(ad => ad.price || 0);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      setMinPrice(min);
      setMaxPrice(max);
      setPriceRange([min, max]);

      // Histogram with 20 bins
      const binCount = 20;
      const bins = new Array(binCount).fill(0);
      const step = (max - min) / binCount || 1;
      prices.forEach(price => {
        const idx = Math.min(binCount - 1, Math.floor((price - min) / step));
        bins[idx]++;
      });
      setHistogram(bins);
    } else {
      setMinPrice(0);
      setMaxPrice(0);
      setPriceRange([0, 0]);
      setHistogram([]);
    }
  }, [ads]);

  const handleFavorite = async (id: string) => {
    try {
      const result = await adsApi.toggleFavorite(id);
      setAds(prevAds => prevAds.map(ad => 
        ad.id === id ? { ...ad, isFavorited: result.isFavorited } : ad
      ));
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  // Filter ads by price range
  const filteredAds = ads.filter(ad => {
    if (!ad.price) return true;
    return ad.price >= priceRange[0] && ad.price <= priceRange[1];
  });

  const clearFilters = () => {
    setSelectedCategory("Alla kategorier");
    setSelectedCondition("Alla skick");
    setSelectedLocation("Alla orter");
    setSearchTerm("");
    setSelectedBikeSize("Alla storlekar");
    setSelectedBikeBrand("Alla märken");
    setSelectedClothingSize("Alla storlekar");
    setSelectedClothingBrand("Alla märken");
    setSelectedShoeSize("Alla storlekar");
    setSelectedShoeBrand("Alla märken");
    setSelectedHelmetSize("Alla storlekar");
    setSelectedHelmetBrand("Alla märken");
    setSelectedWatchSize("Alla storlekar");
    setSelectedWatchBrand("Alla märken");
    setPriceRange([minPrice, maxPrice]);
  };

  const activeFiltersCount = [
    selectedCategory, selectedCondition, selectedBikeSize, selectedBikeBrand, selectedLocation, selectedClothingSize, selectedClothingBrand,
    selectedShoeSize, selectedShoeBrand, selectedHelmetSize, selectedHelmetBrand, selectedWatchSize, selectedWatchBrand
  ].filter(filter => !filter.startsWith("Alla")).length +
  (priceRange[0] !== minPrice || priceRange[1] !== maxPrice ? 1 : 0);

  // Update handler for category change: reset all sidebar filters to default when category changes
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    // Reset all sidebar filters to default (regardless of which category is picked)
    setSelectedCondition("Alla skick");
    setSelectedBikeSize("Alla storlekar");
    setSelectedBikeBrand("Alla märken");
    setSelectedClothingSize("Alla storlekar");
    setSelectedClothingBrand("Alla märken");
    setSelectedShoeSize("Alla storlekar");
    setSelectedShoeBrand("Alla märken");
    setSelectedHelmetSize("Alla storlekar");
    setSelectedHelmetBrand("Alla märken");
    setSelectedWatchSize("Alla storlekar");
    setSelectedWatchBrand("Alla märken");
    setPriceRange([minPrice, maxPrice]);
    // Location is NOT reset here, stays as selected
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-8">
        {/* Sidebar */}
        {selectedCategory !== "Alla kategorier" && (
          <aside className="w-full max-w-xs hidden lg:block mt-[100px] -ml-[160px]">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {/* Price filter with histogram */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Pris</label>
                {maxPrice > 0 ? (
                  <>
                    {/* Histogram */}
                    <div className="relative h-12 mb-2 flex items-end gap-[1px]">
                      {histogram.map((count, i) => {
                        const maxCount = Math.max(...histogram);
                        const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                        return (
                          <div
                            key={i}
                            className="flex-1 bg-gray-300 rounded-t"
                            style={{ height: `${height}%` }}
                          />
                        );
                      })}
                    </div>

                    {/* Slider */}
                    <SliderPrimitive.Root
                      className="relative flex w-full touch-none select-none items-center"
                      min={minPrice}
                      max={maxPrice}
                      step={100}
                      value={priceRange}
                      onValueChange={(val: [number, number]) => setPriceRange(val)}
                    >
                      <SliderPrimitive.Track className="relative h-1 w-full grow rounded-full bg-gray-200">
                        <SliderPrimitive.Range className="absolute h-full rounded-full bg-blue-500" />
                      </SliderPrimitive.Track>
                      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full bg-blue-600 shadow focus:outline-none" />
                      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full bg-blue-600 shadow focus:outline-none" />
                    </SliderPrimitive.Root>

                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>{priceRange[0]} kr</span>
                      <span>{priceRange[1]} kr</span>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Inga priser tillgängliga</p>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Skick</label>
                <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                  <SelectTrigger>
                    <SelectValue placeholder="Alla skick" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONDITIONS.map(condition => (
                      <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedCategory === "Cyklar" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Cykelstorlek</label>
                    <Select value={selectedBikeSize} onValueChange={setSelectedBikeSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Alla storlekar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Alla storlekar">Alla storlekar</SelectItem>
                      {BIKE_SIZE_CODES.map((code, idx) => (
                        <SelectItem key={code} value={code}>{BIKE_SIZE_BUCKETS[idx]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Cykelmärke</label>
                    <Select value={selectedBikeBrand} onValueChange={setSelectedBikeBrand}>
                      <SelectTrigger>
                        <SelectValue placeholder="Alla märken" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alla märken">Alla märken</SelectItem>
                        {BIKE_BRANDS.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {selectedCategory === "Kläder" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Storlek</label>
                    <Select value={selectedClothingSize} onValueChange={setSelectedClothingSize}>
                      <SelectTrigger>
                        <SelectValue placeholder="Alla storlekar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alla storlekar">Alla storlekar</SelectItem>
                        {CLOTHING_SIZES.map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Märke</label>
                    <Select value={selectedClothingBrand} onValueChange={setSelectedClothingBrand}>
                      <SelectTrigger>
                        <SelectValue placeholder="Alla märken" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alla märken">Alla märken</SelectItem>
                        {CLOTHING_BRANDS.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {selectedCategory === "Skor" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Skostorlek</label>
                    <Select value={selectedShoeSize} onValueChange={setSelectedShoeSize}>
                      <SelectTrigger>
                        <SelectValue placeholder="Alla storlekar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alla storlekar">Alla storlekar</SelectItem>
                        {SHOE_SIZES.map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Märke</label>
                    <Select value={selectedShoeBrand} onValueChange={setSelectedShoeBrand}>
                      <SelectTrigger>
                        <SelectValue placeholder="Alla märken" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alla märken">Alla märken</SelectItem>
                        {SHOE_BRANDS.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {selectedCategory === "Hjälmar" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Storlek</label>
                    <Select value={selectedHelmetSize} onValueChange={setSelectedHelmetSize}>
                      <SelectTrigger>
                        <SelectValue placeholder="Alla storlekar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alla storlekar">Alla storlekar</SelectItem>
                        {HELMET_SIZES.map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Märke</label>
                    <Select value={selectedHelmetBrand} onValueChange={setSelectedHelmetBrand}>
                      <SelectTrigger>
                        <SelectValue placeholder="Alla märken" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alla märken">Alla märken</SelectItem>
                        {HELMET_BRANDS.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              {selectedCategory === "Klockor" && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Märke</label>
                    <Select value={selectedWatchBrand} onValueChange={setSelectedWatchBrand}>
                      <SelectTrigger>
                        <SelectValue placeholder="Alla märken" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alla märken">Alla märken</SelectItem>
                        {WATCH_BRANDS.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Storlek</label>
                    <Select value={selectedWatchSize} onValueChange={setSelectedWatchSize}>
                      <SelectTrigger>
                        <SelectValue placeholder="Alla storlekar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alla storlekar">Alla storlekar</SelectItem>
                        {WATCH_SIZES.map(size => (
                          <SelectItem key={size} value={size}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </aside>
        )}
        {/* Main content */}
        <div className="flex-1">
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
              
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Location filter */}
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Alla orter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Alla orter">Alla orter</SelectItem>
                  {LOCATIONS.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
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
                isFavorited={ad.isFavorited}
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

      <MessageDialog
        open={messageDialog.open}
        onOpenChange={(open) => setMessageDialog(prev => ({ ...prev, open }))}
        adId={messageDialog.adId}
        adTitle={messageDialog.adTitle}
        sellerName={messageDialog.sellerName}
      />
    </div>
  );
};

export default Annonser;
