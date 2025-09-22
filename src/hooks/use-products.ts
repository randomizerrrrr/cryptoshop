'use client';

import { useState, useEffect } from 'react';
import { productsAPI, Product, ProductFilters, ProductsResponse } from '@/lib/api/products';

export function useProducts(filters: ProductFilters = {}) {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (filters: ProductFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getProducts(filters);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(filters);
  }, [JSON.stringify(filters)]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchProducts(filters),
    products: data?.products || [],
    pagination: data?.pagination,
  };
}

export function useProduct(id: string) {
  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productsAPI.getProduct(id);
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  return {
    data,
    loading,
    error,
    refetch: fetchProduct,
  };
}