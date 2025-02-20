import React from 'react';
import * as Form from '@radix-ui/react-form';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const FormWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 0 1rem;
  box-sizing: border-box;
`;

const StyledFormRoot = styled(Form.Root)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem 0;

  & > * {
    margin: 0;
  }
`;

const StyledField = styled(Form.Field)`
  width: 100%;
`;

const InlineFieldsContainer = styled.div`
  display: flex;
  gap: 1rem;
  width: 100%;

  ${StyledField} {
    flex: 1;
    margin: 0;
  }
`;

const StyledLabel = styled(Form.Label)`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333333;
`;

const StyledInput = styled(Form.Control)`
  display: block;
  width: 100%;
  padding: 0.75rem;
  border: 1.5px solid #333333;
  border-radius: 6px;
  font-size: 1rem;
  background: white;
  color: #1a1a1a;
  transition: all 0.2s ease;
  box-sizing: border-box;
  
  &:hover {
    border-color: #1a1a1a;
  }
  
  &:focus {
    outline: none;
    border-color: #1a1a1a;
    box-shadow: 0 0 0 1px #1a1a1a;
  }

  &::placeholder {
    color: #999999;
  }
`;

const StyledMessage = styled(Form.Message)`
  font-size: 0.875rem;
  color: var(--red-11);
  margin-top: 0.5rem;
`;

const StyledTitle = styled.h1`
  font-size: 1.5rem;
  color: #333333;
  margin: 0 0 0.5rem 0;
  text-align: left;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
  animation: rotation 1s linear infinite;

  @keyframes rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const StyledButton = styled.button<{ $loading?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.75rem;
  background-color: #333333;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: ${props => props.$loading ? 'not-allowed' : 'pointer'};
  transition: background-color 0.2s;
  box-sizing: border-box;
  text-align: center;
  opacity: ${props => props.$loading ? 0.7 : 1};

  &:hover {
    background-color: ${props => props.$loading ? '#333333' : '#1a1a1a'};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #666666;
  }

  &:active {
    background-color: #1a1a1a;
  }

  &:disabled {
    background-color: #999999;
    cursor: not-allowed;
  }
`;

const StyledLink = styled(Link)`
  color: #333333;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
  text-align: left;
  display: block;

  &:hover {
    color: #1a1a1a;
    text-decoration: underline;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-bottom: 1rem;
  font-size: 0.875rem;
`;

interface RootProps {
  children: React.ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  onClearServerErrors?: () => void;
}

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

const Submit = ({ loading, children, disabled, ...props }: SubmitButtonProps) => (
  <StyledButton type="submit" disabled={disabled || loading} $loading={loading} {...props}>
    {loading && <Spinner />}
    {children}
  </StyledButton>
);

export const AuthForm = {
  Root: ({ children, ...props }: RootProps) => (
    <FormWrapper>
      <StyledFormRoot {...props}>
        {children}
      </StyledFormRoot>
    </FormWrapper>
  ),
  Field: StyledField,
  InlineFields: InlineFieldsContainer,
  Label: StyledLabel,
  Input: StyledInput,
  Message: StyledMessage,
  Submit,
  Link: StyledLink,
  Title: StyledTitle,
  ErrorMessage
};
