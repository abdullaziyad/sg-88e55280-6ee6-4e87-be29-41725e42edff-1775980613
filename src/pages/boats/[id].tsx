import { useRouter } from "next/router";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { mockBoats } from "@/lib/mockData";
import { 
  ArrowLeft, Users, Gauge, Anchor, Calendar, 
  Shield, Wrench, Star, MapPin, Phone, Mail 
} from "lucide-react";
import { useState } from "react";

export default function BoatDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [selectedImage, setSelectedImage] = useState(0);

  const boat = mockBoats.find((b) => b.id === id);

  if (!boat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="font-heading text-3xl font-bold">Boat not found</h1>
          <Link href="/">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const galleryImages = [
    boat.imageUrl,
    "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&auto=format&fit=crop",
  ];

  const features = [
    "GPS Navigation System",
    "Premium Sound System",
    "Cooler & Ice Storage",
    "Safety Equipment Included",
    "Bluetooth Connectivity",
    "Sun Deck Area",
  ];

  return (
    <>
      <SEO
        title={`${boat.name} - Speed Boat Rental`}
        description={`Rent ${boat.name} from ${boat.location}. Capacity: ${boat.capacity} guests. Speed: ${boat.speed} knots. Book your ocean adventure today.`}
      />

      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link href="/">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse
            </Button>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <div className="aspect-[16/10] rounded-lg overflow-hidden shadow-lg">
                  <img
                    src={galleryImages[selectedImage]}
                    alt={`${boat.name} - Image ${selectedImage + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`aspect-video rounded-md overflow-hidden border-2 transition-all ${
                        selectedImage === idx
                          ? "border-accent shadow-md"
                          : "border-border/30 hover:border-accent/50"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="font-heading text-4xl font-bold text-foreground mb-2">
                      {boat.name}
                    </h1>
                    <p className="text-lg text-muted-foreground flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {boat.location}
                    </p>
                  </div>
                  {boat.featured && (
                    <Badge className="bg-accent text-accent-foreground text-sm px-3 py-1">
                      Featured
                    </Badge>
                  )}
                </div>

                <Separator className="my-6" />

                <div className="space-y-6">
                  <div>
                    <h2 className="font-heading text-2xl font-semibold mb-4">Quick Specs</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-muted/30 rounded-lg p-4 text-center">
                        <Users className="w-6 h-6 mx-auto mb-2 text-accent" />
                        <p className="text-sm text-muted-foreground">Capacity</p>
                        <p className="font-heading font-semibold text-lg">{boat.capacity} guests</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4 text-center">
                        <Gauge className="w-6 h-6 mx-auto mb-2 text-accent" />
                        <p className="text-sm text-muted-foreground">Max Speed</p>
                        <p className="font-heading font-semibold text-lg">{boat.speed} knots</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4 text-center">
                        <Wrench className="w-6 h-6 mx-auto mb-2 text-accent" />
                        <p className="text-sm text-muted-foreground">Engine</p>
                        <p className="font-heading font-semibold text-lg">Twin 250HP</p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-4 text-center">
                        <Calendar className="w-6 h-6 mx-auto mb-2 text-accent" />
                        <p className="text-sm text-muted-foreground">Year</p>
                        <p className="font-heading font-semibold text-lg">2024</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="font-heading text-2xl font-semibold mb-4">Features & Amenities</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                            <div className="w-2 h-2 rounded-full bg-accent" />
                          </div>
                          <span className="text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h2 className="font-heading text-2xl font-semibold mb-4">About This Boat</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Experience the thrill of the open water with {boat.name}, a premium speed boat 
                      perfect for coastal adventures. Whether you're planning a sunset cruise, 
                      island hopping, or an adrenaline-filled ride, this boat delivers 
                      exceptional performance and comfort. Equipped with top-tier safety features 
                      and modern amenities, your journey will be both exhilarating and secure.
                    </p>
                  </div>
                </div>
              </div>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Anchor className="w-5 h-5 text-accent" />
                    Boat Owner
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                      <Star className="w-8 h-8 text-accent" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-lg">Captain Mike Rodriguez</p>
                      <p className="text-sm text-muted-foreground">Verified Owner · 5 years experience</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                        ))}
                        <span className="text-sm text-muted-foreground ml-1">(127 reviews)</span>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Contact Owner</p>
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Mail className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-8 border-border/50 shadow-lg">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Price</p>
                    <div className="flex items-baseline gap-1">
                      <span className="font-heading text-4xl font-bold text-primary">
                        ${boat.pricePerHour}
                      </span>
                      <span className="text-muted-foreground">/hour</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-accent" />
                      <span className="text-muted-foreground">Fully insured & licensed</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-accent" />
                      <span className="text-muted-foreground">Free cancellation up to 24h</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-accent" />
                      <span className="text-muted-foreground">Safety equipment included</span>
                    </div>
                  </div>

                  <Link href={`/booking?boatId=${boat.id}`}>
                    <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold">
                      Book Now
                    </Button>
                  </Link>

                  <p className="text-xs text-center text-muted-foreground">
                    You won't be charged yet
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}