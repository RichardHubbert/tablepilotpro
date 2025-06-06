
import React, { useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { Calendar, Users, Clock, MapPin, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockTables, mockBookings, type Table as TableType, type Booking } from '@/utils/bookingUtils';

const AdminDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Get bookings for selected date
  const dayBookings = mockBookings.filter(booking => 
    isSameDay(booking.bookingDate, selectedDate)
  );

  // Get table status for selected date
  const getTableStatus = (table: TableType) => {
    const tableBookings = dayBookings.filter(booking => booking.tableId === table.id);
    return tableBookings;
  };

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
                    <p className="text-2xl font-bold">{mockTables.length}</p>
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
                    <p className="text-2xl font-bold">{mockTables.length - dayBookings.length}</p>
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
                      {dayBookings.reduce((sum, booking) => sum + booking.partySize, 0)}
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
                {mockTables.map(table => {
                  const bookings = getTableStatus(table);
                  const isBooked = bookings.length > 0;
                  
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
                        {bookings.map(booking => (
                          <div key={booking.id} className="mt-2 p-2 bg-white rounded border">
                            <p className="font-medium text-xs">{booking.customerName}</p>
                            <p className="text-xs text-gray-500">
                              {booking.startTime} - {booking.endTime} ({booking.partySize} guests)
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
                    const table = mockTables.find(t => t.id === booking.tableId);
                    return (
                      <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold">{booking.customerName}</h4>
                            <p className="text-sm text-gray-600">
                              {table?.name} ({table?.capacity} capacity) - {table?.section}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {booking.partySize} {booking.partySize === 1 ? 'guest' : 'guests'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{booking.startTime} - {booking.endTime}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="truncate">{booking.customerEmail}</span>
                          </div>
                          {booking.customerPhone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span>{booking.customerPhone}</span>
                            </div>
                          )}
                        </div>
                        
                        {booking.specialRequests && (
                          <div className="text-sm bg-amber-50 border border-amber-200 rounded p-2">
                            <p className="font-medium text-amber-800">Special Requests:</p>
                            <p className="text-amber-700">{booking.specialRequests}</p>
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
