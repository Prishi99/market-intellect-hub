
import { ChartLineUp, Github, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="bg-fin-50/50 border-t border-fin-100">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <a href="/" className="flex items-center gap-2 text-lg font-medium mb-4">
              <ChartLineUp className="h-5 w-5 text-fin-600" />
              <span className="text-shimmer font-semibold">MarketMind</span>
            </a>
            <p className="text-foreground/70 text-sm mb-6">
              Your AI-powered financial research assistant providing real-time market insights.
            </p>
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full h-8 w-8 border-fin-200"
              >
                <Twitter className="h-4 w-4 text-fin-600" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-full h-8 w-8 border-fin-200"
              >
                <Github className="h-4 w-4 text-fin-600" />
              </Button>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <h3 className="font-medium mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  className="text-sm text-foreground/70 hover:text-fin-600 transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-foreground/70 hover:text-fin-600 transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-foreground/70 hover:text-fin-600 transition-colors"
                >
                  Market Data
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-foreground/70 hover:text-fin-600 transition-colors"
                >
                  API
                </a>
              </li>
            </ul>
          </div>
          
          <div className="lg:col-span-1">
            <h3 className="font-medium mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  className="text-sm text-foreground/70 hover:text-fin-600 transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-foreground/70 hover:text-fin-600 transition-colors"
                >
                  Blog
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-foreground/70 hover:text-fin-600 transition-colors"
                >
                  Careers
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-foreground/70 hover:text-fin-600 transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          
          <div className="lg:col-span-1">
            <h3 className="font-medium mb-4">Resources</h3>
            <ul className="space-y-3">
              <li>
                <a 
                  href="#" 
                  className="text-sm text-foreground/70 hover:text-fin-600 transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-foreground/70 hover:text-fin-600 transition-colors"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-foreground/70 hover:text-fin-600 transition-colors"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a 
                  href="#" 
                  className="text-sm text-foreground/70 hover:text-fin-600 transition-colors"
                >
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-10 pt-8 border-t border-fin-100 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-foreground/60 mb-4 md:mb-0">
            © {new Date().getFullYear()} MarketMind. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a 
              href="#" 
              className="text-xs text-foreground/70 hover:text-fin-600 transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="#" 
              className="text-xs text-foreground/70 hover:text-fin-600 transition-colors"
            >
              Terms of Service
            </a>
            <a 
              href="#" 
              className="text-xs text-foreground/70 hover:text-fin-600 transition-colors"
            >
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
