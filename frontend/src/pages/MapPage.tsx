import React, { useEffect, useMemo } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import { LeafletMap } from '../components/Map/LeafletMap';
import { useMapStore } from '../stores/mapStore';

const MapPage: React.FC = () => {
  const {
    locations,
    events,
    isLoading,
    error,
    fetchData,
    filteredLocations,
  } = useMapStore();

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const locationsToDisplay = useMemo(() => filteredLocations ?? locations, [filteredLocations, locations]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-brand-dark-blue">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-brand-dark-blue text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <LeafletMap
        locations={locationsToDisplay}
        events={events}
      />
    </div>
  );
};

export default MapPage;