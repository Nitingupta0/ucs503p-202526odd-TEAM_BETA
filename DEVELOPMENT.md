# Smart Navigator - Development Guide

## 🚀 Quick Start

### Prerequisites Setup
1. **Node.js 18+** - [Download](https://nodejs.org/)
2. **MongoDB** - [Install locally](https://docs.mongodb.com/manual/installation/) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
3. **Google Maps API Key** - [Get API Key](https://developers.google.com/maps/documentation/javascript/get-api-key)

### Initial Setup
```bash
# Clone and setup
git clone <repository>
cd smart-navigator

# Backend setup
cd backend
npm install
cp .env.example .env
# Configure your .env file

# Frontend setup  
cd ../frontend
npm install
cp .env.example .env.local
# Add your Google Maps API key

# Start development
cd ../
npm run dev  # Starts both frontend and backend
```

## 🔧 Development Workflow

### Starting Development Servers
```bash
# Option 1: Both services with one command
npm run dev

# Option 2: Individual services
cd backend && npm run dev    # Backend on :5000
cd frontend && npm run dev   # Frontend on :3000

# Option 3: Docker (includes MongoDB)
docker-compose up -d
```

### Database Operations
```bash
# Seed with sample data
cd backend && npm run seed

# Reset database
cd backend && npm run seed:reset

# Connect to MongoDB CLI
mongosh smart-navigator
```

## 📝 Code Standards

### TypeScript
- Strict mode enabled
- Explicit return types for functions
- Interface definitions for all data structures
- No `any` types (use unknown and type guards)

### React Best Practices
- Functional components with hooks
- Custom hooks for reusable logic
- Proper state management with Zustand
- Error boundaries for error handling

### Styling
- Tailwind CSS utility classes
- Responsive design (mobile-first)
- Consistent spacing and colors
- Accessible design patterns

## 🗂 Project Architecture

### Frontend Structure
```
src/
├── components/          # Reusable UI components
│   ├── MapComponent.tsx
│   ├── SearchFilters.tsx
│   └── index.ts
├── hooks/              # Custom React hooks
│   ├── useGoogleMaps.ts
│   └── useThreeOverlay.ts
├── pages/              # Route components
│   ├── MapPage.tsx
│   ├── LoginPage.tsx
│   └── RegisterPage.tsx
├── services/           # API client services
│   ├── api.ts
│   ├── authService.ts
│   └── locationService.ts
├── stores/             # Zustand state stores
│   ├── authStore.ts
│   └── mapStore.ts
├── types/              # TypeScript definitions
│   └── index.ts
└── utils/              # Helper functions
    └── index.ts
```

### Backend Structure
```
src/
├── controllers/        # Request handlers
├── middleware/         # Auth, validation, errors
├── models/            # MongoDB schemas
├── routes/            # Express routes
└── scripts/           # Database utilities
```

## 🔌 API Integration

### Authentication Flow
```typescript
// Login flow
const { login, isAuthenticated } = useAuthStore();

await login({ email, password });
if (isAuthenticated) {
  // Redirect to dashboard
}
```

### Data Fetching
```typescript
// Location service usage
import { LocationService } from '../services/locationService';

const locations = await LocationService.getLocations({
  q: 'library',
  type: 'building',
  limit: 10
});
```

### State Management
```typescript
// Map store usage
const { 
  selectedLocation, 
  setSelectedLocation,
  applyCameraPreset 
} = useMapStore();

// Update map state
setSelectedLocation(location);
applyCameraPreset('library');
```

## 🗺 Google Maps Integration

### Setup Requirements
1. **API Key Configuration**
   ```env
   VITE_GOOGLE_MAPS_API_KEY=your_api_key
   VITE_GOOGLE_MAPS_MAP_ID=your_map_id
   ```

2. **Enabled APIs**
   - Maps JavaScript API
   - Places API (optional)
   - Geocoding API (optional)

### Custom Map Implementation
```typescript
// Using the custom map hook
const { map, isLoaded, addMarker } = useGoogleMaps(containerRef);

// Add markers
useEffect(() => {
  if (isLoaded) {
    locations.forEach(location => {
      addMarker(
        location.coordinates,
        location.name,
        createInfoWindow(location)
      );
    });
  }
}, [isLoaded, locations]);
```

### 3D Overlay System
```typescript
// 3D overlay integration
const { isActive, setModelUrl } = useThreeOverlay(map);

// Load custom 3D model
setModelUrl('/models/campus-building.glb');
```

## 🎨 UI Components

### MapComponent
- Google Maps integration
- Marker management
- Info windows
- Camera presets
- 3D overlay support

### SearchFilters
- Real-time search
- Category filtering
- Accessibility filters
- Results summary

### Authentication Forms
- Form validation
- Error handling
- Loading states
- Redirect logic

## 🔒 Security Implementation

### Authentication
```typescript
// JWT with HTTP-only cookies
// Automatic token refresh
// Role-based access control

const { user, isAuthenticated } = useAuthStore();
if (user?.role === 'admin') {
  // Admin features
}
```

### API Security
- Rate limiting on sensitive endpoints
- Input validation with express-validator
- CSRF protection
- Helmet security headers
- MongoDB injection prevention

## 🧪 Testing Strategy

### Frontend Testing
```bash
# Unit tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Build verification
npm run build
```

### Backend Testing
```bash
# API tests
cd backend && npm test

# Database tests
npm run test:db

# Integration tests
npm run test:integration
```

## 📱 Responsive Design

### Breakpoints
- **sm**: 640px (mobile)
- **md**: 768px (tablet)
- **lg**: 1024px (desktop)
- **xl**: 1280px (large desktop)

### Mobile Considerations
- Touch-friendly map controls
- Swipe gestures for filters
- Collapsible sidebar
- Optimized marker density

## 🚀 Performance Optimization

### Frontend
- Code splitting with React.lazy
- Image optimization
- Bundle analysis
- Map marker clustering
- Debounced search

### Backend
- Database indexing
- Query optimization
- Response caching
- Rate limiting
- Connection pooling

## 🔄 State Management

### Zustand Stores

#### Auth Store
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

#### Map Store
```typescript
interface MapState {
  selectedLocation: Location | null;
  searchQuery: string;
  activeFilters: FilterState;
  cameraPresets: CameraPreset[];
  showLayer3D: boolean;
}
```

## 🐛 Debugging

### Common Issues

#### Maps Not Loading
```bash
# Check API key
console.log(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

# Verify enabled APIs in Google Cloud Console
# Check browser network tab for API calls
```

#### Authentication Issues
```bash
# Check cookie settings
# Verify JWT secret matches
# Check CORS configuration
```

#### Database Connection
```bash
# Verify MongoDB is running
mongosh

# Check connection string
echo $MONGODB_URI
```

## 📦 Deployment

### Environment Variables

#### Production Backend
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/prod
JWT_SECRET=super-secure-production-secret
CORS_ORIGIN=https://your-domain.com
```

#### Production Frontend
```env
VITE_GOOGLE_MAPS_API_KEY=production_api_key
VITE_API_BASE_URL=https://api.your-domain.com/api
```

### Build Process
```bash
# Frontend build
cd frontend && npm run build

# Backend preparation
cd backend && npm run build  # If using TypeScript compilation

# Docker deployment
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Troubleshooting

### Development Issues

#### Port Conflicts
```bash
# Check what's running on ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :5000

# Kill processes if needed
pkill -f "node.*3000"
```

#### Cache Issues
```bash
# Clear npm cache
npm cache clean --force

# Clear browser cache
# Hard refresh (Ctrl+Shift+R)

# Reset node_modules
rm -rf node_modules package-lock.json
npm install
```

#### TypeScript Errors
```bash
# Check types
npm run type-check

# Generate types
npm run generate-types  # If applicable

# Restart TypeScript service in VS Code
# Ctrl+Shift+P -> "TypeScript: Restart TS Server"
```

## 📚 Additional Resources

### Documentation
- [React Documentation](https://react.dev/)
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [Three.js Documentation](https://threejs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)

### Tools
- [VS Code Extensions](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next)
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/)
- [MongoDB Compass](https://www.mongodb.com/products/compass)

---

Happy coding! 🎉
