import * as bitcoin from 'bitcoinjs-lib';
import * as tinysecp from 'tiny-secp256k1';
import BIP32Factory from 'bip32';
import * as bip39 from 'bip39';

// Enable BIP32 with tiny-secp256k1
const bip32 = BIP32Factory(tinysecp);

export interface BitcoinWallet {
  address: string;
  privateKey: string;
  publicKey: string;
  derivationPath: string;
}

export interface HDWallet {
  mnemonic: string;
  masterPrivateKey: string;
  masterPublicKey: string;
}

export class BitcoinWalletManager {
  private network: bitcoin.Network;

  constructor(network: bitcoin.Network = bitcoin.networks.bitcoin) {
    this.network = network;
  }

  /**
   * Generate a new HD wallet with mnemonic
   */
  generateHDWallet(): HDWallet {
    // Generate mnemonic
    const mnemonic = bip39.generateMnemonic();
    
    // Generate master key from mnemonic
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const masterKey = bip32.fromSeed(seed, this.network);
    
    return {
      mnemonic,
      masterPrivateKey: masterKey.toBase58(),
      masterPublicKey: masterKey.neutered().toBase58(),
    };
  }

  /**
   * Restore HD wallet from mnemonic
   */
  restoreHDWallet(mnemonic: string): HDWallet {
    if (!bip39.validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic');
    }
    
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const masterKey = bip32.fromSeed(seed, this.network);
    
    return {
      mnemonic,
      masterPrivateKey: masterKey.toBase58(),
      masterPublicKey: masterKey.neutered().toBase58(),
    };
  }

  /**
   * Generate a Bitcoin address from HD wallet
   */
  generateAddressFromHD(
    masterPrivateKey: string, 
    derivationPath: string = "m/44'/0'/0'/0/0"
  ): BitcoinWallet {
    // Restore master key
    const masterKey = bip32.fromBase58(masterPrivateKey, this.network);
    
    // Derive child key
    const childKey = masterKey.derivePath(derivationPath);
    
    // Generate address
    const { address } = bitcoin.payments.p2pkh({
      pubkey: childKey.publicKey,
      network: this.network,
    });
    
    return {
      address: address!,
      privateKey: childKey.toWIF(),
      publicKey: childKey.publicKey.toString('hex'),
      derivationPath,
    };
  }

  /**
   * Generate a unique Bitcoin address for each order
   */
  generateOrderAddress(orderId: string): BitcoinWallet {
    // Use a deterministic approach for order addresses
    // This allows us to regenerate the same address for the same order if needed
    const derivationPath = `m/44'/0'/0'/0/${this.getOrderIndex(orderId)}`;
    
    // In production, you would load the master key from secure storage
    // For now, we'll generate a temporary wallet for demonstration
    const hdWallet = this.generateHDWallet();
    
    return this.generateAddressFromHD(hdWallet.masterPrivateKey, derivationPath);
  }

  /**
   * Generate a deposit address for a user
   */
  generateDepositAddress(userId: string): BitcoinWallet {
    const derivationPath = `m/44'/0'/0'/1/${this.getUserIdIndex(userId)}`;
    
    // In production, load from secure storage
    const hdWallet = this.generateHDWallet();
    
    return this.generateAddressFromHD(hdWallet.masterPrivateKey, derivationPath);
  }

  /**
   * Get balance of an address (using blockchain API)
   */
  async getAddressBalance(address: string): Promise<number> {
    try {
      // Use Blockchain.com API to get balance
      const response = await fetch(`https://blockchain.info/q/addressbalance/${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }
      
      const balanceInSatoshis = parseInt(await response.text());
      return balanceInSatoshis / 100000000; // Convert to BTC
    } catch (error) {
      console.error('Error fetching address balance:', error);
      return 0;
    }
  }

  /**
   * Get transaction history for an address
   */
  async getAddressTransactions(address: string): Promise<any[]> {
    try {
      const response = await fetch(`https://blockchain.info/rawaddr/${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      
      const data = await response.json();
      return data.txs || [];
    } catch (error) {
      console.error('Error fetching address transactions:', error);
      return [];
    }
  }

  /**
   * Validate a Bitcoin address
   */
  validateAddress(address: string): boolean {
    try {
      bitcoin.address.toOutputScript(address, this.network);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate a QR code data URL for an address
   */
  generateQRCodeData(address: string, amount?: number): string {
    let uri = `bitcoin:${address}`;
    if (amount && amount > 0) {
      uri += `?amount=${amount.toFixed(8)}`;
    }
    return uri;
  }

  /**
   * Get transaction details by transaction ID
   */
  async getTransaction(txId: string): Promise<any> {
    try {
      const response = await fetch(`https://blockchain.info/rawtx/${txId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch transaction');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

  /**
   * Helper method to get deterministic index for orders
   */
  private getOrderIndex(orderId: string): number {
    // Simple hash function to get a number from order ID
    let hash = 0;
    for (let i = 0; i < orderId.length; i++) {
      const char = orderId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) % 1000000; // Limit to reasonable range
  }

  /**
   * Helper method to get deterministic index for users
   */
  private getUserIdIndex(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash) % 1000000;
  }
}

// Export singleton instance
export const bitcoinWallet = new BitcoinWalletManager();

// Export utility functions
export const generateBitcoinAddress = (orderId: string): BitcoinWallet => {
  return bitcoinWallet.generateOrderAddress(orderId);
};

export const generateDepositAddress = (userId: string): BitcoinWallet => {
  return bitcoinWallet.generateDepositAddress(userId);
};

export const validateBitcoinAddress = (address: string): boolean => {
  return bitcoinWallet.validateAddress(address);
};

export const getQRCodeData = (address: string, amount?: number): string => {
  return bitcoinWallet.generateQRCodeData(address, amount);
};