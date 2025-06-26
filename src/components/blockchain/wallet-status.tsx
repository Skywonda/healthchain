'use client';

import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useWalletConnection } from '@/hooks/use-blockchain';
import { cn } from '@/lib/utils';

interface WalletStatusProps {
  className?: string;
}

export function WalletStatus({ className }: WalletStatusProps) {
  const { isConnected, isConnecting, address } = useWalletConnection();

  if (isConnecting) {
    return (
      <div className={cn('flex items-center gap-2 text-yellow-600', className)}>
        <AlertTriangle className="h-4 w-4" />
        <span className="text-sm">Connecting wallet...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className={cn('flex items-center gap-2 text-red-600', className)}>
        <Shield className="h-4 w-4" />
        <span className="text-sm">Wallet not connected</span>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-2 text-green-600', className)}>
      <CheckCircle className="h-4 w-4" />
      <span className="text-sm font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
    </div>
  );
}