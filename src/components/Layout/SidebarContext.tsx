import { createContext, useContext } from 'react';

interface SidebarContextValue {
  isOpen: boolean;
  close: () => void;
  open: () => void;
  toggle: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export const SidebarProvider = SidebarContext.Provider;

export function useSidebar(): SidebarContextValue {
  const context = useContext(SidebarContext);
  if (!context) {
    // Return no-op functions if used outside of map page
    return {
      isOpen: false,
      close: () => {},
      open: () => {},
      toggle: () => {},
    };
  }
  return context;
}
