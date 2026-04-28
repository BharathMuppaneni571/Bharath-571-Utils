import React, { useEffect } from 'react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import HistoryDrawer from './HistoryDrawer';
import CommandPalette from './CommandPalette';
import { useAppStore } from '../../store/useAppStore';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isSidebarOpen, toggleSidebar } = useAppStore();

  // Handle small screens (Extension Popup)
  useEffect(() => {
    const handleResize = () => {
      const isExtension = document.body.classList.contains('is-extension');
      if ((window.innerWidth < 1000 || isExtension) && isSidebarOpen) {
        toggleSidebar();
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen, toggleSidebar]);

  return (
    <div className="min-h-screen bg-nexus-bg text-slate-50 relative flex overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden h-screen">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar min-h-0 pt-2">
          {children}
        </main>
      </div>

      <HistoryDrawer />
      <CommandPalette />
    </div>
  );
};

export default MainLayout;
