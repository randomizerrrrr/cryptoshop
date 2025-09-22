import { NextRequest, NextResponse } from 'next/server'
import { bitcoinService } from '@/lib/bitcoin-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'price'
    
    // Initialize the service if not already initialized
    await bitcoinService.initialize()
    
    switch (type) {
      case 'price':
        const priceData = await bitcoinService.getCurrentPrice()
        return NextResponse.json(priceData)
        
      case 'network':
        const networkStats = await bitcoinService.getNetworkStats()
        return NextResponse.json(networkStats)
        
      case 'rates':
        const exchangeRates = await bitcoinService.getExchangeRates()
        return NextResponse.json(exchangeRates)
        
      case 'transaction':
        const txid = searchParams.get('txid')
        if (!txid) {
          return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 })
        }
        const transaction = await bitcoinService.getTransactionStatus(txid)
        return NextResponse.json(transaction)
        
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 })
    }
  } catch (error) {
    console.error('Bitcoin API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()
    
    // Initialize the service if not already initialized
    await bitcoinService.initialize()
    
    switch (action) {
      case 'generateAddress':
        const address = await bitcoinService.generateNewAddress()
        return NextResponse.json({ address })
        
      case 'validateAddress':
        if (!data?.address) {
          return NextResponse.json({ error: 'Address required' }, { status: 400 })
        }
        const isValid = await bitcoinService.validateAddress(data.address)
        return NextResponse.json({ valid: isValid })
        
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Bitcoin API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}