'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TransactionStatusProps {
  txHash: string;
  onStatusChange?: (status: 'PENDING' | 'CONFIRMED' | 'FAILED') => void;
  showExplorer?: boolean;
  explorerUrl?: string;
}

export function TransactionStatus({ 
  txHash, 
  onStatusChange,
  showExplorer = true,
  explorerUrl = 'https://sepolia.etherscan.io'
}: TransactionStatusProps) {
  const [status, setStatus] = useState<'PENDING' | 'CONFIRMED' | 'FAILED'>('PENDING');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/blockchain/status?txHash=${txHash}`);
        const data = await response.json();
        setStatus(data.status);
        onStatusChange?.(data.status);
      } catch (error) {
        console.error('Failed to check transaction status:', error);
        setStatus('FAILED');
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
    
    if (status === 'PENDING') {
      const interval = setInterval(checkStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [txHash, status, onStatusChange]);

  const getStatusIcon = () => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'FAILED':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-600 animate-pulse" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmed';
      case 'FAILED':
        return 'Failed';
      default:
        return loading ? 'Checking...' : 'Pending';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'CONFIRMED':
        return 'text-green-600';
      case 'FAILED':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  return (
    <div className="flex items-center gap-2">
      {getStatusIcon()}
      <span className={cn('text-sm font-medium', getStatusColor())}>
        {getStatusText()}
      </span>
      {showExplorer && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(`${explorerUrl}/tx/${txHash}`, '_blank')}
          className="h-auto p-1"
        >
          <ExternalLink className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}