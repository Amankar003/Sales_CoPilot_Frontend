"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface CampaignContextType {
  activeCampaignId: number | null;
  setActiveCampaignId: (id: number | null) => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({ children }: { children: ReactNode }) {
  const [activeCampaignId, setActiveCampaignIdState] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("activeCampaignId");
    if (stored) {
      setActiveCampaignIdState(Number(stored));
    }
  }, []);

  const setActiveCampaignId = (id: number | null) => {
    setActiveCampaignIdState(id);
    if (id === null) {
      localStorage.removeItem("activeCampaignId");
    } else {
      localStorage.setItem("activeCampaignId", id.toString());
    }
  };

  return (
    <CampaignContext.Provider value={{ activeCampaignId, setActiveCampaignId }}>
      {children}
    </CampaignContext.Provider>
  );
}

export function useActiveCampaign() {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error("useActiveCampaign must be used within a CampaignProvider");
  }
  return context;
}
