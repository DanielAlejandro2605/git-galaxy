import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import RepositoryForm from "@/components/RepositoryForm";
import GalaxyVisualization from "@/components/GalaxyVisualization";
import RepositoryList from "@/components/RepositoryList";
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
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchResults = (repos: Repository[], graph: { nodes: GraphNode[]; links: GraphLink[] }) => {
    setRepositories(repos);
    setGraphData(graph);
  };

  const handleSearchStart = () => {
    setIsSearching(true);
  };

  const handleSearchEnd = () => {
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        
        {/* Search Form Section */}
        <section className="py-12 bg-gradient-to-b from-background to-muted/20">
          <div className="container mx-auto px-4">
            <RepositoryForm 
              onSearchResults={handleSearchResults}
              onSearchStart={handleSearchStart}
              onSearchEnd={handleSearchEnd}
            />
          </div>
        </section>

        {/* Main Content Area - Graph and Sidebar */}
        {(repositories.length > 0 || isSearching) && (
          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="flex gap-6">
                {/* Main Graph Area */}
                <div className="flex-1">
                  <GalaxyVisualization 
                    repositories={repositories} 
                    graphData={graphData}
                  />
                </div>
                
                {/* Sidebar with Repository List */}
                <div className="w-72 flex-shrink-0">
                  <RepositoryList 
                    repositories={repositories}
                    isLoading={isSearching}
                  />
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
