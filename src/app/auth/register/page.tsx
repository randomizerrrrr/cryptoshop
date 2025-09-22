'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QrCode, Shield, CheckCircle, Copy, Eye, EyeOff, ArrowRight, ArrowLeft, User, Key, Smartphone, AlertTriangle } from 'lucide-react';

type RegisterStep = 'username' | 'token' | '2fa' | 'complete';

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState<RegisterStep>('username');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isSeller, setIsSeller] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [totpSecret, setTotpSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateAccessToken = () => {
    // Generate a mock access token
    const token = 'cs_' + Math.random().toString(36).substr(2, 9) + '_' + Math.random().toString(36).substr(2, 12);
    setAccessToken(token);
  };

  const generate2FA = () => {
    // Generate mock TOTP secret
    const secret = Math.random().toString(36).substr(2, 16).toUpperCase();
    setTotpSecret(secret);
    
    // Generate backup codes
    const codes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substr(2, 8).toUpperCase()
    );
    setBackupCodes(codes);
  };

  const copyToClipboard = async (text: string) => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
        } catch (clipboardErr) {
          // Handle clipboard permissions error specifically
          if (clipboardErr.name === 'NotAllowedError' || clipboardErr.message.includes('permissions policy')) {
            console.warn('Clipboard API blocked by permissions policy, using fallback');
            throw new Error('Clipboard permissions denied');
          }
          throw clipboardErr;
        }
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
        } catch (execErr) {
          console.error('Failed to copy using execCommand: ', execErr);
          throw new Error('Copy to clipboard failed');
        } finally {
          document.body.removeChild(textArea);
        }
      }
      
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Show error message to user - only if it's not a permissions error (which is expected in some contexts)
      if (err.message !== 'Clipboard permissions denied') {
        alert('Failed to copy text. Please copy it manually.');
      }
    }
  };

  const handleUsernameSubmit = async () => {
    if (!username.trim()) {
      setError('Username is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email: email || null,
          isSeller,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAccessToken(data.accessToken);
        setCurrentStep('token');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTokenContinue = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTotpSecret(data.secret);
        setQrCodeUrl(data.qrCodeUrl);
        setBackupCodes(data.backupCodes);
        setCurrentStep('2fa');
      } else {
        setError(data.error || 'Failed to setup 2FA');
      }
    } catch (err) {
      console.error('2FA setup error:', err);
      setError('Failed to setup 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerify = async () => {
    if (verificationCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          totpCode: verificationCode,
          secret: totpSecret,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentStep('complete');
      } else {
        setError(data.error || 'Failed to verify 2FA code');
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      setError('Failed to verify 2FA code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatToken = (token: string) => {
    return token.match(/.{1,4}/g)?.join('-') || token;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <p className="text-muted-foreground">
            Join CryptoShop with complete anonymity
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {(['username', 'token', '2fa', 'complete'] as RegisterStep[]).map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step
                      ? 'bg-primary text-primary-foreground'
                      : index < ['username', 'token', '2fa', 'complete'].indexOf(currentStep)
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < ['username', 'token', '2fa', 'complete'].indexOf(currentStep) ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 3 && (
                  <div
                    className={`w-8 h-0.5 ${
                      index < ['username', 'token', '2fa', 'complete'].indexOf(currentStep)
                        ? 'bg-green-500'
                        : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Username Step */}
          {currentStep === 'username' && (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  No personal information required. Just choose a username to get started.
                </AlertDescription>
              </Alert>

              <div>
                <label className="text-sm font-medium mb-2 block">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This will be your public identifier on the platform
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="seller"
                  checked={isSeller}
                  onChange={(e) => setIsSeller(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="seller" className="text-sm">
                  I want to become a seller
                </label>
              </div>

              <Button 
                className="w-full" 
                onClick={handleUsernameSubmit}
                disabled={!username.trim() || loading}
              >
                {loading ? 'Creating Account...' : 'Continue'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}

          {/* Access Token Step */}
          {currentStep === 'token' && (
            <div className="space-y-4">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Your access token has been generated. Save it securely - you'll need it to log in.
                </AlertDescription>
              </Alert>

              <div>
                <label className="text-sm font-medium mb-2 block">Access Token</label>
                <div className="relative">
                  <Input
                    value={showToken ? formatToken(accessToken) : '•'.repeat(accessToken.length)}
                    readOnly
                    className="font-mono text-sm pr-20"
                  />
                  <div className="absolute right-1 top-1/2 transform -translate-y-1/2 flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(accessToken)}
                    >
                      {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {copied ? 'Copied to clipboard!' : 'Click copy to save your token'}
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Important Security Notes:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• This token is your only way to access your account</li>
                  <li>• Store it securely (password manager, encrypted storage)</li>
                  <li>• Never share it with anyone</li>
                  <li>• If lost, it cannot be recovered</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setCurrentStep('username')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button className="flex-1" onClick={handleTokenContinue}>
                  Continue
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* 2FA Setup Step */}
          {currentStep === '2fa' && (
            <div className="space-y-4">
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  Set up two-factor authentication for enhanced security.
                </AlertDescription>
              </Alert>

              <div className="text-center">
                <div className="p-4 bg-muted/50 rounded-lg inline-block">
                  <QrCode className="h-48 w-48" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Scan this QR code with your authenticator app
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Or enter manually:</label>
                <div className="relative">
                  <Input
                    value={totpSecret}
                    readOnly
                    className="font-mono text-sm pr-10"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                    onClick={() => copyToClipboard(totpSecret)}
                  >
                    {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Verification Code</label>
                <Input
                  placeholder="Enter 6-digit code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="text-center text-lg font-mono tracking-widest"
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Backup Codes</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Save these codes in a secure place. You can use them if you lose access to your authenticator.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <div key={index} className="bg-background p-2 rounded text-xs font-mono text-center">
                      {code}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setCurrentStep('token')}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handle2FAVerify}
                  disabled={verificationCode.length !== 6 || loading}
                >
                  {loading ? 'Verifying...' : 'Verify & Complete'}
                </Button>
              </div>
            </div>
          )}

          {/* Complete Step */}
          {currentStep === 'complete' && (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Account Created Successfully!</h3>
                <p className="text-muted-foreground">
                  Welcome to CryptoShop, {username}! Your account is now ready.
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">What's Next?</h4>
                <ul className="text-xs text-muted-foreground space-y-1 text-left">
                  <li>• Your access token has been saved securely</li>
                  <li>• 2FA is now enabled on your account</li>
                  <li>• You can now browse and purchase products</li>
                  <li>• Consider becoming a seller to start earning</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Button className="w-full" onClick={() => window.location.href = '/market'}>
                  Browse Marketplace
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/auth/login'}>
                  Go to Login
                </Button>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <a href="/auth/login" className="text-primary hover:underline">
              Sign in
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}