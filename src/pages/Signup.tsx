import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthForm } from '../components/AuthForm';
import { TopBar } from '../components/TopBar';
import axios from 'axios';

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

export const Signup = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validatePassword = (value: string) => {
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(value)) return "Password must contain at least one uppercase letter";
    if (!/\d/.test(value)) return "Password must contain at least one number";
    if (!/[!@#$%^&*]/.test(value)) return "Password must contain at least one symbol (!@#$%^&*)";
    return "";
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await axios.post('https://safe-nest-back-end.vercel.app/api/auth/register', {
        email,
        password,
        firstName,
        lastName
      });

      navigate('/login');
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
          <AuthForm.Title>Sign Up</AuthForm.Title>
          {error && <AuthForm.ErrorMessage>{error}</AuthForm.ErrorMessage>}

          <AuthForm.InlineFields>
            <AuthForm.Field name="firstName">
              <AuthForm.Label>First Name</AuthForm.Label>
              <AuthForm.Input
                type="text"
                name="firstName"
                required
                placeholder="First name"
              />
              <AuthForm.Message match="valueMissing">
                First name is required
              </AuthForm.Message>
            </AuthForm.Field>

            <AuthForm.Field name="lastName">
              <AuthForm.Label>Last Name</AuthForm.Label>
              <AuthForm.Input
                type="text"
                name="lastName"
                required
                placeholder="Last name"
              />
              <AuthForm.Message match="valueMissing">
                Last name is required
              </AuthForm.Message>
            </AuthForm.Field>
          </AuthForm.InlineFields>

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
              placeholder="Create password"
              pattern={passwordRegex.source}
            />
            <AuthForm.Message match="valueMissing">
              Password is required
            </AuthForm.Message>
            <AuthForm.Message match="patternMismatch">
              Password must contain at least 8 characters, one uppercase letter, one number, and one symbol (!@#$%^&*)
            </AuthForm.Message>
          </AuthForm.Field>

          <AuthForm.Field name="confirmPassword">
            <AuthForm.Label>Confirm Password</AuthForm.Label>
            <AuthForm.Input
              type="password"
              name="confirmPassword"
              required
              placeholder="Confirm password"
            />
            <AuthForm.Message match="valueMissing">
              Confirm password is required
            </AuthForm.Message>
          </AuthForm.Field>

          <AuthForm.Submit type="submit" loading={isLoading}>
            Sign Up
          </AuthForm.Submit>
          <AuthForm.Link to="/login">Already have an account? Login</AuthForm.Link>
        </AuthForm.Root>
      </div>
    </>
  );
};
