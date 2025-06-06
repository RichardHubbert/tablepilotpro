import { format, addMinutes, isAfter, isBefore, isSameDay } from 'date-fns';

// Mock data for tables
export interface Table {
  id: number;
  name: string;
  capacity: number;
  section: string;
}

// Mock data for bookings
export interface Booking {
  id: number;
  tableId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  partySize: number;
  status: 'confirmed' | 'cancelled' | 'completed';
  specialRequests?: string;
}

// Updated mock tables data - 10 tables total: 4 for 2 people, 4 for 4 people, 2 for 6 people
const mockTables: Table[] = [
  // 4 tables for 2 people
  { id: 1, name: 'Table 1', capacity: 2, section: 'Window' },
  { id: 2, name: 'Table 2', capacity: 2, section: 'Window' },
  { id: 3, name: 'Table 3', capacity: 2, section: 'Center' },
  { id: 4, name: 'Table 4', capacity: 2, section: 'Center' },
  // 4 tables for 4 people
  { id: 5, name: 'Table 5', capacity: 4, section: 'Center' },
  { id: 6, name: 'Table 6', capacity: 4, section: 'Center' },
  { id: 7, name: 'Table 7', capacity: 4, section: 'Patio' },
  { id: 8, name: 'Table 8', capacity: 4, section: 'Patio' },
  // 2 tables for 6 people
  { id: 9, name: 'Table 9', capacity: 6, section: 'Patio' },
  { id: 10, name: 'Table 10', capacity: 6, section: 'Patio' },
];

// Mock bookings data (some existing bookings for demo)
const mockBookings: Booking[] = [
  {
    id: 1,
    tableId: 1,
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
    bookingDate: new Date(),
    startTime: '18:00',
    endTime: '20:30',
    partySize: 2,
    status: 'confirmed'
  },
  {
    id: 2,
    tableId: 3,
    customerName: 'Jane Smith',
    customerEmail: 'jane@example.com',
    bookingDate: new Date(),
    startTime: '19:00',
    endTime: '21:30',
    partySize: 4,
    status: 'confirmed'
  }
];

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
    if (booking.status !== 'confirmed') return false;
    
    // Convert times to minutes for easier comparison
    const parseTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const newStart = parseTime(startTime);
    const newEnd = parseTime(endTime);
    const existingStart = parseTime(booking.startTime);
    const existingEnd = parseTime(booking.endTime);
    
    // Check for overlap
    return (newStart < existingEnd && newEnd > existingStart);
  });
};

// Get available time slots for a specific date and party size
export const getAvailableTimeSlots = async (
  date: Date,
  partySize: number
): Promise<{time: string, available: boolean, tableSize?: number}[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const timeSlots = generateTimeSlots();
  const suitableTables = mockTables.filter(table => table.capacity >= partySize);
  
  // Get bookings for the selected date
  const dateBookings = mockBookings.filter(booking => 
    isSameDay(booking.bookingDate, date)
  );
  
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
      const tableBookings = dateBookings.filter(booking => booking.tableId === table.id);
      
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
export const getOptimalTable = (partySize: number): Table | null => {
  const suitableTables = mockTables.filter(table => table.capacity >= partySize);
  
  if (suitableTables.length === 0) return null;
  
  // Sort by capacity to prefer smaller tables that still fit the party
  suitableTables.sort((a, b) => a.capacity - b.capacity);
  
  return suitableTables[0];
};

// Create a new booking (mock function)
export const createBooking = async (bookingData: {
  date: Date;
  startTime: string;
  partySize: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  specialRequests?: string;
}): Promise<Booking> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const optimalTable = getOptimalTable(bookingData.partySize);
  
  if (!optimalTable) {
    throw new Error('No suitable table available');
  }
  
  // Calculate end time
  const [hours, minutes] = bookingData.startTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0, 0);
  const endDate = addMinutes(startDate, 150);
  const endTime = format(endDate, 'HH:mm');
  
  const newBooking: Booking = {
    id: Date.now(), // Mock ID
    tableId: optimalTable.id,
    customerName: bookingData.customerName,
    customerEmail: bookingData.customerEmail,
    customerPhone: bookingData.customerPhone,
    bookingDate: bookingData.date,
    startTime: bookingData.startTime,
    endTime: endTime,
    partySize: bookingData.partySize,
    status: 'confirmed',
    specialRequests: bookingData.specialRequests
  };
  
  // Add to mock bookings (in real app, this would be saved to database)
  mockBookings.push(newBooking);
  
  return newBooking;
};
