export interface Product {
  id: string;
  name: string;
  description: string;
  priceBtc: number;
  priceEur: number;
  images: string;
  category: string;
  tags?: string;
  inStock: boolean;
  stockQuantity: number;
  deliveryTime: string;
  digitalProduct: boolean;
  downloadUrl?: string;
  isActive: boolean;
  views: number;
  sellerId: string;
  createdAt: Date;
  updatedAt: Date;
  seller: {
    id: string;
    userId: string;
    storeName: string;
    description?: string;
    verified: boolean;
    rating: number;
    totalSales: number;
    user: {
      username: string;
      avatar?: string;
    };
  };
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductFilters {
  category?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  sellerId?: string;
  page?: number;
  limit?: number;
}

class ProductsAPI {
  private baseUrl = '/api/products';

  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }

    return response.json();
  }

  async getProduct(id: string): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    return response.json();
  }

  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'seller'>): Promise<Product> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create product: ${response.statusText}`);
    }

    return response.json();
  }

  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update product: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteProduct(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete product: ${response.statusText}`);
    }
  }
}

export const productsAPI = new ProductsAPI();