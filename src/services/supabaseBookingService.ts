
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
  console.log('Fetching tables from Supabase...');
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .order('name');
  
  if (error) {
    console.error('Error fetching tables:', error);
    throw error;
  }
  
  console.log('Tables fetched successfully:', data);
  return data || [];
};

// Fetch bookings for a specific date
export const fetchBookingsForDate = async (date: Date): Promise<Booking[]> => {
  const dateString = format(date, 'yyyy-MM-dd');
  console.log('Fetching bookings for date:', dateString);
  
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('booking_date', dateString)
    .eq('status', 'confirmed');
  
  if (error) {
    console.error('Error fetching bookings:', error);
    throw error;
  }
  
  console.log('Bookings fetched for date:', dateString, data);
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
  console.log('🚀 Starting booking creation process...');
  console.log('📊 Booking data received:', {
    ...bookingData,
    date: bookingData.date.toISOString()
  });
  
  try {
    // Test Supabase connection first
    console.log('🔌 Testing Supabase connection...');
    const connectionTest = await supabase.from('tables').select('count', { count: 'exact', head: true });
    console.log('✅ Supabase connection test result:', connectionTest);
    
    if (connectionTest.error) {
      console.error('❌ Supabase connection failed:', connectionTest.error);
      throw new Error(`Database connection failed: ${connectionTest.error.message}`);
    }
    
    console.log('🔍 Finding optimal table...');
    const optimalTable = await getOptimalTable(bookingData.partySize);
    
    if (!optimalTable) {
      console.error('❌ No suitable table found for party size:', bookingData.partySize);
      throw new Error('No suitable table available');
    }
    
    console.log('✅ Optimal table found:', optimalTable);
    
    // Calculate end time
    console.log('⏰ Calculating booking times...');
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
    
    console.log('📝 Prepared booking data for insertion:', newBookingData);
    console.log('🌐 Attempting to connect to Supabase database...');
    
    // Attempt to insert the booking with detailed logging
    console.log('💾 Attempting to insert booking into Supabase...');
    const insertStartTime = Date.now();
    
    const { data, error } = await supabase
      .from('bookings')
      .insert(newBookingData)
      .select()
      .single();
    
    const insertEndTime = Date.now();
    console.log(`⏱️ Insert operation took ${insertEndTime - insertStartTime}ms`);
    
    if (error) {
      console.error('❌ Supabase insert error:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      console.error('📊 Error context:', {
        table: 'bookings',
        operation: 'insert',
        data: newBookingData
      });
      throw new Error(`Failed to create booking: ${error.message}`);
    }
    
    if (!data) {
      console.error('❌ No data returned from insert operation');
      throw new Error('Booking was not created - no data returned');
    }
    
    console.log('🎉 Booking created successfully!');
    console.log('📋 Created booking data:', data);
    
    // Verify the booking was actually created by fetching it back
    console.log('🔄 Verifying booking creation...');
    const verification = await supabase
      .from('bookings')
      .select('*')
      .eq('id', data.id)
      .single();
    
    if (verification.error) {
      console.warn('⚠️ Could not verify booking creation:', verification.error);
    } else {
      console.log('✅ Booking verification successful:', verification.data);
    }
    
    // Cast the returned data to ensure proper typing
    return {
      ...data,
      status: data.status as 'confirmed' | 'cancelled' | 'completed'
    };
    
  } catch (error) {
    console.error('💥 Critical error in createBooking:', error);
    console.error('🔍 Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    console.error('🌍 Browser info:', {
      userAgent: navigator.userAgent,
      onLine: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

// Fetch all bookings (for admin dashboard)
export const fetchAllBookings = async (): Promise<Booking[]> => {
  console.log('Fetching all bookings from Supabase...');
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('booking_date', { ascending: true })
    .order('start_time', { ascending: true });
  
  if (error) {
    console.error('Error fetching all bookings:', error);
    throw error;
  }
  
  console.log('All bookings fetched:', data);
  // Cast the data to ensure proper typing for status field
  return (data || []).map(booking => ({
    ...booking,
    status: booking.status as 'confirmed' | 'cancelled' | 'completed'
  }));
};

// Get next reservation for a specific table
export const getNextReservationForTable = (tableId: string, allBookings: Booking[]): Booking | null => {
  const now = new Date();
  const currentDate = format(now, 'yyyy-MM-dd');
  const currentTime = format(now, 'HH:mm');
  
  // Filter bookings for this table that are today or in the future
  const futureBookings = allBookings
    .filter(booking => booking.table_id === tableId)
    .filter(booking => {
      const bookingDate = booking.booking_date;
      // Include today's bookings that haven't started yet, or future dates
      return bookingDate > currentDate || 
             (bookingDate === currentDate && booking.start_time > currentTime);
    })
    .sort((a, b) => {
      // Sort by date first, then by time
      if (a.booking_date !== b.booking_date) {
        return a.booking_date.localeCompare(b.booking_date);
      }
      return a.start_time.localeCompare(b.start_time);
    });
  
  return futureBookings.length > 0 ? futureBookings[0] : null;
};
