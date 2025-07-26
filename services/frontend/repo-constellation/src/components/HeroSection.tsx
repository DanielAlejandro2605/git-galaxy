import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, GitBranch, Network, Search, Zap } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background with galaxy effect */}
      <div className="absolute inset-0 galaxy-bg opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50"></div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span>Discover • Connect • Innovate</span>
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              Map the{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-pulse">
                Galaxy
              </span>{" "}
              of Code
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Discover connections between Web3 and AI projects. Find similar repositories, 
              explore innovation clusters, and navigate the universe of open-source development.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="cosmic" size="xl" className="min-w-48">
              <Network className="h-5 w-5" />
              Explore the Galaxy
              <ArrowRight className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="xl" className="min-w-48 cosmic-border">
              <GitBranch className="h-5 w-5" />
              Submit Your Project
            </Button>
          </div>

          {/* Feature cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            <Card className="p-6 cosmic-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center cosmic-glow">
                  <Network className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold">Project Mapping</h3>
                <p className="text-muted-foreground text-sm">
                  Visualize connections between Web3 and AI projects with interactive force-directed graphs
                </p>
              </div>
            </Card>

            <Card className="p-6 cosmic-border hover:shadow-lg hover:shadow-accent/10 transition-all duration-300 group">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-accent to-nebula-blue rounded-lg flex items-center justify-center cosmic-glow">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold">Similarity Analysis</h3>
                <p className="text-muted-foreground text-sm">
                  Find repositories similar to yours using advanced matching algorithms and code analysis
                </p>
              </div>
            </Card>

            <Card className="p-6 cosmic-border hover:shadow-lg hover:shadow-nebula-purple/10 transition-all duration-300 group">
              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-nebula-purple to-nebula-blue rounded-lg flex items-center justify-center cosmic-glow">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold">Expert Insights</h3>
                <p className="text-muted-foreground text-sm">
                  Get professional analysis and recommendations from industry experts in Web3 and AI
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;