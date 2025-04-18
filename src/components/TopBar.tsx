import styled from 'styled-components';
import * as Avatar from '@radix-ui/react-avatar';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { ExitIcon } from '@radix-ui/react-icons';
import { clearAuthData } from '../utils/auth';
import { NotificationBell } from './NotificationBell';

const StyledTopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #f5f5f5;
  border-bottom: 1px solid var(--gray-6);
`;

const AvatarContainer = styled.div`
  cursor: pointer;
`;

const StyledAvatar = styled(Avatar.Root)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  overflow: hidden;
  user-select: none;
  width: 40px;
  height: 40px;
  border-radius: 100%;
  background-color: #333333;
`;

const StyledAvatarFallback = styled(Avatar.Fallback)`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-weight: 500;
`;

// Wrapper for user actions: notification bell and avatar
const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const DropdownContent = styled(DropdownMenu.Content)`
  min-width: 180px;
  background-color: white;
  border-radius: 6px;
  padding: 5px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  animation-duration: 400ms;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
`;

const DropdownItem = styled(DropdownMenu.Item)`
  all: unset;
  font-size: 13px;
  line-height: 1;
  color: #333;
  border-radius: 3px;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 25px;
  padding: 0 5px;
  position: relative;
  user-select: none;
  outline: none;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }

  svg {
    color: #e11d48;
  }
`;

const Logo = styled.img`
  height: 40px;
  width: auto;
`;

interface TopBarProps {
  firstName?: string;
  showAvatar?: boolean;
}

export const TopBar = ({ firstName, showAvatar = false }: TopBarProps) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  return (
    <StyledTopBar>
      <Logo src="/assets/logo.png" alt="SafeNest Logo" />
      {showAvatar && (
        <UserMenu>
          <NotificationBell />
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <AvatarContainer>
                <StyledAvatar>
                  <StyledAvatarFallback>
                    {firstName ? firstName[0].toUpperCase() : 'U'}
                  </StyledAvatarFallback>
                </StyledAvatar>
              </AvatarContainer>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownContent>
                <DropdownItem onClick={handleLogout}>
                  <ExitIcon />
                  Logout
                </DropdownItem>
              </DropdownContent>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </UserMenu>
      )}
    </StyledTopBar>
  );
};
