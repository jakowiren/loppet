import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { adsApi } from "@/lib/api";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast"; // or "sonner"

const AdDetails = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ["ad", id],
    queryFn: () => adsApi.getAd(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="animate-spin w-6 h-6" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Kunde inte hämta annonsen.
      </div>
    );
  }

  if (!data) return null;

  const ad = data;

  const handleBuy = () => {
    toast({
      title: "Köp",
      description: "Köpfunktion kommer snart!",
    });
  };

  const handleContactSeller = () => {
    toast({
      title: "Kontakta säljaren",
      description: `Kontaktfunktion kommer snart för ${ad.seller.displayName || ad.seller.username}.`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">{ad.title}</h1>
      <img
        src={ad.images[0] || "/placeholder-product.jpg"}
        alt={ad.title}
        className="w-full h-80 object-cover rounded-lg mb-4"
      />
      <p className="text-lg font-semibold text-blue-600 mb-2">
        {ad.price} kr
      </p>
      <p className="mb-4">{ad.description}</p>

      <div className="text-sm text-gray-600 mb-6 space-y-1">
        <p>Plats: {ad.location}</p>

        {/* Seller Link */}
        <p>
          Säljare:{" "}
          <Link
            to={`/profile/${ad.seller.username}`}
            className="text-blue-600 hover:underline font-medium"
          >
            {ad.seller.displayName || ad.seller.username}
          </Link>
        </p>

        <p>Omdöme: ⭐ {ad.seller.rating}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          onClick={handleBuy}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg py-6"
        >
          Köp
        </Button>
        <Button
          onClick={handleContactSeller}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
        >
          Kontakta säljaren
        </Button>
      </div>
    </div>
  );
};

export default AdDetails;
