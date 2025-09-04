import { FiCoffee, FiFilm, FiMusic, FiMapPin, FiAlertTriangle } from 'react-icons/fi';
import { useMapStore } from '../stores/mapStore';
import { cn } from '../utils';

const LeftSidebar = () => {
  const { filterLocationsByCategory, activeFilters } = useMapStore();

  const categories = [
    { icon: FiCoffee, name: 'Cafes' },
    { icon: FiFilm, name: 'Theaters' },
    { icon: FiMusic, name: 'Concerts' },
    { icon: FiMapPin, name: 'Places' },
    { icon: FiAlertTriangle, name: 'Alerts' },
  ];

  return (
    <aside className="absolute top-1/2 left-4 -translate-y-1/2 z-20">
      <div className="flex flex-col items-center space-y-6 bg-gray-800/50 p-3 rounded-full backdrop-blur-sm">
        {categories.map((category, index) => (
          <button
            key={index}
            onClick={() => filterLocationsByCategory(category.name)}
            className={cn(
              "text-white hover:text-brand-orange transition-colors",
              { "text-brand-orange": activeFilters.category.includes(category.name) }
            )}
            title={category.name}
          >
            <category.icon className="h-6 w-6" />
          </button>
        ))}
      </div>
    </aside>
  );
};

export default LeftSidebar;