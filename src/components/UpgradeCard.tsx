import React from 'react';
import { Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface UpgradeCardProps {
  title: string;
  description: string;
  feature?: string;
  className?: string;
}

const UpgradeCard = ({ 
  title, 
  description, 
  feature = "unlimited access", 
  className = "" 
}: UpgradeCardProps) => {
  const navigate = useNavigate();

  const handleUpgradeClick = () => {
    navigate('/billing');
  };
  return (
    <div className={`glass rounded-2xl p-6 sm:p-8 shadow-beautiful max-w-md w-full mx-auto text-center animate-scale-in ${className}`}>
      {/* Icon */}
      <div className="relative mb-6">
        <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
        <div className="relative w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
          <Crown className="w-8 h-8 text-white" />
        </div>
      </div>
      
      {/* Content */}
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
        {title}
      </h3>
      <p className="text-gray-600 mb-6 leading-relaxed">
        {description}
      </p>
      
      {/* Feature highlight */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 mb-6 border border-orange-200">
        <div className="flex items-center justify-center gap-2 text-orange-700">
          <span className="font-medium">Unlock {feature} with Talkflo Prime</span>
        </div>
      </div>
      
      {/* CTA Button */}
      <Button 
        onClick={handleUpgradeClick}
        className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 font-semibold rounded-xl transition-all hover:scale-105 shadow-lg"
      >
        <Crown className="w-5 h-5 mr-2" />
        Upgrade to Talkflo Prime
        <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
      
      <p className="text-xs text-gray-500 mt-4">
        Start your journey to unlimited creativity
      </p>
    </div>
  );
};

export default UpgradeCard;
