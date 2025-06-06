
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, isSameDay } from 'date-fns';

interface DateSelectorProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onDateSelect }) => {
  const today = new Date();
  const maxDate = addDays(today, 60); // Allow booking up to 60 days in advance

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-gray-600 mb-6">
          Select your preferred dining date
        </p>
      </div>

      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          disabled={(date) => date < today || date > maxDate}
          initialFocus
          className="rounded-md border shadow-sm"
        />
      </div>

      {selectedDate && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
          <p className="text-amber-800 font-medium">
            Selected Date: {format(selectedDate, 'EEEE, MMMM do, yyyy')}
          </p>
        </div>
      )}

      <div className="text-sm text-gray-500 text-center space-y-1">
        <p>• Restaurant hours: 11:00 AM - 10:00 PM daily</p>
        <p>• Last booking available at 7:30 PM</p>
        <p>• Each reservation is for 2.5 hours</p>
      </div>
    </div>
  );
};

export default DateSelector;
