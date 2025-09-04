import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Clock, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Ad {
  id: string;
  title: string;
  price: number;
  location: string;
  postedDate: string;
  category: string;
  raceType: string;
  condition: string;
  images: string[];
  description: string;
  seller: {
    name: string;
    rating: number;
  };
}

interface AdCardProps {
  ad: Ad;
  onFavorite?: (id: string) => void;
  isFavorited?: boolean;
}

const AdCard = ({ ad, onFavorite, isFavorited = false }: AdCardProps) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(`/annonser/${ad.id}`);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(ad.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("sv-SE", {
      style: "currency",
      currency: "SEK",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Idag";
    if (diffInDays === 1) return "Igår";
    if (diffInDays < 7) return `${diffInDays} dagar sedan`;
    return date.toLocaleDateString("sv-SE");
  };

  return (
    <Card
      onClick={handleNavigate}
      className="group hover:shadow-lg transition-all duration-300 cursor-pointer bg-white border-gray-200 hover:border-blue-300"
    >
      <CardHeader className="p-0 relative">
        <div className="relative h-48 overflow-hidden rounded-t-lg bg-gray-200 flex items-center justify-center">
          <div className="text-gray-500 text-center">
            <div className="text-4xl mb-2">📦</div>
            <div className="text-sm">No Image</div>
          </div>
          <button
            onClick={handleFavorite}
            className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-sm transition-colors ${
              isFavorited
                ? "bg-red-500 text-white"
                : "bg-white/80 text-gray-700 hover:bg-red-500 hover:text-white"
            }`}
          >
            <Heart
              className={`h-4 w-4 ${isFavorited ? "fill-current" : ""}`}
            />
          </button>
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-blue-600 text-white">
              {ad.raceType}
            </Badge>
          </div>
          <div className="absolute bottom-2 left-2">
            <Badge variant="outline" className="bg-white/90 text-gray-700">
              {ad.condition}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {ad.title}
            </h3>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {formatPrice(ad.price)}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{ad.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDate(ad.postedDate)}</span>
            </div>
          </div>

          <p className="text-sm text-gray-600 line-clamp-2">
            {ad.description}
          </p>

          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-gray-500">
              Säljare: {ad.seller.name} ⭐ {ad.seller.rating}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdCard;
