import React from 'react';
import { Calendar, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Restaurant } from './RestaurantSelector';

interface RestaurantInfoSectionProps {
  onBookingClick: () => void;
  selectedRestaurant?: Restaurant;
}

const RestaurantInfoSection = ({ onBookingClick, selectedRestaurant }: RestaurantInfoSectionProps) => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Visit {selectedRestaurant?.name || 'Amici Coffee'}
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
                  <p className="text-gray-600">
                    {selectedRestaurant?.address || '123 Fine Dining Street<br />Downtown District, City 12345'}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-amber-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Bookings</h3>
                  <p className="text-gray-600">+44 20 7946 0958</p>
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
                onClick={onBookingClick}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Make a Booking
              </Button>
              <p className="text-sm text-gray-500 text-center">
                Booking slots available every 30 minutes
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RestaurantInfoSection;
