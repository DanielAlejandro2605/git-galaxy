import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Star, GitBranch } from "lucide-react";

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

interface RepositoryListProps {
  repositories: Repository[];
  isLoading: boolean;
}

const RepositoryList = ({ repositories, isLoading }: RepositoryListProps) => {
  if (isLoading) {
    return (
      <Card className="h-[550px] cosmic-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Repository Results
          </CardTitle>
          <CardDescription>
            Searching for repositories...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (repositories.length === 0) {
    return (
      <Card className="h-[550px] cosmic-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Repository Results
          </CardTitle>
          <CardDescription>
            Search for repositories to see results here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <div className="text-center">
              <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No repositories found</p>
              <p className="text-sm">Try searching for a project description</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[550px] cosmic-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Repository Results
        </CardTitle>
        <CardDescription>
          {repositories.length} repositories found
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[470px] px-4">
          <div className="space-y-4">
            {repositories.map((repo, index) => (
              <Card key={index} className="hover:shadow-md transition-all duration-200 border-muted/50">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Repository Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-primary truncate">
                          <a 
                            href={repo.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1"
                          >
                            {repo.name}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {repo.stars.toLocaleString()}
                          </div>
                          {repo.topics_ratio && (
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(repo.topics_ratio * 100)}% match
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {repo.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {repo.description}
                      </p>
                    )}

                    {/* Topics */}
                    {repo.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {repo.topics.slice(0, 3).map((topic, topicIndex) => (
                          <Badge 
                            key={topicIndex} 
                            variant="outline" 
                            className="text-xs"
                          >
                            {topic}
                          </Badge>
                        ))}
                        {repo.topics.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{repo.topics.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Common Topics Highlight */}
                    {repo.common_topics && repo.common_topics.length > 0 && (
                      <div className="pt-2 border-t border-muted/50">
                        <p className="text-xs text-muted-foreground mb-1">Matching topics:</p>
                        <div className="flex flex-wrap gap-1">
                          {repo.common_topics.map((topic, topicIndex) => (
                            <Badge 
                              key={topicIndex} 
                              variant="default" 
                              className="text-xs bg-primary/20 text-primary border-primary/30"
                            >
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default RepositoryList; 