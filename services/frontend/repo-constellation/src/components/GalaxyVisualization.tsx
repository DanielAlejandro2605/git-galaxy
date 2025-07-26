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
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphLink {
  source: number | GraphNode;
  target: number | GraphNode;
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
      .call(drag<SVGCircleElement, GraphNode>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on("end", (event, d) => {
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
        .attr("x1", (d: any) => (d.source as GraphNode).x)
        .attr("y1", (d: any) => (d.source as GraphNode).y)
        .attr("x2", (d: any) => (d.target as GraphNode).x)
        .attr("y2", (d: any) => (d.target as GraphNode).y);

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
    <Card className="h-[550px] cosmic-border hover:shadow-lg hover:shadow-accent/10 transition-all duration-300">
      <CardHeader className="pb-3">
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
      
      <CardContent className="p-0 pb-4">
        <div className="relative bg-gradient-to-br from-galaxy-deep/5 to-galaxy-medium/5 rounded-lg border cosmic-border overflow-hidden h-[420px]">
          <div className="flex justify-center items-center h-full">
            {graphData ? (
              <svg ref={svgRef} className="w-full h-full"></svg>
            ) : (
              <div className="text-center text-muted-foreground">
                <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Search for repositories to see the interactive graph visualization</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-3 grid grid-cols-2 gap-4 px-4">
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
  );
};

export default GalaxyVisualization;
