import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define the API response types
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

interface SearchResponse {
  status: string;
  message: string;
  data: {
    user_prompt: string;
    extracted_info: {
      name_keyword: string;
      topics: string[];
    };
    repositories: Repository[];
    total_found: number;
    search_criteria: {
      name_keyword: string;
      topics: string[];
    };
    graph: {
      nodes: GraphNode[];
      links: GraphLink[];
    };
  };
}

interface RepositoryFormProps {
  onSearchResults: (repositories: Repository[], graphData: { nodes: GraphNode[]; links: GraphLink[] }) => void;
  onSearchStart: () => void;
  onSearchEnd: () => void;
}

const RepositoryForm = ({ onSearchResults, onSearchStart, onSearchEnd }: RepositoryFormProps) => {
  const [projectDescription, setProjectDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    onSearchStart();

    try {
      const response = await fetch("http://localhost:8000/repositories/search-by-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: projectDescription,
          max_results: 20,
          limit_results: 10,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data: SearchResponse = await response.json();
      
      if (data.status === "success") {
        onSearchResults(data.data.repositories, data.data.graph);
        
        toast({
          title: "Search Completed Successfully!",
          description: `Found ${data.data.total_found} repositories matching your description.`,
        });
      } else {
        throw new Error(data.message || "Search failed");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      onSearchEnd();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-medium">Discover Projects</span>
        </div>
        <h2 className="text-3xl font-bold mb-4">
          Find{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Similar Projects
          </span>
        </h2>
        <p className="text-muted-foreground">
          Describe the type of project you're looking for and we'll find similar repositories in our galaxy.
        </p>
      </div>

      <Card className="cosmic-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent cosmic-glow">
              <Search className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Project Search</CardTitle>
              <CardDescription>
                Describe the type of project you're researching in natural language
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="project-description" className="text-sm font-medium">
                What kind of project are you looking for? *
              </Label>
              <Textarea
                id="project-description"
                placeholder="e.g., 'I'm looking for a React-based DeFi dashboard with real-time price feeds and wallet integration' or 'Show me AI projects that use computer vision for medical imaging'..."
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                rows={4}
                className="cosmic-border focus:shadow-lg focus:shadow-primary/20 transition-all resize-none"
                required
              />
              <p className="text-xs text-muted-foreground">
                Be as specific as possible about the technologies, features, or domain you're interested in
              </p>
            </div>

            <Button 
              type="submit" 
              variant="cosmic" 
              size="lg" 
              className="w-full"
              disabled={isSubmitting || !projectDescription.trim()}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Searching Galaxy...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Search Projects
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepositoryForm;