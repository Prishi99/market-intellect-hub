
import Header from "@/components/Header";
import HeroSection from "@/components/Hero";
import QueryInterface from "@/components/QueryInterface";
import Footer from "@/components/Footer";
import { useScrollFadeIn } from "@/lib/animation";
import { ArrowUpRight, Check, BarChart4, LineChart, TrendingUp, Lightbulb } from "lucide-react";

const features = [
  {
    icon: LineChart,
    title: "Real-time Market Data",
    description: "Access up-to-the-minute data on stocks, ETFs, and market indices to make informed decisions.",
  },
  {
    icon: TrendingUp,
    title: "Expert Analysis",
    description: "Get comprehensive analyst ratings and recommendations from top financial institutions.",
  },
  {
    icon: Lightbulb,
    title: "AI-Powered Insights",
    description: "Our AI assistant analyzes patterns and provides personalized investment insights.",
  },
  {
    icon: BarChart4,
    title: "Financial Reports",
    description: "Access detailed company fundamentals, earnings reports, and financial metrics.",
  },
];

const faqItems = [
  {
    question: "How accurate is the financial data?",
    answer: "Our platform sources data from multiple reliable financial APIs and services to ensure high accuracy. Stock prices and market data are typically refreshed in real-time or with minimal delay depending on your subscription plan."
  },
  {
    question: "Can I use this for investment decisions?",
    answer: "While our platform provides comprehensive market analysis and insights, it's designed to be an informational tool only. Always consult with a certified financial advisor before making investment decisions."
  },
  {
    question: "What financial APIs do you use?",
    answer: "We integrate with several leading financial data providers including Yahoo Finance, Alpha Vantage, and Finnhub to provide comprehensive market coverage and ensure data reliability."
  },
  {
    question: "How is the AI model trained?",
    answer: "Our AI model is trained on vast amounts of historical market data, financial news, and analyst reports. It's continuously updated to improve accuracy and adapt to changing market conditions."
  },
];

const Index = () => {
  const featureRef = useScrollFadeIn();
  const faqRef = useScrollFadeIn();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      
      <section id="features" className="py-20 px-6" ref={featureRef.ref}>
        <div className={`max-w-7xl mx-auto transition-all duration-700 ${featureRef.isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Financial Intelligence</h2>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Our platform combines cutting-edge AI with comprehensive financial data to deliver actionable insights.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="glass rounded-xl p-6 border border-fin-100/50 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-fin-50 border border-fin-100 flex items-center justify-center mb-5">
                  <feature.icon className="h-6 w-6 text-fin-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-foreground/70 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 bg-fin-50 rounded-xl overflow-hidden border border-fin-100">
            <div className="grid md:grid-cols-5">
              <div className="md:col-span-3 p-8 md:p-10">
                <h3 className="text-2xl font-bold mb-4">
                  Advanced Features for <span className="text-shimmer">Serious Investors</span>
                </h3>
                <p className="text-foreground/70 mb-6">
                  Take your investment strategy to the next level with our premium features designed for professional traders and serious investors.
                </p>
                
                <div className="space-y-4">
                  {[
                    "Advanced technical indicators and chart patterns",
                    "Customizable alerts and notifications",
                    "Portfolio tracking and performance analytics",
                    "Integration with major trading platforms"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <Check className="h-5 w-5 text-fin-600" />
                      </div>
                      <p className="ml-3 text-foreground/80">{item}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8">
                  <a 
                    href="#"
                    className="inline-flex items-center text-fin-600 font-medium hover:text-fin-700 transition-colors"
                  >
                    Learn more about premium features
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </a>
                </div>
              </div>
              
              <div className="md:col-span-2 bg-gradient-to-br from-fin-600 to-fin-800 p-8 md:p-10 text-white flex items-center">
                <div>
                  <h4 className="text-xl font-semibold mb-4">Early Access Program</h4>
                  <p className="mb-6 text-white/80">
                    Join our early access program and be the first to try our advanced AI-powered financial tools.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm">Currently in beta</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <QueryInterface />
      
      <section id="faq" className="py-20 px-6 bg-fin-50/50" ref={faqRef.ref}>
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
                className="glass rounded-xl p-6 border border-fin-100/50"
              >
                <h3 className="text-lg font-semibold mb-2">{item.question}</h3>
                <p className="text-foreground/70">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-fin-600 to-fin-700 rounded-xl text-white p-10 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Transform Your Financial Research?
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-10">
              Join thousands of investors who are leveraging AI-powered insights to make smarter investment decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="#"
                className="px-8 py-3 bg-white text-fin-700 font-medium rounded-lg hover:bg-white/90 transition-colors"
              >
                Get Started Free
              </a>
              <a 
                href="#"
                className="px-8 py-3 bg-transparent border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-colors"
              >
                Request Demo
              </a>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
