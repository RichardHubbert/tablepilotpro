import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserMenu from '@/components/UserMenu';
import MobileMenu from '@/components/MobileMenu';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface NavigationHeaderProps {
  onBookingClick?: () => void;
}

const NavigationHeader = ({ onBookingClick }: NavigationHeaderProps) => {
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
      {/* Logo/Brand */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-white">Amici Coffee</h1>
      </div>
      
      {/* Right side navigation */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu (only visible on mobile) */}
        <MobileMenu 
          onBookingClick={onBookingClick}
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
              onClick={() => window.location.href = '/amicicoffee/admin'}
            >
              Admin Dashboard
            </Button>
          </>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/amicicoffee/auth'}
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
