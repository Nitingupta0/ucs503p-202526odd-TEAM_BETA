import React, { useState } from 'react';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import BottomBar from './BottomBar';
import SearchFilters from '../components/SearchFilters';
import SearchResults from '../components/SearchResults';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [showSearchFilters, setShowSearchFilters] = useState(false);

  const toggleSearchFilters = () => {
    setShowSearchFilters(prev => !prev);
  };

  return (
    <div className="relative min-h-screen bg-brand-dark">
      <Header onToggleSearchFilters={toggleSearchFilters} />
      <SearchResults />
      <LeftSidebar />
      <main className="h-screen">
        {children}
      </main>
      <BottomBar />
      {showSearchFilters && <SearchFilters onClose={toggleSearchFilters} />}
    </div>
  );
};

export default MainLayout;