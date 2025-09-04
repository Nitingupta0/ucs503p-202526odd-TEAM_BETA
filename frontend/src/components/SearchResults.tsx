import { useMapStore } from '../stores/mapStore';
import { FiMapPin } from 'react-icons/fi';

const SearchResults = () => {
  const { filteredLocations, setSelectedLocation, searchLocations } = useMapStore();

  if (!filteredLocations || filteredLocations.length === 0) {
    return null;
  }

  const handleSelect = (location: typeof filteredLocations[0]) => {
    setSelectedLocation(location);
    // Clear search results after selection
    searchLocations('');
  };

  return (
    <div className="absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-lg z-20">
      <ul className="bg-gray-800/70 backdrop-blur-sm rounded-lg mt-2 overflow-hidden">
        {filteredLocations.map((loc) => (
          <li
            key={loc._id}
            className="flex items-center px-4 py-3 text-white hover:bg-brand-orange/20 cursor-pointer"
            onClick={() => handleSelect(loc)}
          >
            <FiMapPin className="mr-3 text-gray-400" />
            {loc.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SearchResults;
