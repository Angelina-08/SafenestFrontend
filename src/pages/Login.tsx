import  { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';
import { TopBar } from '../components/TopBar';
import axios from 'axios';

interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    firstName: string;
    lastName: string;
    emailVerified: boolean;
  };
}

export const Login = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await axios.post<LoginResponse>(
        'https://safe-nest-back-end.vercel.app/api/auth/login',
        {
          email,
          password,
        }
      );

      const { token, refreshToken, user } = response.data;
      
      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Store user data
      localStorage.setItem('userData', JSON.stringify({
        firstName: user.firstName,
        lastName: user.lastName,
        emailVerified: user.emailVerified
      }));

      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.error || 'An error occurred');
      setIsLoading(false);
    }
  };

  return (
    <>
      <TopBar showAvatar={false} />
      <div style={{ padding: '2rem' }}>
        <AuthForm.Root onSubmit={handleSubmit}>
          <AuthForm.Title>Login</AuthForm.Title>
          {error && <AuthForm.ErrorMessage>{error}</AuthForm.ErrorMessage>}
          
          <AuthForm.Field name="email">
            <AuthForm.Label>Email</AuthForm.Label>
            <AuthForm.Input
              type="email"
              name="email"
              required
              placeholder="Enter email"
            />
            <AuthForm.Message match="valueMissing">
              Email is required
            </AuthForm.Message>
            <AuthForm.Message match="typeMismatch">
              Please enter a valid email
            </AuthForm.Message>
          </AuthForm.Field>

          <AuthForm.Field name="password">
            <AuthForm.Label>Password</AuthForm.Label>
            <AuthForm.Input
              type="password"
              name="password"
              required
              placeholder="Enter password"
            />
            <AuthForm.Message match="valueMissing">
              Password is required
            </AuthForm.Message>
          </AuthForm.Field>

          <AuthForm.Submit type="submit" loading={isLoading}>
            Login
          </AuthForm.Submit>
          <AuthForm.Link to="/signup">Don't have an account? Sign up</AuthForm.Link>
          <AuthForm.Link to="/forgot-password">Forgot password?</AuthForm.Link>
        </AuthForm.Root>
      </div>
    </>
  );
};
