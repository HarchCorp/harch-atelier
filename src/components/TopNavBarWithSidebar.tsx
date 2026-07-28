'use client';

import { useState, useCallback, createContext, useContext } from 'react';
import { TopNavBar } from '@/components/TopNavBar';

const SidebarToggleContext = createContext<{
  toggleSidebar: () => void;
}>({
  toggleSidebar: () => {},
});

export function useSidebarToggle() {
  return useContext(SidebarToggleContext);
}

export function TopNavBarWithSidebar() {
  const [, setSidebarOpen] = useState(false);

  // We need to communicate with the Sidebar component.
  // Since Sidebar has its own internal state, we'll use a custom event.
  const toggleSidebar = useCallback(() => {
    // Dispatch a custom event that the Sidebar listens to
    window.dispatchEvent(new CustomEvent('toggle-sidebar'));
  }, []);

  return (
    <SidebarToggleContext.Provider value={{ toggleSidebar }}>
      <TopNavBar onToggleSidebar={toggleSidebar} />
    </SidebarToggleContext.Provider>
  );
}
