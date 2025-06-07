import React, { useState } from 'react';
import { Calendar, Clock, Users, Phone, Mail, MapPin, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import BookingModal from '@/components/BookingModal';
import UserMenu from '@/components/UserMenu';
import AuthGuard from '@/components/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleBookingClick = () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }
    setIsBookingModalOpen(true);
  };

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
    <div className="min-h-screen bg-background">
      {/* Updated navigation with user menu */}
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-amber-50 to-orange-100 min-h-[70vh] flex items-center">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Table Pilot
              <span className="block text-2xl md:text-3xl text-amber-600 font-normal">Restaurant</span>
            </h1>
            
            {/* Updated image positioned under the Table Pilot text */}
            <div className="relative overflow-hidden rounded-2xl shadow-lg">
              <img 
                src="/lovable-uploads/1cf1aa04-79c2-4d2b-b395-ab316329e682.png" 
                alt="Table Pilot Restaurant fine dining experience"
                className="w-full h-[200px] object-cover"
              />
            </div>
            
            <p className="text-xl text-gray-700 leading-relaxed">
              Experience fine dining with breathtaking views. Reserve your table for an unforgettable culinary journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg"
                onClick={handleBookingClick}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Book a Table
              </Button>
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg">
                View Menu
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Ready to Dine?
              </h3>
              <div className="space-y-4">
                <Button 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-lg py-3"
                  onClick={handleBookingClick}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Make a Reservation
                </Button>
                <p className="text-sm text-gray-500 text-center">
                  Booking slots available every 30 minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Table Sizes Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Perfect Tables for Every Occasion
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From intimate dinners to family gatherings, we have the perfect table waiting for you.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle>Intimate Tables</CardTitle>
                <CardDescription>Perfect for 2 people</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Cozy window-side tables with beautiful city views.</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle>Family Tables</CardTitle>
                <CardDescription>Comfortable for 4 people</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Spacious center tables ideal for families and friends.</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle>Group Tables</CardTitle>
                <CardDescription>Spacious for 6 people</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Large patio tables for celebrations and gatherings.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Restaurant Info */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Visit Table Pilot
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Clock className="h-6 w-6 text-amber-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Opening Hours</h3>
                    <p className="text-gray-600">Daily: 11:00 AM - 10:00 PM</p>
                    <p className="text-sm text-gray-500">Last booking at 7:30 PM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <MapPin className="h-6 w-6 text-amber-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Location</h3>
                    <p className="text-gray-600">123 Fine Dining Street<br />Downtown District, City 12345</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="h-6 w-6 text-amber-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Reservations</h3>
                    <p className="text-gray-600">(555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-amber-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Email</h3>
                    <p className="text-gray-600">reservations@bellavista.com</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Ready to Dine?
              </h3>
              <div className="space-y-4">
                <Button 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-lg py-3"
                  onClick={handleBookingClick}
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  Make a Reservation
                </Button>
                <p className="text-sm text-gray-500 text-center">
                  Booking slots available every 30 minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
