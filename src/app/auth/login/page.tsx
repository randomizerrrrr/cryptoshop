'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Key, Smartphone, CheckCircle, Eye, EyeOff, ArrowRight, User, AlertTriangle, Bitcoin, Mail, Lock } from 'lucide-react';

type LoginStep = 'credentials' | '2fa' | 'bitcoin' | 'success';

export default function LoginPage() {
  const [currentStep, setCurrentStep] = useState<LoginStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [bitcoinSignature, setBitcoinSignature] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleCredentialsSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requires2FA) {
          setRequires2FA(true);
          setUserEmail(data.email);
          setCurrentStep('2fa');
        } else {
          // Sign in with NextAuth
          const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
          });

          if (result?.error) {
            setError(result.error);
          } else {
            setCurrentStep('success');
          }
        }
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handle2FAVerify = async () => {
    if (totpCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          password,
          twoFactorToken: totpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Sign in with NextAuth
        const result = await signIn('credentials', {
          email: userEmail,
          password,
          twoFactorToken: totpCode,
          redirect: false,
        });

        if (result?.error) {
          setError(result.error);
        } else {
          setCurrentStep('success');
        }
      } else {
        setError(data.error || '2FA verification failed');
      }
    } catch (err) {
      console.error('2FA verification error:', err);
      setError('Failed to verify 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBitcoinAuth = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          password,
          twoFactorToken: totpCode,
          bitcoinSignature,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentStep('success');
      } else {
        setError(data.error || 'Bitcoin authentication failed');
      }
    } catch (err) {
      console.error('Bitcoin auth error:', err);
      setError('Failed to authenticate with Bitcoin. Please try again.');
    } finally {
      setLoading(false);
    }
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
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <p className="text-muted-foreground">
            Sign in to your CryptoShop account
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center">
            {(['credentials', '2fa', 'bitcoin', 'success'] as LoginStep[]).map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep === step
                      ? 'bg-primary text-primary-foreground'
                      : index < ['credentials', '2fa', 'bitcoin', 'success'].indexOf(currentStep)
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < ['credentials', '2fa', 'bitcoin', 'success'].indexOf(currentStep) ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : step === 'credentials' ? (
                    <User className="h-4 w-4" />
                  ) : step === '2fa' ? (
                    <Smartphone className="h-4 w-4" />
                  ) : step === 'bitcoin' ? (
                    <Bitcoin className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < 3 && (
                  <div
                    className={`w-8 h-0.5 ${
                      index < ['credentials', '2fa', 'bitcoin', 'success'].indexOf(currentStep)
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

          {/* Credentials Step */}
          {currentStep === 'credentials' && (
            <div className="space-y-4">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Enter your email and password to sign in securely.
                </AlertDescription>
              </Alert>

              <div>
                <label className="text-sm font-medium mb-2 block">Email Address</label>
                <div className="relative">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="remember" className="text-sm">
                  Remember this device for 30 days
                </label>
              </div>

              <Button className="w-full" onClick={handleCredentialsSubmit} disabled={loading}>
                {loading ? 'Signing In...' : 'Sign In'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <div className="text-center">
                <Button variant="link" onClick={() => window.location.href = '/auth/register'}>
                  Don't have an account? Sign up
                </Button>
              </div>
            </div>
          )}

          {/* 2FA Step */}
          {currentStep === '2fa' && (
            <div className="space-y-4">
              <Alert>
                <Smartphone className="h-4 w-4" />
                <AlertDescription>
                  Enter the 6-digit code from your authenticator app.
                </AlertDescription>
              </Alert>

              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm">
                  <Mail className="h-4 w-4" />
                  <span>{userEmail}</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Two-Factor Authentication Code</label>
                <Input
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={6}
                  className="text-center text-lg font-mono tracking-widest"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Open your authenticator app and enter the 6-digit code
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Having trouble?</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Make sure your device time is synchronized</li>
                  <li>• Check that you're using the correct account</li>
                  <li>• Use one of your backup codes if needed</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setCurrentStep('credentials')}>
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handle2FAVerify}
                  disabled={totpCode.length !== 6 || loading}
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </Button>
              </div>
            </div>
          )}

          {/* Bitcoin Step (Optional Enhanced Security) */}
          {currentStep === 'bitcoin' && (
            <div className="space-y-4">
              <Alert>
                <Bitcoin className="h-4 w-4" />
                <AlertDescription>
                  Enhanced security: Sign with your Bitcoin wallet.
                </AlertDescription>
              </Alert>

              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-muted px-3 py-1 rounded-full text-sm">
                  <Smartphone className="h-4 w-4" />
                  <span>2FA Verified</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Bitcoin Signature</label>
                <Input
                  placeholder="Enter your Bitcoin signature..."
                  value={bitcoinSignature}
                  onChange={(e) => setBitcoinSignature(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Sign the challenge message with your Bitcoin wallet
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setCurrentStep('2fa')}>
                  Back
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={handleBitcoinAuth}
                  disabled={!bitcoinSignature.trim() || loading}
                >
                  {loading ? 'Verifying...' : 'Verify Signature'}
                </Button>
              </div>

              <div className="text-center">
                <Button variant="link" onClick={() => setCurrentStep('success')}>
                  Skip Bitcoin verification
                </Button>
              </div>
            </div>
          )}

          {/* Success Step */}
          {currentStep === 'success' && (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Welcome Back!</h3>
                <p className="text-muted-foreground">
                  You have successfully signed in to your account.
                </p>
              </div>

              {rememberDevice && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Device remembered for 30 days</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Button className="w-full" onClick={() => window.location.href = '/market'}>
                  Go to Marketplace
                </Button>
                <Button variant="outline" className="w-full" onClick={() => window.location.href = '/wallet'}>
                  View Wallet
                </Button>
              </div>

              <div className="text-xs text-muted-foreground">
                You'll be automatically signed out after 30 minutes of inactivity
              </div>
            </div>
          )}

          {/* Security Footer */}
          <div className="text-center text-xs text-muted-foreground border-t pt-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="h-4 w-4" />
              <span>Secure Authentication</span>
            </div>
            <p>
              Protected by NextAuth.js, 2FA, and optional Bitcoin verification.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}