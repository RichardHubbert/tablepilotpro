
import React, { useState } from 'react';
import BookingModal from '@/components/BookingModal';
import NavigationHeader from '@/components/NavigationHeader';
import HeroSection from '@/components/HeroSection';
import TableSizesSection from '@/components/TableSizesSection';
import RestaurantInfoSection from '@/components/RestaurantInfoSection';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { user } = useAuth();

  const handleBookingClick = () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader onBookingClick={handleBookingClick} />
      <HeroSection onBookingClick={handleBookingClick} />
      <TableSizesSection />
      <RestaurantInfoSection onBookingClick={handleBookingClick} />

      {user && (
        <BookingModal 
          isOpen={isBookingModalOpen} 
          onClose={() => setIsBookingModalOpen(false)} 
        />
      )}
    </div>
  );
};

export default Index;
