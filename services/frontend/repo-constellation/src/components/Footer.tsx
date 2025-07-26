import { GitBranch, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent cosmic-glow">
                <GitBranch className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Git Galaxy
                </h3>
                <p className="text-xs text-muted-foreground">Mapping Code Universe</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Discover connections in the Web3 and AI ecosystem. Navigate the galaxy of open-source innovation.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold">Explore</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Project Map</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Similarity Search</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Trending Projects</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Categories</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h4 className="font-semibold">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">API Reference</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h4 className="font-semibold">Connect</h4>
            <p className="text-sm text-muted-foreground">
              Join our community and stay updated
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="cosmic-border">
                <Github className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="cosmic-border">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="cosmic-border">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="cosmic-border">
                <Mail className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 Git Galaxy. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;