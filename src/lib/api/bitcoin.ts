export interface BitcoinPrice {
  symbol: string;
  price: number;
  price_24h_change: number;
  volume_24h: number;
  market_cap: number;
  last_updated: string;
}

export interface BitcoinPriceHistory {
  timestamp: string;
  price: number;
}

class BitcoinAPI {
  private baseUrl = 'https://api.coingecko.com/api/v3';

  async getCurrentPrice(): Promise<BitcoinPrice> {
    try {
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=bitcoin&vs_currencies=eur&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true&last_updated=true`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch Bitcoin price: ${response.statusText}`);
      }

      const data = await response.json();
      const bitcoin = data.bitcoin;

      return {
        symbol: 'BTC',
        price: bitcoin.eur,
        price_24h_change: bitcoin.eur_24h_change,
        volume_24h: bitcoin.eur_24h_vol,
        market_cap: bitcoin.eur_market_cap,
        last_updated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching Bitcoin price:', error);
      // Fallback to a fixed price if API fails
      return {
        symbol: 'BTC',
        price: 36000, // Fallback price
        price_24h_change: 0,
        volume_24h: 0,
        market_cap: 0,
        last_updated: new Date().toISOString(),
      };
    }
  }

  async getPriceHistory(days: number = 7): Promise<BitcoinPriceHistory[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/coins/bitcoin/market_chart?vs_currency=eur&days=${days}&interval=daily`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch Bitcoin price history: ${response.statusText}`);
      }

      const data = await response.json();
      
      return data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp: new Date(timestamp).toISOString(),
        price,
      }));
    } catch (error) {
      console.error('Error fetching Bitcoin price history:', error);
      // Fallback to empty array
      return [];
    }
  }

  async convertBtcToEur(btcAmount: number): Promise<number> {
    const priceData = await this.getCurrentPrice();
    return btcAmount * priceData.price;
  }

  async convertEurToBtc(eurAmount: number): Promise<number> {
    const priceData = await this.getCurrentPrice();
    return eurAmount / priceData.price;
  }

  // Alternative API using CoinGecko's public API (no API key required)
  async getAlternativePrice(): Promise<number> {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCEUR');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch alternative price: ${response.statusText}`);
      }

      const data = await response.json();
      return parseFloat(data.price);
    } catch (error) {
      console.error('Error fetching alternative Bitcoin price:', error);
      return 36000; // Fallback price
    }
  }
}

export const bitcoinAPI = new BitcoinAPI();