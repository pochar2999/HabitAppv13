import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Mail, RefreshCw, LogOut } from 'lucide-react';

export default function EmailVerification() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { currentUser, resendVerification, logout, authError } = useAuth();

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      await resendVerification();
      setSuccess(true);
    } catch (error) {
      console.error('Resend verification error:', error);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-orange-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <p className="text-gray-600">Please verify your email address to continue</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {authError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">{authError}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                Verification email sent! Check your inbox.
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              We've sent a verification email to:
            </p>
            <p className="font-medium text-gray-900">{currentUser?.email}</p>
            <p className="text-sm text-gray-600">
              Click the link in the email to verify your account, then refresh this page.
            </p>
          </div>

          <div className="space-y-3">
            <Button onClick={handleRefresh} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              I've Verified - Refresh Page
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleResendVerification} 
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Verification Email
                </>
              )}
            </Button>
            
            <Button variant="ghost" onClick={handleSignOut} className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}