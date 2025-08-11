import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  BlockchainTransaction, 
  SmartContractEvent, 
  WalletConnection 
} from '@/types/blockchain';

interface BlockchainState {
  wallet: WalletConnection | null;
  transactions: BlockchainTransaction[];
  events: SmartContractEvent[];
  isConnecting: boolean;
  isLoading: boolean;
  setWallet: (wallet: WalletConnection | null) => void;
  addTransaction: (transaction: BlockchainTransaction) => void;
  updateTransaction: (hash: string, updates: Partial<BlockchainTransaction>) => void;
  addEvent: (event: SmartContractEvent) => void;
  setConnecting: (connecting: boolean) => void;
  setLoading: (loading: boolean) => void;
  disconnect: () => void;
}

export const useBlockchainStore = create<BlockchainState>()(
  persist(
    (set, get) => ({
      wallet: null,
      transactions: [],
      events: [],
      isConnecting: false,
      isLoading: false,
      setWallet: (wallet) => set({ wallet }),
      addTransaction: (transaction) => set((state) => ({
        transactions: [transaction, ...state.transactions]
      })),
      updateTransaction: (hash, updates) => set((state) => ({
        transactions: state.transactions.map(tx =>
          tx.hash === hash ? { ...tx, ...updates } : tx
        )
      })),
      addEvent: (event) => set((state) => ({
        events: [event, ...state.events]
      })),
      setConnecting: (isConnecting) => set({ isConnecting }),
      setLoading: (isLoading) => set({ isLoading }),
      disconnect: () => set({ wallet: null, transactions: [], events: [] }),
    }),
    {
      name: 'blockchain-storage',
      partialize: (state) => ({ wallet: state.wallet }),
    }
  )
)