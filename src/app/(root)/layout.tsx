import React from 'react';
import { TooltipProvider } from "@/components/ui/tooltip"
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <TooltipProvider>
        {children}
    </TooltipProvider>
  );
};

export default Layout;