
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { getBlockchainService } from '@/lib/blockchain';
import { useBlockchainStore } from '@/stores/blockchain-store';
import { useAuthStore } from '@/stores/auth-store';
import type {  SmartContractEvent } from '@/types/blockchain';
import type { RecordType } from '@/types/medical-records';
import { AccessType } from '@/types/consent';

interface Ethereum {
  on(event: string, listener: (...args: unknown[]) => void): void;
  removeListener(event: string, listener: (...args: unknown[]) => void): void;
}

export function useBlockchain() {
  const blockchainStore = useBlockchainStore();
  const authStore = useAuthStore();
  const [service] = useState(() => getBlockchainService());

  const connectWallet = useCallback(async (): Promise<boolean> => {
    if (blockchainStore.wallet?.isConnected) return true;
    blockchainStore.setConnecting(true);
    try {
      const walletConnection = await service.connectWallet();
      // blockchainStore.setWallet(walletConnection);
      // if (authStore.user) {
      //   await service.registerUser(
      //     walletConnection.address,
      //     authStore.user.role as 'PATIENT' | 'DOCTOR'
      //   );
      // }
      // setupEventListeners();

      if (walletConnection) {
        blockchainStore.setWallet(walletConnection);
        if (authStore.user) {
          await service.registerUser(
            walletConnection.address,
            authStore.user.role as 'PATIENT' | 'DOCTOR'
          );
        }
        setupEventListeners();
        return true;
      }
      toast.error('Failed to connect wallet');
      return false;
    } catch (error) {
      console.log("error", error);
      if (!blockchainStore.wallet || !blockchainStore.wallet.isConnected) {
        toast.error('Failed to connect wallet');
      }
      return false;
    } finally {
      blockchainStore.setConnecting(false);
    }
  }, [service, blockchainStore, authStore.user]);

  const disconnectWallet = useCallback(() => {
    const wasConnected = blockchainStore.wallet?.isConnected;
    service.disconnect();
    blockchainStore.disconnect();
    if (wasConnected) {
      toast.success('Wallet disconnected');
    }
  }, [service, blockchainStore]);

  const createMedicalRecord = useCallback(async (file: File, recordType: RecordType, metadata: unknown) => {
    if (!blockchainStore.wallet?.isConnected) {
      toast.error('Connect your wallet first');
      return;
    }
    try {
      const result = await service.createMedicalRecord(file, recordType, metadata);
      blockchainStore.addTransaction(result.transaction);
      toast.success('Medical record created');
      return result;
    } catch {
      toast.error('Failed to create record');
    }
  }, [service, blockchainStore.wallet]);

  const grantConsent = useCallback(async (doctorAddress: string, recordIds: string[], accessType: AccessType, duration: number, purpose: string) => {
    if (!blockchainStore.wallet?.isConnected) {
      toast.error('Connect your wallet first');
      return;
    }
    try {
      const result = await service.grantConsent(doctorAddress, recordIds, accessType, duration, purpose);
      blockchainStore.addTransaction(result.transaction);
      toast.success('Consent granted');
      return result;
    } catch {
      toast.error('Failed to grant consent');
    }
  }, [service, blockchainStore.wallet]);

  const revokeConsent = useCallback(async (consentId: string) => {
    if (!blockchainStore.wallet?.isConnected) {
      toast.error('Connect your wallet first');
      return;
    }
    try {
      const tx = await service.revokeConsent(consentId);
      blockchainStore.addTransaction(tx);
      toast.success('Consent revoked');
      return tx;
    } catch {
      toast.error('Failed to revoke consent');
    }
  }, [service, blockchainStore.wallet]);

  const accessRecord = useCallback(async (recordId: string, purpose: string, encryptionKey: string) => {
    if (!blockchainStore.wallet?.isConnected) {
      toast.error('Connect your wallet first');
      return;
    }
    try {
      const result = await service.accessRecord(recordId, purpose, encryptionKey);
      blockchainStore.addTransaction(result.transaction);
      toast.success('Record accessed');
      return result;
    } catch {
      toast.error('Failed to access record');
    }
  }, [service, blockchainStore.wallet]);

  const getPatientRecords = useCallback(async (address: string) => {
    return await service.getPatientRecords(address);
  }, [service, blockchainStore.wallet]);

  const getRecordDetails = useCallback(async (recordId: string) => {
    return await service.getRecordDetails(recordId);
  }, [service]);

  const isConsentValid = useCallback(async (consentId: string) => {
    return await service.isConsentValid(consentId);
  }, [service]);

  const setupEventListeners = useCallback(() => {
    service.onEvent('RecordCreated', (event: unknown) => {
      blockchainStore.addEvent(event as SmartContractEvent);
      toast.success('Medical record created successfully');
    });
    service.onEvent('ConsentGranted', (event: unknown) => {
      blockchainStore.addEvent(event as SmartContractEvent);
      toast.success('Consent granted successfully');
    });
    service.onEvent('ConsentRevoked', (event: unknown) => {
      blockchainStore.addEvent(event as SmartContractEvent);
      toast.success('Consent revoked successfully');
    });
    service.onEvent('RecordAccessed', (event: unknown) => {
      blockchainStore.addEvent(event as SmartContractEvent);
    });
  }, [service, blockchainStore]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ethereum = (window as unknown as { ethereum?: unknown }).ethereum as Ethereum | undefined;
      if (ethereum) {
        const handleAccountsChanged = (...args: unknown[]) => {
          const accounts = args[0] as string[];
          if (accounts.length === 0) {
            disconnectWallet();
          } else if (accounts[0] !== blockchainStore.wallet?.address) {
            connectWallet();
          }
        };
        const handleChainChanged = () => {
          window.location.reload();
        };
        ethereum.on('accountsChanged', handleAccountsChanged);
        ethereum.on('chainChanged', handleChainChanged);
        return () => {
          ethereum.removeListener('accountsChanged', handleAccountsChanged);
          ethereum.removeListener('chainChanged', handleChainChanged);
        };
      }
    }
  }, [blockchainStore.wallet, connectWallet, disconnectWallet]);

  useEffect(() => {
    if (blockchainStore.wallet && blockchainStore.wallet.isConnected) {
      connectWallet();
    }
  }, []);

  return {
    isConnected: blockchainStore.wallet?.isConnected || false,
    isConnecting: blockchainStore.isConnecting,
    isLoading: blockchainStore.isLoading,
    address: blockchainStore.wallet?.address,
    chainId: blockchainStore.wallet?.chainId,
    connectWallet,
    disconnectWallet,
    createMedicalRecord,
    grantConsent,
    revokeConsent,
    accessRecord,
    getPatientRecords,
    getRecordDetails,
    isConsentValid,
    transactions: blockchainStore.transactions,
    events: blockchainStore.events,
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