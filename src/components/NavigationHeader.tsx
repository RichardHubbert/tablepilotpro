
import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserMenu from '@/components/UserMenu';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const NavigationHeader = () => {
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
    <div className="absolute top-4 right-4 z-10 flex items-center gap-4">
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
  );
};

export default NavigationHeader;
