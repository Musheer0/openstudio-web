import React from 'react';
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from 'sonner';
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <TooltipProvider>
        {children}
        <Toaster/>
    </TooltipProvider>
  );
};

export default Layout;