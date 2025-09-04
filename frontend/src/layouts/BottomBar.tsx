import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FaStreetView } from 'react-icons/fa';

const BottomBar = () => {
  const pointsOfInterest = [
    { name: 'Central Library', distance: '500m' },
    { name: 'Student Union', distance: '750m' },
    { name: 'Main Auditorium', distance: '1.2km' },
    { name: 'Sports Complex', distance: '1.8km' },
    { name: 'Art Gallery', distance: '2.1km' },
  ];

  return (
    <footer className="absolute bottom-0 left-0 right-0 z-20 p-4">
      <div className="container mx-auto flex justify-between items-center bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4">
        {/* POI Scroller */}
        <div className="flex items-center flex-1">
          <button className="text-white p-2 hover:text-brand-orange">
            <FiChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center space-x-8 px-4">
              {pointsOfInterest.map((poi, index) => (
                <div key={index} className="text-center flex-shrink-0">
                  <p className="text-white font-semibold">{poi.name}</p>
                  <p className="text-gray-400 text-sm">{poi.distance}</p>
                </div>
              ))}
            </div>
          </div>
          <button className="text-white p-2 hover:text-brand-orange">
            <FiChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Street View Button */}
        <div className="ml-8">
          <button className="bg-brand-orange text-white p-4 rounded-full hover:bg-opacity-90 transition-opacity shadow-lg">
            <FaStreetView className="h-8 w-8" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default BottomBar;
