import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, Play, RotateCcw, Maximize2 } from "lucide-react";

const GalaxyVisualization = () => {
  return (
    <section id="explore" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 to-transparent"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-4">
            <Network className="h-4 w-4" />
            <span className="text-sm font-medium">Interactive Exploration</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Explore the{" "}
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Project Galaxy
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Navigate through interconnected Web3 and AI projects. Discover relationships, 
            clusters, and innovation pathways in the open-source ecosystem.
          </p>
        </div>

        <Card className="cosmic-border hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-accent to-nebula-blue cosmic-glow">
                  <Network className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Force-Directed Graph</CardTitle>
                  <CardDescription>
                    Interactive visualization of project relationships
                  </CardDescription>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="cosmic-border">
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
                <Button variant="outline" size="sm" className="cosmic-border">
                  <Maximize2 className="h-4 w-4" />
                  Fullscreen
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Placeholder for D3.js visualization */}
            <div className="relative h-96 bg-gradient-to-br from-galaxy-deep/5 to-galaxy-medium/5 rounded-lg border cosmic-border overflow-hidden">
              {/* Simulated network nodes */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="relative">
                    {/* Central node */}
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-full cosmic-glow mx-auto flex items-center justify-center">
                      <Network className="h-8 w-8 text-white" />
                    </div>
                    
                    {/* Surrounding nodes */}
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-8 h-8 bg-gradient-to-br from-nebula-purple to-nebula-blue rounded-full opacity-70 animate-pulse"
                        style={{
                          left: `${50 + 40 * Math.cos((i * Math.PI) / 4)}%`,
                          top: `${50 + 40 * Math.sin((i * Math.PI) / 4)}%`,
                          transform: 'translate(-50%, -50%)',
                          animationDelay: `${i * 0.2}s`
                        }}
                      />
                    ))}
                    
                    {/* Connection lines */}
                    <svg className="absolute inset-0 w-full h-full">
                      {[...Array(8)].map((_, i) => (
                        <line
                          key={i}
                          x1="50%"
                          y1="50%"
                          x2={`${50 + 40 * Math.cos((i * Math.PI) / 4)}%`}
                          y2={`${50 + 40 * Math.sin((i * Math.PI) / 4)}%`}
                          stroke="hsl(var(--primary))"
                          strokeWidth="1"
                          opacity="0.3"
                          className="animate-pulse"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </svg>
                  </div>
                  
                  <div className="bg-card/80 backdrop-blur-sm rounded-lg p-4 max-w-sm mx-auto border cosmic-border">
                    <p className="text-sm text-muted-foreground mb-3">
                    D3.js visualization will be integrated here
                    </p>
                    <Button variant="cosmic" size="sm" className="w-full">
                      <Play className="h-4 w-4" />
                      Start Simulation
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-xs text-muted-foreground">Web3 Projects</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="text-xs text-muted-foreground">AI Projects</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-nebula-purple rounded-full"></div>
                <span className="text-xs text-muted-foreground">Hybrid Projects</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-muted rounded-full"></div>
                <span className="text-xs text-muted-foreground">Related Tools</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default GalaxyVisualization;
