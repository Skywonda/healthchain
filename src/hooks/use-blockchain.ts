// hooks/use-blockchain.ts
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { getBlockchainService } from '@/lib/blockchain';
import { useBlockchainStore } from '@/stores/blockchain-store';
import { useAuthStore } from '@/stores/auth-store';
import type { WalletConnection, BlockchainTransaction } from '@/types/blockchain';
import type { RecordType } from '@/types/medical-records';
import { AccessType } from '@prisma/client';

export function useBlockchain() {
  const blockchainStore = useBlockchainStore();
  const authStore = useAuthStore();
  const [service] = useState(() => getBlockchainService());

  const connectWallet = useCallback(async (): Promise<boolean> => {
    if (blockchainStore.wallet?.isConnected) return true;

    blockchainStore.setConnecting(true);
    
    try {
      const walletConnection = await service.connectWallet();
      blockchainStore.setWallet(walletConnection);
      
      if (authStore.user) {
        await service.registerUser(
          walletConnection.address, 
          authStore.user.role as 'PATIENT' | 'DOCTOR'
        );
      }
      
      setupEventListeners();
      toast.success('Wallet connected successfully');
      return true;
    } catch (error) {
      console.error('Wallet connection failed:', error);
      toast.error('Failed to connect wallet');
      return false;
    } finally {
      blockchainStore.setConnecting(false);
    }
  }, [service, blockchainStore, authStore.user]);

  const disconnectWallet = useCallback(() => {
    service.disconnect();
    blockchainStore.disconnect();
    toast.success('Wallet disconnected');
  }, [service, blockchainStore]);

  const createMedicalRecord = useCallback(async (
    file: File,
    recordType: RecordType,
    metadata: any
  ) => {
    if (!blockchainStore.wallet?.isConnected) {
      throw new Error('Wallet not connected');
    }

    blockchainStore.setLoading(true);
    
    try {
      const result = await service.createMedicalRecord(file, recordType, metadata);
      blockchainStore.addTransaction(result.transaction);
      return result;
    } catch (error) {
      console.error('Create record error:', error);
      throw error;
    } finally {
      blockchainStore.setLoading(false);
    }
  }, [service, blockchainStore]);

  const grantConsent = useCallback(async (
    doctorAddress: string,
    recordIds: string[],
    accessType: AccessType,
    duration: number,
    purpose: string
  ) => {
    if (!blockchainStore.wallet?.isConnected) {
      throw new Error('Wallet not connected');
    }

    blockchainStore.setLoading(true);
    
    try {
      const result = await service.grantConsent(
        doctorAddress,
        recordIds,
        accessType,
        duration,
        purpose
      );
      blockchainStore.addTransaction(result.transaction);
      return result;
    } catch (error) {
      console.error('Grant consent error:', error);
      throw error;
    } finally {
      blockchainStore.setLoading(false);
    }
  }, [service, blockchainStore]);

  const revokeConsent = useCallback(async (consentId: string) => {
    if (!blockchainStore.wallet?.isConnected) {
      throw new Error('Wallet not connected');
    }

    blockchainStore.setLoading(true);
    
    try {
      const transaction = await service.revokeConsent(consentId);
      blockchainStore.addTransaction(transaction);
      return transaction;
    } catch (error) {
      console.error('Revoke consent error:', error);
      throw error;
    } finally {
      blockchainStore.setLoading(false);
    }
  }, [service, blockchainStore]);

  const accessRecord = useCallback(async (
    recordId: string,
    purpose: string,
    encryptionKey: string
  ) => {
    if (!blockchainStore.wallet?.isConnected) {
      throw new Error('Wallet not connected');
    }

    blockchainStore.setLoading(true);
    
    try {
      const result = await service.accessRecord(recordId, purpose, encryptionKey);
      blockchainStore.addTransaction(result.transaction);
      return result;
    } catch (error) {
      console.error('Access record error:', error);
      throw error;
    } finally {
      blockchainStore.setLoading(false);
    }
  }, [service, blockchainStore]);

  const getPatientRecords = useCallback(async (patientAddress?: string) => {
    const address = patientAddress || blockchainStore.wallet?.address;
    if (!address) throw new Error('No patient address available');
    
    return await service.getPatientRecords(address);
  }, [service, blockchainStore.wallet]);

  const getRecordDetails = useCallback(async (recordId: string) => {
    return await service.getRecordDetails(recordId);
  }, [service]);

  const isConsentValid = useCallback(async (consentId: string) => {
    return await service.isConsentValid(consentId);
  }, [service]);

  const setupEventListeners = useCallback(() => {
    service.onEvent('RecordCreated', (event: any) => {
      blockchainStore.addEvent(event);
      toast.success('Medical record created successfully');
    });

    service.onEvent('ConsentGranted', (event: any) => {
      blockchainStore.addEvent(event);
      toast.success('Consent granted successfully');
    });

    service.onEvent('ConsentRevoked', (event: any) => {
      blockchainStore.addEvent(event);
      toast.success('Consent revoked successfully');
    });

    service.onEvent('RecordAccessed', (event: any) => {
      blockchainStore.addEvent(event);
    });
  }, [service, blockchainStore]);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== blockchainStore.wallet?.address) {
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      (window as any).ethereum.on('accountsChanged', handleAccountsChanged);
      (window as any).ethereum.on('chainChanged', handleChainChanged);

      return () => {
        (window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged);
        (window as any).ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [blockchainStore.wallet, connectWallet, disconnectWallet]);

  return {
    // Wallet state
    isConnected: blockchainStore.wallet?.isConnected || false,
    isConnecting: blockchainStore.isConnecting,
    isLoading: blockchainStore.isLoading,
    address: blockchainStore.wallet?.address,
    chainId: blockchainStore.wallet?.chainId,
    
    // Wallet actions
    connectWallet,
    disconnectWallet,
    
    // Blockchain actions
    createMedicalRecord,
    grantConsent,
    revokeConsent,
    accessRecord,
    
    // Query functions
    getPatientRecords,
    getRecordDetails,
    isConsentValid,
    
    // Transactions and events
    transactions: blockchainStore.transactions,
    events: blockchainStore.events,
    
    // Service instance
    service,
  };
}

export function useWalletConnection() {
  const { isConnected, isConnecting, connectWallet, disconnectWallet, address } = useBlockchain();
  
  return {
    isConnected,
    isConnecting,
    address,
    connect: connectWallet,
    disconnect: disconnectWallet,
  };
}