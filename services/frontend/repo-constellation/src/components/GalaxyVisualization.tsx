import React, { useRef, useEffect } from "react";
import { select } from "d3-selection";
import { forceSimulation, forceLink, forceManyBody, forceCenter } from "d3-force";
import { drag } from "d3-drag";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, Play, RotateCcw, Maximize2 } from "lucide-react";

interface GraphNode {
  id: number;
  name: string;
  type: "topic" | "repo";
}

interface GraphLink {
  source: number;
  target: number;
}

interface Repository {
  name: string;
  url: string;
  description: string;
  stars: number;
  topics: string[];
  readme?: string;
  common_topics?: string[];
  topics_ratio?: number;
}

interface GalaxyVisualizationProps {
  repositories: Repository[];
  graphData: {
    nodes: GraphNode[];
    links: GraphLink[];
  } | null;
}

const GalaxyVisualization = ({ repositories, graphData }: GalaxyVisualizationProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !graphData) return;

    const width = 800;
    const height = 500;

    // Clear previous renders
    const svgElement = select(svgRef.current);
    svgElement.selectAll("*").remove();

    const simulation = forceSimulation(graphData.nodes as any)
      .force("link", forceLink(graphData.links).id((d: any) => d.id).distance(80))
      .force("charge", forceManyBody().strength(-200))
      .force("center", forceCenter(width / 2, height / 2));

    const svg = svgElement
      .attr("width", width)
      .attr("height", height)
      .style("background", "transparent");

    // Color scale for different node types
    const color = (type: string) => {
      switch (type) {
        case "topic": return "hsl(var(--accent))";
        case "repo": return "hsl(var(--primary))";
        default: return "hsl(var(--muted))";
      }
    };

    // Size scale for nodes
    const getNodeSize = (node: GraphNode) => {
      if (node.type === "topic") return 8;
      // For repo nodes, find the corresponding repository data
      const repo = repositories.find(r => r.name === node.name);
      return repo ? 10 + Math.log2(repo.stars) / 2 : 10;
    };

    // Draw links
    const link = svg.append("g")
      .attr("stroke", "hsl(var(--primary))")
      .attr("stroke-opacity", 0.4)
      .selectAll("line")
      .data(graphData.links)
      .join("line")
      .attr("stroke-width", 2);

    // Draw nodes
    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .selectAll("circle")
      .data(graphData.nodes)
      .join("circle")
      .attr("r", (d: any) => getNodeSize(d))
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
      let tooltipContent = "";
      
      if (d.type === "topic") {
        tooltipContent = `<strong>Topic: ${d.name}</strong>`;
      } else {
        const repo = repositories.find(r => r.name === d.name);
        if (repo) {
          tooltipContent = `
            <strong>${repo.name}</strong><br/>
            Stars: ${repo.stars}<br/>
            Topics: ${repo.topics.join(", ")}<br/>
            <a href='${repo.url}' target='_blank' style='color:#aaf'>View Repo</a>
          `;
        }
      }
      
      tooltip.html(tooltipContent)
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
      .data(graphData.nodes)
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
  }, [graphData, repositories]);

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
            Navigate through interconnected repositories and topics. Discover relationships, 
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
                    Interactive visualization of repository-topic relationships
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
                {graphData ? (
                  <svg ref={svgRef} className="w-full h-[500px]"></svg>
                ) : (
                  <div className="text-center text-muted-foreground py-20">
                    <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Search for repositories to see the interactive graph visualization</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-xs text-muted-foreground">Repositories</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-accent rounded-full"></div>
                <span className="text-xs text-muted-foreground">Topics</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default GalaxyVisualization;
