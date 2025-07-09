import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
}
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar, Users, Clock, CheckCircle, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DateSelector from '@/components/DateSelector';
import PartySizeSelector from '@/components/PartySizeSelector';
import TimeSlotSelector from '@/components/TimeSlotSelector';
import CustomerForm from '@/components/CustomerForm';
import BookingConfirmation from '@/components/BookingConfirmation';
import { createBooking } from '@/services/supabaseBookingService';
import { sendBookingConfirmationEmail } from '@/services/emailService';
import { fetchRestaurants, Restaurant } from '@/services/restaurantService';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant?: Restaurant;
  initialDate?: string;
  initialTime?: string;
  initialPartySize?: string;
}

export interface BookingData {
  restaurantId: string;
  date: Date;
  startTime: string;
  partySize: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  specialRequests?: string;
}

const steps = [
  { id: 1, title: 'Date', icon: Calendar },
  { id: 2, title: 'Party Size', icon: Users },
  { id: 3, title: 'Time', icon: Clock },
  { id: 4, title: 'Details', icon: Users },
  { id: 5, title: 'Confirm', icon: CheckCircle },
];

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, restaurant, initialDate, initialTime, initialPartySize }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({ restaurantId: '', date: undefined });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationData, setConfirmationData] = useState<BookingData | null>(null);
  const { toast } = useToast();
  const [counties] = useState(["Bedfordshire", "Cambridgeshire", "Hertfordshire"]);
  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [restaurantOptions, setRestaurantOptions] = useState<Restaurant[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch restaurants when county changes
  useEffect(() => {
    const fetchAndSetRestaurants = async () => {
      const all = await fetchRestaurants();
      const filtered = selectedCounty ? all.filter(r => r.county && r.county === selectedCounty) : all;
      setRestaurantOptions(filtered);
      // If current restaurantId is not in filtered, reset
      if (!filtered.find(r => r.id === bookingData.restaurantId)) {
        setBookingData(b => ({ ...b, restaurantId: filtered[0]?.id }));
      }
    };
    fetchAndSetRestaurants();
  }, [selectedCounty]);

  // Pre-fill county and restaurant if opened from a card
  useEffect(() => {
    if (isOpen && restaurant) {
      setSelectedCounty(restaurant.county || "");
      // Ensure restaurant is set in booking data
      setBookingData(prev => ({
        ...prev,
        restaurantId: restaurant.id
      }));
    }
  }, [isOpen, restaurant]);

  // When restaurantOptions change, ensure bookingData.restaurantId is a valid UUID
  useEffect(() => {
    if (restaurantOptions.length > 0 && !restaurantOptions.find(r => r.id === bookingData.restaurantId)) {
      setBookingData(b => ({ ...b, restaurantId: restaurantOptions[0].id }));
    }
  }, [restaurantOptions]);

  // Pre-fill form with initial values from filter selections
  useEffect(() => {
    if (isOpen) {
      const newBookingData: Partial<BookingData> = {
        restaurantId: restaurant?.id || bookingData.restaurantId || '',
        date: initialDate ? new Date(initialDate) : undefined,
        startTime: initialTime || undefined,
        partySize: initialPartySize ? parseInt(initialPartySize) : undefined,
      };
      setBookingData(newBookingData);
    }
  }, [isOpen, initialDate, initialTime, initialPartySize, restaurant]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setBookingData({ restaurantId: '', date: undefined });
    setIsSubmitting(false);
    setConfirmationData(null);
    onClose();
  };

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData({ ...bookingData, ...data });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return bookingData.date; // Only require date
      case 2:
        return bookingData.partySize;
      case 3:
        return bookingData.startTime;
      case 4:
        return bookingData.customerName && bookingData.customerEmail;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    console.log('🔍 Debug booking data:', {
      restaurantId: bookingData.restaurantId,
      restaurant: restaurant,
      hasRestaurant: !!bookingData.restaurantId,
      hasDate: !!bookingData.date,
      hasStartTime: !!bookingData.startTime,
      hasPartySize: !!bookingData.partySize,
      hasCustomerName: !!bookingData.customerName,
      hasCustomerEmail: !!bookingData.customerEmail
    });

    if (!bookingData.restaurantId || !bookingData.date || !bookingData.startTime || !bookingData.partySize || 
        !bookingData.customerName || !bookingData.customerEmail) {
      console.error('❌ Missing required booking data:', {
        hasRestaurant: !!bookingData.restaurantId,
        hasDate: !!bookingData.date,
        hasStartTime: !!bookingData.startTime,
        hasPartySize: !!bookingData.partySize,
        hasCustomerName: !!bookingData.customerName,
        hasCustomerEmail: !!bookingData.customerEmail
      });
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields, including restaurant selection",
        variant: "destructive"
      });
      setSubmitError('Please fill in all required fields, including restaurant selection.');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('📝 Submitting booking with data:', {
        ...bookingData,
        date: bookingData.date?.toISOString()
      });
      const result = await createBooking({
        restaurantId: bookingData.restaurantId,
        date: bookingData.date,
        startTime: bookingData.startTime,
        partySize: bookingData.partySize,
        customerName: bookingData.customerName,
        customerEmail: bookingData.customerEmail,
        customerPhone: bookingData.customerPhone,
        specialRequests: bookingData.specialRequests
      });
      console.log('🎉 Booking submission successful!', result);
      // Convert Booking to BookingData
      const confirmedBooking: BookingData = {
        restaurantId: result.restaurant_id,
        date: new Date(result.booking_date),
        startTime: result.start_time,
        partySize: result.party_size,
        customerName: result.customer_name,
        customerEmail: result.customer_email,
        customerPhone: result.customer_phone,
        specialRequests: result.special_requests
      };
      setConfirmationData(confirmedBooking);
      setCurrentStep(5);
      
      // Send confirmation email
      console.log('📧 Attempting to send confirmation email...');
      const emailSent = await sendBookingConfirmationEmail(result);
      
      toast({
        title: "Booking Confirmed!",
        description: emailSent 
          ? "Your table reservation has been successfully created. A confirmation email has been sent to your inbox." 
          : "Your table reservation has been successfully created. (Email delivery failed)",
      });
      
    } catch (error) {
      console.error('💥 Booking submission failed:', error);
      setSubmitError('Booking failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <div className="mb-4">
              <label className="block mb-1 font-medium">County</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={selectedCounty}
                onChange={e => setSelectedCounty(e.target.value)}
              >
                <option value="">Select county</option>
                {counties.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium">Restaurant</label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={bookingData.restaurantId}
                onChange={e => setBookingData({ ...bookingData, restaurantId: e.target.value })}
                required
              >
                {restaurantOptions.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <DateSelector
              selectedDate={bookingData.date}
              onDateSelect={date => setBookingData({ ...bookingData, date })}
            />
          </>
        );
      case 2:
        return (
          <PartySizeSelector
            selectedSize={bookingData.partySize}
            onSizeSelect={(partySize) => updateBookingData({ partySize })}
          />
        );
      case 3:
        return (
          <TimeSlotSelector
            date={bookingData.date!}
            partySize={bookingData.partySize!}
            selectedTime={bookingData.startTime}
            onTimeSelect={time => updateBookingData({ startTime: time })}
          />
        );
      case 4:
        return (
          <CustomerForm
            data={bookingData}
            onUpdate={updateBookingData}
          />
        );
      case 5:
        return (
          <BookingConfirmation
            bookingData={bookingData as BookingData}
            onClose={handleClose}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Reserve Your Table
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 px-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                  ${isActive ? 'bg-amber-600 text-white' : 
                    isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  <Icon className="h-5 w-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={`
                    w-8 h-0.5 mx-2
                    ${isCompleted ? 'bg-green-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <Card className="border-0 shadow-none">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">
              {steps[currentStep - 1]?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Show error if booking fails */}
        {submitError && (
          <div className="text-red-600 text-sm mt-2 text-center">{submitError}</div>
        )}

        {/* Navigation Buttons */}
        {currentStep < 5 && (
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            
            {currentStep === 4 ? (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 flex items-center"
              >
                {isSubmitting ? 'Creating Booking...' : 'Confirm Booking'}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-amber-600 hover:bg-amber-700 flex items-center"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
