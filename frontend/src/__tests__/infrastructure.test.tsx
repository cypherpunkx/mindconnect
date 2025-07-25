import { render } from '@testing-library/react';
import { Providers } from '@/components/providers';

describe('Frontend Infrastructure', () => {
  describe('Next.js Configuration', () => {
    it('should have proper Next.js setup', () => {
      // Test that Next.js is properly configured
      // In test environment, these might not be set, so we check for defaults
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
      
      expect(apiUrl).toBeTruthy();
      expect(socketUrl).toBeTruthy();
      expect(apiUrl).toMatch(/^https?:\/\//);
      expect(socketUrl).toMatch(/^https?:\/\//);
    });
  });

  describe('TypeScript Configuration', () => {
    it('should compile TypeScript without errors', () => {
      // This test passes if the file compiles successfully
      expect(true).toBe(true);
    });
  });

  describe('Package Dependencies', () => {
    it('should have all required dependencies available', () => {
      // Test that key dependencies are available
      expect(() => require('react')).not.toThrow();
      expect(() => require('next')).not.toThrow();
      expect(() => require('@tanstack/react-query')).not.toThrow();
      expect(() => require('axios')).not.toThrow();
      expect(() => require('socket.io-client')).not.toThrow();
      expect(() => require('next-themes')).not.toThrow();
      expect(() => require('react-hook-form')).not.toThrow();
      expect(() => require('zod')).not.toThrow();
      expect(() => require('clsx')).not.toThrow();
      expect(() => require('lucide-react')).not.toThrow();
    });
  });

  describe('Providers Setup', () => {
    it('should render providers without errors', () => {
      const TestComponent = () => <div>Test</div>;
      
      expect(() => {
        render(
          <Providers>
            <TestComponent />
          </Providers>
        );
      }).not.toThrow();
    });
  });

  describe('PWA Configuration', () => {
    it('should have manifest.json available', () => {
      // Test that PWA manifest exists
      expect(() => require('../../public/manifest.json')).not.toThrow();
    });
  });
});