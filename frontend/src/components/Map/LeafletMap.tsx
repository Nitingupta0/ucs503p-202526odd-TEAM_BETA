import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '@changey/react-leaflet-markercluster/dist/styles.min.css';

import { MAP_CONFIG } from '../../config/mapConfig';
import { Location, Event } from '../../types';
import { useMapStore } from '../../stores/mapStore';

// Helper to programmatically change map view
const ChangeView = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  map.flyTo(center, zoom, { animate: true, duration: 1.5 });
  return null;
};

// Function to create custom, styled div icons
const createCustomIcon = (isSelected: boolean, type: 'location' | 'event' = 'location') => {
  const bgColor = isSelected ? 'bg-brand-orange' : (type === 'event' ? 'bg-red-500' : 'bg-brand-teal');
  const pulseColor = isSelected ? 'bg-brand-orange/30 animate-ping' : 'bg-transparent'; // Only pulse when selected

  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <div class="absolute w-6 h-6 rounded-full ${pulseColor}"></div>
        <div class="absolute w-3 h-3 rounded-full ${bgColor}"></div>
      </div>
    `,
    className: 'custom-leaflet-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

interface MarkersProps {
  locations: Location[];
  events: Event[];
}

// This component contains the actual markers
const Markers: React.FC<MarkersProps> = ({ locations, events }) => {
  const { selectedLocation, setSelectedLocation } = useMapStore();

  const locationMarkers = useMemo(() => locations.map(location => (
    <Marker
      key={`loc-${location._id}`}
      position={[location.coordinates.lat, location.coordinates.lng]}
      icon={createCustomIcon(selectedLocation?._id === location._id, 'location')}
      eventHandlers={{
        click: () => setSelectedLocation(location),
      }}
    >
      <Popup>
        <div className="p-1 bg-gray-800 text-white">
          <h3 className="font-bold text-md mb-1">{location.name}</h3>
          <p className="text-sm text-gray-300 mb-2">{location.description}</p>
          <span className="bg-brand-teal/20 text-brand-teal px-2 py-1 rounded-md text-xs font-semibold">
            {location.category || 'N/A'}
          </span>
        </div>
      </Popup>
    </Marker>
  )), [locations, selectedLocation, setSelectedLocation]);

  const eventMarkers = useMemo(() => events.map(event => {
    const location = event.location as Location;
    return (
      <Marker
        key={`evt-${event._id}`}
        position={[location.coordinates.lat, location.coordinates.lng]}
        icon={createCustomIcon(selectedLocation?._id === location._id, 'event')}
        eventHandlers={{
          click: () => setSelectedLocation(location),
        }}
      >
        <Popup>
          <div className="p-1 bg-gray-800 text-white">
            <h3 className="font-bold text-md mb-1">{event.title}</h3>
            <p className="text-sm text-gray-300 mb-2">{event.description}</p>
            <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-md text-xs font-semibold">
              EVENT
            </span>
          </div>
        </Popup>
      </Marker>
    );
  }), [events, selectedLocation, setSelectedLocation]);

  return <>{locationMarkers}{eventMarkers}</>;
};


interface LeafletMapProps {
  locations: Location[];
  events?: Event[];
  className?: string;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  locations = [],
  events = [],
  className = ''
}) => {
  const { selectedLocation } = useMapStore();

  // Filter out any locations or events that don't have valid coordinates
  const filteredLocations = useMemo(() => locations.filter(loc => loc.coordinates), [locations]);
  const filteredEvents = useMemo(() => events.filter(evt => evt.location && typeof evt.location !== 'string' && evt.location.coordinates), [events]);

  return (
    <MapContainer
      center={[MAP_CONFIG.center.lat, MAP_CONFIG.center.lng]}
      zoom={MAP_CONFIG.zoom}
      maxZoom={MAP_CONFIG.maxZoom}
      minZoom={MAP_CONFIG.minZoom}
      className={`w-full h-full z-0 ${className}`}
      style={{ backgroundColor: '#111827' }}
      zoomControl={true}
    >
      <TileLayer
        url={MAP_CONFIG.tileLayer.url}
        attribution={MAP_CONFIG.tileLayer.attribution}
      />
      
      {selectedLocation && selectedLocation.coordinates && (
        <ChangeView 
          center={[selectedLocation.coordinates.lat, selectedLocation.coordinates.lng]} 
          zoom={18} 
        />
      )}

      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={80}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
      >
        <Markers locations={filteredLocations} events={filteredEvents} />
      </MarkerClusterGroup>
    </MapContainer>
  );
};
