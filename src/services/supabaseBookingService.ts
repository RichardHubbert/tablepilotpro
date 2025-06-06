
import { supabase } from '@/integrations/supabase/client';
import { format, addMinutes, isSameDay } from 'date-fns';

export interface Table {
  id: string;
  name: string;
  capacity: number;
  section: string;
}

export interface Booking {
  id: string;
  table_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  party_size: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  special_requests?: string;
  created_at: string;
}

// Fetch all tables from Supabase
export const fetchTables = async (): Promise<Table[]> => {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching tables:', error);
    throw error;
  }
  
  return data || [];
};

// Fetch bookings for a specific date
export const fetchBookingsForDate = async (date: Date): Promise<Booking[]> => {
  const dateString = format(date, 'yyyy-MM-dd');
  
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_date', dateString)
    .eq('status', 'confirmed');
  
  if (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
  
  // Cast the data to ensure proper typing for status field
  return (data || []).map(booking => ({
    ...booking,
    status: booking.status as 'confirmed' | 'cancelled' | 'completed'
  }));
};

// Generate time slots from 11:00 AM to 7:30 PM (every 30 minutes)
export const generateTimeSlots = (): string[] => {
  const slots: string[] = [];
  const startHour = 11; // 11 AM
  const endHour = 19; // 7 PM
  const endMinute = 30; // 7:30 PM

  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === endHour && minute > endMinute) break;
      
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  return slots;
};

// Check if a time slot overlaps with existing bookings
const hasTimeConflict = (
  startTime: string,
  endTime: string,
  existingBookings: Booking[]
): boolean => {
  return existingBookings.some(booking => {
    // Convert times to minutes for easier comparison
    const parseTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const newStart = parseTime(startTime);
    const newEnd = parseTime(endTime);
    const existingStart = parseTime(booking.start_time);
    const existingEnd = parseTime(booking.end_time);
    
    // Check for overlap
    return (newStart < existingEnd && newEnd > existingStart);
  });
};

// Get available time slots for a specific date and party size
export const getAvailableTimeSlots = async (
  date: Date,
  partySize: number
): Promise<{time: string, available: boolean, tableSize?: number}[]> => {
  const timeSlots = generateTimeSlots();
  const tables = await fetchTables();
  const bookings = await fetchBookingsForDate(date);
  
  const suitableTables = tables.filter(table => table.capacity >= partySize);
  
  return timeSlots.map(timeSlot => {
    // Calculate end time (2.5 hours later)
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(hours, minutes, 0, 0);
    const endDate = addMinutes(startDate, 150); // 2.5 hours
    const endTime = format(endDate, 'HH:mm');
    
    // Check if any suitable table is available
    let availableTable = null;
    
    for (const table of suitableTables) {
      const tableBookings = bookings.filter(booking => booking.table_id === table.id);
      
      if (!hasTimeConflict(timeSlot, endTime, tableBookings)) {
        availableTable = table;
        break;
      }
    }
    
    return {
      time: timeSlot,
      available: !!availableTable,
      tableSize: availableTable?.capacity
    };
  });
};

// Get the optimal table for a party size (prefer exact match)
export const getOptimalTable = async (partySize: number): Promise<Table | null> => {
  const tables = await fetchTables();
  const suitableTables = tables.filter(table => table.capacity >= partySize);
  
  if (suitableTables.length === 0) return null;
  
  // Sort by capacity to prefer smaller tables that still fit the party
  suitableTables.sort((a, b) => a.capacity - b.capacity);
  
  return suitableTables[0];
};

// Create a new booking
export const createBooking = async (bookingData: {
  date: Date;
  startTime: string;
  partySize: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  specialRequests?: string;
}): Promise<Booking> => {
  const optimalTable = await getOptimalTable(bookingData.partySize);
  
  if (!optimalTable) {
    throw new Error('No suitable table available');
  }
  
  // Calculate end time
  const [hours, minutes] = bookingData.startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  const endDate = addMinutes(startDate, 150);
  const endTime = format(endDate, 'HH:mm');
  
  const newBookingData = {
    table_id: optimalTable.id,
    customer_name: bookingData.customerName,
    customer_email: bookingData.customerEmail,
    customer_phone: bookingData.customerPhone,
    booking_date: format(bookingData.date, 'yyyy-MM-dd'),
    start_time: bookingData.startTime,
    end_time: endTime,
    party_size: bookingData.partySize,
    status: 'confirmed' as const,
    special_requests: bookingData.specialRequests
  };
  
  const { data, error } = await supabase
    .from('bookings')
    .insert(newBookingData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
  
  // Cast the returned data to ensure proper typing
  return {
    ...data,
    status: data.status as 'confirmed' | 'cancelled' | 'completed'
  };
};

// Fetch all bookings (for admin dashboard)
export const fetchAllBookings = async (): Promise<Booking[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('booking_date', { ascending: true })
    .order('start_time', { ascending: true });
  
  if (error) {
    console.error('Error fetching all bookings:', error);
    throw error;
  }
  
  // Cast the data to ensure proper typing for status field
  return (data || []).map(booking => ({
    ...booking,
    status: booking.status as 'confirmed' | 'cancelled' | 'completed'
  }));
};
