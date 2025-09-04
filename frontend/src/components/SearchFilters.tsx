import { FiX, FiClock } from 'react-icons/fi';
import { FaBuilding, FaUtensils, FaCalendarAlt } from 'react-icons/fa';
import { useMapStore } from '../stores/mapStore';
import { cn } from '../utils';

interface SearchFiltersProps {
  onClose?: () => void;
  className?: string;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ onClose, className }) => {
  const { filterLocationsByCategory, activeFilters } = useMapStore();

  const filterCategories = [
    { icon: FaCalendarAlt, name: 'Events' },
    { icon: FaUtensils, name: 'Food' },
    { icon: FaBuilding, name: 'Buildings' },
  ];

  const recentSearches = [
    'Main Library',
    'Engineering Block',
    'Student Cafeteria',
  ];

  return (
    <aside className={cn("absolute top-0 right-0 h-full w-80 bg-gray-900/70 backdrop-blur-sm z-30 text-white p-6 flex flex-col", className)}>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold">Search & Filters</h2>
        {onClose && (
          <button onClick={onClose} className="hover:text-brand-orange">
            <FiX className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Filter Categories */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Categories</h3>
        <div className="flex justify-around">
          {filterCategories.map((cat, index) => (
            <button 
              key={index} 
              onClick={() => filterLocationsByCategory(cat.name)}
              className="flex flex-col items-center space-y-2 text-gray-300 hover:text-brand-orange transition-colors"
            >
              <div className={cn(
                "bg-gray-800 p-4 rounded-full",
                { "bg-brand-orange text-white": activeFilters.category.includes(cat.name) }
              )}>
                <cat.icon className="h-6 w-6" />
              </div>
              <span className="text-sm">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Searches */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Recent</h3>
        <ul className="space-y-4">
          {recentSearches.map((search, index) => (
            <li key={index} className="flex items-center text-gray-300 hover:text-white cursor-pointer">
              <FiClock className="h-5 w-5 mr-4 text-gray-500" />
              <span>{search}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default SearchFilters;
