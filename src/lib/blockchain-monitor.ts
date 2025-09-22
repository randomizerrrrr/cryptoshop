import { bitcoinWallet } from './bitcoin-wallet';
import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';
import { sendTransactionNotification, sendOrderNotification } from './socket';

export interface TransactionMonitor {
  address: string;
  expectedAmount: number;
  orderId: string;
  status: 'pending' | 'confirmed' | 'expired';
  createdAt: Date;
  confirmedAt?: Date;
  txId?: string;
  confirmations: number;
  requiredConfirmations: number;
}

export interface TransactionEvent {
  type: 'received' | 'confirmed' | 'expired';
  address: string;
  txId?: string;
  amount: number;
  confirmations: number;
  timestamp: Date;
  orderId: string;
}

class BlockchainMonitor {
  private monitors: Map<string, TransactionMonitor> = new Map();
  private eventHandlers: Set<(event: TransactionEvent) => void> = new Set();
  private intervalId?: NodeJS.Timeout;
  private isRunning = false;
  private io?: ServerIO;

  constructor(private checkInterval: number = 30000) { // 30 seconds default
  }

  /**
   * Initialize with Socket.IO server for real-time updates
   */
  initializeSocket(server: NetServer | any): void {
    this.io = new ServerIO(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' ? false : true,
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected to blockchain monitor');

      // Join room for specific address monitoring
      socket.on('monitor-address', (address: string) => {
        socket.join(`address-${address}`);
        console.log(`Client monitoring address: ${address}`);
      });

      // Leave monitoring room
      socket.on('stop-monitoring', (address: string) => {
        socket.leave(`address-${address}`);
        console.log(`Client stopped monitoring address: ${address}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected from blockchain monitor');
      });
    });
  }

  /**
   * Start monitoring blockchain transactions
   */
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.intervalId = setInterval(() => {
      this.checkAllAddresses();
    }, this.checkInterval);
    
    console.log('Blockchain monitor started');
  }

  /**
   * Stop monitoring blockchain transactions
   */
  stop(): void {
    if (!this.isRunning) return;
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    
    this.isRunning = false;
    console.log('Blockchain monitor stopped');
  }

  /**
   * Add an address to monitor for incoming payments
   */
  addMonitor(monitor: Omit<TransactionMonitor, 'confirmations'>): void {
    const fullMonitor: TransactionMonitor = {
      ...monitor,
      confirmations: 0,
    };
    
    this.monitors.set(monitor.address, fullMonitor);
    console.log(`Added monitor for address: ${monitor.address}`);
    
    // Notify connected clients
    if (this.io) {
      this.io.to(`address-${monitor.address}`).emit('monitor-added', {
        address: monitor.address,
        expectedAmount: monitor.expectedAmount,
        orderId: monitor.orderId,
      });
    }
  }

  /**
   * Remove an address from monitoring
   */
  removeMonitor(address: string): void {
    this.monitors.delete(address);
    console.log(`Removed monitor for address: ${address}`);
    
    // Notify connected clients
    if (this.io) {
      this.io.to(`address-${address}`).emit('monitor-removed', { address });
    }
  }

  /**
   * Get monitor status for an address
   */
  getMonitor(address: string): TransactionMonitor | undefined {
    return this.monitors.get(address);
  }

  /**
   * Get all active monitors
   */
  getAllMonitors(): TransactionMonitor[] {
    return Array.from(this.monitors.values());
  }

  /**
   * Add event handler for transaction events
   */
  onEvent(handler: (event: TransactionEvent) => void): void {
    this.eventHandlers.add(handler);
  }

  /**
   * Remove event handler
   */
  offEvent(handler: (event: TransactionEvent) => void): void {
    this.eventHandlers.delete(handler);
  }

  /**
   * Emit event to all handlers and Socket.IO clients
   */
  private emitEvent(event: TransactionEvent): void {
    // Emit to local event handlers
    this.eventHandlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in event handler:', error);
      }
    });

    // Emit to Socket.IO clients
    if (this.io) {
      this.io.to(`address-${event.address}`).emit('transaction-event', event);
      this.io.to(`order-${event.orderId}`).emit('transaction-event', event);

      // Send real-time notifications based on event type
      switch (event.type) {
        case 'received':
          sendTransactionNotification(this.io, event.address, {
            title: 'Payment Received',
            message: `Payment of ${event.amount.toFixed(6)} BTC received`,
            data: {
              txId: event.txId,
              amount: event.amount,
              confirmations: event.confirmations,
            },
            severity: 'success',
          });
          
          sendOrderNotification(this.io, event.orderId, {
            title: 'Payment Detected',
            message: 'Your payment has been detected and is being confirmed',
            data: {
              txId: event.txId,
              amount: event.amount,
              confirmations: event.confirmations,
            },
            severity: 'info',
          });
          break;

        case 'confirmed':
          sendTransactionNotification(this.io, event.address, {
            title: 'Payment Confirmed',
            message: `Payment of ${event.amount.toFixed(6)} BTC confirmed with ${event.confirmations} confirmations`,
            data: {
              txId: event.txId,
              amount: event.amount,
              confirmations: event.confirmations,
            },
            severity: 'success',
          });
          
          sendOrderNotification(this.io, event.orderId, {
            title: 'Order Confirmed',
            message: 'Your payment has been confirmed and your order is being processed',
            data: {
              txId: event.txId,
              amount: event.amount,
              confirmations: event.confirmations,
            },
            severity: 'success',
          });
          break;

        case 'expired':
          sendTransactionNotification(this.io, event.address, {
            title: 'Payment Expired',
            message: `Payment window has expired for ${event.amount.toFixed(6)} BTC`,
            data: {
              expectedAmount: event.amount,
              timeout: 15 * 60 * 1000, // 15 minutes
            },
            severity: 'warning',
          });
          
          sendOrderNotification(this.io, event.orderId, {
            title: 'Payment Expired',
            message: 'The payment window has expired. Please try again.',
            data: {
              expectedAmount: event.amount,
              timeout: 15 * 60 * 1000,
            },
            severity: 'warning',
          });
          break;
      }
    }
  }

  /**
   * Check all monitored addresses for new transactions
   */
  private async checkAllAddresses(): Promise<void> {
    const monitors = Array.from(this.monitors.values());
    
    for (const monitor of monitors) {
      try {
        await this.checkAddress(monitor);
      } catch (error) {
        console.error(`Error checking address ${monitor.address}:`, error);
      }
    }
  }

  /**
   * Check a specific address for new transactions
   */
  private async checkAddress(monitor: TransactionMonitor): Promise<void> {
    // Check if monitor has expired (15 minutes timeout)
    const now = new Date();
    const timeElapsed = now.getTime() - monitor.createdAt.getTime();
    if (timeElapsed > 15 * 60 * 1000 && monitor.status === 'pending') {
      monitor.status = 'expired';
      this.emitEvent({
        type: 'expired',
        address: monitor.address,
        amount: monitor.expectedAmount,
        confirmations: 0,
        timestamp: now,
        orderId: monitor.orderId,
      });
      return;
    }

    // Get transactions for the address
    const transactions = await bitcoinWallet.getAddressTransactions(monitor.address);
    
    // Look for transactions that match our expected amount
    for (const tx of transactions) {
      const txAmount = this.getTransactionAmount(tx, monitor.address);
      
      // Check if this transaction matches our expected amount (with small tolerance for fees)
      const tolerance = 0.000001; // 1 satoshi tolerance
      if (Math.abs(txAmount - monitor.expectedAmount) <= tolerance) {
        
        if (monitor.status === 'pending') {
          // Found a matching transaction
          monitor.status = 'confirmed';
          monitor.txId = tx.hash;
          monitor.confirmedAt = new Date();
          monitor.confirmations = this.getConfirmations(tx);
          
          this.emitEvent({
            type: 'received',
            address: monitor.address,
            txId: tx.hash,
            amount: txAmount,
            confirmations: monitor.confirmations,
            timestamp: new Date(),
            orderId: monitor.orderId,
          });
        }
        
        // Update confirmations
        const newConfirmations = this.getConfirmations(tx);
        if (newConfirmations > monitor.confirmations) {
          monitor.confirmations = newConfirmations;
          
          // Emit confirmation update event
          this.io?.to(`address-${monitor.address}`).emit('confirmation-update', {
            address: monitor.address,
            txId: tx.hash,
            confirmations: monitor.confirmations,
            requiredConfirmations: monitor.requiredConfirmations,
          });
          
          if (monitor.confirmations >= monitor.requiredConfirmations) {
            this.emitEvent({
              type: 'confirmed',
              address: monitor.address,
              txId: tx.hash,
              amount: txAmount,
              confirmations: monitor.confirmations,
              timestamp: new Date(),
              orderId: monitor.orderId,
            });
          }
        }
        
        break; // Found the transaction we're looking for
      }
    }
  }

  /**
   * Extract the amount received by an address from a transaction
   */
  private getTransactionAmount(transaction: any, address: string): number {
    let amount = 0;
    
    for (const output of transaction.out) {
      if (output.script && output.addr === address) {
        amount += output.value / 100000000; // Convert satoshis to BTC
      }
    }
    
    return amount;
  }

  /**
   * Get number of confirmations for a transaction
   */
  private getConfirmations(transaction: any): number {
    if (!transaction.block_height) return 0;
    
    // In a real implementation, you would get the current block height
    // For now, we'll simulate confirmations based on time
    const txTime = new Date(transaction.time * 1000);
    const now = new Date();
    const minutesElapsed = (now.getTime() - txTime.getTime()) / (1000 * 60);
    
    // Simulate confirmations (roughly 1 confirmation per 10 minutes)
    return Math.min(Math.floor(minutesElapsed / 10), 6);
  }

  /**
   * Wait for a payment to be confirmed
   */
  async waitForPayment(
    address: string, 
    expectedAmount: number, 
    orderId: string,
    timeout: number = 15 * 60 * 1000 // 15 minutes
  ): Promise<{ success: boolean; txId?: string; confirmations?: number }> {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        this.offEvent(handler);
        resolve({ success: false });
      }, timeout);

      const handler = (event: TransactionEvent) => {
        if (event.address === address && event.orderId === orderId) {
          if (event.type === 'confirmed' && event.confirmations >= 3) {
            clearTimeout(timeoutId);
            this.offEvent(handler);
            resolve({ 
              success: true, 
              txId: event.txId, 
              confirmations: event.confirmations 
            });
          } else if (event.type === 'expired') {
            clearTimeout(timeoutId);
            this.offEvent(handler);
            resolve({ success: false });
          }
        }
      };

      this.onEvent(handler);

      // Add monitor for this payment
      this.addMonitor({
        address,
        expectedAmount,
        orderId,
        status: 'pending',
        createdAt: new Date(),
        requiredConfirmations: 3,
      });
    });
  }

  /**
   * Get statistics about the monitor
   */
  getStats() {
    const monitors = Array.from(this.monitors.values());
    const pending = monitors.filter(m => m.status === 'pending').length;
    const confirmed = monitors.filter(m => m.status === 'confirmed').length;
    const expired = monitors.filter(m => m.status === 'expired').length;

    return {
      total: monitors.length,
      pending,
      confirmed,
      expired,
      isRunning: this.isRunning,
    };
  }

  /**
   * Get detailed transaction information
   */
  async getTransactionDetails(txId: string): Promise<any> {
    return await bitcoinWallet.getTransaction(txId);
  }

  /**
   * Get address balance and info
   */
  async getAddressInfo(address: string): Promise<{
    balance: number;
    isValid: boolean;
    transactionCount: number;
    transactions: any[];
  }> {
    const isValid = bitcoinWallet.validateAddress(address);
    const balance = await bitcoinWallet.getAddressBalance(address);
    const transactions = await bitcoinWallet.getAddressTransactions(address);

    return {
      balance,
      isValid,
      transactionCount: transactions.length,
      transactions: transactions.slice(0, 10),
    };
  }
}

// Export singleton instance
export const blockchainMonitor = new BlockchainMonitor();

// Auto-start the monitor in development
if (process.env.NODE_ENV === 'development') {
  blockchainMonitor.start();
}