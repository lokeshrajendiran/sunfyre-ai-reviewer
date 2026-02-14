import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { config } from '../config';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Sparkles, Shield, Zap, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const { token, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let newToken = params.get('token');
    if (newToken) {
      // Strip quotes and trim
      newToken = newToken.replace(/^"|"$/g, '').trim();
      
      // Validate JWT format (should have 3 parts: header.payload.signature)
      const tokenParts = newToken.split('.');
      
      if (newToken.length > 0 && tokenParts.length === 3) {
        localStorage.setItem('token', newToken);
        window.location.href = '/';
      } else {
        console.error('Invalid or incomplete token received');
        const url = new URL(window.location.href);
        url.searchParams.delete('token');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, []);

  if (token && user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Welcome back, {user.username}!</CardTitle>
            <CardDescription>You're already authenticated</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="gradient" className="w-full" asChild>
              <a href="/">Go to Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${config.githubClientId}&scope=repo,user:email`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-950">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
          <CardHeader className="text-center space-y-6">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mx-auto w-16 h-16 rounded-2xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center shadow-sm"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>

            <div>
              <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
                SunFyre
              </CardTitle>
              <CardDescription className="text-base mt-2">
                AI-Powered Pull Request Reviewer
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 mt-5">
            {/* Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className='text-white'>Security-focused code analysis</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <span className='text-white'>Instant AI-powered insights</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                  <Github className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                </div>
                <span className='text-white'>Seamless GitHub integration</span>
              </div>
            </div>

            {/* Login Button */}
            <Button
              asChild={!isLoading}
              size="lg"
              disabled={isLoading}
              onClick={() => setIsLoading(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Connecting to GitHub...
                </span>
              ) : (
                <a href={githubAuthUrl} className="flex items-center justify-center gap-2">
                  <Github className="w-5 h-5" />
                  Continue with GitHub
                </a>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
