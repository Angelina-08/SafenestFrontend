import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';
import { TopBar } from '../components/TopBar';
import { useAuth } from '../contexts/AuthContext';

export const Login = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Failed to login. Please check your credentials.');
    } finally {
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
