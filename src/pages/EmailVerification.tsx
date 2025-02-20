import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { authAxios } from '../utils/auth';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f5f5f5;
`;

const Card = styled.div`
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
  text-align: center;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 20px;
  font-size: 24px;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 30px;
  font-size: 16px;
`;

const CodeInputContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
`;

const CodeInput = styled.input`
  width: 40px;
  height: 40px;
  text-align: center;
  font-size: 20px;
  border: 2px solid #ddd;
  border-radius: 8px;
  outline: none;
  
  &:focus {
    border-color: #007bff;
  }
`;

const SubmitButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;
  margin-bottom: 16px;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  text-decoration: underline;
  cursor: pointer;
  font-size: 14px;

  &:disabled {
    color: #999;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 10px;
  font-size: 14px;
`;

const LoadingSpinner = styled.div`
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const EmailVerification = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Check if user is logged in and email is unverified
    const userData = localStorage.getItem('userData');
    if (!userData) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(userData);
    if (user.emailVerified) {
      navigate('/dashboard');
      return;
    }

    // Send initial verification code
    handleResendCode();
  }, [navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleInput = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setIsSubmitting(true);
      const verificationCode = code.join('');
      
      const response = await authAxios.post('/auth/verify-email', {
        code: verificationCode
      });

      if (response.data.verified) {
        // Update user data in localStorage
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        userData.emailVerified = true;
        localStorage.setItem('userData', JSON.stringify(userData));
        
        navigate('/dashboard');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to verify email');
      // Clear code inputs on error
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setError('');
      setIsLoading(true);
      await authAxios.post('/auth/resend-verification');
      setCountdown(60);
      // Clear existing code
      setCode(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to resend verification code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Card>
        <Title>Email Verification</Title>
        <Subtitle>
          Please enter the verification code sent to your email address.
        </Subtitle>

        <CodeInputContainer>
          {code.map((digit, index) => (
            <CodeInput
              key={index}
              ref={(el) => {
                if (inputs.current) {
                  inputs.current[index] = el;
                }
              }}
              type="text"
              maxLength={1}
              value={digit}
              onChange={e => handleInput(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              disabled={isSubmitting}
            />
          ))}
        </CodeInputContainer>

        <SubmitButton
          onClick={handleSubmit}
          disabled={code.some(digit => !digit) || isSubmitting}
        >
          {isSubmitting ? <LoadingSpinner /> : 'Verify Email'}
        </SubmitButton>

        <ResendButton
          onClick={handleResendCode}
          disabled={countdown > 0 || isLoading}
        >
          {isLoading ? (
            <LoadingSpinner />
          ) : countdown > 0 ? (
            `Resend code in ${countdown}s`
          ) : (
            'Resend code'
          )}
        </ResendButton>

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </Card>
    </Container>
  );
};
