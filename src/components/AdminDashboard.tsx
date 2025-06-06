
import React, { useState, useEffect } from 'react';
import { format, isSameDay } from 'date-fns';
import { Calendar, Users, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { fetchTables, fetchAllBookings, getNextReservationForTable, type Table as TableType, type Booking } from '@/services/supabaseBookingService';

const AdminDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tables, setTables] = useState<TableType[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('Loading admin dashboard data...');
        const [tablesData, bookingsData] = await Promise.all([
          fetchTables(),
          fetchAllBookings()
        ]);
        console.log('Tables loaded:', tablesData);
        console.log('Bookings loaded:', bookingsData);
        setTables(tablesData);
        setAllBookings(bookingsData);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get bookings for selected date
  const dayBookings = allBookings.filter(booking => 
    isSameDay(new Date(booking.booking_date), selectedDate)
  );

  // Get table status for selected date
  const getTableStatus = (table: TableType) => {
    const tableBookings = dayBookings.filter(booking => booking.table_id === table.id);
    return tableBookings;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                <input
                  type="date"
                  value={format(selectedDate, 'yyyy-MM-dd')}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  className="border rounded px-3 py-2"
                />
              </div>
              <Badge variant="outline">
                {format(selectedDate, 'EEEE, MMMM do, yyyy')}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Tables</p>
                    <p className="text-2xl font-bold">{tables.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Booked Tables</p>
                    <p className="text-2xl font-bold">{dayBookings.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-600">Available Tables</p>
                    <p className="text-2xl font-bold">{tables.length - dayBookings.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Guests</p>
                    <p className="text-2xl font-bold">
                      {dayBookings.reduce((sum, booking) => sum + booking.party_size, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tables Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Table Status Overview</CardTitle>
              <CardDescription>Current status of all tables for {format(selectedDate, 'MMM do, yyyy')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tables.map(table => {
                  const bookings = getTableStatus(table);
                  const isBooked = bookings.length > 0;
                  const nextReservation = getNextReservationForTable(table.id, allBookings);
                  
                  return (
                    <div
                      key={table.id}
                      className={`p-4 rounded-lg border-2 ${
                        isBooked 
                          ? 'border-red-200 bg-red-50' 
                          : 'border-green-200 bg-green-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">{table.name}</h3>
                        <Badge variant={isBooked ? 'destructive' : 'default'}>
                          {isBooked ? 'Booked' : 'Available'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>Capacity: {table.capacity}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>Section: {table.section}</span>
                        </div>
                        
                        {/* Next Reservation Info */}
                        {nextReservation && (
                          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                            <p className="font-medium text-xs text-blue-800">Next Reservation:</p>
                            <p className="text-xs text-blue-700">
                              {format(new Date(nextReservation.booking_date), 'MMM dd')} at {nextReservation.start_time}
                            </p>
                            <p className="text-xs text-blue-600">{nextReservation.customer_name}</p>
                          </div>
                        )}
                        
                        {bookings.map(booking => (
                          <div key={booking.id} className="mt-2 p-2 bg-white rounded border">
                            <p className="font-medium text-xs">{booking.customer_name}</p>
                            <p className="text-xs text-gray-500">
                              {booking.start_time} - {booking.end_time} ({booking.party_size} guests)
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Bookings List */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Bookings</CardTitle>
              <CardDescription>Detailed view of all bookings for {format(selectedDate, 'MMM do, yyyy')}</CardDescription>
            </CardHeader>
            <CardContent>
              {dayBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No bookings for this date</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {dayBookings.map(booking => {
                    const table = tables.find(t => t.id === booking.table_id);
                    return (
                      <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{booking.customer_name}</h4>
                            <p className="text-sm text-gray-600">
                              {table?.name} ({table?.capacity} capacity) - {table?.section}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {booking.party_size} {booking.party_size === 1 ? 'guest' : 'guests'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{booking.start_time} - {booking.end_time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="truncate">{booking.customer_email}</span>
                          </div>
                          {booking.customer_phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{booking.customer_phone}</span>
                            </div>
                          )}
                        </div>
                        
                        {booking.special_requests && (
                          <div className="text-sm bg-amber-50 border border-amber-200 rounded p-2">
                            <p className="font-medium text-amber-800">Special Requests:</p>
                            <p className="text-amber-700">{booking.special_requests}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
