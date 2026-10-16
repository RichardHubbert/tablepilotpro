import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MobileMenu from '@/components/MobileMenu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface NavigationHeaderProps {
  onBookingClick?: () => void;
}

const NavigationHeader = ({ onBookingClick }: NavigationHeaderProps) => {
  const navigate = useNavigate();
  const { isAdmin: signedIn, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="fixed top-0 left-0 right-0 w-full z-50 bg-white border-b flex items-center justify-between px-4 py-3">
      <div className="flex-1 flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-lg select-none">TP</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 ml-2">Amici Coffee</h1>
      </div>
      
      <div className="flex items-center gap-4">
        <MobileMenu onBookingClick={onBookingClick} />
        
        <div className="hidden md:flex items-center gap-4">
          {signedIn ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/admin')}
              >
                Admin Dashboard
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/auth')}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavigationHeader;
