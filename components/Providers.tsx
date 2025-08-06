"use client";

import { ReactNode } from "react";
import { Toaster } from "sonner";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/redux/store";
import { LoadingProvider } from "@/context/useLoadingContext";
import SessionProvider from "@/components/SessionProvider";
import ReactQueryClientProvider from "@/components/ReactQueryClientProvider";
import { SidebarProvider } from "@/context/useSidebarContext";

type Props = {
  children: ReactNode;
  session: any;
};

const Providers = ({ children, session }: Props) => {
  return (
    <ReactQueryClientProvider>
      <SessionProvider session={session}>
        <SidebarProvider>
          <ReduxProvider store={store}>
            <LoadingProvider>
              {children}
              <Toaster />
            </LoadingProvider>
          </ReduxProvider>
        </SidebarProvider>
      </SessionProvider>
    </ReactQueryClientProvider>
  );
};

export default Providers;
