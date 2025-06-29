import React from 'react';
import { PricingTable } from '@clerk/clerk-react';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { SignInButton, SignUpButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";

const Billing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a 
                href="/" 
                className="flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </a>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800">Billing & Subscription</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Prime Note */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        <div className="bg-orange-100 text-orange-800 rounded-xl py-3 px-6 text-center text-lg font-semibold shadow mb-6">
          Unlock unlimited possibilities with Talkflo Prime
        </div>
      </div>

      {/* Clerk Pricing Table */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          
    
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
          <PricingTable />
        </div>
      </div>
    </div>
  );
};

export default Billing;
