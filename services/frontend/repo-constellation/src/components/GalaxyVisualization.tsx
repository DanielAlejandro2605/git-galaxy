import React, { useRef, useEffect } from "react";
import { select } from "d3-selection";
import { forceSimulation, forceLink, forceManyBody, forceCenter } from "d3-force";
import { drag } from "d3-drag";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, Play, RotateCcw, Maximize2 } from "lucide-react";

// Mock data for the force-directed graph
const nodes = [
  { id: "0", name: "Alice", group: "web3" },
  { id: "1", name: "Bob", group: "ai" },
  { id: "2", name: "Carol", group: "hybrid" },
  { id: "3", name: "David", group: "web3" },
  { id: "4", name: "Eva", group: "ai" },
  { id: "Frank", name: "Frank", group: "hybrid" },
  { id: "6", name: "Grace", group: "web3" },
  { id: "7", name: "Henry", group: "ai" },
  { id: "8", name: "Ivy", group: "hybrid" },
  { id: "9", name: "Jack", group: "web3" },
  { id: "10", name: "Karen", group: "ai" },
  { id: "11", name: "Leo", group: "hybrid" },
  { id: "12", name: "Mona", group: "web3" },
  { id: "13", name: "Nate", group: "ai" },
  { id: "14", name: "Olga", group: "hybrid" },
  { id: "15", name: "Paul", group: "web3" },
  { id: "16", name: "Quinn", group: "ai" },
  { id: "17", name: "Rose", group: "hybrid" },
  { id: "18", name: "Steve", group: "web3" },
  { id: "19", name: "Tina", group: "ai" }
];

const links = [
  { source: "0", target: "1" },
  { source: "1", target: "2" },
  { source: "2", target: "3" },
  { source: "0", target: "4" },
  { source: "0", target: "Frank" },
  { source: "4", target: "6" },
  { source: "0", target: "7" },
  { source: "0", target: "8" },
  { source: "0", target: "9" },
  { source: "Frank", target: "10" },
  { source: "0", target: "11" },
  { source: "0", target: "12" },
  { source: "6", target: "13" },
  { source: "0", target: "14" },
  { source: "0", target: "15" },
  { source: "Frank", target: "16" },
  { source: "0", target: "17" },
  { source: "0", target: "18" },
  { source: "0", target: "19" },
  { source: "3", target: "19" },
  { source: "12", target: "19" },
  { source: "13", target: "19" }
];

const GalaxyVisualization = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 500;

    // Clear previous renders
    const svgElement = select(svgRef.current);
    svgElement.selectAll("*").remove();

    const simulation = forceSimulation(nodes as any)
      .force("link", forceLink(links).id((d: any) => d.id).distance(80))
      .force("charge", forceManyBody().strength(-200))
      .force("center", forceCenter(width / 2, height / 2));

    const svg = svgElement
      .attr("width", width)
      .attr("height", height)
      .style("background", "transparent");

    // Color scale for different groups
    const color = (group: string) => {
      switch (group) {
        case "web3": return "hsl(var(--primary))";
        case "ai": return "hsl(var(--accent))";
        case "hybrid": return "hsl(var(--nebula-purple))";
        default: return "hsl(var(--muted))";
      }
    };

    // Draw links
    const link = svg.append("g")
      .attr("stroke", "hsl(var(--primary))")
      .attr("stroke-opacity", 0.4)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2);

    // Draw nodes
    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 12)
      .attr("fill", (d: any) => color(d.group))
      .call(drag()
        .on("start", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d: any) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d: any) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
      );

    // Draw labels
    const label = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text((d: any) => d.name)
      .attr("dx", 15)
      .attr("dy", "0.35em")
      .style("fill", "hsl(var(--foreground))")
      .style("font-size", "12px")
      .style("font-weight", "500");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node
        .attr("cx", (d: any) => d.x)
        .attr("cy", (d: any) => d.y);

      label
        .attr("x", (d: any) => d.x)
        .attr("y", (d: any) => d.y);
    });

    // Cleanup on unmount
    return () => {
      simulation.stop();
    };
  }, []);

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
            <div className="relative bg-gradient-to-br from-galaxy-deep/5 to-galaxy-medium/5 rounded-lg border cosmic-border overflow-hidden">
              <div className="flex justify-center items-center p-4">
                <svg ref={svgRef} className="w-full h-[500px]"></svg>
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
