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
  };
}

const RepositoryForm = () => {
  const [projectDescription, setProjectDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchResults, setSearchResults] = useState<Repository[]>([]);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSearchResults([]);

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
        setSearchResults(data.data.repositories);
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
    }
  };

  return (
    <section id="submit" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/20"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Discover Projects</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Find{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Similar Projects
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
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
                    rows={6}
                    className="cosmic-border focus:shadow-lg focus:shadow-primary/20 transition-all resize-none"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Be as specific as possible about the technologies, features, or domain you're interested in
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    What happens next?
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• We'll analyze your description using AI to understand your requirements</li>
                    <li>• Similar projects in our galaxy will be identified and ranked</li>
                    <li>• You'll receive a curated list of matching repositories</li>
                    <li>• Each result will include similarity scores and key features</li>
                  </ul>
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

              {/* Display search results */}
              {searchResults.length > 0 && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-semibold">Search Results</h3>
                  <div className="space-y-3">
                    {searchResults.map((repo, index) => (
                      <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-medium text-primary">
                                <a 
                                  href={repo.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  {repo.name}
                                </a>
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {repo.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2">
                                <span className="text-xs bg-muted px-2 py-1 rounded">
                                  ⭐ {repo.stars} stars
                                </span>
                                {repo.topics.slice(0, 3).map((topic, topicIndex) => (
                                  <span 
                                    key={topicIndex} 
                                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                                  >
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default RepositoryForm;