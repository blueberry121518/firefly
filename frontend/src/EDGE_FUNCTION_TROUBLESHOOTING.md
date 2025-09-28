# Edge Function Troubleshooting Guide

## Issue: "Failed to send a request to the Edge Function"

This error indicates that the Supabase Edge Function is not running or accessible. Here are the steps to resolve this:

### 1. Check Edge Function Deployment

The Edge Function needs to be deployed to your Supabase project. The function code is located at:
```
/supabase/functions/server/index.tsx
```

### 2. Verify Function Structure

Make sure the function structure is correct:
```
/supabase/
  └── functions/
      └── server/
          ├── index.tsx  (main function code)
          └── kv_store.tsx  (database utilities)
```

### 3. Deploy the Function

If using Supabase CLI:
```bash
supabase functions deploy server
```

### 4. Check Function Logs

View function logs to see startup errors:
```bash
supabase functions logs server
```

Or check logs in the Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to "Edge Functions"
3. Click on the "server" function
4. Check the logs tab for errors

### 5. Test Function Manually

You can test the function directly:
```bash
curl -X GET https://[your-project-id].supabase.co/functions/v1/server
```

Expected response:
```json
{
  "message": "FireFly Backend Server",
  "status": "online",
  "success": true,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}
```

### 6. Environment Variables

Ensure these environment variables are set in your Supabase project:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 7. Common Issues

**Function won't start:**
- Check for syntax errors in `index.tsx`
- Verify all imports are correct
- Look for runtime errors in function logs

**CORS errors:**
- Function includes comprehensive CORS headers
- Make sure function is accessible via HTTP

**Permission errors:**
- Verify API keys are correct
- Check function permissions in Supabase dashboard

### 8. Fallback Mode

If the Edge Function cannot be deployed, the dashboard will automatically fall back to demo mode with mock data. You can still test the voice agent by calling:

**+1 (669) 205 9496**

### 9. Quick Test Script

You can also test connectivity using this JavaScript snippet in your browser console:

```javascript
// Test basic connectivity
fetch('https://bitcsqyvattyxydlmlkb.supabase.co/functions/v1/server')
  .then(response => response.json())
  .then(data => console.log('✅ Function is working:', data))
  .catch(error => console.error('❌ Function error:', error));
```

### 10. Next Steps

Once the Edge Function is deployed and running:
- The dashboard will automatically detect the connection
- Live incident data will be fetched from your Redis backend
- Real-time updates will be enabled
- The voice agent integration will be fully functional

If you continue to have issues, check the Supabase service status at https://status.supabase.com/