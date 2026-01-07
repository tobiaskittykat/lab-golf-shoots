import { useNavigate } from "react-router-dom";
import { Cat, ArrowRight, Image, Megaphone, Wand2, Zap } from "lucide-react";

const features = [
  {
    icon: Image,
    title: "AI-Powered Imagery",
    description: "Generate stunning product shots and lifestyle images in seconds",
  },
  {
    icon: Megaphone,
    title: "Campaign Creation",
    description: "Build cohesive ad campaigns across all platforms effortlessly",
  },
  {
    icon: Wand2,
    title: "Smart Editing",
    description: "Edit and enhance images with natural language commands",
  },
  {
    icon: Zap,
    title: "Batch Generation",
    description: "Create multiple variations instantly for A/B testing",
  },
];

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
              <Cat className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">KittyKat</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/login")} 
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Log in
            </button>
            <button 
              onClick={() => navigate("/login")} 
              className="btn-primary px-5 py-2.5 text-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/3 rounded-full blur-3xl animate-float" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in">
            <Cat className="w-4 h-4" />
            AI-powered ad creative generation
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in" style={{ animationDelay: "0.1s" }}>
            Create stunning ads
            <br />
            <span className="text-gradient">in seconds</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Transform your e-commerce brand with AI-generated campaign images. 
            From concept to creative—powered by your brand identity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <button 
              onClick={() => navigate("/login")} 
              className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              Start Creating
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="btn-secondary text-lg px-8 py-4">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
            Everything you need to create
          </h2>
          <p className="text-muted-foreground text-center max-w-xl mx-auto mb-16">
            From single product shots to full campaign rollouts—all powered by AI that understands your brand
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="card-elevated group hover:border-primary/30 transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${0.1 * i}s` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Ready to transform your ads?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Join thousands of e-commerce brands creating on-brand visuals at scale
              </p>
              <button 
                onClick={() => navigate("/login")} 
                className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-purple-400 flex items-center justify-center">
              <Cat className="w-3 h-3 text-primary-foreground" />
            </div>
            <span>KittyKat</span>
          </div>
          <p>© 2025 KittyKat. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
