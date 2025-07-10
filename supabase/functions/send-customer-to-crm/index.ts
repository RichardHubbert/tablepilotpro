// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

interface CustomerData {
  customerName: string
  customerEmail: string
  customerPhone?: string
  specialRequests?: string
  restaurantId: string
  restaurantName?: string
  bookingDate: string
  startTime: string
  partySize: number
  bookingId: string
}

serve(async (req) => {
  console.log('🚀 Function started, method:', req.method)
  
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  // Add a schema check endpoint
  const url = new URL(req.url)
  if (url.pathname.includes('/schema')) {
    const CRM_API_KEY = Deno.env.get('CRM_API_KEY')
    const CRM_ENDPOINT = Deno.env.get('CRM_ENDPOINT_URL') || 'https://nnxdtpnrwgcknhpyhowr.supabase.co/rest/v1/customers'
    
    try {
      // Try to get the table schema by making a request with specific headers
      const response = await fetch(CRM_ENDPOINT, {
        method: 'GET',
        headers: {
          'apikey': CRM_API_KEY || '',
          'Authorization': `Bearer ${CRM_API_KEY || ''}`,
          'Accept': 'application/json',
          'Range': '0-0'
        }
      })
      
      const responseText = await response.text()
      
      return new Response(
        JSON.stringify({
          schema_check: {
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
            response: responseText,
            endpoint: CRM_ENDPOINT
          }
        }),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    } catch (error) {
      return new Response(
        JSON.stringify({
          schema_check: {
            error: error.message,
            endpoint: CRM_ENDPOINT
          }
        }),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }
  }

  // Add a test endpoint for debugging
  if (url.pathname.includes('/test')) {
    const CRM_API_KEY = Deno.env.get('CRM_API_KEY')
    const CRM_ENDPOINT = Deno.env.get('CRM_ENDPOINT_URL') || 'https://nnxdtpnrwgcknhpyhowr.supabase.co/rest/v1/customers'
    
    // Test the connection and get table info
    try {
      const response = await fetch(CRM_ENDPOINT, {
        method: 'GET',
        headers: {
          'apikey': CRM_API_KEY || '',
          'Authorization': `Bearer ${CRM_API_KEY || ''}`,
          'Range': '0-0' // Just get one row to see the structure
        }
      })
      
      const tableInfo = await response.text()
      
      return new Response(
        JSON.stringify({
          env_check: {
            crm_api_key_present: !!CRM_API_KEY,
            crm_endpoint: CRM_ENDPOINT,
            crm_api_key_length: CRM_API_KEY ? CRM_API_KEY.length : 0
          },
          table_response: tableInfo,
          test_connection: 'Use POST to test actual connection'
        }),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    } catch (error) {
      return new Response(
        JSON.stringify({
          env_check: {
            crm_api_key_present: !!CRM_API_KEY,
            crm_endpoint: CRM_ENDPOINT,
            crm_api_key_length: CRM_API_KEY ? CRM_API_KEY.length : 0
          },
          error: error.message,
          test_connection: 'Use POST to test actual connection'
        }),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }
  }

  try {
    console.log('📝 Parsing request body...')
    
    // Parse the request body
    let customerData: CustomerData
    try {
      customerData = await req.json()
      console.log('✅ Request body parsed successfully:', customerData)
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError)
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Validate required fields
    if (!customerData.customerName || !customerData.customerEmail || !customerData.restaurantId) {
      console.error('❌ Missing required fields:', { 
        hasName: !!customerData.customerName, 
        hasEmail: !!customerData.customerEmail, 
        hasRestaurantId: !!customerData.restaurantId 
      })
      return new Response(
        JSON.stringify({ error: 'Missing required fields: customerName, customerEmail, restaurantId' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Get your CRM endpoint URL from environment variables
    const CRM_ENDPOINT = Deno.env.get('CRM_ENDPOINT_URL') || 'https://nnxdtpnrwgcknhpyhowr.supabase.co/rest/v1/customers'
    const CRM_API_KEY = Deno.env.get('CRM_API_KEY')

    console.log('🔍 CRM endpoint:', CRM_ENDPOINT)
    console.log('🔑 CRM API key present:', !!CRM_API_KEY)

    if (!CRM_API_KEY) {
      console.error('❌ CRM_API_KEY environment variable not set')
      return new Response(
        JSON.stringify({ error: 'CRM API key not configured' }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Prepare data for CRM Supabase database - only send columns that exist
    const crmPayload = {
      name: customerData.customerName,
      booking_date: customerData.startTime + ':00', // as time (e.g., '19:00:00')
      booking_time: customerData.startTime, // as text (e.g., '19:00')
      party_size: customerData.partySize,
      special_requests: customerData.specialRequests,
      source: 'tablepilotpro_booking',
      booking_id: customerData.bookingId,
      restaurant_id: customerData.restaurantId,
      restaurant_name: customerData.restaurantName
    }

    console.log('🚀 Sending to CRM payload:', JSON.stringify(crmPayload, null, 2))
    console.log('🔗 CRM endpoint:', CRM_ENDPOINT)
    console.log('🔑 API key length:', CRM_API_KEY ? CRM_API_KEY.length : 0)

    // Send data to CRM
    const crmResponse = await fetch(CRM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': CRM_API_KEY,
        'Authorization': `Bearer ${CRM_API_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(crmPayload)
    })

    console.log('📡 CRM response status:', crmResponse.status)
    console.log('📡 CRM response headers:', Object.fromEntries(crmResponse.headers.entries()))

    if (!crmResponse.ok) {
      const errorText = await crmResponse.text()
      console.error('❌ CRM request failed:', crmResponse.status, errorText)
      return new Response(
        JSON.stringify({ 
          error: 'CRM request failed', 
          status: crmResponse.status,
          details: errorText,
          endpoint: CRM_ENDPOINT,
          payload: crmPayload
        }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }
      )
    }

    // Try to get the response body even if it's minimal
    let responseBody = ''
    try {
      responseBody = await crmResponse.text()
      console.log('📡 CRM response body:', responseBody)
    } catch (e) {
      console.log('📡 CRM response body: (could not read)')
    }

    console.log('✅ CRM request successful')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Customer data sent to CRM successfully',
        crm_status: crmResponse.status,
        crm_response: responseBody,
        sent_data: crmPayload
      }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )

  } catch (error) {
    console.error('💥 Error in send-customer-to-crm function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send customer data to CRM',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-customer-to-crm' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
