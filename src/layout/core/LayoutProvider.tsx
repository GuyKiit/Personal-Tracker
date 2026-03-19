import { createContext, useContext, useState, ReactNode } from "react";

interface LayoutContextProps {
  isLoadingScreen: boolean;
  setIsLoadingScreen: (v: boolean) => void;
}

const initialState: LayoutContextProps = {
  isLoadingScreen: false,
  setIsLoadingScreen: () => {},
};

const LayoutContext = createContext<LayoutContextProps>(initialState);

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  const [isLoadingScreen, setIsLoadingScreen] = useState(false);

  return (
    <LayoutContext.Provider value={{ isLoadingScreen, setIsLoadingScreen }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => useContext(LayoutContext);
