
import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserMenu from '@/components/UserMenu';
import MobileMenu from '@/components/MobileMenu';
import RestaurantSelector, { Restaurant } from '@/components/RestaurantSelector';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface NavigationHeaderProps {
  onBookingClick?: () => void;
  selectedRestaurant?: Restaurant;
  onRestaurantChange?: (restaurant: Restaurant) => void;
}

const NavigationHeader = ({ onBookingClick, selectedRestaurant, onRestaurantChange }: NavigationHeaderProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
      {/* Restaurant Selector */}
      <div className="flex-1 max-w-xs">
        <RestaurantSelector
          selectedRestaurant={selectedRestaurant}
          onRestaurantChange={onRestaurantChange || (() => {})}
        />
      </div>
      
      {/* Right side navigation */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu (only visible on mobile) */}
        <MobileMenu 
          onBookingClick={onBookingClick}
          selectedRestaurant={selectedRestaurant}
          onRestaurantChange={onRestaurantChange}
        />
        
        {/* Desktop Navigation (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-4">
        {user ? (
          <>
            <UserMenu />
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.href = '/admin'}
            >
              Admin Dashboard
            </Button>
          </>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/auth'}
          >
            Sign In
          </Button>
        )}
        </div>
      </div>
    </div>
  );
};

export default NavigationHeader;
