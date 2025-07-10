import { supabase } from '@/integrations/supabase/client';

export interface CustomerDataForCRM {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  specialRequests?: string;
  restaurantId: string;
  restaurantName?: string;
  bookingDate: string;
  startTime: string;
  partySize: number;
  bookingId: string;
}

export interface CRMResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string;
  crm_response?: any;
}

/**
 * Send customer booking data to CRM via Supabase function
 */
export const sendCustomerToCRM = async (customerData: CustomerDataForCRM): Promise<CRMResponse> => {
  try {
    console.log('📧 Sending customer data to CRM:', customerData);

    const { data, error } = await supabase.functions.invoke('send-customer-to-crm', {
      body: customerData
    });

    if (error) {
      console.error('❌ Supabase function error:', error);
      return {
        success: false,
        error: 'Failed to send data to CRM',
        details: error.message
      };
    }

    console.log('✅ CRM function response:', data);
    return {
      success: true,
      message: 'Customer data sent to CRM successfully',
      crm_response: data
    };

  } catch (error) {
    console.error('💥 Error calling CRM function:', error);
    return {
      success: false,
      error: 'Failed to send data to CRM',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}; 