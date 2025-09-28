# Mapbox Integration Setup Guide

## Overview
The emergency dispatch dashboard now uses Mapbox GL JS for real-world mapping capabilities, replacing the previous SVG-based visualization with an interactive street map.

## Required Setup Steps

### 1. Get a Mapbox Access Token
1. Go to [Mapbox.com](https://www.mapbox.com/) and create a free account
2. Navigate to your Account Dashboard
3. Go to "Access tokens" section
4. Create a new token or use the default public token
5. Copy your access token

### 2. Configure the Access Token
Open `/components/MapboxEmergencyMap.tsx` and find this line:
```javascript
mapboxgl.accessToken = 'pk.eyJ1IjoiZGVtby1hY2NvdW50IiwiYSI6ImNtNTZwYXo0NjBrZWgya3EwdDhqMW13b2QifQ.mock-token-replace-with-real' || 'YOUR_MAPBOX_ACCESS_TOKEN_HERE';
```

Replace it with your actual token:
```javascript
mapboxgl.accessToken = 'pk.eyJ1IjoieW91cm5hbWUiLCJhIjoiY2xrd...'; // Your actual token from Mapbox
```

**Note:** The system will automatically fall back to a demo mode if no valid token is provided.

### 3. Install Required Dependencies
The following packages are automatically imported:
- `mapbox-gl` - Core Mapbox GL JS library
- `mapbox-gl/dist/mapbox-gl.css` - Required CSS styles

## Features Included

### ✅ Real Street Maps
- Dark theme optimized for emergency services
- San Francisco area coordinates (easily changeable)
- Interactive zoom, pan, and navigation controls

### ✅ Emergency Units Tracking
- Real-time unit positions with live updates
- Color-coded status indicators (Available, En Route, On Scene, Returning)
- Interactive unit selection with detailed info panels

### ✅ Incident Management
- Priority-based incident markers (Critical, High, Medium, Low)
- Click-to-select incident details
- Visual incident status representation

### ✅ Live Routing
- Toggle routes on/off
- Multiple routing modes (Optimal, Fastest, Alternative)
- Real-time route calculation using Mapbox Directions API
- Animated unit movement along calculated routes

### ✅ Enhanced Controls
- Zoom in/out controls
- Geolocation button for finding current position
- Route mode selector
- Map refresh functionality

## Customization Options

### Change Map Style
In `MapboxEmergencyMap.tsx`, modify the `style` property:
```javascript
style: 'mapbox://styles/mapbox/dark-v11', // Current dark theme
// Options: 'streets-v11', 'light-v10', 'satellite-v9'
```

### Change Default Location
Modify the `center` coordinates:
```javascript
center: [-122.4194, 37.7749], // San Francisco
// Use [longitude, latitude] format
```

### Update Unit/Incident Coordinates
The sample data uses real San Francisco coordinates. Update the `units` and `incidents` arrays with your actual location data.

## API Features

### Mapbox Directions API
The routing system integrates with Mapbox's Directions API for:
- Real-time route calculation
- Traffic-aware routing
- Multiple route alternatives
- Step-by-step navigation instructions

### Advanced Routing Options
The system supports different routing profiles:
- `driving` - Standard vehicle routing
- `driving-traffic` - Traffic-aware routing (requires premium account)
- `walking` - Pedestrian routing
- `cycling` - Bicycle routing

## Performance Considerations

- Map tiles are cached automatically by Mapbox
- Unit positions update every 2 seconds for smooth animation
- Route calculations are performed on-demand
- GeoJSON data is optimized for real-time updates

## Security Notes

- Keep your Mapbox access token secure
- Use URL restrictions on your token for production deployments
- Monitor your API usage in the Mapbox dashboard
- Consider using environment variables for token storage

## Troubleshooting

### Map Not Loading
- Verify your access token is correct
- Check browser console for errors
- Ensure internet connectivity for tile loading

### Performance Issues
- Reduce update frequency if needed
- Limit the number of units/incidents displayed
- Use data clustering for large datasets

### Styling Issues
- Ensure `mapbox-gl.css` is properly imported
- Check for CSS conflicts with existing styles
- Verify map container has defined dimensions

## Cost Considerations

Mapbox has a generous free tier that includes:
- 50,000 map loads per month
- 100,000 geocoding requests per month
- 25,000 directions requests per month

Perfect for development and small-scale deployments!