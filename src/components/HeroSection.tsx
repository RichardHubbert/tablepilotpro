import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Clock, Star } from 'lucide-react';

interface HeroSectionProps {
  onBookTable: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onBookTable }) => {
  return (
    <section className="relative bg-gradient-to-br from-amber-50 to-orange-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to{' '}
            <span className="text-amber-600">Amici Coffee</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience the perfect blend of Italian tradition and modern comfort. 
            Book your table today and enjoy our authentic coffee and cuisine.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              onClick={onBookTable}
              size="lg" 
              className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 text-lg"
            >
              Book a Table
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Calendar className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Easy Booking</h3>
                <p className="text-sm text-gray-600">Book your table in seconds</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Group Friendly</h3>
                <p className="text-sm text-gray-600">Perfect for any party size</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <Clock className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Flexible Times</h3>
                <p className="text-sm text-gray-600">Choose your preferred time</p>
              </CardContent>
            </Card>
            
            <Card className="text-center">
              <CardContent className="pt-6">
                <Star className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                <h3 className="font-semibold text-gray-900">Premium Service</h3>
                <p className="text-sm text-gray-600">Exceptional dining experience</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
