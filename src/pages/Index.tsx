import React, { useState, useEffect } from 'react';
import BookingModal from '@/components/BookingModal';
import NavigationHeader from '@/components/NavigationHeader';
import HeroSection from '@/components/HeroSection';
import TableSizesSection from '@/components/TableSizesSection';
import RestaurantInfoSection from '@/components/RestaurantInfoSection';
import TopFilterBar from '@/components/TopFilterBar';
import { useAuth } from '@/hooks/useAuth';
import { fetchRestaurants, Restaurant } from '@/services/restaurantService';
import { fetchTables, fetchBookingsForDate } from '@/services/supabaseBookingService';
import { addMinutes, format } from 'date-fns';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

const Index = () => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { user } = useAuth();
  const [bookingRestaurant, setBookingRestaurant] = useState<Restaurant | undefined>(undefined);

  // Filter bar state
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedPartySize, setSelectedPartySize] = useState(''); // always string
  const [selectedLocation, setSelectedLocation] = useState('');
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedMap, setBookedMap] = useState<{ [restaurantId: string]: boolean }>({});
  const [infoModalRestaurant, setInfoModalRestaurant] = useState<Restaurant | null>(null);

  const handlePartySizeChange = (value: string) => {
    setSelectedPartySize(value);
  };

  useEffect(() => {
    const fetchAndFilter = async () => {
      setLoading(true);
      setError(null);
      try {
        const allRestaurants = await fetchRestaurants();
        // If 'All' is selected (selectedLocation is ''), show all
        const filtered = selectedLocation
          ? allRestaurants.filter(r => r.county && r.county.toLowerCase() === selectedLocation.toLowerCase())
          : allRestaurants;
        setFilteredRestaurants(filtered);

        // If date, time, and party size are selected, check booking status
        if (selectedDate && selectedTime && selectedPartySize) {
          const tables = await fetchTables();
          const bookings = await fetchBookingsForDate(new Date(selectedDate));
          const partySizeNum = parseInt(selectedPartySize);
          const [hours, minutes] = selectedTime.split(':').map(Number);
          const startDate = new Date(selectedDate);
          startDate.setHours(hours, minutes, 0, 0);
          const endDate = addMinutes(startDate, 150); // 2.5 hours
          const endTime = format(endDate, 'HH:mm');

          // Check if there are any available tables for the party size
          const suitableTables = tables.filter(t => t.capacity >= partySizeNum);
          let anyTableAvailable = false;
          
          for (const table of suitableTables) {
            const tableBookings = bookings.filter(b => b.table_id === table.id);
            const hasConflict = tableBookings.some(booking => {
              const parseTime = (time: string) => {
                const [h, m] = time.split(':').map(Number);
                return h * 60 + m;
              };
              const newStart = parseTime(selectedTime);
              const newEnd = parseTime(endTime);
              const existingStart = parseTime(booking.start_time);
              const existingEnd = parseTime(booking.end_time);
              return (newStart < existingEnd && newEnd > existingStart);
            });
            if (!hasConflict) {
              anyTableAvailable = true;
              break;
            }
          }

          // All restaurants have the same availability since they share the same tables
          const newBookedMap: { [restaurantId: string]: boolean } = {};
          for (const restaurant of filtered) {
            newBookedMap[restaurant.id] = !anyTableAvailable;
          }
          setBookedMap(newBookedMap);
        } else {
          setBookedMap({});
        }
      } catch (e) {
        setError('Failed to fetch restaurants.');
      } finally {
        setLoading(false);
      }
    };
    fetchAndFilter();
  }, [selectedLocation, selectedDate, selectedTime, selectedPartySize]);

  const handleBookingClick = (restaurant?: Restaurant) => {
    setBookingRestaurant(restaurant);
    setIsBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader 
        onBookingClick={handleBookingClick}
      />
      <TopFilterBar
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedTime={selectedTime}
        onTimeChange={setSelectedTime}
        selectedPartySize={selectedPartySize}
        onPartySizeChange={handlePartySizeChange}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        onSave={() => {}}
      />
      {loading && <div className="text-center py-8">Loading restaurants...</div>}
      {error && <div className="text-center text-red-600 py-4">{error}</div>}
      {!loading && filteredRestaurants.length > 0 && (
        <div className="max-w-2xl mx-auto mt-8">
          <Carousel className="w-full" opts={{ slidesToScroll: 1, align: 'start' }}>
            <CarouselContent>
              {filteredRestaurants.map(r => (
                <CarouselItem key={r.id} className="px-2 basis-1/3">
                  <div className="border rounded p-4 bg-white shadow-sm h-full flex flex-col items-center justify-between">
                    {/* Restaurant Image */}
                    <img
                      src={r.image_url || '/placeholder.svg'}
                      alt={r.name}
                      className="w-full h-36 object-cover mb-2 rounded-lg border-2 border-amber-400 bg-gray-100"
                      onError={e => { e.currentTarget.src = '/placeholder.svg'; }}
                    />
                    <div
                      className="font-bold text-lg mb-2 text-amber-700 hover:underline cursor-pointer"
                      onClick={() => setInfoModalRestaurant(r)}
                    >
                      {r.name}
                    </div>
                    <div className="text-gray-600 mb-1">{r.address}</div>
                    <div className="text-sm text-gray-500 mb-4">Cuisine: {r.cuisine}</div>
                    {bookedMap[r.id] ? (
                      <div className="mt-auto px-4 py-2 bg-red-500 text-white rounded font-semibold">Booked</div>
                    ) : (
                      <button
                        className="mt-auto px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition"
                        onClick={() => handleBookingClick(r)}
                      >
                        Book
                      </button>
                    )}
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
          {/* Dots */}
          <div className="flex justify-center mt-4 gap-2">
            {filteredRestaurants.map((_, idx) => (
              <span key={idx} className="inline-block w-2 h-2 rounded-full bg-gray-300" />
            ))}
          </div>
        </div>
      )}
      {!loading && filteredRestaurants.length === 0 && selectedLocation && (
        <div className="text-center text-gray-500 py-8">No restaurants found for {selectedLocation}.</div>
      )}
      {!loading && filteredRestaurants.length === 0 && !selectedLocation && (
        <div className="text-center text-gray-500 py-8">No restaurants found.</div>
      )}
      <HeroSection 
        onBookingClick={() => handleBookingClick()}
        selectedRestaurant={undefined}
      />
      <TableSizesSection />
      <RestaurantInfoSection 
        onBookingClick={handleBookingClick}
        selectedRestaurant={undefined}
      />

      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        restaurant={bookingRestaurant}
        initialDate={selectedDate}
        initialTime={selectedTime}
        initialPartySize={selectedPartySize}
      />
      {/* Restaurant Info Modal */}
      <Dialog open={!!infoModalRestaurant} onOpenChange={open => !open && setInfoModalRestaurant(null)}>
        <DialogContent className="max-w-lg">
          {infoModalRestaurant && (
            <>
              <DialogHeader>
                <DialogTitle>{infoModalRestaurant.name}</DialogTitle>
                <DialogDescription>{infoModalRestaurant.cuisine} | {infoModalRestaurant.address}</DialogDescription>
              </DialogHeader>
              {infoModalRestaurant.image_url && (
                <img
                  src={infoModalRestaurant.image_url}
                  alt={infoModalRestaurant.name}
                  className="w-full max-h-64 object-cover rounded mb-4"
                />
              )}
              <div className="text-gray-700 mb-2">
                {infoModalRestaurant.description}
              </div>
              <div className="text-xs text-gray-500">
                County: {infoModalRestaurant.county}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
