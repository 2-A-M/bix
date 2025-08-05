'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { LogIn, Eye, EyeOff, User } from 'lucide-react';
import { fakeLogin, DEMO_CREDENTIALS } from '@/lib/auth';
import { useAuthContext } from '@/lib/AuthContext';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
`;

const LoginCard = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Logo = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  
  h1 {
    font-size: 2rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #666;
    font-size: 0.9rem;
  }
`;

const AutoFillButton = styled.button`
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  width: 100%;
  justify-content: center;
  
  &:hover:not(:disabled) {
    background: #e5e7eb;
    border-color: #9ca3af;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  label {
    font-weight: 500;
    color: #333;
    font-size: 0.9rem;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #e1e5e9;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s;
    
    &:focus {
      outline: none;
      border-color: #667eea;
    }
    
    &:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  
  &:hover {
    color: #333;
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover:not(:disabled) {
    opacity: 0.9;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background: #fee;
  color: #c33;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  border: 1px solid #fcc;
`;

const DemoCredentials = styled.div`
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.9rem;
  
  h4 {
    color: #333;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
  
  p {
    color: #666;
    margin: 0.25rem 0;
  }
  
  code {
    background: #e5e7eb;
    padding: 0.125rem 0.25rem;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.8rem;
  }
`;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isAuthenticated, refreshAuth } = useAuthContext();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const token = await fakeLogin(email, password);
      
      // Refresh auth state
      refreshAuth();
      
      // Use replace to avoid back button issues
      router.replace('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoFill = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    setError('');
  };

  return (
    <LoginContainer>
      <LoginCard>
        <Logo>
          <h1>BIX Dashboard</h1>
          <p>Financial Analysis Platform</p>
        </Logo>

        <AutoFillButton 
          type="button" 
          onClick={handleAutoFill}
          disabled={isLoading}
        >
          <User size={16} />
          Fill with Demo Credentials
        </AutoFillButton>

        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <label htmlFor="email">Email</label>
            <InputWrapper>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={isLoading}
              />
            </InputWrapper>
          </InputGroup>

          <InputGroup>
            <label htmlFor="password">Password</label>
            <InputWrapper>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <PasswordToggle
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </PasswordToggle>
            </InputWrapper>
          </InputGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <LoginButton type="submit" disabled={isLoading}>
            <LogIn size={20} />
            {isLoading ? 'Signing in...' : 'Sign In'}
          </LoginButton>
        </Form>

        <DemoCredentials>
          <h4>Demo Credentials:</h4>
          <p><strong>Email:</strong> <code>{DEMO_CREDENTIALS.email}</code></p>
          <p><strong>Password:</strong> <code>{DEMO_CREDENTIALS.password}</code></p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontStyle: 'italic' }}>
            Authentication system for demonstration purposes. Use the button above to auto-fill.
          </p>
        </DemoCredentials>
      </LoginCard>
    </LoginContainer>
  );
}