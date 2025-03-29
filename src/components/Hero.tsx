
import { Button } from "@/components/ui/button";
import { useTypingEffect } from "@/lib/animation";
import { ArrowRight, BarChart4, TrendingUp, ChevronDown, Shield } from "lucide-react";
import { useState, useEffect } from "react";

const HeroSection = () => {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    setLoaded(true);
  }, []);
  
  const { displayText, isTyping } = useTypingEffect(
    "Your AI-powered financial research assistant", 
    40, 
    500
  );

  // Smooth scroll function
  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({behavior: 'smooth'});
  };

  return (
    <section className="min-h-screen pt-28 pb-16 px-6 flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-fin-100 to-fin-200 -top-32 -right-32 blur-3xl opacity-50 animate-pulse-slow" />
        <div className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-br from-fin-50 to-fin-100 bottom-32 -left-32 blur-3xl opacity-40 animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 relative z-10">
        <div className={`flex flex-col justify-center transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center px-3 py-1.5 border border-fin-200 rounded-full bg-fin-50/80 mb-6 self-start animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <span className="flex h-2 w-2 rounded-full bg-fin-500 mr-2 animate-pulse" />
            <span className="text-xs font-medium text-fin-800">Financial Intelligence</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <span className="block">Real-time</span>
            <span className="text-shimmer block">Stock Intelligence</span>
            <span className="block">at Your Fingertips</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/70 mb-8 max-w-lg h-[60px] animate-fade-in" style={{ animationDelay: '0.6s' }}>
            {displayText}
            {isTyping && <span className="typing-animation"></span>}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <Button 
              size="lg" 
              className="btn-gradient text-white font-medium rounded-lg shadow-md transition-all hover:shadow-lg"
              onClick={scrollToDemo}
            >
              Try It Now <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-fin-200 text-foreground hover:bg-fin-50 font-medium rounded-lg"
            >
              Learn More
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-12 animate-fade-in" style={{ animationDelay: '1s' }}>
            <div className="flex items-start gap-3 p-4 rounded-xl hover-lift subtle-border bg-white/50">
              <div className="rounded-lg p-2 bg-fin-50 border border-fin-100">
                <TrendingUp className="h-5 w-5 text-fin-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Real-time Analysis</h3>
                <p className="text-sm text-foreground/60">Get instant stock insights</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-xl hover-lift subtle-border bg-white/50">
              <div className="rounded-lg p-2 bg-fin-50 border border-fin-100">
                <Shield className="h-5 w-5 text-fin-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Expert Recommendations</h3>
                <p className="text-sm text-foreground/60">Make informed decisions</p>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center animate-fade-in hidden md:block" style={{ animationDelay: '1.2s' }}>
            <button 
              onClick={scrollToDemo}
              className="flex flex-col items-center text-fin-600 hover:text-fin-800 transition-colors"
            >
              <span className="text-sm font-medium mb-2">Explore Financial Assistant</span>
              <ChevronDown className="h-5 w-5 animate-bounce" />
            </button>
          </div>
        </div>

        <div className={`flex items-center justify-center transition-all duration-700 delay-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative w-full max-w-md" style={{ animation: 'float-slow 6s ease-in-out infinite' }}>
            <div className="glass rounded-2xl shadow-elegant overflow-hidden border border-fin-50/80">
              <div className="h-10 bg-fin-50/80 border-b border-fin-100/80 flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-fin-200" />
                  <div className="w-3 h-3 rounded-full bg-fin-200" />
                  <div className="w-3 h-3 rounded-full bg-fin-200" />
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-2 mb-4">
                  <div className="h-6 w-3/4 bg-fin-100/80 rounded-md shine-effect" />
                  <div className="h-6 w-1/2 bg-fin-100/80 rounded-md shine-effect" />
                </div>
                <div className="space-y-4">
                  <div className="gradient-border">
                    <div className="h-24 p-3">
                      <div className="h-4 w-1/3 bg-fin-100/80 rounded-sm" />
                      <div className="flex justify-between mt-3">
                        <div className="h-10 w-20 bg-fin-600/20 rounded-lg flex items-center justify-center">
                          <div className="h-4 w-12 bg-fin-600 rounded-sm" />
                        </div>
                        <div className="h-10 w-20 bg-green-100 rounded-lg flex items-center justify-center">
                          <div className="h-4 w-12 bg-green-500 rounded-sm" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="h-32 bg-fin-50/80 rounded-lg border border-fin-100/50 hover-lift p-3">
                    <div className="h-4 w-1/4 bg-fin-100/80 rounded-sm mb-2" />
                    <div className="flex flex-col gap-2">
                      <div className="h-5 bg-fin-100/60 rounded-sm w-full" />
                      <div className="h-5 bg-fin-100/60 rounded-sm w-3/4" />
                      <div className="h-5 bg-fin-100/40 rounded-sm w-5/6" />
                    </div>
                  </div>
                  <div className="h-20 bg-fin-50/80 rounded-lg border border-fin-100/50 hover-lift p-3">
                    <div className="flex justify-between">
                      <div className="h-4 w-1/5 bg-fin-100/80 rounded-sm" />
                      <div className="h-4 w-1/5 bg-fin-500/80 rounded-sm" />
                    </div>
                    <div className="mt-3 h-6 w-full bg-fin-100/30 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-4 -right-4 glass rounded-xl p-4 shadow-elegant border border-fin-50/80 animate-float" style={{ animationDuration: '4s' }}>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-green-500 rounded-sm" />
                </div>
                <div>
                  <div className="h-3 w-16 bg-fin-100/80 rounded-sm" />
                  <div className="h-5 w-20 bg-fin-200/80 rounded-sm mt-1" />
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 glass rounded-xl p-4 shadow-elegant border border-fin-50/80 animate-float" style={{ animationDuration: '5s', animationDelay: '1s' }}>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-fin-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-fin-600 rounded-sm" />
                </div>
                <div>
                  <div className="h-3 w-16 bg-fin-100/80 rounded-sm" />
                  <div className="h-5 w-20 bg-fin-200/80 rounded-sm mt-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
