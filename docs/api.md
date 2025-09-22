# API Documentation

This document provides comprehensive documentation for CryptoShop's RESTful API, including authentication, endpoints, request/response formats, and error handling.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication-endpoints)
  - [Products](#products-endpoints)
  - [Sellers](#sellers-endpoints)
  - [Orders](#orders-endpoints)
  - [Escrow](#escrow-endpoints)
  - [Wallet](#wallet-endpoints)
  - [Support](#support-endpoints)
- [WebSockets](#websockets)
- [Webhooks](#webhooks)
- [Examples](#examples)

## Overview

CryptoShop's API is built on Next.js API Routes and follows RESTful principles. All endpoints return JSON responses and support standard HTTP methods.

### Key Features

- **RESTful Design**: Clean, predictable endpoint structure
- **Type Safety**: Full TypeScript support with Zod validation
- **Authentication**: Anonymous access tokens with optional 2FA
- **Pagination**: Built-in pagination for list endpoints
- **Filtering**: Advanced filtering and sorting capabilities
- **Real-time**: WebSocket support for live updates

## Authentication

CryptoShop uses anonymous authentication with access tokens. No personal information is required to use the platform.

### Access Token Authentication

#### Header Authentication
```http
Authorization: Bearer <access_token>
```

#### Query Parameter Authentication
```http
GET /api/products?access_token=<access_token>
```

#### Request Body Authentication
```json
{
  "access_token": "<access_token>",
  "data": {}
}
```

### Getting an Access Token

#### Register (Create Anonymous Account)
```http
POST /api/auth/register
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123456",
    "accessToken": "cs_xxxxxxxxx_xxxxxxxxxxxx",
    "username": "user_1640995200000",
    "twoFactorEnabled": false,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Login (Existing Account)
```http
POST /api/auth/login
```

**Request:**
```json
{
  "accessToken": "cs_xxxxxxxxx_xxxxxxxxxxxx"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123456",
      "username": "user_1640995200000",
      "twoFactorEnabled": false
    },
    "requires2FA": false
  }
}
```

### Two-Factor Authentication (2FA)

#### Setup 2FA
```http
POST /api/auth/2fa/setup
```

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCodeUrl": "otpauth://totp/CryptoShop?secret=JBSWY3DPEHPK3PXP&issuer=CryptoShop"
  }
}
```

#### Verify 2FA
```http
POST /api/auth/2fa/verify
```

**Request:**
```json
{
  "token": "123456"
}
```

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "backupCodes": ["abc123", "def456", "ghi789"]
  }
}
```

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.cryptoshop.com`

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 100,
    "pages": 9
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Pagination

List endpoints support pagination with the following parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 12 | Items per page (max 100) |

**Example:**
```http
GET /api/products?page=2&limit=24
```

## Error Handling

The API uses standard HTTP status codes and provides detailed error information.

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

### Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_REQUIRED` | Authentication token required |
| `INVALID_TOKEN` | Invalid or expired access token |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `RATE_LIMIT_EXCEEDED` | API rate limit exceeded |
| `INTERNAL_ERROR` | Internal server error |

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Default Limit**: 100 requests per 15 minutes per IP
- **Authenticated Users**: 1000 requests per 15 minutes per user
- **WebSocket Connections**: 10 connections per user

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## API Endpoints

### Authentication Endpoints

#### Register Anonymous User
```http
POST /api/auth/register
```

**Request Body:**
```json
{}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "user_123456",
    "accessToken": "cs_xxxxxxxxx_xxxxxxxxxxxx",
    "username": "user_1640995200000",
    "twoFactorEnabled": false,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Login with Access Token
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "accessToken": "cs_xxxxxxxxx_xxxxxxxxxxxx",
  "rememberDevice": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123456",
      "username": "user_1640995200000",
      "twoFactorEnabled": false
    },
    "requires2FA": false
  }
}
```

#### Setup 2FA
```http
POST /api/auth/2fa/setup
```

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "secret": "JBSWY3DPEHPK3PXP",
    "qrCodeUrl": "otpauth://totp/CryptoShop?secret=JBSWY3DPEHPK3PXP&issuer=CryptoShop"
  }
}
```

#### Verify 2FA
```http
POST /api/auth/2fa/verify
```

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "token": "123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "backupCodes": ["abc123", "def456", "ghi789"]
  }
}
```

#### Logout
```http
POST /api/auth/logout
```

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Products Endpoints

#### Get Products
```http
GET /api/products
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 12 | Items per page |
| `category` | string | All | Product category |
| `search` | string | - | Search query |
| `minPrice` | number | 0 | Minimum BTC price |
| `maxPrice` | number | - | Maximum BTC price |
| `sortBy` | string | rating | Sort field (rating, price, created, popularity) |
| `sortOrder` | string | desc | Sort order (asc, desc) |
| `sellerId` | string | - | Filter by seller |

**Example Request:**
```http
GET /api/products?category=Electronics&minPrice=0.001&maxPrice=0.1&sortBy=price&sortOrder=asc
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "product_123",
      "name": "Premium VPN Subscription",
      "description": "Lifetime VPN subscription with unlimited bandwidth",
      "priceBtc": 0.0025,
      "priceEur": 89.99,
      "category": "Services",
      "images": ["https://example.com/image1.jpg"],
      "tags": ["VPN", "Privacy", "Security"],
      "inStock": true,
      "deliveryTime": "Instant",
      "rating": 4.8,
      "reviewCount": 1247,
      "viewCount": 15420,
      "seller": {
        "id": "seller_456",
        "storeName": "SecureNet",
        "rating": 4.8,
        "user": {
          "username": "securenet",
          "avatar": "https://example.com/avatar.jpg"
        }
      },
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "pages": 4
  }
}
```

#### Get Product by ID
```http
GET /api/products/[id]
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "product_123",
    "name": "Premium VPN Subscription",
    "description": "Lifetime VPN subscription with unlimited bandwidth",
    "priceBtc": 0.0025,
    "priceEur": 89.99,
    "category": "Services",
    "images": ["https://example.com/image1.jpg"],
    "tags": ["VPN", "Privacy", "Security"],
    "inStock": true,
    "stockQuantity": 999,
    "deliveryTime": "Instant",
    "digitalProduct": true,
    "downloadUrl": "https://example.com/download",
    "rating": 4.8,
    "reviewCount": 1247,
    "viewCount": 15420,
    "salesCount": 8934,
    "isActive": true,
    "seller": {
      "id": "seller_456",
      "storeName": "SecureNet",
      "description": "Premium digital services provider",
      "rating": 4.8,
      "reviewCount": 1247,
      "totalSales": 8934,
      "totalRevenue": 45600,
      "responseTime": "2 hours",
      "isOnline": true,
      "user": {
        "username": "securenet",
        "avatar": "https://example.com/avatar.jpg",
        "isVerified": true
      }
    },
    "specifications": [
      {
        "key": "Subscription Type",
        "value": "Lifetime"
      },
      {
        "key": "Devices",
        "value": "Up to 10"
      }
    ],
    "reviews": [
      {
        "id": "review_789",
        "rating": 5,
        "content": "Excellent VPN service!",
        "helpful": 24,
        "user": {
          "username": "crypto_buyer",
          "avatar": "https://example.com/avatar.jpg"
        },
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Create Product
```http
POST /api/products
```

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Premium VPN Subscription",
  "description": "Lifetime VPN subscription with unlimited bandwidth",
  "priceBtc": 0.0025,
  "priceEur": 89.99,
  "category": "Services",
  "images": ["https://example.com/image1.jpg"],
  "tags": ["VPN", "Privacy", "Security"],
  "inStock": true,
  "stockQuantity": 999,
  "deliveryTime": "Instant",
  "digitalProduct": true,
  "downloadUrl": "https://example.com/download",
  "specifications": [
    {
      "key": "Subscription Type",
      "value": "Lifetime"
    },
    {
      "key": "Devices",
      "value": "Up to 10"
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "product_123",
    "name": "Premium VPN Subscription",
    "description": "Lifetime VPN subscription with unlimited bandwidth",
    "priceBtc": 0.0025,
    "priceEur": 89.99,
    "category": "Services",
    "images": ["https://example.com/image1.jpg"],
    "tags": ["VPN", "Privacy", "Security"],
    "inStock": true,
    "stockQuantity": 999,
    "deliveryTime": "Instant",
    "digitalProduct": true,
    "downloadUrl": "https://example.com/download",
    "sellerId": "seller_456",
    "rating": 0,
    "reviewCount": 0,
    "viewCount": 0,
    "salesCount": 0,
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Product
```http
PUT /api/products/[id]
```

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "priceBtc": 0.003,
  "inStock": false
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "product_123",
    "name": "Updated Product Name",
    "priceBtc": 0.003,
    "inStock": false,
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

#### Delete Product
```http
DELETE /api/products/[id]
```

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

### Sellers Endpoints

#### Get Sellers
```http
GET /api/sellers
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 12 | Items per page |
| `category` | string | All | Seller category |
| `search` | string | - | Search query |
| `sortBy` | string | rating | Sort field (rating, sales, products, revenue, joined) |
| `sortOrder` | string | desc | Sort order (asc, desc) |
| `verifiedOnly` | boolean | false | Filter verified sellers only |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "seller_456",
      "storeName": "SecureNet",
      "description": "Premium digital services provider",
      "category": "Services",
      "rating": 4.8,
      "reviewCount": 1247,
      "totalSales": 8934,
      "totalRevenue": 45600,
      "responseTime": "2 hours",
      "isOnline": true,
      "joinedAt": "2024-01-01T00:00:00Z",
      "user": {
        "username": "securenet",
        "avatar": "https://example.com/avatar.jpg",
        "isVerified": true
      },
      "_count": {
        "products": 45
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 342,
    "pages": 29
  }
}
```

#### Get Seller by ID
```http
GET /api/sellers/[id]
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "seller_456",
    "storeName": "SecureNet",
    "description": "Premium digital services provider",
    "category": "Services",
    "rating": 4.8,
    "reviewCount": 1247,
    "totalSales": 8934,
    "totalRevenue": 45600,
    "responseTime": "2 hours",
    "isOnline": true,
    "joinedAt": "2024-01-01T00:00:00Z",
    "user": {
      "username": "securenet",
      "avatar": "https://example.com/avatar.jpg",
      "isVerified": true
    },
    "products": [
      {
        "id": "product_123",
        "name": "Premium VPN Subscription",
        "priceBtc": 0.0025,
        "rating": 4.8,
        "reviewCount": 1247,
        "salesCount": 8934
      }
    ],
    "reviews": [
      {
        "id": "review_789",
        "rating": 5,
        "content": "Excellent seller!",
        "helpful": 45,
        "user": {
          "username": "happy_customer",
          "avatar": "https://example.com/avatar.jpg"
        },
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### Create Seller Profile
```http
POST /api/sellers
```

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "storeName": "SecureNet",
  "description": "Premium digital services provider",
  "category": "Services",
  "responseTime": "2 hours"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "seller_456",
    "userId": "user_123",
    "storeName": "SecureNet",
    "description": "Premium digital services provider",
    "category": "Services",
    "rating": 0,
    "reviewCount": 0,
    "totalSales": 0,
    "totalRevenue": 0,
    "responseTime": "2 hours",
    "isOnline": false,
    "joinedAt": "2024-01-01T00:00:00Z",
    "user": {
      "username": "user_1640995200000",
      "avatar": null,
      "isVerified": false
    }
  }
}
```

#### Update Seller Profile
```http
PUT /api/sellers/[id]
```

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "description": "Updated description",
  "responseTime": "1 hour"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "seller_456",
    "description": "Updated description",
    "responseTime": "1 hour",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

### Orders Endpoints

#### Get Orders
```http
GET /api/orders
```

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 12 | Items per page |
| `status` | string | All | Order status (PENDING, PAID, CONFIRMED, SHIPPED, DELIVERED, COMPLETED, CANCELLED, REFUNDED) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "order_789",
      "buyerId": "user_123",
      "status": "CONFIRMED",
      "totalBtc": 0.0025,
      "totalEur": 89.99,
      "paymentHash": "tx123456789",
      "paymentConfirmed": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "completedAt": null,
      "orderItems": [
        {
          "id": "item_101",
          "productId": "product_123",
          "quantity": 1,
          "priceBtc": 0.0025,
          "priceEur": 89.99,
          "product": {
            "id": "product_123",
            "name": "Premium VPN Subscription",
            "images": ["https://example.com/image1.jpg"]
          }
        }
      ],
      "escrowTransaction": {
        "id": "escrow_202",
        "status": "CONFIRMED",
        "amountBtc": 0.0025,
        "amountEur": 89.99,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 24,
    "pages": 2
  }
}
```

#### Get Order by ID
```http
GET /api/orders/[id]
```

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "order_789",
    "buyerId": "user_123",
    "status": "CONFIRMED",
    "totalBtc": 0.0025,
    "totalEur": 89.99,
    "paymentHash": "tx123456789",
    "paymentConfirmed": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "completedAt": null,
    "orderItems": [
      {
        "id": "item_101",
        "productId": "product_123",
        "quantity": 1,
        "priceBtc": 0.0025,
        "priceEur": 89.99,
        "product": {
          "id": "product_123",
          "name": "Premium VPN Subscription",
          "description": "Lifetime VPN subscription",
          "priceBtc": 0.0025,
          "priceEur": 89.99,
          "images": ["https://example.com/image1.jpg"],
          "seller": {
            "id": "seller_456",
            "storeName": "SecureNet",
            "user": {
              "username": "securenet",
              "avatar": "https://example.com/avatar.jpg"
            }
          }
        }
      }
    ],
    "escrowTransaction": {
      "id": "escrow_202",
      "status": "CONFIRMED",
      "amountBtc": 0.0025,
      "amountEur": 89.99,
      "releaseCode": "ABC123",
      "disputeRaised": false,
      "disputeResolved": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "participants": [
        {
          "userId": "user_123",
          "role": "BUYER",
          "agreedAt": "2024-01-01T00:00:00Z",
          "user": {
            "username": "user_1640995200000",
            "avatar": null
          }
        }
      ]
    }
  }
}
```

#### Create Order
```http
POST /api/orders
```

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": "product_123",
      "quantity": 1
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "order_789",
    "buyerId": "user_123",
    "status": "PENDING",
    "totalBtc": 0.0025,
    "totalEur": 89.99,
    "createdAt": "2024-01-01T00:00:00Z",
    "orderItems": [
      {
        "id": "item_101",
        "productId": "product_123",
        "quantity": 1,
        "priceBtc": 0.0025,
        "priceEur": 89.99
      }
    ]
  }
}
```

#### Update Order Status
```http
PUT /api/orders/[id]
```

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "CONFIRMED",
  "paymentHash": "tx123456789"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "order_789",
    "status": "CONFIRMED",
    "paymentHash": "tx123456789",
    "paymentConfirmed": true,
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

### Escrow Endpoints

#### Get Escrow Transactions
```http
GET /api/escrow
```

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 12 | Items per page |
| `status` | string | All | Escrow status (PENDING, FUNDED, CONFIRMED, RELEASED, REFUNDED, DISPUTED) |
| `userId` | string | - | Filter by user ID |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "escrow_202",
      "orderId": "order_789",
      "amountBtc": 0.0025,
      "amountEur": 89.99,
      "status": "CONFIRMED",
      "releaseCode": "ABC123",
      "disputeRaised": false,
      "disputeResolved": false,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "order": {
        "id": "order_789",
        "buyer": {
          "username": "user_1640995200000",
          "avatar": null
        },
        "orderItems": [
          {
            "id": "item_101",
            "quantity": 1,
            "product": {
              "id": "product_123",
              "name": "Premium VPN Subscription",
              "seller": {
                "id": "seller_456",
                "name": "SecureNet",
                "user": {
                  "username": "securenet",
                  "avatar": "https://example.com/avatar.jpg"
                }
              }
            }
          }
        ]
      },
      "participants": [
        {
          "id": "participant_303",
          "userId": "user_123",
          "role": "BUYER",
          "agreedAt": "2024-01-01T00:00:00Z",
          "user": {
            "username": "user_1640995200000",
            "avatar": null
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 5,
    "pages": 1
  }
}
```

#### Get Escrow Transaction by ID
```http
GET /api/escrow/[id]
```

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "escrow_202",
    "orderId": "order_789",
    "amountBtc": 0.0025,
    "amountEur": 89.99,
    "status": "CONFIRMED",
    "releaseCode": "ABC123",
    "disputeRaised": false,
    "disputeResolved": false,
    "fundedAt": "2024-01-01T00:00:00Z",
    "confirmedAt": "2024-01-01T01:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T01:00:00Z",
    "order": {
      "id": "order_789",
      "buyer": {
        "username": "user_1640995200000",
        "avatar": null
      },
      "orderItems": [
        {
          "id": "item_101",
          "quantity": 1,
          "product": {
            "id": "product_123",
            "name": "Premium VPN Subscription",
            "seller": {
              "id": "seller_456",
              "name": "SecureNet",
              "user": {
                "username": "securenet",
                "avatar": "https://example.com/avatar.jpg"
              }
            }
          }
        }
      ]
    },
    "participants": [
      {
        "id": "participant_303",
        "userId": "user_123",
        "role": "BUYER",
        "agreedAt": "2024-01-01T00:00:00Z",
        "user": {
          "username": "user_1640995200000",
          "avatar": null
        }
      },
      {
        "id": "participant_304",
        "userId": "user_456",
        "role": "SELLER",
        "agreedAt": "2024-01-01T01:00:00Z",
        "user": {
          "username": "securenet",
          "avatar": "https://example.com/avatar.jpg"
        }
      }
    ]
  }
}
```

#### Create Escrow Transaction
```http
POST /api/escrow
```

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "orderId": "order_789",
  "releaseCode": "ABC123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "escrow_202",
    "orderId": "order_789",
    "userId": "user_123",
    "amountBtc": 0.0025,
    "amountEur": 89.99,
    "status": "PENDING",
    "releaseCode": "$2a$10$hashed_release_code",
    "disputeRaised": false,
    "disputeResolved": false,
    "createdAt": "2024-01-01T00:00:00Z",
    "participants": [
      {
        "id": "participant_303",
        "userId": "user_123",
        "role": "BUYER",
        "agreedAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### Release Escrow Funds
```http
POST /api/escrow/[id]/release
```

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "releaseCode": "ABC123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "escrow_202",
    "status": "RELEASED",
    "releasedAt": "2024-01-01T12:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

#### Raise Escrow Dispute
```http
POST /api/escrow/[id]/dispute
```

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "reason": "Product not as described"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "escrow_202",
    "status": "DISPUTED",
    "disputeRaised": true,
    "disputeReason": "Product not as described",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

### Wallet Endpoints

#### Get Wallet
```http
GET /api/wallet
```

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "wallet_404",
    "userId": "user_123",
    "balanceBtc": 1.2345,
    "balanceEur": 45678.90,
    "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "transactions": [
      {
        "id": "tx_505",
        "type": "DEPOSIT",
        "amountBtc": 0.1,
        "amountEur": 4567.89,
        "description": "Bitcoin deposit",
        "hash": "tx123456789",
        "status": "CONFIRMED",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### Create Wallet
```http
POST /api/wallet
```

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "wallet_404",
    "userId": "user_123",
    "balanceBtc": 0,
    "balanceEur": 0,
    "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Wallet Address
```http
PUT /api/wallet
```

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "wallet_404",
    "address": "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

### Support Endpoints

#### Get Support Tickets
```http
GET /api/support
```

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 12 | Items per page |
| `status` | string | All | Ticket status (OPEN, IN_PROGRESS, RESOLVED, CLOSED) |
| `category` | string | All | Ticket category |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "ticket_606",
      "userId": "user_123",
      "subject": "Product not delivered",
      "content": "I ordered a product but haven't received it yet.",
      "status": "OPEN",
      "priority": "MEDIUM",
      "category": "Delivery",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "resolvedAt": null,
      "messages": [
        {
          "id": "msg_707",
          "content": "Thank you for contacting support. We'll look into this issue.",
          "isStaff": true,
          "createdAt": "2024-01-01T01:00:00Z",
          "user": {
            "username": "support_agent",
            "avatar": "https://example.com/avatar.jpg"
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 3,
    "pages": 1
  }
}
```

#### Create Support Ticket
```http
POST /api/support
```

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "subject": "Product not delivered",
  "content": "I ordered a product but haven't received it yet.",
  "priority": "MEDIUM",
  "category": "Delivery"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "ticket_606",
    "userId": "user_123",
    "subject": "Product not delivered",
    "content": "I ordered a product but haven't received it yet.",
    "status": "OPEN",
    "priority": "MEDIUM",
    "category": "Delivery",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### Get Support Ticket by ID
```http
GET /api/support/[id]
```

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "ticket_606",
    "userId": "user_123",
    "subject": "Product not delivered",
    "content": "I ordered a product but haven't received it yet.",
    "status": "OPEN",
    "priority": "MEDIUM",
    "category": "Delivery",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "resolvedAt": null,
    "messages": [
      {
        "id": "msg_707",
        "ticketId": "ticket_606",
        "userId": "user_123",
        "content": "I ordered a product but haven't received it yet.",
        "isStaff": false,
        "createdAt": "2024-01-01T00:00:00Z",
        "user": {
          "username": "user_1640995200000",
          "avatar": null
        }
      },
      {
        "id": "msg_708",
        "ticketId": "ticket_606",
        "userId": "staff_789",
        "content": "Thank you for contacting support. We'll look into this issue.",
        "isStaff": true,
        "createdAt": "2024-01-01T01:00:00Z",
        "user": {
          "username": "support_agent",
          "avatar": "https://example.com/avatar.jpg"
        }
      }
    ]
  }
}
```

#### Add Message to Support Ticket
```http
POST /api/support/[id]/messages
```

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "content": "Here's more information about my issue."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "msg_709",
    "ticketId": "ticket_606",
    "userId": "user_123",
    "content": "Here's more information about my issue.",
    "isStaff": false,
    "createdAt": "2024-01-01T02:00:00Z",
    "user": {
      "username": "user_1640995200000",
      "avatar": null
    }
  }
}
```

## WebSockets

CryptoShop uses Socket.io for real-time communication. Connect to the WebSocket endpoint to receive live updates.

### Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    accessToken: 'your-access-token'
  }
});

socket.on('connect', () => {
  console.log('Connected to WebSocket');
});

socket.on('disconnect', () => {
  console.log('Disconnected from WebSocket');
});
```

### Authentication

```javascript
socket.emit('authenticate', {
  accessToken: 'your-access-token'
});
```

### Events

#### Order Updates
```javascript
socket.on('order:updated', (data) => {
  console.log('Order updated:', data);
});

// Example data
{
  "orderId": "order_789",
  "status": "CONFIRMED",
  "message": "Your order has been confirmed"
}
```

#### Escrow Updates
```javascript
socket.on('escrow:updated', (data) => {
  console.log('Escrow updated:', data);
});

// Example data
{
  "escrowId": "escrow_202",
  "status": "RELEASED",
  "message": "Funds have been released to the seller"
}
```

#### Support Messages
```javascript
socket.on('support:new_message', (data) => {
  console.log('New support message:', data);
});

// Example data
{
  "ticketId": "ticket_606",
  "message": {
    "id": "msg_709",
    "content": "Here's more information about my issue.",
    "isStaff": false,
    "user": {
      "username": "user_1640995200000",
      "avatar": null
    },
    "createdAt": "2024-01-01T02:00:00Z"
  }
}
```

#### Notifications
```javascript
socket.on('notification', (data) => {
  console.log('New notification:', data);
});

// Example data
{
  "id": "notif_808",
  "type": "ORDER_CONFIRMED",
  "title": "Order Confirmed",
  "message": "Your order has been confirmed",
  "data": {
    "orderId": "order_789"
  },
  "createdAt": "2024-01-01T01:00:00Z"
}
```

## Webhooks

CryptoShop supports webhooks for real-time notifications about important events.

### Configuration

Webhooks can be configured in the application settings or via API:

```http
POST /api/webhooks
```

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "url": "https://your-webhook-url.com/endpoint",
  "events": ["order.created", "escrow.released", "support.message"],
  "secret": "your-webhook-secret"
}
```

### Webhook Events

| Event | Description | Payload |
|-------|-------------|---------|
| `order.created` | New order created | Order object |
| `order.updated` | Order status changed | Order object |
| `escrow.created` | Escrow transaction created | Escrow object |
| `escrow.updated` | Escrow status changed | Escrow object |
| `escrow.released` | Escrow funds released | Escrow object |
| `escrow.disputed` | Escrow dispute raised | Escrow object |
| `support.ticket_created` | Support ticket created | Ticket object |
| `support.message_created` | Support message created | Message object |

### Webhook Payload Example

```json
{
  "event": "order.created",
  "timestamp": "2024-01-01T00:00:00Z",
  "data": {
    "id": "order_789",
    "buyerId": "user_123",
    "status": "PENDING",
    "totalBtc": 0.0025,
    "totalEur": 89.99,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Webhook Security

Webhooks include a signature header for verification:

```http
X-Webhook-Signature: sha256=signature
```

**Verification Example (Node.js):**
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');
  
  return signature === `sha256=${expectedSignature}`;
}
```

## Examples

### Basic Usage Examples

#### 1. Register and Create First Product

```javascript
// Register user
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
});
const { data: { accessToken } } = await registerResponse.json();

// Create seller profile
const sellerResponse = await fetch('/api/sellers', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    storeName: 'My Store',
    description: 'Amazing digital products',
    category: 'Digital Goods',
    responseTime: '1 hour'
  })
});

// Create product
const productResponse = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Digital Art Collection',
    description: 'Beautiful digital artwork',
    priceBtc: 0.001,
    priceEur: 35.99,
    category: 'Art & Design',
    images: ['https://example.com/art.jpg'],
    tags: ['Art', 'Digital', 'NFT'],
    inStock: true,
    deliveryTime: 'Instant',
    digitalProduct: true
  })
});
```

#### 2. Browse and Purchase Products

```javascript
// Get products with filters
const productsResponse = await fetch('/api/products?category=Art&minPrice=0.0005&maxPrice=0.01&sortBy=rating&sortOrder=desc');
const { data: products } = await productsResponse.json();

// Create order
const orderResponse = await fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    items: [
      {
        productId: products[0].id,
        quantity: 1
      }
    ]
  })
});
const { data: order } = await orderResponse.json();

// Create escrow transaction
const escrowResponse = await fetch('/api/escrow', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    orderId: order.id,
    releaseCode: generateRandomCode()
  })
});
```

#### 3. Setup Real-time Notifications

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    accessToken: 'your-access-token'
  }
});

socket.on('connect', () => {
  console.log('Connected');
});

socket.on('order:updated', (data) => {
  if (data.status === 'CONFIRMED') {
    showNotification('Order confirmed!', 'success');
  }
});

socket.on('escrow:updated', (data) => {
  if (data.status === 'RELEASED') {
    showNotification('Funds released to seller', 'info');
  }
});

function showNotification(message, type) {
  // Show notification in UI
}
```

### Error Handling Examples

#### 1. Handling API Errors

```javascript
async function apiCall(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    
    // Handle specific errors
    if (error.message.includes('Authentication required')) {
      // Redirect to login
    } else if (error.message.includes('Rate limit exceeded')) {
      // Show rate limit message
    } else {
      // Show generic error message
    }
    
    throw error;
  }
}
```

#### 2. Handling WebSocket Errors

```javascript
socket.on('connect_error', (error) => {
  console.error('WebSocket connection error:', error);
  
  if (error.message.includes('Authentication failed')) {
    // Re-authenticate
  } else {
    // Show connection error
  }
});

socket.on('error', (error) => {
  console.error('WebSocket error:', error);
});
```

### Advanced Usage Examples

#### 1. Implementing Pagination

```javascript
class ProductPaginator {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.currentPage = 1;
    this.totalPages = 1;
    this.products = [];
  }
  
  async loadPage(page = 1, filters = {}) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '12',
      ...filters
    });
    
    const response = await fetch(`/api/products?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`
      }
    });
    
    const { data, pagination } = await response.json();
    
    this.currentPage = pagination.page;
    this.totalPages = pagination.pages;
    this.products = data;
    
    return { products: data, pagination };
  }
  
  async nextPage() {
    if (this.currentPage < this.totalPages) {
      return await this.loadPage(this.currentPage + 1);
    }
  }
  
  async previousPage() {
    if (this.currentPage > 1) {
      return await this.loadPage(this.currentPage - 1);
    }
  }
}
```

#### 2. Implementing Real-time Search

```javascript
class ProductSearch {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.debounceTimer = null;
  }
  
  search(query, filters = {}) {
    clearTimeout(this.debounceTimer);
    
    return new Promise((resolve) => {
      this.debounceTimer = setTimeout(async () => {
        const params = new URLSearchParams({
          search: query,
          limit: '20',
          ...filters
        });
        
        const response = await fetch(`/api/products?${params}`, {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        });
        
        const { data } = await response.json();
        resolve(data);
      }, 300);
    });
  }
}
```

This comprehensive API documentation provides all the information needed to integrate with CryptoShop's API, from basic authentication to advanced real-time features and webhooks.