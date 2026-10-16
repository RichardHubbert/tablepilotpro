import React from 'react';
import { Button } from '@/components/ui/button';
import AdminDashboard from '@/components/AdminDashboard';

const Admin = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b shadow-sm py-3 px-4 md:px-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/'}
          >
            Back to Home
          </Button>
        </div>
      </header>
      
      <div className="pt-4">
        <AdminDashboard />
      </div>
    </div>
  );
};

export default Admin;
