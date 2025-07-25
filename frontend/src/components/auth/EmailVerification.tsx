'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Mail, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface EmailVerificationProps {
  mode?: 'verify' | 'pending';
}

export function EmailVerification({ mode = 'verify' }: EmailVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const { user, verifyEmail, refreshAuth } = useAuth();
  const searchParams = useSearchParams();
  const token = searchParams?.get('token');

  useEffect(() => {
    if (mode === 'verify' && token) {
      handleVerification(token);
    }
  }, [mode, token]);

  const handleVerification = async (verificationToken: string) => {
    setIsVerifying(true);
    setVerificationStatus('pending');
    setErrorMessage(null);

    try {
      const result = await verifyEmail(verificationToken);
      
      if (result.success) {
        setVerificationStatus('success');
        // Refresh auth state to get updated user data
        await refreshAuth();
      } else {
        setVerificationStatus('error');
        setErrorMessage(result.error || 'Email verification failed. The link may be expired or invalid.');
      }
    } catch (error) {
      setVerificationStatus('error');
      setErrorMessage('An unexpected error occurred during verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;

    setIsResending(true);
    try {
      // This would typically call a resend verification endpoint
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      // In a real implementation, you'd call an API endpoint here
      console.log('Resend verification email to:', user.email);
    } catch (error) {
      console.error('Failed to resend verification email:', error);
    } finally {
      setIsResending(false);
    }
  };

  // Verification in progress
  if (isVerifying || verificationStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verifying Your Email
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we verify your email address...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Verification successful
  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Email Verified Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your email address has been verified. You can now access all features of MindConnect.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Verification failed
  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Verification Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {errorMessage}
            </p>
            <div className="space-y-3">
              <Link
                href="/auth/login"
                className="block w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Login
              </Link>
              {user && (
                <button
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4 inline" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="-ml-1 mr-2 h-4 w-4 inline" />
                      Resend Verification Email
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pending verification (default state)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 text-center">
          <Mail className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We've sent a verification email to:
          </p>
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            {user?.email}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Please check your inbox and click the verification link to activate your account. 
            Don't forget to check your spam folder if you don't see the email.
          </p>
          
          <div className="space-y-3">
            <button
              onClick={handleResendVerification}
              disabled={isResending}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isResending
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isResending ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Sending...
                </>
              ) : (
                <>
                  <RefreshCw className="-ml-1 mr-3 h-5 w-5" />
                  Resend Verification Email
                </>
              )}
            </button>
            
            <Link
              href="/auth/login"
              className="block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}