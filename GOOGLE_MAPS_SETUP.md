# Google Maps Integration Setup

This guide will help you set up Google Maps with live directions for Northern Capital Hotel.

## Prerequisites

1. A Google Cloud account
2. A credit card (required for Google Cloud, but you get $200 free credit monthly)

## Setup Steps

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Enter project name: `Northern Capital Hotel`
4. Click **Create**

### 2. Enable Required APIs

You need to enable these APIs:
- **Maps JavaScript API** (for displaying maps)
- **Directions API** (for calculating routes)
- **Geolocation API** (optional, for better location accuracy)

**Steps:**
1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Maps JavaScript API" and click **Enable**
3. Search for "Directions API" and click **Enable**
4. Search for "Geolocation API" and click **Enable** (optional)

### 3. Create API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy the generated API key
4. Click **Edit API key** to configure restrictions

### 4. Restrict Your API Key (Important for Security)

**Application Restrictions:**
1. Select **HTTP referrers (web sites)**
2. Add your website URLs:
   - Development: `http://localhost:3000/*`
   - Production: `https://yourdomain.com/*`

**API Restrictions:**
1. Select **Restrict key**
2. Check these APIs:
   - Maps JavaScript API
   - Directions API
   - Geolocation API (if enabled)

3. Click **Save**

### 5. Configure Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder with your actual API key:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 6. Restart Your Development Server

After updating `.env.local`, restart your Next.js server:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

## Features

### Live Directions
- Click "Get Directions from My Location" button
- Browser will request location permission
- Map will show route from your location to the hotel
- Displays distance and estimated travel time

### Interactive Map
- Zoom in/out with mouse wheel or controls
- Pan by clicking and dragging
- Switch between map types (Map, Satellite, Terrain)
- Street View available
- Full-screen mode

### Custom Markers
- 🔵 Blue marker: Northern Capital Hotel
- 🔵 Blue dot: Your current location
- Route displayed in brand color (#01a4ff)

## Hotel Location

The map is centered on:
- **Latitude:** 9.6412
- **Longitude:** -0.8270
- **Location:** Savelugu, Northern Region, Ghana

**Note:** Update these coordinates in `components/GoogleMapWithDirections.tsx` if needed:

```typescript
const hotelLocation = {
  lat: 9.6412, // Your actual latitude
  lng: -0.8270  // Your actual longitude
};
```

## Getting Exact Coordinates

To get the exact coordinates of your hotel:

1. Go to [Google Maps](https://www.google.com/maps)
2. Search for your hotel address
3. Right-click on the location marker
4. Click on the coordinates (they will be copied)
5. Update the `hotelLocation` in the code

## Cost Considerations

### Free Tier
Google Maps provides:
- **$200 free credit per month**
- Maps JavaScript API: 28,000 loads free per month
- Directions API: 40,000 requests free per month

### Typical Usage
For a hotel website with moderate traffic:
- ~1,000 map loads per month
- ~500 direction requests per month
- **Total cost: $0** (well within free tier)

### Cost Monitoring
1. Go to **Billing** in Google Cloud Console
2. Set up budget alerts
3. Monitor API usage in **APIs & Services** → **Dashboard**

## Troubleshooting

### Map not loading
- Check if API key is correct in `.env.local`
- Verify APIs are enabled in Google Cloud Console
- Check browser console for errors
- Ensure dev server was restarted after adding API key

### "This page can't load Google Maps correctly"
- API key restrictions might be too strict
- Check HTTP referrer restrictions
- Verify API restrictions include required APIs

### Directions not working
- Ensure Directions API is enabled
- Check if user granted location permission
- Verify coordinates are valid

### Location permission denied
- User must manually enable location in browser settings
- Provide alternative: manual address input (future feature)

## Browser Compatibility

The Google Maps integration works on:
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Security Best Practices

1. ✅ Never commit API keys to version control
2. ✅ Always use environment variables
3. ✅ Restrict API keys by HTTP referrer
4. ✅ Restrict API keys to specific APIs
5. ✅ Monitor usage regularly
6. ✅ Rotate keys if compromised

## Going Live

Before deploying to production:

1. Add production domain to API key restrictions
2. Update `NEXT_PUBLIC_APP_URL` in `.env.local`
3. Test all map features on production
4. Set up billing alerts
5. Monitor API usage

## Support

- Google Maps Documentation: https://developers.google.com/maps/documentation
- Google Cloud Support: https://cloud.google.com/support
- Northern Capital Hotel Support: info@northerncapitalhotel.com

## Additional Features (Future Enhancements)

- 📍 Multiple hotel locations
- 🚗 Different travel modes (walking, transit, biking)
- 📱 Mobile-optimized directions
- 🗺️ Nearby attractions and landmarks
- 🏨 Street View of hotel entrance
- 📊 Traffic information
- 🕐 Real-time ETA updates
