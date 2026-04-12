import { SEO } from "@/components/SEO";
import { BoatGrid } from "@/components/BoatGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { mockBoats } from "@/lib/mockData";
import { Search, Anchor, Users, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <SEO
        title="Speed Boat Rentals - Book Your Ocean Adventure"
        description="Discover premium speed boats for rent. Browse available boats, book your experience, and create unforgettable coastal memories."
      />
      
      <div className="min-h-screen">
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-navy/90 to-primary/80 z-10" />
          <img
            src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1600&auto=format&fit=crop"
            alt="Speed boat on ocean"
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          <div className="relative z-20 max-w-4xl mx-auto px-6 text-center space-y-6">
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white">
              Your Ocean Adventure Awaits
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              Discover premium speed boats for rent. Book in minutes and create unforgettable memories on the water.
            </p>
            
            <div className="flex gap-3 max-w-xl mx-auto bg-white rounded-lg p-2 shadow-xl">
              <Input
                placeholder="Search by location..."
                className="border-0 focus-visible:ring-0 text-base"
              />
              <Button size="lg" className="bg-accent hover:bg-accent/90">
                <Search className="w-5 h-5 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="w-14 h-14 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
                <Anchor className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-semibold">Premium Fleet</h3>
              <p className="text-muted-foreground">
                Expertly maintained boats with top safety standards and modern amenities.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-14 h-14 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
                <Users className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-semibold">Trusted Owners</h3>
              <p className="text-muted-foreground">
                Verified boat owners with excellent ratings and customer reviews.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-14 h-14 mx-auto bg-accent/10 rounded-full flex items-center justify-center">
                <Shield className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-semibold">Safe & Secure</h3>
              <p className="text-muted-foreground">
                Comprehensive insurance coverage and 24/7 customer support for peace of mind.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
                Featured Boats
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore our handpicked selection of premium speed boats available for your next adventure.
              </p>
            </div>
            
            <BoatGrid boats={mockBoats} showFilters={true} />
          </div>
        </section>

        <footer className="bg-primary text-primary-foreground py-12 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h3 className="font-heading text-2xl font-bold mb-2">Ready to Set Sail?</h3>
            <p className="text-primary-foreground/80 mb-6">
              Book your speed boat experience today and discover the freedom of the open water.
            </p>
            <Button size="lg" variant="secondary" className="font-semibold">
              Browse All Boats
            </Button>
            
            <div className="mt-12 pt-8 border-t border-primary-foreground/20 text-sm text-primary-foreground/60">
              <p>© 2026 Speed Boat Rentals. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}