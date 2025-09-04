# Map Icons

This directory contains SVG icons for map markers. You can replace these with custom icons for better visual representation.

## Required Icons

### Location Types
- `building-pin.svg` - For building locations
- `room-pin.svg` - For room locations  
- `poi-pin.svg` - For points of interest
- `location-pin.svg` - Default location marker

### Events
- `event-pin.svg` - For event markers

### Academic Categories (Optional)
- `academic-pin.svg` - Academic buildings
- `residential-pin.svg` - Hostels and residential areas
- `recreation-pin.svg` - Recreation facilities
- `dining-pin.svg` - Dining halls and cafeterias
- `admin-pin.svg` - Administrative buildings
- `sports-pin.svg` - Sports complexes
- `library-pin.svg` - Libraries
- `medical-pin.svg` - Medical facilities
- `parking-pin.svg` - Parking areas
- `transport-pin.svg` - Transportation hubs

## Icon Specifications

- **Format**: SVG (recommended) or PNG
- **Size**: 32x32 pixels (will be scaled automatically)
- **Anchor Point**: Bottom center (16, 32) for drop pin style
- **Colors**: Use brand colors for consistency
  - Primary: #4a90e2 (blue)
  - Secondary: #50c878 (green)
  - Accent: #ff6b6b (red)

## Using Custom Icons

1. Place your SVG/PNG files in this directory
2. Update the icon paths in `MapComponent.tsx`
3. Ensure proper naming convention matches the location types

## Default Fallback

If specific icons are not found, the application will fall back to `location-pin.svg` or browser default markers.
