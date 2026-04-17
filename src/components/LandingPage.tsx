import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  BarChart3,
  Package,
  FileText,
  CreditCard,
  Users,
  Zap,
  Shield,
  Clock,
  Globe,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  const features = [
    {
      icon: ShoppingCart,
      title: "Quick Checkout",
      description: "Fast and intuitive checkout process with barcode scanning support",
    },
    {
      icon: Package,
      title: "Inventory Management",
      description: "Track stock levels with low-stock alerts and automatic notifications",
    },
    {
      icon: BarChart3,
      title: "Sales Analytics",
      description: "Comprehensive reports and insights on your business performance",
    },
    {
      icon: FileText,
      title: "Invoicing & Quotations",
      description: "Professional invoices, quotations, and credit bill management",
    },
    {
      icon: CreditCard,
      title: "Multiple Payment Methods",
      description: "Accept cash and card payments with detailed transaction tracking",
    },
    {
      icon: Users,
      title: "User Management",
      description: "Role-based access control for owners, admins, and cashiers",
    },
  ];

  const benefits = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process transactions in seconds with optimized workflows",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with automatic data backup",
    },
    {
      icon: Clock,
      title: "Works Offline",
      description: "Continue selling even without internet connection",
    },
    {
      icon: Globe,
      title: "Multi-Language",
      description: "Support for English and Dhivehi languages",
    },
    {
      icon: TrendingUp,
      title: "Business Growth",
      description: "Insights and tools to help your business thrive",
    },
    {
      icon: CheckCircle2,
      title: "Easy to Use",
      description: "Intuitive interface designed for all skill levels",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge variant="outline" className="text-primary border-primary/30 px-4 py-1.5">
            Modern Point of Sale System
          </Badge>
          
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            Transform Your{" "}
            <span className="text-primary">Maldives Shop</span>
            <br />
            with Smart POS
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Streamline your retail operations with a powerful, easy-to-use point of sale system
            designed specifically for Maldivian businesses
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" className="text-lg px-8 py-6" onClick={onGetStarted}>
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6">
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8">
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-primary">100%</div>
              <div className="text-sm text-muted-foreground">Free to Start</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-primary">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-heading font-bold text-primary">∞</div>
              <div className="text-sm text-muted-foreground">Transactions</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-heading text-4xl md:text-5xl font-bold">
            Everything You Need to Succeed
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to make managing your shop effortless
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-lg">
                <CardContent className="pt-6 pb-6 space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-bold">
              Why Choose Our POS System?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for the unique needs of Maldivian retail businesses
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-lg mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-32">
        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
            <CardContent className="py-16 px-8 text-center space-y-6">
              <h2 className="font-heading text-4xl md:text-5xl font-bold">
                Ready to Modernize Your Shop?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join hundreds of Maldivian businesses using our POS system to grow faster
              </p>
              <div className="pt-4">
                <Button size="lg" className="text-lg px-12 py-6" onClick={onGetStarted}>
                  Start Your Free Trial
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                No credit card required • Setup in 5 minutes • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}