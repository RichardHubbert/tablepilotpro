import React from 'react';
import { Button } from '@/components/ui/button';
import MobileMenu from '@/components/MobileMenu';
import { useNavigate } from 'react-router-dom';

interface NavigationHeaderProps {
  onBookingClick?: () => void;
}

const NavigationHeader = ({ onBookingClick }: NavigationHeaderProps) => {
  const navigate = useNavigate();

  const handleAdminDashboard = () => {
    navigate('/admin');
  };

  return (
    <div className="fixed top-0 left-0 right-0 w-full z-50 bg-white border-b flex items-center justify-between px-4 py-3">
      {/* Logo/Brand */}
      <div className="flex-1 flex items-center gap-2">
        {/* TP Logo */}
        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-lg select-none">TP</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 ml-2">Amici Coffee</h1>
      </div>
      
      {/* Right side navigation */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu (only visible on mobile) */}
        <MobileMenu 
          onBookingClick={onBookingClick}
        />
        
        {/* Desktop Navigation (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleAdminDashboard}
          >
            Admin Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NavigationHeader;
