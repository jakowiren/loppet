import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { adsApi } from "@/lib/api";
import { Loader2, ChevronLeft, ChevronRight, X, Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MessageDialog from "@/components/MessageDialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const AdDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["ad", id],
    queryFn: () => adsApi.getAd(id!),
    enabled: !!id,
  });

  const [messageDialog, setMessageDialog] = useState<{
    open: boolean;
    adId: string;
    adTitle: string;
    sellerName: string;
  }>({
    open: false,
    adId: "",
    adTitle: "",
    sellerName: "",
  });

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    price: 0,
    location: "",
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

  // Check if current user is the owner of the ad
  const isOwner = user && user.id === ad.seller.id;

  // Initialize edit form when ad data loads
  if (ad && !editForm.title) {
    setEditForm({
      title: ad.title,
      description: ad.description,
      price: ad.price,
      location: ad.location,
    });
  }

  const handleContactSeller = () => {
    setMessageDialog({
      open: true,
      adId: ad.id,
      adTitle: ad.title,
      sellerName: ad.seller.displayName || ad.seller.username,
    });
  };

  const nextImage = () => {
    if (ad?.images && ad.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % ad.images.length);
    }
  };

  const prevImage = () => {
    if (ad?.images && ad.images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + ad.images.length) % ad.images.length);
    }
  };

  const openImageModal = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      title: ad.title,
      description: ad.description,
      price: ad.price,
      location: ad.location,
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await adsApi.updateAd(ad.id, editForm);

      // Update the query cache
      queryClient.invalidateQueries({ queryKey: ["ad", id] });

      setIsEditing(false);
      toast.success("Annons uppdaterad!");
    } catch (error: any) {
      toast.error("Kunde inte uppdatera annons: " + (error.response?.data?.error || "Okänt fel"));
    } finally {
      setIsSaving(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg">
      <div className="flex justify-between items-start mb-4">
        {isEditing ? (
          <Input
            value={editForm.title}
            onChange={(e) => setEditForm({...editForm, title: e.target.value})}
            className="text-2xl font-bold flex-1 mr-4"
            placeholder="Annons titel"
          />
        ) : (
          <h1 className="text-2xl font-bold">{ad.title}</h1>
        )}

        {isOwner && !isEditing && (
          <Button onClick={handleEdit} variant="outline" className="ml-4">
            <Edit className="h-4 w-4 mr-2" />
            Redigera
          </Button>
        )}

        {isOwner && isEditing && (
          <div className="flex gap-2 ml-4">
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Sparar..." : "Spara"}
            </Button>
            <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Avbryt
            </Button>
          </div>
        )}
      </div>

      {/* Image Gallery */}
      <div className="mb-6">
        {/* Main Image */}
        <div className="relative mb-4">
          <img
            src={ad.images[currentImageIndex] || "/placeholder-product.jpg"}
            alt={`${ad.title} - bild ${currentImageIndex + 1}`}
            className="w-full h-80 object-cover rounded-lg cursor-pointer hover:brightness-95 transition-all"
            onClick={() => openImageModal(currentImageIndex)}
          />

          {/* Navigation arrows - only show if more than 1 image */}
          {ad.images && ad.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {ad.images.length}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Navigation - only show if more than 1 image */}
        {ad.images && ad.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {ad.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentImageIndex
                    ? 'border-blue-500 scale-105'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
      {isEditing ? (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Pris (kr)</label>
          <Input
            type="number"
            value={editForm.price}
            onChange={(e) => setEditForm({...editForm, price: Number(e.target.value)})}
            className="w-32 mb-4"
            placeholder="Pris"
          />
        </div>
      ) : (
        <p className="text-lg font-semibold text-blue-600 mb-2">
          {ad.price} kr
        </p>
      )}

      {isEditing ? (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivning</label>
          <Textarea
            value={editForm.description}
            onChange={(e) => setEditForm({...editForm, description: e.target.value})}
            rows={4}
            placeholder="Beskrivning av produkten"
          />
        </div>
      ) : (
        <p className="mb-4">{ad.description}</p>
      )}

      <div className="text-sm text-gray-600 mb-6 space-y-1">
        {isEditing ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plats</label>
            <Input
              value={editForm.location}
              onChange={(e) => setEditForm({...editForm, location: e.target.value})}
              placeholder="Ort eller region"
              className="mb-2"
            />
          </div>
        ) : (
          <p>Plats: {ad.location}</p>
        )}

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
      </div>

      {/* Action Buttons */}
      {!isOwner && (
        <div className="flex gap-4">
          <Button
            onClick={handleContactSeller}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-lg py-6"
          >
            Kontakta säljaren
          </Button>
        </div>
      )}

      {/* Contact Seller Dialog */}
      <MessageDialog
        open={messageDialog.open}
        onOpenChange={(open) =>
          setMessageDialog((prev) => ({ ...prev, open }))
        }
        adId={messageDialog.adId}
        adTitle={messageDialog.adTitle}
        sellerName={messageDialog.sellerName}
      />

      {/* Fullscreen Image Modal */}
      {showImageModal && ad.images && ad.images.length > 0 && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-full p-4">
            {/* Close button */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-2 right-2 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Main modal image */}
            <img
              src={ad.images[currentImageIndex]}
              alt={`${ad.title} - bild ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Navigation arrows in modal - only if more than 1 image */}
            {ad.images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-3 hover:bg-black/70 transition-colors"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Image counter in modal */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full">
                  {currentImageIndex + 1} / {ad.images.length}
                </div>
              </>
            )}

            {/* Thumbnail strip in modal - only if more than 1 image */}
            {ad.images.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 flex justify-center">
                <div className="flex gap-2 overflow-x-auto max-w-full px-4">
                  {ad.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex(index);
                      }}
                      className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? 'border-white scale-110'
                          : 'border-gray-400 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdDetails;
