import { create } from 'zustand';
import { Location, Event } from '../types';
import { LocationService } from '../services/locationService';
import { EventService } from '../services/eventService';

interface CameraPreset {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zoom: number;
  heading?: number;
  tilt?: number;
}

interface MapState {
  isMapLoaded: boolean;
  selectedLocation: Location | null;
  searchQuery: string;
  filteredLocations: Location[] | null;
  activeFilters: {
    category: string[];
    accessibility: boolean;
  };
  cameraPresets: CameraPreset[];
  currentPreset: string | null;
  showLayer3D: boolean;
  showLayerSatellite: boolean;
  showLayerTraffic: boolean;
  overlayConfig: {
    glbModelUrl: string | null;
    scale: number;
    rotation: { x: number; y: number; z: number };
    position: { lat: number; lng: number; altitude: number };
  };
  locations: Location[];
  events: Event[];
  isLoading: boolean;
  error: string | null;
}

interface MapActions {
  setMapLoaded: (loaded: boolean) => void;
  setSelectedLocation: (location: Location | null) => void;
  setSearchQuery: (query: string) => void;
  setFilteredLocations: (locations: Location[] | null) => void;
  setActiveFilters: (filters: MapState['activeFilters']) => void;
  setCameraPreset: (presetId: string) => void;
  toggleLayer3D: () => void;
  toggleLayerSatellite: () => void;
  toggleLayerTraffic: () => void;
  setOverlayConfig: (config: Partial<MapState['overlayConfig']>) => void;
  fetchData: () => Promise<void>;
  searchLocations: (query: string) => Promise<void>;
  filterLocationsByCategory: (category: string) => void;
}

export const useMapStore = create<MapState & MapActions>((set, get) => ({
  isMapLoaded: false,
  selectedLocation: null,
  searchQuery: '',
  filteredLocations: null,
  activeFilters: {
    category: [],
    accessibility: false,
  },
  cameraPresets: [
    { id: 'campus-overview', name: 'Campus Overview', lat: 30.3557, lng: 76.3675, zoom: 16, heading: 0, tilt: 0 },
    { id: 'main-gate', name: 'Main Gate', lat: 30.3565, lng: 76.3660, zoom: 18, heading: 90, tilt: 45 },
    { id: 'academic-block', name: 'Academic Block', lat: 30.3555, lng: 76.3680, zoom: 17, heading: 180, tilt: 30 },
    { id: 'hostels', name: 'Hostel Area', lat: 30.3540, lng: 76.3690, zoom: 17, heading: 270, tilt: 0 },
  ],
  currentPreset: 'campus-overview',
  showLayer3D: false,
  showLayerSatellite: false,
  showLayerTraffic: false,
  overlayConfig: {
    glbModelUrl: null,
    scale: 1,
    rotation: { x: 0, y: 0, z: 0 },
    position: { lat: 0, lng: 0, altitude: 0 },
  },
  locations: [],
  events: [],
  isLoading: false,
  error: null,

  setMapLoaded: (loaded) => set({ isMapLoaded: loaded }),
  setSelectedLocation: (location) => set({ selectedLocation: location, filteredLocations: null, searchQuery: location?.name || '' }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilteredLocations: (locations) => set({ filteredLocations: locations }),
  setActiveFilters: (filters) => set({ activeFilters: filters }),
  setCameraPreset: (presetId) => set({ currentPreset: presetId }),
  toggleLayer3D: () => set((state) => ({ showLayer3D: !state.showLayer3D })),
  toggleLayerSatellite: () => set((state) => ({ showLayerSatellite: !state.showLayerSatellite })),
  toggleLayerTraffic: () => set((state) => ({ showLayerTraffic: !state.showLayerTraffic })),
  setOverlayConfig: (config) => set((state) => ({ overlayConfig: { ...state.overlayConfig, ...config } })),

  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [locationsResponse, eventsResponse] = await Promise.all([
        LocationService.getLocations(),
        EventService.getEvents(),
      ]);
      set({ locations: locationsResponse.locations, events: eventsResponse.events, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch data:', error);
      set({ error: 'Failed to load map data.', isLoading: false });
    }
  },

  searchLocations: async (query: string) => {
    set({ searchQuery: query });
    if (query.length < 2) {
      set({ filteredLocations: null });
      return;
    }
    try {
      const locations = await LocationService.searchLocations(query);
      set({ filteredLocations: locations });
    } catch (error) {
      console.error('Search failed:', error);
      set({ filteredLocations: [] });
    }
  },

  filterLocationsByCategory: (category: string) => {
    const { locations, activeFilters } = get();
    const newCategoryFilter = activeFilters.category.includes(category)
      ? activeFilters.category.filter(c => c !== category)
      : [...activeFilters.category, category];

    set({ activeFilters: { ...activeFilters, category: newCategoryFilter } });

    if (newCategoryFilter.length === 0) {
      set({ filteredLocations: null });
      return;
    }

    const filtered = locations.filter(location => 
      newCategoryFilter.some(filterCat => 
        location.category && typeof location.category === 'string' && location.category.toLowerCase().includes(filterCat.toLowerCase())
      )
    );
    set({ filteredLocations: filtered });
  },
}));
