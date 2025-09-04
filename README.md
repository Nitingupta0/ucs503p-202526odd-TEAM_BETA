<<<<<<< HEAD
# Smart Navigator - Thapar Institute Campus Navigation App

A modern campus navigation and event finder web application for Thapar Institute, Patiala, Punjab. Built with Google Maps integration and future 3D GLB overlay capabilities.

## Features

- 🗺️ Interactive campus map with Google Maps
- 📍 Location search and navigation
- 📅 Campus events discovery
- 🎯 Personalized event recommendations
- 👥 User authentication and profiles
- 🔐 Admin dashboard for content management
- 🌐 3D overlay ready architecture
- 📱 Responsive design

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Google Maps JavaScript API
- Zustand for state management

### Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT authentication with HTTP-only cookies
- Role-based access control

### DevOps
- Docker & Docker Compose
- ESLint + Prettier
- Husky for git hooks

## Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Google Maps API Key
- Google Maps Map ID (for vector maps)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smart-navigator
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your actual values
```

4. Create frontend environment file:
```bash
cp frontend/.env.example frontend/.env.local
# Edit with your Google Maps API key and Map ID
```

5. Create backend environment file:
```bash
cp backend/.env.example backend/.env
# Edit with your database and JWT settings
```

### Development

#### Using Docker Compose (Recommended)
```bash
docker-compose up
```

#### Manual Setup
1. Start MongoDB:
```bash
# If using local MongoDB
mongod
```

2. Start backend:
```bash
cd backend
npm run dev
```

3. Start frontend:
```bash
cd frontend
npm run dev
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Google Maps Setup

1. **Get API Key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Maps JavaScript API
   - Create credentials (API Key)
   - Restrict the key to your domain

2. **Create Map ID:**
   - Go to [Google Maps Platform](https://console.cloud.google.com/google/maps-apis/client-libraries)
   - Create a new Map ID
   - Set map type to "Vector"
   - Customize styling if desired

3. **Update Environment:**
   ```bash
   # In frontend/.env.local
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key
   VITE_MAP_ID=your_actual_map_id
   ```

## Project Structure

```
smart-navigator/
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # State management
│   │   └── types/         # TypeScript types
├── backend/               # Express + MongoDB backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Mongoose models
│   │   ├── middleware/    # Custom middleware
│   │   ├── routes/        # API routes
│   │   └── utils/         # Utility functions
├── scripts/               # Database seeding & utilities
└── docker-compose.yml     # Development environment
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Locations
- `GET /api/locations` - Get all locations (with filters)
- `GET /api/locations/:id` - Get specific location
- `POST /api/locations` - Create location (admin)
- `PUT /api/locations/:id` - Update location (admin)
- `DELETE /api/locations/:id` - Delete location (admin)

### Events
- `GET /api/events` - Get all events (with filters)
- `GET /api/events/:id` - Get specific event
- `GET /api/events/recommended` - Get recommended events
- `POST /api/events` - Create event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Default Campus Coordinates

- **Center:** 30.3564°N, 76.3625°E
- **Zoom:** 17-18
- **Tilt:** 60-67°
- **Bearing:** 20-30°

### Camera Presets
- **Main Gate:** 30.3568°N, 76.3619°E
- **Library:** 30.3573°N, 76.3631°E
- **Sports Complex:** 30.3549°N, 76.3615°E

## Future 3D Integration

The application is architected to support 3D GLB overlays using Three.js and Google Maps WebGLOverlayView. To enable 3D features:

1. Set `modelUrl` in `frontend/src/components/Map/overlayConfig.ts`
2. The 3D toggle will automatically become available
3. No refactoring required - the overlay system is already integrated

## Security Features

- JWT tokens in HTTP-only cookies
- CSRF protection
- Rate limiting on authentication routes
- Input validation and sanitization
- Security headers (Helmet.js)
- Role-based access control

## License

MIT License - see LICENSE file for details

## Support

For support or questions, please open an issue in the repository.


