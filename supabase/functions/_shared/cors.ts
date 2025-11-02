export const getCorsHeaders = (_requestOrigin: string | null = null) => ({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
});

// Legacy export for backward compatibility
export const corsHeaders = getCorsHeaders();
