import { NextRequest, NextResponse } from 'next/server';
import { generateBitcoinAddress, generateDepositAddress } from '@/lib/bitcoin-wallet';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, id } = body;

    if (!type || !id) {
      return NextResponse.json(
        { error: 'Type and ID are required' },
        { status: 400 }
      );
    }

    let addressInfo;

    switch (type) {
      case 'order':
        addressInfo = generateBitcoinAddress(id);
        break;
      case 'deposit':
        addressInfo = generateDepositAddress(id);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be "order" or "deposit"' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      address: addressInfo.address,
      privateKey: addressInfo.privateKey, // In production, this should be stored securely
      publicKey: addressInfo.publicKey,
      derivationPath: addressInfo.derivationPath,
      qrCode: `bitcoin:${addressInfo.address}`,
    });

  } catch (error) {
    console.error('Error generating Bitcoin address:', error);
    return NextResponse.json(
      { error: 'Failed to generate Bitcoin address' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { error: 'Address is required' },
      { status: 400 }
    );
  }

  try {
    const { bitcoinWallet } = await import('@/lib/bitcoin-wallet');
    
    const isValid = bitcoinWallet.validateAddress(address);
    const balance = await bitcoinWallet.getAddressBalance(address);
    const transactions = await bitcoinWallet.getAddressTransactions(address);

    return NextResponse.json({
      success: true,
      address,
      isValid,
      balance,
      transactionCount: transactions.length,
      transactions: transactions.slice(0, 10), // Return last 10 transactions
    });

  } catch (error) {
    console.error('Error fetching address info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch address information' },
      { status: 500 }
    );
  }
}