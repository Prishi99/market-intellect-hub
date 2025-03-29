
import Header from "@/components/Header";
import HeroSection from "@/components/Hero";
import QueryInterface from "@/components/QueryInterface";
import Footer from "@/components/Footer";
import { useScrollFadeIn } from "@/lib/animation";
import { ArrowUpRight, Check, BarChart4, LineChart, TrendingUp, Lightbulb, Shield, Clock, Globe } from "lucide-react";

const features = [
  {
    icon: LineChart,
    title: "Real-time Financial Data",
    description: "Access up-to-the-minute stock prices, market indices, and trading data from reliable financial sources.",
  },
  {
    icon: TrendingUp,
    title: "Expert Market Analysis",
    description: "Get comprehensive analyst ratings, price targets, and technical indicators from top financial institutions.",
  },
  {
    icon: Lightbulb,
    title: "AI-Powered Insights",
    description: "Our advanced AI analyzes patterns across multiple financial data sources to provide accurate market insights.",
  },
  {
    icon: BarChart4,
    title: "Comprehensive Financial Reports",
    description: "Access detailed company fundamentals, earnings data, and key financial metrics from trusted sources.",
  },
];

const additionalFeatures = [
  {
    icon: Shield,
    title: "Verified Sources",
    description: "All data is sourced directly from reputable financial websites including Yahoo Finance, Bloomberg, and CNBC."
  },
  {
    icon: Clock,
    title: "Real-time Updates",
    description: "Our platform automatically refreshes data to ensure you always have the latest financial information."
  },
  {
    icon: Globe,
    title: "Global Market Coverage",
    description: "Access data from markets around the world, including US, European, and Asian exchanges."
  }
];

const faqItems = [
  {
    question: "How accurate is your financial data?",
    answer: "Our platform retrieves real-time data directly from reliable financial sources like Yahoo Finance, Google Finance, Bloomberg, and CNBC using advanced search technology. The information is typically accurate to within minutes of the current market situation."
  },
  {
    question: "Can I use this for investment decisions?",
    answer: "While our platform provides comprehensive market data and analysis, it's designed to be an informational tool only. Always consult with a certified financial advisor before making investment decisions."
  },
  {
    question: "What financial data sources do you use?",
    answer: "Our AI searches and aggregates information from multiple trusted financial sources including Yahoo Finance, MarketWatch, Bloomberg, CNBC, Reuters, and other reputable financial news and data providers."
  },
  {
    question: "How is the AI financial analysis performed?",
    answer: "Our system uses Gemini technology to search the web for the most current financial information, extract relevant data points, and present them in an organized, easy-to-understand format with proper sourcing."
  },
];

const Index = () => {
  const featureRef = useScrollFadeIn();
  const additionalFeaturesRef = useScrollFadeIn();
  const faqRef = useScrollFadeIn();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      <section id="features" className="py-20 px-6" ref={featureRef.ref}>
        <div className={`max-w-7xl mx-auto transition-all duration-700 ${featureRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-shimmer inline-block">Real-Time Financial Intelligence</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Our platform combines advanced AI with comprehensive financial data sources to deliver accurate, up-to-date market insights.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="glass rounded-xl p-6 border border-fin-100/50 hover-lift subtle-border"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-fin-50 to-fin-100 border border-fin-100 flex items-center justify-center mb-5">
                  <feature.icon className="h-6 w-6 text-fin-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-foreground/70 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16">
            <div className="gradient-border">
              <div className="grid md:grid-cols-5 overflow-hidden rounded-xl">
                <div className="md:col-span-3 p-8 md:p-10 bg-white">
                  <h3 className="text-2xl font-bold mb-4">
                    Financial Insights for <span className="text-shimmer">Smart Investors</span>
                  </h3>
                  <p className="text-foreground/70 mb-6">
                    Get accurate, real-time financial data and expert analysis to make more informed investment decisions.
                  </p>
                  
                  <div className="space-y-4">
                    {[
                      "Real-time stock prices and market index data",
                      "Comprehensive analyst ratings and price targets",
                      "Latest breaking financial news and market-moving events",
                      "Key technical indicators and financial metrics"
                    ].map((item, index) => (
                      <div key={index} className="flex items-start">
                        <div className="flex-shrink-0 mt-1">
                          <div className="rounded-full bg-fin-50 p-1">
                            <Check className="h-4 w-4 text-fin-600" />
                          </div>
                        </div>
                        <p className="ml-3 text-foreground/80">{item}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8">
                    <a 
                      href="#demo"
                      className="inline-flex items-center text-fin-600 font-medium hover:text-fin-700 transition-colors hover-lift px-4 py-2 rounded-lg bg-fin-50/80"
                    >
                      Try our financial assistant now
                      <ArrowUpRight className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                </div>
                
                <div className="md:col-span-2 bg-gradient-to-br from-fin-600 to-fin-800 p-8 md:p-10 text-white flex items-center">
                  <div>
                    <h4 className="text-xl font-semibold mb-4">Financial Expert AI</h4>
                    <p className="mb-6 text-white/90">
                      Ask any financial question and get accurate, real-time data from trusted sources - just like having your own financial analyst.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                      <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-sm">Powered by advanced AI</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="py-16 px-6 bg-fin-50/30" ref={additionalFeaturesRef.ref}>
        <div className={`max-w-7xl mx-auto transition-all duration-700 ${additionalFeaturesRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Why Choose Our Platform</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Designed with investors in mind, our platform offers features that help you make better financial decisions.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {additionalFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-6 border border-fin-100/30 shadow-soft hover-lift"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-fin-100/50 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-fin-600" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                </div>
                <p className="text-foreground/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <QueryInterface />
      
      <section id="faq" className="py-20 px-6 bg-gradient-to-br from-white to-fin-50/50" ref={faqRef.ref}>
        <div className={`max-w-3xl mx-auto transition-all duration-700 ${faqRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Find answers to common questions about our platform and services.
            </p>
          </div>
          
          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <div 
                key={index} 
                className="glass rounded-xl p-6 border border-fin-100/30 shadow-soft hover-lift"
              >
                <h3 className="text-lg font-semibold mb-2 text-fin-700">{item.question}</h3>
                <p className="text-foreground/70">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="gradient-border">
            <div className="bg-gradient-to-r from-fin-600 to-fin-700 rounded-xl text-white p-10 md:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Expert Financial Intelligence at Your Fingertips
              </h2>
              <p className="text-white/90 max-w-2xl mx-auto mb-10">
                Join investors who are leveraging our AI-powered financial assistant to get accurate, real-time market insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="#demo"
                  className="px-8 py-3 bg-white text-fin-700 font-medium rounded-lg hover:bg-white/90 transition-colors shadow-md hover:shadow-lg hover-lift"
                >
                  Try Financial Assistant
                </a>
                <a 
                  href="#"
                  className="px-8 py-3 bg-transparent border border-white/40 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
