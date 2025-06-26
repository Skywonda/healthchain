// components/blockchain/blockchain-guard.tsx
'use client';

import { ReactNode } from 'react';
import { WalletConnect } from './wallet-connect';
import { useWalletConnection } from '@/hooks/use-blockchain';

interface BlockchainGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  requireConnection?: boolean;
}

export function BlockchainGuard({ 
  children, 
  fallback,
  requireConnection = true 
}: BlockchainGuardProps) {
  const { isConnected } = useWalletConnection();

  if (requireConnection && !isConnected) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Wallet Connection Required
          </h3>
          <p className="text-gray-600 mb-6">
            Please connect your wallet to access blockchain features
          </p>
        </div>
        {fallback || <WalletConnect showCard />}
      </div>
    );
  }

  return <>{children}</>;
}