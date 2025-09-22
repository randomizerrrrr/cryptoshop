import { db } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import speakeasy from 'speakeasy';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import { User, Session } from 'next-auth';

// Extend NextAuth types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      username: string;
      isSeller: boolean;
      isVerified: boolean;
      accessToken: string;
      bitcoinAddress?: string;
    };
  }

  interface User {
    id: string;
    email: string;
    username: string;
    isSeller: boolean;
    isVerified: boolean;
    accessToken: string;
    bitcoinAddress?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    username: string;
    isSeller: boolean;
    isVerified: boolean;
    accessToken: string;
    bitcoinAddress?: string;
  }
}

// Generate a unique access token
export function generateAccessToken(): string {
  const prefix = 'cs_'; // CryptoShop prefix
  const randomPart = uuidv4().replace(/-/g, '').substring(0, 16);
  const timestamp = Date.now().toString(36);
  return `${prefix}${timestamp}_${randomPart}`;
}

// Validate access token format
export function validateAccessTokenFormat(token: string): boolean {
  const tokenRegex = /^cs_[a-z0-9]+_[a-f0-9]{16}$/;
  return tokenRegex.test(token);
}

// Authenticate user by access token
export async function authenticateUser(accessToken: string) {
  if (!validateAccessTokenFormat(accessToken)) {
    return null;
  }

  try {
    const user = await db.user.findUnique({
      where: { accessToken },
      include: {
        seller: true,
        wallet: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}

// Generate 2FA secret
export function generate2FASecret(username: string): { secret: string; qrCodeUrl: string } {
  const secret = speakeasy.generateSecret({
    name: `CryptoShop (${username})`,
    issuer: 'CryptoShop',
  });

  return {
    secret: secret.base32!,
    qrCodeUrl: secret.otpauth_url!,
  };
}

// Verify 2FA token
export function verify2FAToken(token: string, secret: string): boolean {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    window: 2, // Allow 2 steps of clock drift
  });
}

// Generate backup codes for 2FA
export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    codes.push(Math.random().toString(36).substring(2, 8).toUpperCase());
  }
  return codes;
}

// Middleware to check authentication
export async function requireAuth(request: Request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const accessToken = authHeader.substring(7);
  const user = await authenticateUser(accessToken);

  return user;
}

// Middleware to check if user is a seller
export async function requireSeller(request: Request) {
  const user = await requireAuth(request);
  
  if (!user || !user.isSeller || !user.seller) {
    return null;
  }

  return user;
}

// NextAuth configuration
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        twoFactorToken: { label: '2FA Token', type: 'text', required: false },
        bitcoinSignature: { label: 'Bitcoin Signature', type: 'text', required: false },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Find user by email
          const user = await db.user.findUnique({
            where: { email: credentials.email },
            include: {
              seller: true,
              wallet: true,
            },
          });

          if (!user) {
            return null;
          }

          // Verify password (in production, use bcrypt)
          if (user.password !== credentials.password) {
            return null;
          }

          // Check 2FA if enabled
          if (user.twoFactorEnabled && user.twoFactorSecret) {
            if (!credentials.twoFactorToken) {
              throw new Error('2FA token required');
            }
            
            if (!verify2FAToken(credentials.twoFactorToken, user.twoFactorSecret)) {
              return null;
            }
          }

          // Verify Bitcoin signature if provided
          if (credentials.bitcoinSignature && user.bitcoinAddress) {
            // In production, verify the signature against the user's Bitcoin address
            // This is a placeholder for Bitcoin signature verification
            console.log('Bitcoin signature verification would happen here');
          }

          // Update last login
          await db.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });

          return {
            id: user.id,
            email: user.email,
            username: user.username,
            isSeller: user.isSeller,
            isVerified: user.isVerified,
            accessToken: user.accessToken,
            bitcoinAddress: user.bitcoinAddress,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.username = user.username;
        token.isSeller = user.isSeller;
        token.isVerified = user.isVerified;
        token.accessToken = user.accessToken;
        token.bitcoinAddress = user.bitcoinAddress;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email,
          username: token.username,
          isSeller: token.isSeller,
          isVerified: token.isVerified,
          accessToken: token.accessToken,
          bitcoinAddress: token.bitcoinAddress,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
};

// Export NextAuth handler
export const handler = NextAuth(authOptions);