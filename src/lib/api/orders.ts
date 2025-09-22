export interface OrderItem {
  productId: string;
  quantity: number;
  priceBtc: number;
  priceEur: number;
}

export interface CreateOrderData {
  items: OrderItem[];
  totalBtc: number;
  totalEur: number;
}

export interface Order {
  id: string;
  buyerId: string;
  status: 'PENDING' | 'PAID' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  totalBtc: number;
  totalEur: number;
  paymentHash?: string;
  paymentConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  orderItems: Array<{
    id: string;
    productId: string;
    quantity: number;
    priceBtc: number;
    priceEur: number;
    product: {
      id: string;
      name: string;
      images: string;
    };
  }>;
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class OrdersAPI {
  private baseUrl = '/api/orders';

  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.statusText}`);
    }

    return response.json();
  }

  async getOrders(filters: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}): Promise<OrdersResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`${this.baseUrl}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    return response.json();
  }

  async getOrder(id: string): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch order: ${response.statusText}`);
    }

    return response.json();
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update order status: ${response.statusText}`);
    }

    return response.json();
  }

  async confirmPayment(id: string, paymentHash: string): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/${id}/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentHash }),
    });

    if (!response.ok) {
      throw new Error(`Failed to confirm payment: ${response.statusText}`);
    }

    return response.json();
  }
}

export const ordersAPI = new OrdersAPI();