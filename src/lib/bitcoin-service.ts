import ZAI from 'z-ai-web-dev-sdk'

export interface BitcoinPriceData {
  bitcoin: {
    eur: number
    usd: number
    gbp: number
  }
  last_updated: string
}

export interface BitcoinNetworkStats {
  blocks: number
  difficulty: number
  hash_rate: number
  mempool_size: number
  market_cap_usd: number
}

export interface BitcoinTransaction {
  txid: string
  confirmations: number
  value: number
  address: string
  timestamp: number
  status: 'pending' | 'confirmed' | 'failed'
}

class BitcoinService {
  private zai: any = null

  async initialize() {
    try {
      this.zai = await ZAI.create()
      console.log('Bitcoin service initialized successfully')
    } catch (error) {
      console.error('Failed to initialize Bitcoin service:', error)
      throw error
    }
  }

  async getCurrentPrice(): Promise<BitcoinPriceData> {
    try {
      // Use web search to get current Bitcoin prices
      const searchResult = await this.zai.functions.invoke("web_search", {
        query: "current Bitcoin price EUR USD GBP 2024",
        num: 5
      })

      // Extract price information from search results
      const prices = this.extractPricesFromSearch(searchResult)
      
      return {
        bitcoin: {
          eur: prices.eur || 0,
          usd: prices.usd || 0,
          gbp: prices.gbp || 0
        },
        last_updated: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error fetching Bitcoin price:', error)
      // Return fallback data
      return {
        bitcoin: {
          eur: 42000,
          usd: 45000,
          gbp: 35000
        },
        last_updated: new Date().toISOString()
      }
    }
  }

  async getNetworkStats(): Promise<BitcoinNetworkStats> {
    try {
      const searchResult = await this.zai.functions.invoke("web_search", {
        query: "Bitcoin network stats blocks difficulty hash rate mempool market cap 2024",
        num: 5
      })

      const stats = this.extractNetworkStatsFromSearch(searchResult)
      
      return {
        blocks: stats.blocks || 820000,
        difficulty: stats.difficulty || 72000000000000,
        hash_rate: stats.hash_rate || 500000000000000,
        mempool_size: stats.mempool_size || 50000,
        market_cap_usd: stats.market_cap_usd || 880000000000
      }
    } catch (error) {
      console.error('Error fetching network stats:', error)
      // Return fallback data
      return {
        blocks: 820000,
        difficulty: 72000000000000,
        hash_rate: 500000000000000,
        mempool_size: 50000,
        market_cap_usd: 880000000000
      }
    }
  }

  async getTransactionStatus(txid: string): Promise<BitcoinTransaction | null> {
    try {
      const searchResult = await this.zai.functions.invoke("web_search", {
        query: `Bitcoin transaction ${txid} confirmations status block explorer`,
        num: 3
      })

      const txData = this.extractTransactionFromSearch(searchResult, txid)
      
      if (txData) {
        return {
          txid,
          confirmations: txData.confirmations || 0,
          value: txData.value || 0,
          address: txData.address || '',
          timestamp: txData.timestamp || Date.now(),
          status: txData.confirmations >= 3 ? 'confirmed' : 'pending'
        }
      }

      return null
    } catch (error) {
      console.error('Error fetching transaction status:', error)
      return null
    }
  }

  async getExchangeRates(): Promise<{ [key: string]: number }> {
    try {
      const searchResult = await this.zai.functions.invoke("web_search", {
        query: "Bitcoin exchange rates EUR USD GBP JPY CNY CAD AUD 2024",
        num: 5
      })

      const rates = this.extractExchangeRatesFromSearch(searchResult)
      
      return {
        EUR: rates.EUR || 42000,
        USD: rates.USD || 45000,
        GBP: rates.GBP || 35000,
        JPY: rates.JPY || 6500000,
        CNY: rates.CNY || 320000,
        CAD: rates.CAD || 60000,
        AUD: rates.AUD || 68000
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error)
      // Return fallback rates
      return {
        EUR: 42000,
        USD: 45000,
        GBP: 35000,
        JPY: 6500000,
        CNY: 320000,
        CAD: 60000,
        AUD: 68000
      }
    }
  }

  async generateNewAddress(): Promise<string> {
    // In a real implementation, this would generate a new Bitcoin address
    // For now, we'll return a mock address
    return `bc1q${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`
  }

  async validateAddress(address: string): Promise<boolean> {
    // Basic Bitcoin address validation
    const bitcoinAddressRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/
    return bitcoinAddressRegex.test(address)
  }

  private extractPricesFromSearch(searchResult: any[]): { eur: number; usd: number; gbp: number } {
    const prices = { eur: 0, usd: 0, gbp: 0 }
    
    if (searchResult && searchResult.length > 0) {
      // Look for price information in search results
      const text = searchResult.map((result: any) => result.snippet).join(' ')
      
      // Extract USD price
      const usdMatch = text.match(/(\$|USD)\s*([0-9,]+(\.[0-9]+)?)/)
      if (usdMatch) {
        prices.usd = parseFloat(usdMatch[2].replace(',', ''))
      }
      
      // Extract EUR price
      const eurMatch = text.match(/(€|EUR)\s*([0-9,]+(\.[0-9]+)?)/)
      if (eurMatch) {
        prices.eur = parseFloat(eurMatch[2].replace(',', ''))
      }
      
      // Extract GBP price
      const gbpMatch = text.match(/(£|GBP)\s*([0-9,]+(\.[0-9]+)?)/)
      if (gbpMatch) {
        prices.gbp = parseFloat(gbpMatch[2].replace(',', ''))
      }
    }
    
    return prices
  }

  private extractNetworkStatsFromSearch(searchResult: any[]): any {
    const stats: any = {}
    
    if (searchResult && searchResult.length > 0) {
      const text = searchResult.map((result: any) => result.snippet).join(' ')
      
      // Extract block height
      const blockMatch = text.match(/block\s*([0-9,]+)/)
      if (blockMatch) {
        stats.blocks = parseInt(blockMatch[1].replace(',', ''))
      }
      
      // Extract difficulty
      const difficultyMatch = text.match(/difficulty\s*([0-9,]+(\.[0-9]+)?[Ee][+\-]?[0-9]+|[0-9,]+)/)
      if (difficultyMatch) {
        stats.difficulty = parseFloat(difficultyMatch[1].replace(',', ''))
      }
      
      // Extract hash rate
      const hashRateMatch = text.match(/hash\s*rate\s*([0-9,]+(\.[0-9]+)?\s*(EH\/s|TH\/s|GH\/s))/)
      if (hashRateMatch) {
        const value = parseFloat(hashRateMatch[1].replace(',', ''))
        const unit = hashRateMatch[3]
        // Convert to H/s
        if (unit === 'EH/s') stats.hash_rate = value * 1e18
        else if (unit === 'TH/s') stats.hash_rate = value * 1e12
        else if (unit === 'GH/s') stats.hash_rate = value * 1e9
      }
    }
    
    return stats
  }

  private extractTransactionFromSearch(searchResult: any[], txid: string): any {
    if (searchResult && searchResult.length > 0) {
      const text = searchResult.map((result: any) => result.snippet).join(' ')
      
      // Look for transaction information
      const confirmationsMatch = text.match(/confirmations?\s*([0-9]+)/)
      const valueMatch = text.match(/([0-9,]+(\.[0-9]+)?)\s*BTC/)
      
      return {
        confirmations: confirmationsMatch ? parseInt(confirmationsMatch[1]) : 0,
        value: valueMatch ? parseFloat(valueMatch[1].replace(',', '')) : 0,
        address: '', // Would need more sophisticated parsing
        timestamp: Date.now()
      }
    }
    
    return null
  }

  private extractExchangeRatesFromSearch(searchResult: any[]): { [key: string]: number } {
    const rates: { [key: string]: number } = {}
    
    if (searchResult && searchResult.length > 0) {
      const text = searchResult.map((result: any) => result.snippet).join(' ')
      
      // Extract various currency rates
      const currencies = ['EUR', 'USD', 'GBP', 'JPY', 'CNY', 'CAD', 'AUD']
      
      currencies.forEach(currency => {
        const match = text.match(new RegExp(`${currency}\\s*([0-9,]+(\\.[0-9]+)?)`))
        if (match) {
          rates[currency] = parseFloat(match[1].replace(',', ''))
        }
      })
    }
    
    return rates
  }
}

export const bitcoinService = new BitcoinService()