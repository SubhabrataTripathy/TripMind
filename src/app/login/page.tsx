"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, Mail, Lock, User, CheckCircle2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (isSignUp && !name)) {
      alert("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    }, 1200);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-stretch">
      
      {/* LEFT COLUMN: Visual Branding Panel (hidden on mobile) */}
      <section className="hidden lg:flex lg:w-[40%] bg-blue-955 text-white flex-col justify-between p-12 relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900 via-slate-900 to-black border-r border-slate-800">
        {/* Glow accents */}
        <div className="absolute top-[-20%] right-[-20%] w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[250px] h-[250px] bg-indigo-500/10 rounded-full blur-[80px]" />

        {/* Top Logo */}
        <button 
          onClick={() => router.push("/")}
          className="flex items-center gap-2.5 hover:opacity-90 transition-opacity w-fit z-10"
        >
          <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20 text-white">
            <Sparkles className="w-4.5 h-4.5 fill-current text-white animate-pulse" />
          </div>
          <span className="font-extrabold tracking-tight text-xl text-white">
            Trip<span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent font-black">Mind</span>
          </span>
        </button>

        {/* Center Editorial Copy */}
        <div className="space-y-6 z-10 max-w-sm">
          <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
            Map out your next journey with <span className="text-blue-400">AI</span>.
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Create customized itineraries, view real-time maps, budget in local currency (₹), and book flights or hotels in one click.
          </p>
          
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-4 space-y-3 shadow-2xl">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Indian Traveller Pick</p>
            <div className="flex gap-2.5 items-center">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-slate-200">Goa weekend plans trending today</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-slate-500 z-10">
          © {new Date().getFullYear()} TripMind India. Premium travel planning.
        </p>

      </section>

      {/* RIGHT COLUMN: Auth Form Area */}
      <section className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-white">
        
        {/* Mobile Logo / Home Link */}
        <div className="absolute top-6 left-6 flex items-center justify-between w-[calc(100%-3rem)] lg:w-auto">
          <button 
            onClick={() => router.push("/")}
            className="flex items-center gap-1 text-slate-500 hover:text-slate-800 font-extrabold text-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
          <div className="flex items-center gap-2 lg:hidden">
            <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white">
              <Sparkles className="w-4 h-4 fill-current text-white" />
            </div>
            <span className="font-extrabold tracking-tight text-base text-slate-900">
              Trip<span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-black">Mind</span>
            </span>
          </div>
        </div>

        <div className="w-full max-w-md space-y-8 mt-12 lg:mt-0">
          
          {/* Header Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-xs text-slate-550 mt-1.5">
              {isSignUp 
                ? "Join travelers planning local stays and transit routes in seconds." 
                : "Sign in to access your saved itineraries and bookings."}
            </p>
          </div>

          {/* Social login buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button" 
              onClick={() => alert("Google Sign In integrated.")}
              className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Google
            </button>
            <button 
              type="button" 
              onClick={() => alert("Apple Sign In integrated.")}
              className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.51-.62.73-1.16 1.87-1.01 2.98 1.1.09 2.25-.57 2.96-1.43z"/>
              </svg>
              Apple
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-xs font-bold uppercase"><span className="bg-white px-3 text-slate-400">Or continue with</span></div>
          </div>

          {/* Form */}
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Full Name</label>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-slate-800 focus-within:ring-2 focus-within:ring-slate-900/5 transition">
                    <User className="w-4 h-4 text-slate-450" />
                    <input 
                      type="text" 
                      placeholder="Aniket Sharma" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 outline-none w-full placeholder:text-slate-400"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Email Address</label>
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-slate-800 focus-within:ring-2 focus-within:ring-slate-900/5 transition">
                  <Mail className="w-4 h-4 text-slate-450" />
                  <input 
                    type="email" 
                    placeholder="name@domain.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 outline-none w-full placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Password</label>
                  {!isSignUp && (
                    <button type="button" onClick={() => alert("Reset code sent.")} className="text-[10px] text-blue-600 hover:underline font-bold">
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-slate-800 focus-within:ring-2 focus-within:ring-slate-900/5 transition">
                  <Lock className="w-4 h-4 text-slate-450" />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-800 outline-none w-full placeholder:text-slate-400"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-xl shadow-md transition active:scale-[0.98] cursor-pointer flex justify-center items-center gap-2"
              >
                {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {isSignUp ? "Create Account" : "Sign In"}
              </button>
            </form>
          ) : (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3 animate-fade-in">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Success!</h3>
                <p className="text-[11px] text-slate-500 mt-1">
                  {isSignUp ? "Your account has been registered successfully." : "You have signed in successfully."}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Redirecting to explorer dashboard...</p>
              </div>
            </div>
          )}

          {/* Toggle Switch */}
          <div className="text-center text-xs font-bold text-slate-550">
            {isSignUp ? (
              <span>
                Already have an account?{" "}
                <button 
                  type="button" 
                  onClick={() => setIsSignUp(false)}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{" "}
                <button 
                  type="button" 
                  onClick={() => setIsSignUp(true)}
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  Sign Up
                </button>
              </span>
            )}
          </div>

        </div>

      </section>

    </main>
  );
}
