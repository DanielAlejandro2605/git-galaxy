import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import GalaxyVisualization from "@/components/GalaxyVisualization";
import RepositoryForm from "@/components/RepositoryForm";
import Footer from "@/components/Footer";

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

interface GraphNode {
  id: number;
  name: string;
  type: "topic" | "repo";
}

interface GraphLink {
  source: number;
  target: number;
}

const Index = () => {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[]; links: GraphLink[] } | null>(null);

  const handleSearchResults = (repos: Repository[], graph: { nodes: GraphNode[]; links: GraphLink[] }) => {
    setRepositories(repos);
    setGraphData(graph);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <GalaxyVisualization repositories={repositories} graphData={graphData} />
        <RepositoryForm onSearchResults={handleSearchResults} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
