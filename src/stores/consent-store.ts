import { create } from 'zustand';
import type { ConsentGrant, AccessRequest, SharingSettings } from '@/types/consent';

interface ConsentState {
  consents: ConsentGrant[];
  accessRequests: AccessRequest[];
  sharingSettings: SharingSettings | null;
  isLoading: boolean;
  
  // Actions
  setConsents: (consents: ConsentGrant[]) => void;
  addConsent: (consent: ConsentGrant) => void;
  updateConsent: (id: string, updates: Partial<ConsentGrant>) => void;
  revokeConsent: (id: string) => void;
  
  setAccessRequests: (requests: AccessRequest[]) => void;
  addAccessRequest: (request: AccessRequest) => void;
  updateAccessRequest: (id: string, updates: Partial<AccessRequest>) => void;
  
  setSharingSettings: (settings: SharingSettings) => void;
  updateSharingSettings: (updates: Partial<SharingSettings>) => void;
  
  setLoading: (loading: boolean) => void;
}

export const useConsentStore = create<ConsentState>((set, get) => ({
  consents: [],
  accessRequests: [],
  sharingSettings: null,
  isLoading: false,
  
  setConsents: (consents) => set({ consents }),
  
  addConsent: (consent) => set((state) => ({ 
    consents: [consent, ...state.consents] 
  })),
  
  updateConsent: (id, updates) => set((state) => ({
    consents: state.consents.map(consent => 
      consent.id === id ? { ...consent, ...updates } : consent
    )
  })),
  
  revokeConsent: (id) => set((state) => ({
    consents: state.consents.map(consent => 
      consent.id === id 
        ? { ...consent, status: 'REVOKED' as const, revokedAt: new Date() }
        : consent
    )
  })),
  
  setAccessRequests: (accessRequests) => set({ accessRequests }),
  
  addAccessRequest: (request) => set((state) => ({ 
    accessRequests: [request, ...state.accessRequests] 
  })),
  
  updateAccessRequest: (id, updates) => set((state) => ({
    accessRequests: state.accessRequests.map(request => 
      request.id === id ? { ...request, ...updates } : request
    )
  })),
  
  setSharingSettings: (sharingSettings) => set({ sharingSettings }),
  
  updateSharingSettings: (updates) => set((state) => ({
    sharingSettings: state.sharingSettings 
      ? { ...state.sharingSettings, ...updates }
      : null
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
}));