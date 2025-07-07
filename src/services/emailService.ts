import emailjs from '@emailjs/browser';
import { format } from 'date-fns';
import { Booking } from './supabaseBookingService';

// EmailJS service configuration
const SERVICE_ID = 'service_fvy9wzm'; // EmailJS service ID
const TEMPLATE_ID = 'template_booking_confirmation'; // Replace with your EmailJS template ID
const PUBLIC_KEY = 'CrvLAsC5DKRwVy5jR'; // EmailJS public key

/**
 * Format a booking date and time for display in emails
 */
const formatBookingDateTime = (date: string, time: string): string => {
  const bookingDate = new Date(date);
  const formattedDate = format(bookingDate, 'EEEE, MMMM do, yyyy');
  return `${formattedDate} at ${time}`;
};

/**
 * Send a booking confirmation email to the customer
 */
export const sendBookingConfirmationEmail = async (booking: Booking): Promise<boolean> => {
  try {
    console.log('📧 Preparing to send booking confirmation email...');
    
    // Format the booking date and time for the email
    const formattedDateTime = formatBookingDateTime(booking.booking_date, booking.start_time);
    
    // Prepare template parameters
    const templateParams = {
      to_name: booking.customer_name,
      to_email: booking.customer_email,
      booking_id: booking.id,
      booking_date_time: formattedDateTime,
      party_size: booking.party_size,
      special_requests: booking.special_requests || 'None',
      restaurant_name: 'Table Pilot Restaurant',
      restaurant_address: '123 Main Street, City, Country',
      restaurant_phone: '+1 (555) 123-4567',
      restaurant_email: 'contact@tablepilot.com',
    };
    
    console.log('📧 Sending confirmation email with params:', templateParams);
    
    // Send the email using EmailJS
    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      PUBLIC_KEY
    );
    
    console.log('✅ Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('❌ Failed to send confirmation email:', error);
    return false;
  }
};

/**
 * Initialize EmailJS
 */
export const initEmailService = (): void => {
  emailjs.init(PUBLIC_KEY);
  console.log('📧 EmailJS service initialized');
};
