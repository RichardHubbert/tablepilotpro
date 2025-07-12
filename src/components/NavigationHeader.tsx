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

  const handleSignIn = () => {
    navigate('/auth');
  };

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
              onClick={handleAdminDashboard}
            >
              Admin Dashboard
            </Button>
          </>
        ) : (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSignIn}
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
