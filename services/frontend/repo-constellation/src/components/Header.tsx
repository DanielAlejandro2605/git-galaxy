import { Button } from "@/components/ui/button";
import { GitBranch, Sparkles, Menu } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b border-border/50 bg-card/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent cosmic-glow">
            <GitBranch className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Git Galaxy
            </h1>
            <p className="text-xs text-muted-foreground">Mapping the Universe of Code</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#" className="text-foreground hover:text-primary transition-colors">
            Home
          </a>
          <a href="#explore" className="text-muted-foreground hover:text-primary transition-colors">
            Explore
          </a>
          <a href="#submit" className="text-muted-foreground hover:text-primary transition-colors">
            Submit Repository
          </a>
          <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
            About
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <Sparkles className="h-4 w-4" />
            Pro Features
          </Button>
          <Button variant="cosmic" size="sm">
            Get Started
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;