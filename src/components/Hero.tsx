
import { Button } from "@/components/ui/button";
import { useTypingEffect } from "@/lib/animation";
import { ArrowRight, BarChart4, TrendingUp } from "lucide-react";
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

  return (
    <section className="min-h-screen pt-28 pb-16 px-6 flex items-center justify-center overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-[500px] h-[500px] rounded-full bg-fin-100 -top-24 -right-24 blur-3xl opacity-50" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-fin-50 bottom-24 -left-24 blur-3xl opacity-40" />
      </div>

      <div className="max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 relative z-10">
        <div className={`flex flex-col justify-center transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-flex items-center px-3 py-1.5 border border-fin-200 rounded-full bg-fin-50/50 mb-6 self-start">
            <span className="flex h-2 w-2 rounded-full bg-fin-500 mr-2" />
            <span className="text-xs font-medium text-fin-800">Financial Intelligence</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="block">Real-time</span>
            <span className="text-shimmer block">Stock Intelligence</span>
            <span className="block">at Your Fingertips</span>
          </h1>
          
          <p className="text-lg md:text-xl text-foreground/70 mb-8 max-w-lg h-[60px]">
            {displayText}
            {isTyping && <span className="typing-animation"></span>}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="bg-fin-600 hover:bg-fin-700 font-medium rounded-lg"
              onClick={() => document.getElementById('demo')?.scrollIntoView({behavior: 'smooth'})}
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

          <div className="grid grid-cols-2 gap-6 mt-12">
            <div className="flex items-start gap-3">
              <div className="rounded-lg p-2 bg-fin-50 border border-fin-100">
                <TrendingUp className="h-5 w-5 text-fin-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Real-time Analysis</h3>
                <p className="text-sm text-foreground/60">Get instant stock insights</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-lg p-2 bg-fin-50 border border-fin-100">
                <BarChart4 className="h-5 w-5 text-fin-600" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Expert Recommendations</h3>
                <p className="text-sm text-foreground/60">Make informed decisions</p>
              </div>
            </div>
          </div>
        </div>

        <div className={`flex items-center justify-center transition-all duration-700 delay-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="relative w-full max-w-md animate-float">
            <div className="glass rounded-2xl shadow-xl overflow-hidden border border-fin-50">
              <div className="h-10 bg-fin-50/70 border-b border-fin-100 flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-fin-200" />
                  <div className="w-3 h-3 rounded-full bg-fin-200" />
                  <div className="w-3 h-3 rounded-full bg-fin-200" />
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-2 mb-4">
                  <div className="h-6 w-3/4 bg-fin-100 rounded-md animate-pulse" />
                  <div className="h-6 w-1/2 bg-fin-100 rounded-md animate-pulse" />
                </div>
                <div className="space-y-3">
                  <div className="h-24 bg-fin-50 rounded-lg border border-fin-100 p-3">
                    <div className="h-4 w-1/3 bg-fin-100 rounded-sm" />
                    <div className="flex justify-between mt-3">
                      <div className="h-10 w-20 bg-fin-600/20 rounded flex items-center justify-center">
                        <div className="h-4 w-12 bg-fin-600 rounded-sm" />
                      </div>
                      <div className="h-10 w-20 bg-green-100 rounded flex items-center justify-center">
                        <div className="h-4 w-12 bg-green-500 rounded-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="h-32 bg-fin-50 rounded-lg border border-fin-100" />
                  <div className="h-20 bg-fin-50 rounded-lg border border-fin-100" />
                </div>
              </div>
            </div>
            
            <div className="absolute -top-4 -right-4 glass rounded-xl p-4 shadow-lg border border-fin-50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-green-500 rounded-sm" />
                </div>
                <div>
                  <div className="h-3 w-16 bg-fin-100 rounded-sm" />
                  <div className="h-5 w-20 bg-fin-200 rounded-sm mt-1" />
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 glass rounded-xl p-4 shadow-lg border border-fin-50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-fin-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-fin-600 rounded-sm" />
                </div>
                <div>
                  <div className="h-3 w-16 bg-fin-100 rounded-sm" />
                  <div className="h-5 w-20 bg-fin-200 rounded-sm mt-1" />
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
