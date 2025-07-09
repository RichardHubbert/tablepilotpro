import React from 'react';
import { Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import QuickReserveCard from './QuickReserveCard';
import { Restaurant } from './RestaurantSelector';

interface HeroSectionProps {
  onBookingClick: () => void;
  selectedRestaurant?: Restaurant;
}

const HeroSection = ({ onBookingClick, selectedRestaurant }: HeroSectionProps) => {
  return (
    <section className="relative min-h-[80vh] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={selectedRestaurant?.imageUrl || "/amicicoffee.jpg"}
          alt="Amici Coffee background"
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
              {selectedRestaurant?.name || 'Table Pilot Pro'}
              <span className="block text-2xl md:text-3xl text-amber-400 font-normal">
                {selectedRestaurant?.cuisine || 'Coffee & Dining'}
              </span>
            </h1>
            
            {selectedRestaurant && (
              <div className="flex items-center gap-2 text-amber-400">
                <Star className="h-5 w-5 fill-current" />
                <span className="text-lg font-medium">{selectedRestaurant.rating}</span>
                <span className="text-sm text-gray-300">• {selectedRestaurant.address}</span>
              </div>
            )}
            
            <p className="text-xl leading-relaxed">
              {selectedRestaurant 
                ? `Experience ${selectedRestaurant.cuisine.toLowerCase()} cuisine at ${selectedRestaurant.name}. Reserve your table for an unforgettable culinary journey.`
                : 'Experience artisanal coffee and delicious dining in a warm, welcoming atmosphere. Reserve your table for an unforgettable experience at Table Pilot Pro.'
              }
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
