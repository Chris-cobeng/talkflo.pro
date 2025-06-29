import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ArrowLeft, Mic, Search, HelpCircle } from 'lucide-react';
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqCategories = [
    {
      title: "Getting Started",
      questions: [
        {
          question: "How do I get started with Talkflo?",
          answer: "Simply sign up for a free account, grant microphone permissions, and start recording! Your first recording will be transcribed and rewritten automatically. No setup required."
        },
        {
          question: "Is Talkflo free to use?",
          answer: "Yes! Talkflo offers a generous free plan that includes transcription, AI rewriting, and basic organization features. Premium plans offer additional features like unlimited recordings, advanced AI models, and priority support."
        },
        {
          question: "Do I need to download anything?",
          answer: "No downloads required! Talkflo works entirely in your web browser. Just visit our website, sign up, and start using it immediately on any device."
        },
        {
          question: "What devices can I use Talkflo on?",
          answer: "Talkflo works on any device with a web browser and microphone - desktop computers, laptops, tablets, and smartphones. Your notes sync automatically across all devices."
        }
      ]
    },
    {
      title: "Recording & Transcription",
      questions: [
        {
          question: "How accurate is the transcription?",
          answer: "Our AI-powered transcription achieves 95%+ accuracy for clear speech in supported languages. Accuracy may vary based on audio quality, background noise, and speaking clarity."
        },
        {
          question: "What languages are supported?",
          answer: "Talkflo supports 13+ languages including English, Spanish, French, German, Italian, Portuguese, Japanese, Korean, Chinese, Arabic, Hindi, and Russian. More languages are added regularly."
        },
        {
          question: "Can I upload audio files instead of recording?",
          answer: "Yes! You can upload audio files in MP3, WAV, M4A, OGG, and FLAC formats. The same transcription and AI rewriting process applies to uploaded files."
        },
        {
          question: "What's the maximum recording length?",
          answer: "Free accounts can record up to 10 minutes per session. Premium accounts have extended limits up to 60 minutes per recording, perfect for meetings and lectures."
        },
        {
          question: "How does the AI rewriting work?",
          answer: "After transcription, our AI analyzes your speech patterns and intent, then rewrites the text for clarity, structure, and professionalism while preserving your original meaning and voice."
        }
      ]
    },
    {
      title: "Organization & Features",
      questions: [
        {
          question: "How do I organize my notes?",
          answer: "Create custom folders to organize your notes by project, topic, or any system that works for you. You can also search through all your notes instantly using our smart search feature."
        },
        {
          question: "Can I edit the transcribed text?",
          answer: "Absolutely! You can edit both the original transcript and the AI-rewritten version. Your edits are saved automatically, and you can always view the original recording."
        },
        {
          question: "What is Magic Chat?",
          answer: "Magic Chat is our AI assistant that can discuss your notes, suggest improvements, answer questions about your content, and help you expand on your ideas. It's like having a writing partner for every note."
        },
        {
          question: "Can I export my notes?",
          answer: "Yes! You can copy your notes as text, or share them directly. Premium accounts get additional export options including formatted documents and integration with popular productivity tools."
        },
        {
          question: "Are my recordings stored?",
          answer: "For quality purposes, recordings may be temporarily stored during processing, but they're automatically deleted after transcription. Your text notes are securely saved in your account."
        }
      ]
    },
    {
      title: "Privacy & Security",
      questions: [
        {
          question: "Is my data secure?",
          answer: "Yes! We use enterprise-grade encryption for all data transmission and storage. Your notes are private to your account and never shared with third parties without your explicit consent."
        },
        {
          question: "Who can access my recordings and notes?",
          answer: "Only you can access your content. Our AI processing is automated and anonymous. Our team cannot access your personal notes or recordings unless you explicitly share them for support purposes."
        },
        {
          question: "Can I delete my data?",
          answer: "Yes, you have full control over your data. You can delete individual notes, clear your entire account, or request complete data deletion at any time through your account settings."
        },
        {
          question: "Do you use my data to train AI models?",
          answer: "No, we do not use your personal recordings or notes to train our AI models. Your content remains private and is only used to provide you with transcription and rewriting services."
        }
      ]
    },
    {
      title: "Technical Support",
      questions: [
        {
          question: "What if the transcription is inaccurate?",
          answer: "You can edit any transcription directly. For consistently poor results, check your microphone quality, reduce background noise, and speak clearly. Contact support if issues persist."
        },
        {
          question: "Why isn't my microphone working?",
          answer: "Ensure you've granted microphone permissions to your browser and that no other applications are using your microphone. Try refreshing the page or restarting your browser."
        },
        {
          question: "Can I use Talkflo offline?",
          answer: "Currently, Talkflo requires an internet connection for AI transcription and rewriting. We're exploring offline capabilities for future updates."
        },
        {
          question: "How do I contact support?",
          answer: "You can reach our support team at support@talkflo.com or through the contact form on our website. Premium users get priority support with faster response times."
        }
      ]
    }
  ];

  const allQuestions = faqCategories.flatMap(category => 
    category.questions.map(q => ({ ...q, category: category.title }))
  );

  const filteredQuestions = searchQuery
    ? allQuestions.filter(
        q => 
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a 
                href="/" 
                className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Talkflo</span>
              </a>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <Mic className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800">FAQ</h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <SignInButton mode="modal">
                <Button variant="outline" className="hidden sm:flex border-orange-200 text-orange-600 hover:bg-orange-50">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                  Get Started
                </Button>
              </SignUpButton>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Everything you need to know about Talkflo. Can't find what you're looking for? 
              <a href="mailto:support@talkflo.com" className="text-orange-600 hover:text-orange-700 ml-1">
                Contact our support team.
              </a>
            </p>
          </div>

          {/* Search */}
          <div className="relative max-w-lg mx-auto mb-12">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all text-lg"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {searchQuery ? (
            /* Search Results */
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Search Results ({filteredQuestions.length})
              </h2>
              {filteredQuestions.length > 0 ? (
                filteredQuestions.map((item, index) => (
                  <div key={index} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                    <button
                      onClick={() => toggleItem(index + 1000)} // Offset to avoid conflicts
                      className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-orange-50/50 transition-colors"
                    >
                      <div>
                        <span className="text-sm text-orange-600 font-medium">{item.category}</span>
                        <h3 className="text-lg font-semibold text-gray-800 mt-1">{item.question}</h3>
                      </div>
                      {openItems.includes(index + 1000) ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0 ml-4" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 ml-4" />
                      )}
                    </button>
                    {openItems.includes(index + 1000) && (
                      <div className="px-6 pb-5">
                        <div className="border-t border-gray-100 pt-4">
                          <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No results found for "{searchQuery}"</p>
                  <p className="text-gray-400 mt-2">Try different keywords or browse categories below.</p>
                </div>
              )}
            </div>
          ) : (
            /* Categories */
            <div className="space-y-12">
              {faqCategories.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    {category.title}
                  </h2>
                  <div className="space-y-4">
                    {category.questions.map((item, questionIndex) => {
                      const itemIndex = categoryIndex * 100 + questionIndex;
                      return (
                        <div key={questionIndex} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <button
                            onClick={() => toggleItem(itemIndex)}
                            className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-orange-50/50 transition-colors group"
                          >
                            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-orange-700 transition-colors pr-4">
                              {item.question}
                            </h3>
                            {openItems.includes(itemIndex) ? (
                              <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            )}
                          </button>
                          {openItems.includes(itemIndex) && (
                            <div className="px-6 pb-5">
                              <div className="border-t border-gray-100 pt-4">
                                <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-r from-orange-50 to-orange-100/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-6">
            Still have questions?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Our support team is here to help you get the most out of Talkflo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:support@talkflo.com"
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-2xl transition-all hover:scale-105 shadow-lg"
            >
              Contact Support
            </a>
            <SignUpButton mode="modal">
              <Button variant="outline" className="px-8 py-4 border-2 border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold rounded-2xl transition-all hover:scale-105">
                Try Talkflo Free
              </Button>
            </SignUpButton>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
