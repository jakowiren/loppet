import { useParams, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { adsApi } from "@/lib/api";
import { Loader2, ChevronLeft, ChevronRight, X, Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import MessageDialog from "@/components/MessageDialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import axios from "axios"; // For image upload/delete
import { heicTo } from "heic-to"; // Add this import
import { useRef } from "react";

const CATEGORIES = [
  { label: "Cyklar", value: "Cyklar" },
  { label: "Kläder", value: "Kläder" },
  { label: "Skor", value: "Skor" },
  { label: "Tillbehör", value: "Tillbehör" },
  { label: "Klockor", value: "Klockor" },
  { label: "Hjälmar", value: "Hjälmar" },
  { label: "Nutrition", value: "Nutrition" },
  { label: "Annat", value: "Annat" }
];

const CONDITIONS = [
  { label: "Nytt", value: "NYTT" },
  { label: "Som nytt", value: "SOM_NYTT" },
  { label: "Mycket bra", value: "MYCKET_BRA" },
  { label: "Bra", value: "BRA" },
  { label: "Acceptabelt", value: "ACCEPTABELT" }
];

const BIKE_SIZE_OPTIONS = [
  { label: "42", value: "42" }, { label: "43", value: "43" }, { label: "44", value: "44" },
  { label: "45", value: "45" }, { label: "46", value: "46" }, { label: "47", value: "47" },
  { label: "48", value: "48" }, { label: "49", value: "49" }, { label: "50", value: "50" },
  { label: "51", value: "51" }, { label: "52", value: "52" }, { label: "53", value: "53" },
  { label: "54", value: "54" }, { label: "55", value: "55" }, { label: "56", value: "56" },
  { label: "57", value: "57" }, { label: "58", value: "58" }, { label: "59", value: "59" },
  { label: "60", value: "60" }, { label: "61", value: "61" }, { label: "62", value: "62" },
  { label: "63", value: "63" }, { label: "64", value: "64" },
  { label: "XXXS", value: "XXXS" }, { label: "XXS", value: "XXS" }, { label: "XS", value: "XS" },
  { label: "S", value: "S" }, { label: "M", value: "M" }, { label: "L", value: "L" },
  { label: "XL", value: "XL" }, { label: "XXL", value: "XXL" }, { label: "XXXL", value: "XXXL" }
];

const BIKE_BRANDS = [
  "Trek", "Specialized", "Cannondale", "Bianchi", "Colnago", "Cervélo", "Scott", "Giant", "Cube", "Orbea", "Annat"
];

const SHOE_SIZES = [
  "36", "37", "38", "39", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "50"
];

const SHOE_BRANDS = [
  "Sidi", "Shimano", "Giro", "Specialized", "Fizik", "Bontrager", "Pearl Izumi", "Salomon", "Asics", "Nike", "Adidas", "Brooks", "Hoka", "Saucony", "New Balance", "Mizuno", "Altra", "On Running", "Annat"
];

const CLOTHING_SIZES = [
  "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"
];

const CLOTHING_BRANDS = [
  "Castelli", "Gore Wear", "Assos", "Pearl Izumi", "Rapha", "Santini", "Endura", "Craft", "2XU", "Salomon", "The North Face", "Patagonia", "Haglöfs", "Adidas", "Nike", "Puma", "Annat"
];

const AdDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["ad", id],
    queryFn: () => adsApi.getAd(id!),
    enabled: !!id,
  });

  const ad = data; // <-- Move this up, before any useEffect that uses 'ad'

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
    category: "",
    condition: "",
    // Category-specific fields
    bikeSize: "",
    bikeBrand: "",
    shoeSize: "",
    shoeBrand: "",
    clothingSize: "",
    clothingBrand: "",
    images: [] as string[], // <-- Add images array
  });

  const [loadingImages, setLoadingImages] = useState<string[]>([]);

  useEffect(() => {
    if (ad) {
      setEditForm({
        title: ad.title,
        description: ad.description,
        price: ad.price,
        location: ad.location,
        category: ad.category || "",
        condition: ad.condition || "",
        bikeSize: ad.bikeSize || "",
        bikeBrand: ad.bikeBrand || "",
        shoeSize: ad.shoeSize || "",
        shoeBrand: ad.shoeBrand || "",
        clothingSize: ad.clothingSize || "",
        clothingBrand: ad.clothingBrand || "",
        images: ad.images || [],
      });
    }
  }, [ad]);

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

  // Check if current user is the owner of the ad
  const isOwner = user && user.id === ad.seller.id;

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
      category: ad.category || "",
      condition: ad.condition || "",
      // Category-specific fields
      bikeSize: ad.bikeSize || "",
      bikeBrand: ad.bikeBrand || "",
      shoeSize: ad.shoeSize || "",
      shoeBrand: ad.shoeBrand || "",
      clothingSize: ad.clothingSize || "",
      clothingBrand: ad.clothingBrand || "",
      images: ad.images || [], // <-- Reset images
    });
  };

  // --- Save handler: send updated images to backend ---
  const handleSave = async () => {
    try {
      setIsSaving(true);
      await adsApi.updateAd(ad.id, {
        ...editForm,
        images: editForm.images, // Send updated image URLs
      });
      queryClient.invalidateQueries({ queryKey: ["ad", id] });
      setIsEditing(false);
      toast.success("Annons uppdaterad!");
    } catch (error: any) {
      toast.error("Kunde inte uppdatera annons: " + (error.response?.data?.error || "Okänt fel"));
    } finally {
      setIsSaving(false);
    }
  };

  // Get auth token for protected endpoints
  const { token } = useAuth();

  // Helper to convert HEIC/HEIF File to JPEG File
  async function convertHEICFileToJPEG(file: File): Promise<File> {
    try {
      const jpegBlob = await heicTo({
        blob: file,
        type: "image/jpeg",
        quality: 0.7,
      });
      return new File(
        [jpegBlob],
        file.name.replace(/\.(heic|heif)$/i, ".jpg"),
        { type: "image/jpeg" }
      );
    } catch (err) {
      console.error("Failed to convert HEIC file:", err);
      throw err;
    }
  }

  // --- Image upload handler with HEIC placeholder spinner ---
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (editForm.images.length + files.length > 5) {
      toast.error("Max 5 bilder är tillåtna.");
      return;
    }

    const processedFiles: File[] = [];
    const tempIds: string[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (
        file.type === "image/heic" ||
        file.type === "image/heif" ||
        ext === "heic" ||
        ext === "heif"
      ) {
        // Generate a temporary ID for the placeholder
        const tempId = `loading-${Date.now()}-${Math.random()}`;
        tempIds.push(tempId);

        // Add placeholder to images and loadingImages
        setEditForm((prev) => ({
          ...prev,
          images: [...prev.images, tempId],
        }));
        setLoadingImages((prev) => [...prev, tempId]);

        try {
          const convertedFile = await convertHEICFileToJPEG(file);
          processedFiles.push(convertedFile);
        } catch (err) {
          // Remove placeholder if conversion fails
          setEditForm((prev) => ({
            ...prev,
            images: prev.images.filter((img) => img !== tempId),
          }));
          setLoadingImages((prev) => prev.filter((id) => id !== tempId));
          toast.error("Kunde inte konvertera HEIC-bild. Använd JPEG/PNG istället.");
        }
      } else {
        processedFiles.push(file);
      }
    }

    if (processedFiles.length === 0) return;

    const formData = new FormData();
    processedFiles.forEach((file) => formData.append("images", file));
    try {
      const res = await axios.post("/api/upload/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const newImages = res.data.images.map((img: any) => img.url);

      // Replace placeholders with real image URLs
      setEditForm((prev) => {
        let images = [...prev.images];
        tempIds.forEach((tempId, idx) => {
          const realUrl = newImages[idx];
          const tempIndex = images.indexOf(tempId);
          if (tempIndex !== -1 && realUrl) {
            images[tempIndex] = realUrl;
          }
        });
        // Add any non-HEIC images at the end
        if (newImages.length > tempIds.length) {
          images = images.concat(newImages.slice(tempIds.length));
        }
        return { ...prev, images };
      });
      setLoadingImages((prev) => prev.filter((id) => !tempIds.includes(id)));
      toast.success("Bilder uppladdade!");
    } catch (err: any) {
      // Remove placeholders on error
      setEditForm((prev) => ({
        ...prev,
        images: prev.images.filter((img) => !tempIds.includes(img)),
      }));
      setLoadingImages((prev) => prev.filter((id) => !tempIds.includes(id)));
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Okänt fel";
      toast.error("Kunde inte ladda upp bilder: " + msg);
    }
  };

  // --- Image delete handler ---
  const handleImageDelete = async (imgUrl: string, idx: number) => {
    // Extract filename from URL (assuming /ad-images/filename.ext)
    const parts = imgUrl.split("/");
    const fileName = parts[parts.length - 1];
    try {
      await axios.delete(`/api/upload/images/${fileName}`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      setEditForm((prev) => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== idx),
      }));
      toast.success("Bild borttagen!");
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Okänt fel";
      toast.error("Kunde inte ta bort bild: " + msg);
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

        {/* --- Image management in edit mode --- */}
        {isEditing && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bilder</label>
            <div className="flex gap-2 flex-wrap mb-2">
              {editForm.images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 flex items-center justify-center bg-gray-100 rounded">
                  {loadingImages.includes(img) ? (
                    // Show spinner for loading images
                    <svg className="animate-spin h-8 w-8 text-gray-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                  ) : (
                    <img src={img} className="w-20 h-20 object-cover rounded" alt={`Bild ${idx + 1}`} />
                  )}
                  {editForm.images.length > 1 && !loadingImages.includes(img) && (
                    <button
                      type="button"
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      onClick={() => handleImageDelete(img, idx)}
                      title="Ta bort bild"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-400">
                <span className="text-2xl text-gray-400">+</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">Max 5 bilder. Endast JPG, PNG, WebP, HEIC, HEIF.</p>
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
        <p className="mb-4 whitespace-pre-line">{ad.description}</p>
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

        {/* Metadata Display */}
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <Select value={editForm.category} onValueChange={(value) => setEditForm({...editForm, category: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Välj kategori" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skick</label>
              <Select value={editForm.condition} onValueChange={(value) => setEditForm({...editForm, condition: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Välj skick" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="flex gap-2 flex-wrap mb-2">
            {ad.category && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {CATEGORIES.find(c => c.value === ad.category)?.label || ad.category}
              </Badge>
            )}
            {ad.condition && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                {CONDITIONS.find(c => c.value === ad.condition)?.label || ad.condition}
              </Badge>
            )}
          </div>
        )}

        {/* Category-specific fields display */}
        {!isEditing && (
          <div className="text-sm text-gray-600 space-y-1">
            {/* Bike-specific fields */}
            {ad.category === "Cyklar" && (
              <>
                {ad.bikeSize && <p>Cykelstorlek: {ad.bikeSize}</p>}
                {ad.bikeBrand && <p>Cykelmärke: {ad.bikeBrand}</p>}
              </>
            )}

            {/* Shoe-specific fields */}
            {ad.category === "Skor" && (
              <>
                {ad.shoeSize && <p>Skostorlek: {ad.shoeSize}</p>}
                {ad.shoeBrand && <p>Skomärke: {ad.shoeBrand}</p>}
              </>
            )}

            {/* Clothing-specific fields */}
            {ad.category === "Kläder" && (
              <>
                {ad.clothingSize && <p>Klädstorlek: {ad.clothingSize}</p>}
                {ad.clothingBrand && <p>Klädmärke: {ad.clothingBrand}</p>}
              </>
            )}
          </div>
        )}

        {/* Category-specific fields editing */}
        {isEditing && (
          <div className="space-y-3 mt-4">
            {/* Bike-specific fields */}
            {editForm.category === "Cyklar" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cykelstorlek</label>
                  <Select value={editForm.bikeSize} onValueChange={(value) => setEditForm({...editForm, bikeSize: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj cykelstorlek" />
                    </SelectTrigger>
                    <SelectContent>
                      {BIKE_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cykelmärke</label>
                  <Select value={editForm.bikeBrand} onValueChange={(value) => setEditForm({...editForm, bikeBrand: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj cykelmärke" />
                    </SelectTrigger>
                    <SelectContent>
                      {BIKE_BRANDS.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Shoe-specific fields */}
            {editForm.category === "Skor" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skostorlek</label>
                  <Select value={editForm.shoeSize} onValueChange={(value) => setEditForm({...editForm, shoeSize: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj skostorlek" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHOE_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skomärke</label>
                  <Select value={editForm.shoeBrand} onValueChange={(value) => setEditForm({...editForm, shoeBrand: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj skomärke" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHOE_BRANDS.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {/* Clothing-specific fields */}
            {editForm.category === "Kläder" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Klädstorlek</label>
                  <Select value={editForm.clothingSize} onValueChange={(value) => setEditForm({...editForm, clothingSize: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj klädstorlek" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLOTHING_SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Klädmärke</label>
                  <Select value={editForm.clothingBrand} onValueChange={(value) => setEditForm({...editForm, clothingBrand: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj klädmärke" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLOTHING_BRANDS.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
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
