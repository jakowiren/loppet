import { useState, useEffect } from "react";
import { adsApi, uploadApi } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Camera, MapPin, Tag, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Bike size options for dropdown (both numeric and bucket codes)
const BIKE_SIZE_OPTIONS = [
  { label: "42", value: "42" },
  { label: "43", value: "43" },
  { label: "44", value: "44" },
  { label: "45", value: "45" },
  { label: "46", value: "46" },
  { label: "47", value: "47" },
  { label: "48", value: "48" },
  { label: "49", value: "49" },
  { label: "50", value: "50" },
  { label: "51", value: "51" },
  { label: "52", value: "52" },
  { label: "53", value: "53" },
  { label: "54", value: "54" },
  { label: "55", value: "55" },
  { label: "56", value: "56" },
  { label: "57", value: "57" },
  { label: "58", value: "58" },
  { label: "59", value: "59" },
  { label: "60", value: "60" },
  { label: "61", value: "61" },
  { label: "62", value: "62" },
  { label: "63", value: "63" },
  { label: "64", value: "64" },
  { label: "XXXS", value: "XXXS" },
  { label: "XXS", value: "XXS" },
  { label: "XS", value: "XS" },
  { label: "S", value: "S" },
  { label: "M", value: "M" },
  { label: "L", value: "L" },
  { label: "XL", value: "XL" },
  { label: "XXL", value: "XXL" },
  { label: "XXXL", value: "XXXL" }
];

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

const LOCATIONS = [
  "Stockholm",
  "Göteborg",
  "Malmö",
  "Uppsala",
  "Linköping",
  "Västerås",
  "Örebro",
  "Norrköping",
  "Helsingborg",
  "Jönköping",
  "Umeå",
  "Lund",
  "Borås",
  "Sundsvall",
  "Gävle"
];

const BIKE_BRANDS = [
  "Trek", "Specialized", "Cannondale", "Bianchi", "Colnago", "Cervélo", "Scott", "Giant", "Cube", "Orbea", "Annat"
];

// Update FormData interface
interface FormData {
  title: string;
  description: string;
  price: string;
  category: string;
  condition: string;
  location: string;
  images: File[];
  bikeSize?: string; // now only one field for dropdown
  bikeBrand?: string;
}

const SkapaAnnons = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    location: "",
    images: [],
    bikeSize: "",
    bikeBrand: ""
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login-to-create');
    }
  }, [user, isLoading, navigate]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.images.length + files.length > 5) {
      alert("Du kan ladda upp max 5 bilder");
      return;
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors: Partial<FormData> = {};

    if (!formData.title.trim()) newErrors.title = "Titel krävs";
    if (!formData.description.trim()) newErrors.description = "Beskrivning krävs";
    if (!formData.price.trim()) newErrors.price = "Pris krävs";
    if (!formData.category) newErrors.category = "Kategori krävs";
    if (!formData.condition) newErrors.condition = "Skick krävs";
    if (!formData.location) newErrors.location = "Plats krävs";

    if (formData.price && isNaN(Number(formData.price))) {
      newErrors.price = "Priset måste vara ett nummer";
    }

    if (formData.category === "Cyklar") {
      if (!formData.bikeSize) {
        newErrors.bikeSize = "Du måste välja en cykelstorlek";
      }
      if (!formData.bikeBrand) newErrors.bikeBrand = "Cykelmärke krävs";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper to map selected value to bucket code for filtering
  function getBikeSizeBucket(selected: string) {
    if (["XXXS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"].includes(selected)) {
      return selected;
    }
    const num = Number(selected);
    if (!isNaN(num)) {
      if (num < 45) return "XXXS";
      if (num >= 45 && num <= 47) return "XXS";
      if (num >= 48 && num <= 50) return "XS";
      if (num >= 51 && num <= 52) return "S";
      if (num >= 53 && num <= 55) return "M";
      if (num >= 56 && num <= 58) return "L";
      if (num >= 59 && num <= 62) return "XL";
      if (num >= 63 && num <= 64) return "XXL";
      if (num > 64) return "XXXL";
    }
    return undefined;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      let imageUrls: string[] = [];

      // Upload images first if any are selected
      if (formData.images.length > 0) {
        const uploadResponse = await uploadApi.uploadImages(formData.images);
        imageUrls = uploadResponse.images.map((img: any) => img.url);
      }

      // Always send the bucket code for filtering
      const bikeSizeBucket = formData.category === "Cyklar" ? getBikeSizeBucket(formData.bikeSize || "") : undefined;

      // Create ad with image URLs
      await adsApi.createAd({
        title: formData.title,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        condition: formData.condition,
        location: formData.location,
        images: imageUrls,
        bikeSize: bikeSizeBucket,
        bikeBrand: formData.category === "Cyklar" ? formData.bikeBrand : undefined,
      });

      // Navigate to ads page after successful submission
      navigate("/annonser");
    } catch (error: any) {
      console.error("Error creating ad:", error);
      alert(error.response?.data?.error || "Kunde inte skapa annons. Försök igen.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laddar...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Skapa ny annons
          </h1>
          <p className="text-gray-600">
            Sälj din lopputrustning till andra entusiaster
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Grundläggande information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="t.ex. Trek Speed Concept - Timetrial cykel"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="description">Beskrivning *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Beskriv din utrustning i detalj..."
                  rows={4}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <Label htmlFor="price">Pris (SEK) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="0"
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Kategorisering
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <Label>Kategori *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                      <SelectValue placeholder="Välj kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(category => (
                        <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <Label>Skick *</Label>
                  <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
                    <SelectTrigger className={errors.condition ? "border-red-500" : ""}>
                      <SelectValue placeholder="Välj skick" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDITIONS.map(condition => (
                        <SelectItem key={condition.value} value={condition.value}>{condition.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.condition && <p className="text-red-500 text-sm mt-1">{errors.condition}</p>}
                </div>

                <div>
                  <Label>Plats *</Label>
                  <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
                    <SelectTrigger className={errors.location ? "border-red-500" : ""}>
                      <SelectValue placeholder="Välj ort" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOCATIONS.map(location => (
                        <SelectItem key={location} value={location}>{location}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                </div>
              </div>

              {/* Bike details - shown only if category is "Cyklar" */}
              {formData.category === "Cyklar" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Cykelstorlek *</Label>
                    <Select
                      value={formData.bikeSize || ""}
                      onValueChange={v => handleInputChange("bikeSize", v)}
                    >
                      <SelectTrigger className={errors.bikeSize ? "border-red-500" : ""}>
                        <SelectValue placeholder="Välj cykelstorlek" />
                      </SelectTrigger>
                      <SelectContent>
                        {BIKE_SIZE_OPTIONS.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.bikeSize && (
                      <p className="text-red-500 text-sm mt-1">{errors.bikeSize}</p>
                    )}
                  </div>
                  <div>
                    <Label>Cykelmärke *</Label>
                    <Select value={formData.bikeBrand || ""} onValueChange={v => handleInputChange("bikeBrand", v)}>
                      <SelectTrigger className={errors.bikeBrand ? "border-red-500" : ""}>
                        <SelectValue placeholder="Välj märke" />
                      </SelectTrigger>
                      <SelectContent>
                        {BIKE_BRANDS.map(brand => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.bikeBrand && <p className="text-red-500 text-sm mt-1">{errors.bikeBrand}</p>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Bilder (max 5)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {formData.images.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  {formData.images.length < 5 && (
                    <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 h-32 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                      <Upload className="h-6 w-6 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Ladda upp bild</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Ladda upp bilder på din utrustning. Första bilden blir huvudbild.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/annonser")}
              className="flex-1"
            >
              Avbryt
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting 
                ? formData.images.length > 0 
                  ? "Laddar upp bilder..." 
                  : "Skapar annons..."
                : "Skapa annons"
              }
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SkapaAnnons;