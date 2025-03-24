
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChartLineUp, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-10 transition-all duration-300",
        {
          "glass shadow-sm py-3": isScrolled,
          "bg-transparent": !isScrolled,
        }
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 text-lg font-medium">
          <ChartLineUp className="h-6 w-6 text-fin-600" />
          <span className="text-shimmer font-semibold">MarketMind</span>
        </a>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-8">
          <a 
            href="#features" 
            className="text-sm font-medium text-foreground/80 hover:text-fin-600 transition-colors"
          >
            Features
          </a>
          <a 
            href="#demo" 
            className="text-sm font-medium text-foreground/80 hover:text-fin-600 transition-colors"
          >
            Try It
          </a>
          <a 
            href="#faq" 
            className="text-sm font-medium text-foreground/80 hover:text-fin-600 transition-colors"
          >
            FAQ
          </a>
          <Button size="sm" variant="default" className="bg-fin-600 hover:bg-fin-700">
            Get Started
          </Button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-foreground" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="glass md:hidden absolute top-full left-0 right-0 p-4 flex flex-col gap-4 animate-fade-in-up">
          <a 
            href="#features" 
            className="px-4 py-2 rounded-md text-foreground/80 hover:bg-fin-50 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Features
          </a>
          <a 
            href="#demo" 
            className="px-4 py-2 rounded-md text-foreground/80 hover:bg-fin-50 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Try It
          </a>
          <a 
            href="#faq" 
            className="px-4 py-2 rounded-md text-foreground/80 hover:bg-fin-50 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            FAQ
          </a>
          <Button 
            size="default" 
            variant="default" 
            className="bg-fin-600 hover:bg-fin-700 w-full"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Get Started
          </Button>
        </div>
      )}
    </header>
  );
};

export default Header;
