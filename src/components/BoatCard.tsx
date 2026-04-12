import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Gauge, Anchor } from "lucide-react";

export interface Boat {
  id: string;
  name: string;
  imageUrl: string;
  pricePerHour: number;
  capacity: number;
  speed: number;
  location: string;
  featured?: boolean;
}

interface BoatCardProps {
  boat: Boat;
}

export function BoatCard({ boat }: BoatCardProps) {
  return (
    <Link href={`/boats/${boat.id}`}>
      <Card className="group overflow-hidden border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img
            src={boat.imageUrl}
            alt={boat.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {boat.featured && (
            <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
              Featured
            </Badge>
          )}
        </div>
        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="font-heading text-xl font-semibold text-foreground mb-1">
              {boat.name}
            </h3>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Anchor className="w-3.5 h-3.5" />
              {boat.location}
            </p>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {boat.capacity} guests
              </span>
              <span className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4" />
                {boat.speed} knots
              </span>
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-2 border-t border-border/50">
            <div>
              <span className="text-2xl font-heading font-bold text-primary">
                ${boat.pricePerHour}
              </span>
              <span className="text-sm text-muted-foreground">/hour</span>
            </div>
            <span className="text-accent font-medium text-sm group-hover:underline">
              View Details →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}