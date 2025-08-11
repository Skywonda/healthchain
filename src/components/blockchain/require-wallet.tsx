import { ReactNode } from 'react';
import { WalletConnect } from './wallet-connect';
import { useWalletConnection } from '@/hooks/use-blockchain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RequireWalletProps {
  children: ReactNode;
}

export function RequireWallet({ children }: RequireWalletProps) {
  const { isConnected } = useWalletConnection();

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Connect Your Wallet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-700 text-sm">
              For your security, please connect your wallet to access this feature.
            </p>
            <WalletConnect showCard />
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
} 