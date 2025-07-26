import React, { useRef, useEffect } from "react";
import { select } from "d3-selection";
import { forceSimulation, forceLink, forceManyBody, forceCenter } from "d3-force";
import { drag } from "d3-drag";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, Play, RotateCcw, Maximize2 } from "lucide-react";

// Mock data for repositories
const nodes = [
  { id: "repo1", name: "OpenAI GPT", type: "ai", stars: 12000, language: "Python", owner: "openai", url: "https://github.com/openai/gpt" },
  { id: "repo2", name: "Web3.js", type: "web3", stars: 8000, language: "JavaScript", owner: "ethereum", url: "https://github.com/ethereum/web3.js" },
  { id: "repo3", name: "Hardhat", type: "tool", stars: 6000, language: "TypeScript", owner: "nomiclabs", url: "https://github.com/nomiclabs/hardhat" },
  { id: "repo4", name: "Supabase", type: "tool", stars: 20000, language: "TypeScript", owner: "supabase", url: "https://github.com/supabase/supabase" },
  { id: "repo5", name: "LangChain", type: "ai", stars: 15000, language: "Python", owner: "langchain", url: "https://github.com/langchain/langchain" },
];

const links = [
  { source: "repo1", target: "repo5", type: "related" },
  { source: "repo2", target: "repo3", type: "uses" },
  { source: "repo3", target: "repo4", type: "depends_on" },
  { source: "repo5", target: "repo4", type: "uses" },
  { source: "repo2", target: "repo4", type: "related" },
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

    // Color scale for different repo types
    const color = (type: string) => {
      switch (type) {
        case "web3": return "hsl(var(--primary))";
        case "ai": return "hsl(var(--accent))";
        case "tool": return "hsl(var(--nebula-purple))";
        default: return "hsl(var(--muted))";
      }
    };

    // Link style by type
    const linkStroke = (type: string) => {
      switch (type) {
        case "related": return "4,2"; // dashed
        case "uses": return ""; // solid
        case "depends_on": return "2,2"; // dotted
        default: return "";
      }
    };

    // Draw links
    const link = svg.append("g")
      .attr("stroke", "hsl(var(--primary))")
      .attr("stroke-opacity", 0.4)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", d => linkStroke((d as any).type));

    // Draw nodes
    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", d => 10 + Math.log2((d as any).stars) / 2) // size by stars
      .attr("fill", (d: any) => color(d.type))
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

    // Tooltip
    const tooltip = select("body")
      .append("div")
      .attr("class", "d3-tooltip")
      .style("position", "absolute")
      .style("z-index", "10")
      .style("visibility", "hidden")
      .style("background", "rgba(0,0,0,0.8)")
      .style("color", "#fff")
      .style("padding", "8px 12px")
      .style("border-radius", "6px")
      .style("font-size", "13px");

    node.on("mouseover", function (event, d: any) {
      tooltip.html(
        `<strong>${d.name}</strong><br/>` +
        `Owner: ${d.owner}<br/>` +
        `Language: ${d.language}<br/>` +
        `Stars: ${d.stars}<br/>` +
        `<a href='${d.url}' target='_blank' style='color:#aaf'>View Repo</a>`
      )
        .style("visibility", "visible");
    })
    .on("mousemove", function (event) {
      tooltip
        .style("top", (event.pageY + 10) + "px")
        .style("left", (event.pageX + 10) + "px");
    })
    .on("mouseout", function () {
      tooltip.style("visibility", "hidden");
    });

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
      tooltip.remove();
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
