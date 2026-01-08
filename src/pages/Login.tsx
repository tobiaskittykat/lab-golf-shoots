import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import kittykatLogo from "@/assets/kittykat-logo-transparent.png";
const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/brand-setup");
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Dreamy gradient background matching KittyKat branding */}
      <div className="absolute inset-0 -z-10">
        {/* Base white/cream */}
        <div className="absolute inset-0 bg-background" />
        
        {/* Soft coral/pink wash - top left and bottom right */}
        <div className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[100px]" />
        
        {/* Blue accent wash - top right and bottom left */}
        <div className="absolute -top-1/4 -right-1/4 w-[700px] h-[700px] bg-accent/25 rounded-full blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px]" />
        
        {/* Subtle purple blend in corners */}
        <div className="absolute top-1/2 -left-1/4 w-[400px] h-[400px] bg-purple-300/10 rounded-full blur-[80px]" />
        <div className="absolute top-1/2 -right-1/4 w-[400px] h-[400px] bg-purple-300/10 rounded-full blur-[80px]" />
      </div>

      {/* Header - Absolutely positioned so it doesn't affect form layout */}
      <header className="absolute top-0 left-0 px-4 py-3 z-10">
        <img src={kittykatLogo} alt="KittyKat" className="h-36" />
      </header>

      {/* Main Content - Centered Form */}
      <main className="min-h-screen flex items-center justify-center px-8 pt-20 pb-12">
        <div className="w-full max-w-md">
          {/* Glass Card */}
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-8 shadow-2xl shadow-accent/5">
            {/* Heading */}
            <div className="text-center space-y-2 mb-8">
              <h1 className="font-display text-3xl font-bold text-foreground">
                {isSignUp ? "Create your account" : "Welcome back"}
              </h1>
              <p className="text-muted-foreground">
                {isSignUp
                  ? "Start creating with KittyKat today"
                  : "Sign in to continue to KittyKat"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-3.5 rounded-xl border border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3.5 rounded-xl border border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  {!isSignUp && (
                    <button type="button" className="text-sm text-accent hover:underline">
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 rounded-xl border border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-accent text-accent-foreground font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 group mt-6 shadow-lg shadow-accent/20"
              >
                {isSignUp ? "Create account" : "Sign in"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-card/50 text-muted-foreground">or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 py-3 rounded-xl border border-border/50 bg-background/50 text-foreground font-medium hover:bg-secondary/50 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>
              <button
                type="button"
                className="flex-1 py-3 rounded-xl border border-border/50 bg-background/50 text-foreground font-medium hover:bg-secondary/50 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
                GitHub
              </button>
            </div>

            {/* Toggle */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-accent font-medium hover:underline"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 text-center text-sm text-muted-foreground">
        © 2026 KittyKat. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
