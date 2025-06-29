import React, { useState, useEffect } from 'react';
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { 
  Mic, 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  MessageSquare, 
  FileText, 
  Users, 
  Mail, 
  PenTool,
  Brain,
  Lightbulb,
  Zap,
  Star,
  Play,
  Check
} from 'lucide-react';
import { Button } from "@/components/ui/button";

const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    setIsVisible(true);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const useCases = [
    { icon: Lightbulb, title: "Ideation", description: "Capture breakthrough moments" },
    { icon: BookOpen, title: "Journaling", description: "Daily thoughts & reflections" },
    { icon: FileText, title: "Study Notes", description: "Learn faster, retain more" },
    { icon: Users, title: "Meeting Notes", description: "Never miss key insights" },
    { icon: Mail, title: "Emails", description: "Professional communication" },
    { icon: PenTool, title: "Blog Posts", description: "From idea to publish" },
    { icon: MessageSquare, title: "Memos", description: "Quick team updates" },
    { icon: Brain, title: "Exploratory Thought", description: "Think out loud freely" },
    { icon: FileText, title: "Academic Papers", description: "Research made simple" },
    { icon: Star, title: "Dream Journaling", description: "Capture the subconscious" },
    { icon: BookOpen, title: "Book Writing", description: "Author your masterpiece" },
    { icon: Zap, title: "Brain Dumps", description: "Empty your mind efficiently" }
  ];

  const features = [
    "AI-powered transcription",
    "Intelligent rewriting",
    "Multi-language support", 
    "Instant organization",
    "Cross-device sync",
    "Premium quality output"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-20 -left-20 w-96 h-96 bg-gradient-to-r from-orange-400/20 to-orange-600/20 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${scrollY * 0.3}px)` }}
        />
        <div 
          className="absolute bottom-20 -right-20 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-orange-700/20 rounded-full blur-3xl animate-pulse"
          style={{ transform: `translateY(${-scrollY * 0.2}px)` }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent rotate-12" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className={`max-w-7xl mx-auto transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Headline & Content */}
            <div className="text-center lg:text-left lg:pl-8 lg:mt-12">
              {/* Main Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Think it.
                </span>
                <br />
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Say it.
                </span>
                <br />
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  Talkflo it.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-xl sm:text-2xl lg:text-3xl text-gray-700 mb-12 sm:mb-16 leading-relaxed font-light">
                Transform your rambling thoughts into clear, structured text with the power of AI. 
                <span className="text-orange-600 font-medium"> Your intelligent scribe, available 24/7.</span>
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start items-center mb-16 sm:mb-20">
                <SignUpButton mode="modal">
                  <Button className="group w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-lg sm:text-xl font-semibold rounded-2xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105 min-h-[56px]">
                    Start Creating Free
                    <ArrowRight className="ml-3 w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </SignUpButton>
                
                <SignInButton mode="modal">
                  <Button variant="outline" className="group w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-6 border-2 border-orange-200 text-orange-600 hover:bg-orange-50 text-lg sm:text-xl font-semibold rounded-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm bg-white/70 hover:shadow-lg min-h-[56px]">
                    Welcome Back
                    <Play className="ml-3 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </SignInButton>
              </div>
            </div>

            {/* Right Column - Animated Microphone */}
            <div className="flex justify-center lg:justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-2xl opacity-30 animate-pulse scale-150" />
                <div className="relative bg-gradient-to-r from-orange-500 to-orange-600 p-8 sm:p-12 lg:p-16 rounded-full shadow-2xl">
                  <Mic className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-white animate-bounce" />
                </div>
                {/* Voice Wave Animation */}
                <div className="absolute -inset-16 lg:-inset-20 flex items-center justify-center">
                  {/* Primary waves */}
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={`primary-${i}`}
                      className="absolute border-2 border-orange-400/20 rounded-full"
                      style={{ 
                        width: `${8 + i * 4}rem`,
                        height: `${8 + i * 4}rem`,
                        animationDelay: `${i * 0.8}s`,
                        animationDuration: '3s',
                        animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)',
                        animation: `ping 3s cubic-bezier(0.4, 0, 0.6, 1) infinite`,
                        opacity: 0.8 - i * 0.15
                      }}
                    />
                  ))}
                  
                  {/* Secondary subtle waves */}
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={`secondary-${i}`}
                      className="absolute border border-orange-300/15 rounded-full"
                      style={{ 
                        width: `${6 + i * 3}rem`,
                        height: `${6 + i * 3}rem`,
                        animationDelay: `${i * 0.6 + 0.3}s`,
                        animationDuration: '2.5s',
                        animationTimingFunction: 'ease-out',
                        animation: `ping 2.5s ease-out infinite`,
                        opacity: 0.6 - i * 0.1
                      }}
                    />
                  ))}
                  
                  {/* Micro ripples */}
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={`ripple-${i}`}
                      className="absolute border border-orange-500/10 rounded-full"
                      style={{ 
                        width: `${3 + i * 1.5}rem`,
                        height: `${3 + i * 1.5}rem`,
                        animationDelay: `${i * 0.3}s`,
                        animationDuration: '1.8s',
                        animationTimingFunction: 'ease-in-out',
                        animation: `ping 1.8s ease-in-out infinite`,
                        opacity: 0.4 - i * 0.05
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlights - Below both columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 max-w-5xl mx-auto mt-16 lg:mt-20">
            {features.map((feature, index) => (
              <div 
                key={feature}
                className="group bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <Check className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mb-2 sm:mb-3 mx-auto" />
                <p className="text-xs sm:text-sm font-medium text-gray-700 group-hover:text-orange-600 transition-colors text-center leading-tight">
                  {feature}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6 pb-8 sm:pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 sm:mb-12">
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Thoughts are living things
              </span>
            </h2>
            <div className="max-w-4xl mx-auto space-y-8 sm:space-y-12">
              <p className="text-xl sm:text-2xl lg:text-3xl text-gray-600 leading-relaxed">
                Every day, brilliant ideas flash through your mind. But by the time you find a pen, open an app, 
                or sit down to write...
              </p>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-800">
                They're gone.
              </p>
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed mb-2">
                Good ideas die not from lack of merit, but from poor capturing and clumsy articulation. 
                Your thoughts deserve better than being lost in the chaos of daily life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Showcase */}
      <section className="relative pt-8 sm:pt-12 py-20 sm:py-32 px-4 sm:px-6 bg-gradient-to-b from-transparent to-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-3 bg-orange-100 text-orange-700 px-6 py-3 rounded-full text-sm sm:text-base font-medium mb-8 backdrop-blur-sm">
              <Sparkles className="w-5 h-5" />
              It doesn't have to be that way
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8 sm:mb-12">
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Your intelligent scribe
              </span>
              <br />
              <span className="text-gray-800">in your pocket, 24x7</span>
            </h2>

            <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed max-w-4xl mx-auto mb-16">
              Talkflo captures your thoughts the moment they happen, then transforms them into 
              clear, structured text. No more lost ideas. No more rambling notes. Just pure, 
              crystallized thinking.
            </p>

            {/* Process Visualization */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 max-w-5xl mx-auto">
              <div className="group text-center">
                <div className="relative mb-6 sm:mb-8">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <Mic className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                  <div className="absolute -inset-4 bg-orange-200/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Speak Naturally</h3>
                <p className="text-gray-600 leading-relaxed">
                  Just hit record and speak your mind. No structure needed. No perfect sentences required.
                </p>
              </div>

              <div className="group text-center">
                <div className="relative mb-6 sm:mb-8">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                  <div className="absolute -inset-4 bg-orange-300/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">AI Magic</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our AI transcribes and intelligently rewrites your thoughts into clear, professional text.
                </p>
              </div>

              <div className="group text-center">
                <div className="relative mb-6 sm:mb-8">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-orange-600 to-orange-700 rounded-full flex items-center justify-center mx-auto shadow-2xl group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                  <div className="absolute -inset-4 bg-orange-400/30 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">Perfect Output</h3>
                <p className="text-gray-600 leading-relaxed">
                  Get polished, ready-to-use text that captures your ideas with clarity and precision.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="relative py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8">
              <span className="text-gray-800">Endless</span>
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent"> possibilities</span>
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              From fleeting thoughts to finished masterpieces. Talkflo adapts to every creative and professional need.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {useCases.map((useCase, index) => (
              <div
                key={useCase.title}
                className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-white/30 hover:border-orange-200"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="relative mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <useCase.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-orange-200/30 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3 group-hover:text-orange-600 transition-colors">
                  {useCase.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-8 sm:py-12 px-4 sm:px-6 bg-gradient-to-b from-transparent to-white/50 mt-0">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent">
              Ready to capture
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              every brilliant thought?
            </span>
          </h2>
          
          <p className="text-xl sm:text-2xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
            Join thousands of creators, writers, and professionals who never lose an idea again.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <SignUpButton mode="modal">
              <Button className="group w-full sm:w-auto px-12 py-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xl font-semibold rounded-2xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105 min-h-[64px]">
                Start Your Journey Free
                <Sparkles className="ml-3 w-6 h-6 group-hover:rotate-12 transition-transform" />
              </Button>
            </SignUpButton>
            
            <SignInButton mode="modal">
              <Button variant="outline" className="group w-full sm:w-auto px-12 py-6 border-2 border-orange-300 text-orange-600 hover:bg-orange-50 text-xl font-semibold rounded-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm bg-white/80 hover:shadow-lg min-h-[64px]">
                Sign In
                <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </SignInButton>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            No credit card required • Start creating in seconds • Join the future of thought capture
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-16 px-4 sm:px-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Talkflo</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Transform your thoughts into clear, structured text with AI-powered transcription and rewriting.
              </p>
            </div>

            {/* Quick FAQ */}
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Quick FAQ</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Is it free to use?</p>
                  <p className="text-xs text-gray-600">Yes! Start with our free plan and upgrade as needed.</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">What languages are supported?</p>
                  <p className="text-xs text-gray-600">13+ languages including English, Spanish, French, and more.</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">How accurate is the transcription?</p>
                  <p className="text-xs text-gray-600">AI-powered transcription with 95%+ accuracy.</p>
                </div>
                <a href="/faq" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                  View all FAQs →
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 mb-4 sm:mb-0">
              © 2025 Talkflo. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="/faq" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">
                FAQ
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-600 hover:text-orange-600 transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
