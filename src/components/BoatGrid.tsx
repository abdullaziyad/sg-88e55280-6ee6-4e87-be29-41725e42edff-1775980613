import { useState } from "react";
import { BoatCard, type Boat } from "@/components/BoatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Users, DollarSign } from "lucide-react";

interface BoatGridProps {
  boats: Boat[];
  showFilters?: boolean;
}

export function BoatGrid({ boats, showFilters = false }: BoatGridProps) {
  const [capacityFilter, setCapacityFilter] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);

  const filteredBoats = boats.filter((boat) => {
    const meetsCapacity = capacityFilter === 0 || boat.capacity >= capacityFilter;
    const meetsPrice = boat.pricePerHour <= maxPrice;
    return meetsCapacity && meetsPrice;
  });

  return (
    <div className="space-y-8">
      {showFilters && (
        <div className="bg-card border border-border/50 rounded-lg p-6 shadow-sm">
          <h3 className="font-heading text-lg font-semibold mb-4">Filter Boats</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <Users className="w-4 h-4 text-accent" />
                Minimum Capacity: {capacityFilter === 0 ? "Any" : `${capacityFilter} guests`}
              </Label>
              <Slider
                value={[capacityFilter]}
                onValueChange={([value]) => setCapacityFilter(value)}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="space-y-3">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="w-4 h-4 text-accent" />
                Max Price: ${maxPrice}/hour
              </Label>
              <Slider
                value={[maxPrice]}
                onValueChange={([value]) => setMaxPrice(value)}
                max={1000}
                step={50}
                className="w-full"
              />
            </div>
          </div>
          
          {(capacityFilter > 0 || maxPrice < 1000) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCapacityFilter(0);
                setMaxPrice(1000);
              }}
              className="mt-4"
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBoats.map((boat) => (
          <BoatCard key={boat.id} boat={boat} />
        ))}
      </div>

      {filteredBoats.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No boats match your filters. Try adjusting your criteria.
          </p>
        </div>
      )}
    </div>
  );
}