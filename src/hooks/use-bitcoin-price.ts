'use client';

import { useState, useEffect } from 'react';
import { bitcoinAPI, BitcoinPrice } from '@/lib/api/bitcoin';

export function useBitcoinPrice(refreshInterval: number = 60000) { // 1 minute default
  const [data, setData] = useState<BitcoinPrice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = async () => {
    try {
      setLoading(true);
      setError(null);
      const priceData = await bitcoinAPI.getCurrentPrice();
      setData(priceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Bitcoin price');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();

    if (refreshInterval > 0) {
      const interval = setInterval(fetchPrice, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval]);

  return {
    data,
    loading,
    error,
    refetch: fetchPrice,
    currentPrice: data?.price || 36000, // Fallback price
    priceChange: data?.price_24h_change || 0,
  };
}

export function useBitcoinPriceHistory(days: number = 7) {
  const [data, setData] = useState<Array<{ timestamp: string; price: number }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const history = await bitcoinAPI.getPriceHistory(days);
      setData(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Bitcoin price history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [days]);

  return {
    data,
    loading,
    error,
    refetch: fetchHistory,
  };
}

export function useBitcoinConverter() {
  const { currentPrice } = useBitcoinPrice();

  const btcToEur = (btcAmount: number): number => {
    return btcAmount * currentPrice;
  };

  const eurToBtc = (eurAmount: number): number => {
    return eurAmount / currentPrice;
  };

  const formatBtc = (btcAmount: number): string => {
    return btcAmount.toFixed(8);
  };

  const formatEur = (eurAmount: number): string => {
    return eurAmount.toFixed(2);
  };

  return {
    btcToEur,
    eurToBtc,
    formatBtc,
    formatEur,
    currentPrice,
  };
}