import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface NodeDatum extends d3.SimulationNodeDatum {
  id: string;
  name: string;
}

interface LinkDatum extends d3.SimulationLinkDatum<NodeDatum> {
  source: string | NodeDatum;
  target: string | NodeDatum;
}

const ForceGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    const sampleNames = [
      "Alice", "Bob", "Carol", "David", "Eva",
      "Frank", "Grace", "Henry", "Ivy", "Jack",
      "Karen", "Leo", "Mona", "Nate", "Olga",
      "Paul", "Quinn", "Rose", "Steve", "Tina"
    ];

    const nodes: NodeDatum[] = Array.from({ length: 20 }, (_, i) => ({
      id: i.toString(),
      name: sampleNames[i],
    }));

    const links: LinkDatum[] = [];

    for (let i = 0; i < nodes.length - 1; i++) {
      links.push({ source: i.toString(), target: (i + 1).toString() });
    }

    for (let i = 0; i < 10; i++) {
      const source = Math.floor(Math.random() * 20).toString();
      let target: string;
      do {
        target = Math.floor(Math.random() * 20).toString();
      } while (
        target === source ||
        links.some(
          (l) =>
            (l.source === source && l.target === target) ||
            (l.source === target && l.target === source)
        )
      );
      links.push({ source, target });
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear any previous render

    const simulation = d3
      .forceSimulation<NodeDatum>(nodes)
      .force(
        "link",
        d3.forceLink<NodeDatum, LinkDatum>(links)
          .id((d) => d.id)
          .distance(60)
      )
      .force("charge", d3.forceManyBody().strength(-100))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append("g")
      .attr("stroke", "#aaa")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 1.5);

    const node = svg
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", 6)
      .attr("fill", "steelblue")
      .call(drag(simulation));

    const label = svg
      .append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text((d) => d.name)
      .attr("dx", 8)
      .attr("dy", "0.35em")
      .style("fill", "#333")
      .style("font-size", "12px")
      .style("font-family", "sans-serif")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as NodeDatum).x!)
        .attr("y1", (d) => (d.source as NodeDatum).y!)
        .attr("x2", (d) => (d.target as NodeDatum).x!)
        .attr("y2", (d) => (d.target as NodeDatum).y!);

      node
        .attr("cx", (d) => d.x!)
        .attr("cy", (d) => d.y!);

      label
        .attr("x", (d) => d.x!)
        .attr("y", (d) => d.y!);
    });

    function drag(simulation: d3.Simulation<NodeDatum, LinkDatum>) {
      return d3
        .drag<Element, NodeDatum>()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.f
