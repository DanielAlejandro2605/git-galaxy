import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GitBranch, Upload, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RepositoryForm = () => {
  const [repoUrl, setRepoUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Repository Submitted Successfully!",
        description: "Your repository has been added to the galaxy. Analysis will begin shortly.",
      });
      setRepoUrl("");
      setDescription("");
      setIsSubmitting(false);
    }, 2000);
  };

  return (
    <section id="submit" className="py-24 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-muted/20"></div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Join the Galaxy</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Submit Your{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Repository
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Add your Web3 or AI project to our galaxy and discover similar repositories in the ecosystem.
            </p>
          </div>

          <Card className="cosmic-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent cosmic-glow">
                  <GitBranch className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>Repository Information</CardTitle>
                  <CardDescription>
                    Provide details about your project for accurate analysis
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="repo-url" className="text-sm font-medium">
                    Repository URL *
                  </Label>
                  <Input
                    id="repo-url"
                    type="url"
                    placeholder="https://github.com/username/repository"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    required
                    className="cosmic-border focus:shadow-lg focus:shadow-primary/20 transition-all"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the full GitHub URL of your repository
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Project Description (Optional)
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project, its main features, and technologies used..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="cosmic-border focus:shadow-lg focus:shadow-primary/20 transition-all resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Help us better understand your project for more accurate similarity matching
                  </p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    What happens next?
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Your repository will be analyzed using advanced algorithms</li>
                    <li>• Similar projects will be identified and connections mapped</li>
                    <li>• You'll receive insights about your project's ecosystem position</li>
                    <li>• Expert recommendations may be provided based on your project</li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  variant="cosmic" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting || !repoUrl.trim()}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Analyzing Repository...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Submit to Galaxy
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default RepositoryForm;