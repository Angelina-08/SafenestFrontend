import React from 'react';
import styled, { css } from 'styled-components';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  $variant?: 'primary' | 'secondary';
  $size?: 'normal' | 'small';
  $fullWidth?: boolean;
}

const StyledButton = styled.button<ButtonProps>`
  display: inline-flex;
  background-color: #333333;
  color: white;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.$size === 'small' ? css`
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  ` : css`
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  `}

  ${props => props.$fullWidth && css`
    width: 100%;
  `}

  ${props => props.$variant === 'secondary' ? css`
    background-color: var(--gray-3);
    color: var(--gray-12);
    &:hover:not(:disabled) {
      background-color: var(--gray-4);
    }
    &:active:not(:disabled) {
      background-color: var(--gray-5);
    }
  ` : css`
    background-color: var(--blue-9);
    color: white;
    &:hover:not(:disabled) {
      background-color: var(--blue-10);
    }
    &:active:not(:disabled) {
      background-color: var(--blue-11);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  $variant = 'primary',
  $size = 'normal',
  $fullWidth = false,
  ...props 
}) => {
  return (
    <StyledButton
      $variant={$variant}
      $size={$size}
      $fullWidth={$fullWidth}
      {...props}
    >
      {children}
    </StyledButton>
  );
};
