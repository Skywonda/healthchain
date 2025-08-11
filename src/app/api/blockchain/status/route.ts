// app/api/blockchain/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBlockchainService } from '@/lib/blockchain';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const txHash = searchParams.get('txHash');

    if (!txHash) {
      return NextResponse.json({ message: 'Transaction hash required' }, { status: 400 });
    }

    try {
      const blockchainService = getBlockchainService();
      const status = await blockchainService.getTransactionStatus(txHash);
      return NextResponse.json({ txHash, status });
    } catch (error) {
      console.error('Blockchain status error:', error);
      return NextResponse.json({ message: 'Failed to get transaction status', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }

  } catch (error) {
    console.error('Blockchain status error:', error);
    return NextResponse.json(
      { message: 'Failed to get transaction status' },
      { status: 500 }
    );
  }
}