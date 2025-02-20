import React, { useState } from 'react';
import styled from 'styled-components';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { GearIcon } from '@radix-ui/react-icons';
import { HouseSettings } from './HouseSettings';

interface Permission {
  email: string;
}

interface House {
  homeId: number;
  homeName: string;
  homeImage: string;
  homeOwner: string;
  ownerEmail: string;
  permissions?: Permission[];
}

interface HouseCardProps {
  house: House;
  currentUserId: string;
  onUpdateHouse: (id: number, name: string, imageUrl: string, permissions: string[]) => Promise<void>;
}

const Card = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const Image = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;
`;

const Content = styled.div`
  padding: 1rem;
`;

const Name = styled.h3`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-12);
`;

const ContextMenuItem = styled(ContextMenu.Item)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  outline: none;
  color: var(--gray-12);
  font-size: 0.875rem;

  &:hover {
    background: var(--gray-4);
  }

  &:focus {
    background: var(--gray-4);
  }
`;

export const HouseCard: React.FC<HouseCardProps> = ({
  house,
  currentUserId,
  onUpdateHouse
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const isOwner = house.homeOwner === currentUserId;

  return (
    <>
      <ContextMenu.Root>
        <ContextMenu.Trigger>
          <Card>
            <Image src={house.homeImage} alt={house.homeName} />
            <Content>
              <Name>{house.homeName}</Name>
            </Content>
          </Card>
        </ContextMenu.Trigger>

        {isOwner && (
          <ContextMenu.Portal>
            <ContextMenu.Content
              style={{
                minWidth: 160,
                backgroundColor: 'white',
                borderRadius: 6,
                padding: '0.25rem',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              <ContextMenuItem onClick={() => setShowSettings(true)}>
                <GearIcon />
                Settings
              </ContextMenuItem>
            </ContextMenu.Content>
          </ContextMenu.Portal>
        )}
      </ContextMenu.Root>

      {isOwner && (
        <HouseSettings
          house={house}
          open={showSettings}
          onOpenChange={setShowSettings}
          onUpdate={(name, imageUrl, permissions) => 
            onUpdateHouse(house.homeId, name, imageUrl, permissions)
          }
        />
      )}
    </>
  );
};
