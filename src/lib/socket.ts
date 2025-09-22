import { Server } from 'socket.io';

export interface NotificationEvent {
  type: 'transaction' | 'order' | 'system' | 'payment';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  severity: 'info' | 'success' | 'warning' | 'error';
}

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Handle joining rooms for specific notifications
    socket.on('join-room', (room: string) => {
      socket.join(room);
      console.log(`Client ${socket.id} joined room: ${room}`);
    });

    // Handle leaving rooms
    socket.on('leave-room', (room: string) => {
      socket.leave(room);
      console.log(`Client ${socket.id} left room: ${room}`);
    });

    // Handle monitoring specific addresses for blockchain events
    socket.on('monitor-address', (address: string) => {
      socket.join(`address-${address}`);
      console.log(`Client ${socket.id} monitoring address: ${address}`);
    });

    // Handle monitoring specific orders
    socket.on('monitor-order', (orderId: string) => {
      socket.join(`order-${orderId}`);
      console.log(`Client ${socket.id} monitoring order: ${orderId}`);
    });

    // Handle user-specific notifications
    socket.on('register-user', (userId: string) => {
      socket.join(`user-${userId}`);
      console.log(`Client ${socket.id} registered as user: ${userId}`);
    });

    // Handle messages (legacy support)
    socket.on('message', (msg: { text: string; senderId: string }) => {
      // Echo: broadcast message only the client who send the message
      socket.emit('message', {
        text: `Echo: ${msg.text}`,
        senderId: 'system',
        timestamp: new Date().toISOString(),
      });
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to CryptoShop Real-time Notifications!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });

    // Send initial notification
    socket.emit('notification', {
      type: 'system',
      title: 'Connected',
      message: 'You are now connected to real-time notifications',
      timestamp: new Date(),
      severity: 'info' as const,
    } as NotificationEvent);
  });
};

// Utility functions to send notifications
export const sendNotification = (
  io: Server, 
  event: NotificationEvent, 
  room?: string
) => {
  if (room) {
    io.to(room).emit('notification', event);
  } else {
    io.emit('notification', event);
  }
};

export const sendTransactionNotification = (
  io: Server,
  address: string,
  event: Omit<NotificationEvent, 'type'> & { type?: 'transaction' }
) => {
  const notification: NotificationEvent = {
    type: 'transaction',
    ...event,
    timestamp: new Date(),
  };
  
  io.to(`address-${address}`).emit('notification', notification);
};

export const sendOrderNotification = (
  io: Server,
  orderId: string,
  event: Omit<NotificationEvent, 'type'> & { type?: 'order' }
) => {
  const notification: NotificationEvent = {
    type: 'order',
    ...event,
    timestamp: new Date(),
  };
  
  io.to(`order-${orderId}`).emit('notification', notification);
};

export const sendUserNotification = (
  io: Server,
  userId: string,
  event: Omit<NotificationEvent, 'type'>
) => {
  const notification: NotificationEvent = {
    type: 'system',
    ...event,
    timestamp: new Date(),
  };
  
  io.to(`user-${userId}`).emit('notification', notification);
};