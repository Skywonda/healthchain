// components/blockchain/wallet-connect.tsx
'use client';

import { useState } from 'react';
import { Wallet, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWalletConnection } from '@/hooks/use-blockchain';
import { cn } from '@/lib/utils';

interface WalletConnectProps {
  showCard?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'secondary';
  onConnectSuccess?: () => void;
}

export function WalletConnect({ 
  showCard = false, 
  size = 'md',
  variant = 'default',
  onConnectSuccess
}: WalletConnectProps) {
  const { isConnected, isConnecting, address, connect, disconnect } = useWalletConnection();
  const [error, setError] = useState<string>('');

  const handleConnect = async () => {
    setError('');
    try {
      const success = await connect();
      if (success && onConnectSuccess) {
        onConnectSuccess();
      }
      if (!success && !isConnected) {
        setError('Failed to connect wallet');
      } else if (isConnected) {
        setError('');
      }
    } catch (err) {
      if (!isConnected) {
        setError(err instanceof Error ? err.message : 'Connection failed');
      }
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setError('');
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (showCard) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-700">Connected</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Address</div>
                <div className="font-mono text-sm">{formatAddress(address!)}</div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleDisconnect}
                className="w-full"
              >
                Disconnect Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-sm text-gray-600">
                Connect your wallet to access blockchain features
              </div>
              <Button 
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="font-mono">{formatAddress(address!)}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleDisconnect}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size="default"
      onClick={handleConnect}
      disabled={isConnecting}
      className={cn(
        error && 'border-red-300 text-red-700'
      )}
    >
      {isConnecting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="h-4 w-4 mr-2" />
          Connect Wallet
        </>
      )}
    </Button>
  );
}