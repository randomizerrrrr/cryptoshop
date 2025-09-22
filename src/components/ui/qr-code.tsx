'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCodeComponent({ value, size = 200, className = "" }: QRCodeProps) {
  const [dataUrl, setDataUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(value, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        setDataUrl(url);
        setError(null);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code');
      }
    };

    if (value) {
      generateQR();
    }
  }, [value, size]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`} style={{ width: size, height: size }}>
        <span className="text-xs text-gray-500 text-center px-2">QR Code Error</span>
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg animate-pulse ${className}`} style={{ width: size, height: size }}>
        <span className="text-xs text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <img 
      src={dataUrl} 
      alt="QR Code" 
      className={className}
      style={{ width: size, height: size }}
    />
  );
}