import { useState, useEffect } from 'react';
import { FiSearch, FiBell, FiUser, FiFilter } from 'react-icons/fi';
import { useMapStore } from '../stores/mapStore';
import { debounce } from '../utils';

interface HeaderProps {
  onToggleSearchFilters?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSearchFilters }) => {
  const { searchQuery, searchLocations } = useMapStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);

  const debouncedSearch = debounce((query: string) => {
    searchLocations(query);
  }, 300);

  useEffect(() => {
    debouncedSearch(localQuery);
  }, [localQuery, debouncedSearch]);

  useEffect(() => {
    // Keep local query in sync if global state is cleared elsewhere
    if (searchQuery !== localQuery) {
      setLocalQuery(searchQuery);
    }
  }, [searchQuery, localQuery]);

  return (
    <header className="absolute top-0 left-0 right-0 z-20 bg-transparent">
      <div className="container mx-auto px-6 sm:px-8 h-24 flex justify-between items-center">
        {/* Left side: Title */}
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-white">Smart Navigator</h1>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 flex justify-center px-8">
          <div className="relative w-full max-w-lg">
            <input
              type="text"
              placeholder="Search for places or events..."
              className="w-full bg-gray-800/50 text-white placeholder-gray-400 rounded-full py-3 px-6 focus:outline-none focus:ring-2 focus:ring-brand-orange backdrop-blur-sm"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
            />
            <FiSearch className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>
        </div>

        {/* Right side: Icons */}
        <div className="flex items-center space-x-6">
          <button onClick={onToggleSearchFilters} className="text-white hover:text-brand-orange transition-colors">
            <FiFilter className="h-6 w-6" />
          </button>
          <FiBell className="h-6 w-6 text-white cursor-pointer hover:text-brand-orange transition-colors" />
          <FiUser className="h-6 w-6 text-white cursor-pointer hover:text-brand-orange transition-colors" />
        </div>
      </div>
    </header>
  );
};

export default Header;
