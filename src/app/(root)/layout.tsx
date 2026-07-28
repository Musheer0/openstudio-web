import React from 'react';
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from 'sonner';
import ReactQueryProvider from '@/components/react-query-provider';
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReactQueryProvider>
          {children}
        <Toaster/>
        </ReactQueryProvider>
  );
};

export default Layout;