'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WalletConnect } from '@/components/blockchain/wallet-connect';
import { TransactionStatus } from '@/components/blockchain/transaction-status';
import { useBlockchain } from '@/hooks/use-blockchain';
import { CheckCircle, AlertCircle, Loader2, Wallet } from 'lucide-react';
import { Navigation } from '@/components/dashboard/shared/navigation';

export default function WalletTestPage() {
  const {
    isConnected,
    isConnecting,
    address,
    chainId,
    connectWallet,
    createMedicalRecord,
    isLoading,
    transactions
  } = useBlockchain();

  const [testResults, setTestResults] = useState<{
    walletConnection: 'pending' | 'success' | 'error';
    networkCheck: 'pending' | 'success' | 'error';
    ipfsTest: 'pending' | 'success' | 'error';
    contractTest: 'pending' | 'success' | 'error';
  }>({
    walletConnection: 'pending',
    networkCheck: 'pending',
    ipfsTest: 'pending',
    contractTest: 'pending'
  });

  const [testFile, setTestFile] = useState<File | null>(null);
  const [testTxHash, setTestTxHash] = useState<string>('');

  // Check network when wallet connects
  useEffect(() => {
    if (isConnected && chainId) {
      const expectedChainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '11155111');
      if (chainId === expectedChainId) {
        setTestResults(prev => ({ ...prev, networkCheck: 'success' }));
      } else {
        setTestResults(prev => ({ ...prev, networkCheck: 'error' }));
      }
    }
  }, [isConnected, chainId]);

  // Update wallet connection status
  useEffect(() => {
    if (isConnected) {
      setTestResults(prev => ({ ...prev, walletConnection: 'success' }));
    } else if (!isConnecting) {
      setTestResults(prev => ({ ...prev, walletConnection: 'pending' }));
    }
  }, [isConnected, isConnecting]);

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
    } catch (error) {
      setTestResults(prev => ({ ...prev, walletConnection: 'error' }));
    }
  };

  const testIPFS = async () => {
    setTestResults(prev => ({ ...prev, ipfsTest: 'pending' }));
    
    try {
      const response = await fetch('/api/test/ipfs', { method: 'POST' });
      const result = await response.json();
      
      if (result.success) {
        setTestResults(prev => ({ ...prev, ipfsTest: 'success' }));
      } else {
        setTestResults(prev => ({ ...prev, ipfsTest: 'error' }));
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, ipfsTest: 'error' }));
    }
  };

  const testSmartContract = async () => {
    if (!testFile) {
      alert('Please select a test file first');
      return;
    }

    setTestResults(prev => ({ ...prev, contractTest: 'pending' }));
    
    try {
      const result = await createMedicalRecord(
        testFile,
        'MEDICAL_REPORT',
        { title: 'Test Record', description: 'Blockchain test' }
      );
      
      setTestTxHash(result.transaction.hash);
      setTestResults(prev => ({ ...prev, contractTest: 'success' }));
    } catch (error) {
      console.error('Contract test error:', error);
      setTestResults(prev => ({ ...prev, contractTest: 'error' }));
    }
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />;
    }
  };

  const getStatusText = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Failed';
      default:
        return 'Testing...';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Navigation userRole="PATIENT" />
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            HealthChain Wallet & Blockchain Test
          </h1>
          <p className="text-gray-600">
            Test your wallet connection and blockchain integration
          </p>
        </div>

        {/* Environment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><strong>RPC URL:</strong> {process.env.NEXT_PUBLIC_RPC_URL || 'Not configured'}</div>
            <div><strong>Chain ID:</strong> {process.env.NEXT_PUBLIC_CHAIN_ID || 'Not configured'}</div>
            <div><strong>IPFS URL:</strong> {process.env.NEXT_PUBLIC_IPFS_URL || 'Not configured'}</div>
            <div><strong>Contract:</strong> {process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'Not deployed'}</div>
          </CardContent>
        </Card>

        {/* Wallet Connection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Wallet Connection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <WalletConnect showCard />
            
            {isConnected && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-800">Wallet Connected</span>
                </div>
                <div className="text-sm text-green-700">
                  <div><strong>Address:</strong> {address}</div>
                  <div><strong>Chain ID:</strong> {chainId}</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Suite */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Test 1: Wallet Connection */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.walletConnection)}
                <div>
                  <div className="font-medium">Wallet Connection</div>
                  <div className="text-sm text-gray-600">Connect MetaMask wallet</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {getStatusText(testResults.walletConnection)}
              </div>
            </div>

            {/* Test 2: Network Check */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.networkCheck)}
                <div>
                  <div className="font-medium">Network Verification</div>
                  <div className="text-sm text-gray-600">Verify Sepolia testnet connection</div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {getStatusText(testResults.networkCheck)}
              </div>
            </div>

            {/* Test 3: IPFS Connection */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.ipfsTest)}
                <div>
                  <div className="font-medium">IPFS Connection</div>
                  <div className="text-sm text-gray-600">Test Infura IPFS API</div>
                </div>
              </div>
              <Button
                size="sm"
                onClick={testIPFS}
                disabled={testResults.ipfsTest === 'pending'}
              >
                Test IPFS
              </Button>
            </div>

            {/* Test 4: Smart Contract */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(testResults.contractTest)}
                <div>
                  <div className="font-medium">Smart Contract</div>
                  <div className="text-sm text-gray-600">Deploy and interact with contract</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  onChange={(e) => setTestFile(e.target.files?.[0] || null)}
                  className="text-xs"
                  accept=".txt,.pdf,.jpg,.png"
                />
                <Button
                  size="sm"
                  onClick={testSmartContract}
                  disabled={!isConnected || !testFile || isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Test Contract'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        {transactions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.slice(0, 5).map((tx) => (
                  <div key={tx.hash} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-mono text-sm">{tx.hash.slice(0, 10)}...{tx.hash.slice(-8)}</div>
                      <div className="text-xs text-gray-500">{tx.timestamp.toLocaleString()}</div>
                    </div>
                    <TransactionStatus txHash={tx.hash} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transaction Status */}
        {testTxHash && (
          <Card>
            <CardHeader>
              <CardTitle>Test Transaction Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-mono text-sm">{testTxHash}</div>
                  <div className="text-xs text-gray-500">Smart contract interaction</div>
                </div>
                <TransactionStatus 
                  txHash={testTxHash}
                  showExplorer={true}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify({
                isConnected,
                address: address?.slice(0, 10) + '...',
                chainId,
                transactionCount: transactions.length,
                testResults
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}