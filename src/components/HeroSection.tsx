
import React from 'react';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QuickReserveCard from './QuickReserveCard';

interface HeroSectionProps {
  onBookingClick: () => void;
}

const HeroSection = ({ onBookingClick }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[80vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/lovable-uploads/d1a98a63-2cc5-4972-9f0d-87d62451a02b.png" 
          alt="Table Pilot Restaurant background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      
      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Title and Description */}
          <div className="space-y-6 text-white">
            <h1 className="text-4xl md:text-6xl font-bold">
              Table Pilot
              <span className="block text-2xl md:text-3xl text-amber-400 font-normal">Restaurant</span>
            </h1>
            
            <p className="text-xl leading-relaxed">
              Experience fine dining with breathtaking views. Reserve your table for an unforgettable culinary journey.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg"
                onClick={onBookingClick}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book a Table
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-3 text-lg border-white text-amber-600 hover:bg-white hover:text-gray-900"
              >
                View Menu
              </Button>
            </div>
          </div>

          {/* Right Side - Quick Reserve Card */}
          <div className="flex justify-end">
            <QuickReserveCard onBookingClick={onBookingClick} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
