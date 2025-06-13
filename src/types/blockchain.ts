export interface BlockchainTransaction {
  hash: string;
  blockNumber?: number;
  from: string;
  to: string;
  gasUsed?: string;
  gasPrice?: string;
  timestamp: Date;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
}

export interface SmartContractEvent {
  eventName: string;
  transactionHash: string;
  blockNumber: number;
  args: Record<string, any>;
  timestamp: Date;
}

export interface WalletConnection {
  address: string;
  provider: string;
  chainId: number;
  isConnected: boolean;
}