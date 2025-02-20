import React, { useState } from 'react';
import styled from 'styled-components';
import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { createClient, Photos } from 'pexels';
import { Button } from './Button';

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

interface Props {
  house: House;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (name: string, imageUrl: string, permissions: string[]) => Promise<void>;
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Content = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const Title = styled.h2`
  margin: 0 0 1.5rem;
  color: var(--gray-12);
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: var(--gray-12);
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid var(--gray-7);
  border-radius: 6px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: var(--gray-8);
  }
`;

const SubmitButton = styled.button`
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
  transition: all 0.2s;
  box-sizing: border-box;
  text-align: center;
  opacity: 1;
  gap: 8px;

  &:hover:not(:disabled) {
    background-color: #444444;
    color: #e0e0e0;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px #666666;
  }

  &:active:not(:disabled) {
    background-color: #1a1a1a;
  }

  &:disabled {
    background-color: #999999;
    cursor: not-allowed;
    color: #e0e0e0;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  max-height: 300px;
  overflow-y: auto;
`;

const ImageOption = styled.div`
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  aspect-ratio: 1;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.2s;
  }

  &:hover img {
    transform: scale(1.05);
  }
`;

const SelectedImageContainer = styled.div`
  position: relative;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
  aspect-ratio: 16/9;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  button {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 50%;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: white;
    transition: background-color 0.2s;

    &:hover {
      background: rgba(0, 0, 0, 0.7);
    }
  }
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;

export const HouseSettings: React.FC<Props> = ({
  house,
  open,
  onOpenChange,
  onUpdate
}) => {
  const [name, setName] = useState(house.homeName);
  const [imageUrl, setImageUrl] = useState(house.homeImage);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [permissions, setPermissions] = useState<string[]>(
    house.permissions?.map(p => p.email) || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<Photos['photos']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showImageGrid, setShowImageGrid] = useState(false);
  const [selectedImage, setSelectedImage] = useState(house.homeImage);

  const pexelsClient = createClient(import.meta.env.VITE_PEXELS_API);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await pexelsClient.photos.search({
        query: searchQuery,
        per_page: 15,
        orientation: 'landscape'
      });
      
      if ('error' in response) {
        setError(response.error);
        return;
      }
      
      setImages(response.photos);
      setShowImageGrid(true);
    } catch (error) {
      setError('Failed to fetch images. Please try again.');
      console.error('Error fetching images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (url: string) => {
    setSelectedImage(url);
    setImageUrl(url);
    setShowImageGrid(false);
    setSearchQuery('');
  };

  const handleRemoveSelectedImage = () => {
    setSelectedImage('');
    setImageUrl('');
    setShowImageGrid(true);
    setImages([]);
  };

  const handleAddMember = () => {
    if (newMemberEmail && !permissions.includes(newMemberEmail)) {
      setPermissions([...permissions, newMemberEmail]);
      setNewMemberEmail('');
    }
  };

  const handleRemoveMember = (email: string) => {
    setPermissions(permissions.filter(p => p !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onUpdate(name, imageUrl, permissions);
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update house:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <Container onClick={() => onOpenChange(false)}>
      <Content onClick={e => e.stopPropagation()}>
        <Title>House Settings</Title>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>House Name</Label>
            <Input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>House Image</Label>
            {!selectedImage ? (
              <>
                <SearchContainer>
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for house images..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                  />
                  <Button 
                    type="button"
                    variant="secondary"
                    size="small"
                    onClick={handleSearch}
                    disabled={isLoading || !searchQuery.trim()}
                  >
                    <MagnifyingGlassIcon />
                    {isLoading ? 'Searching...' : 'Search'}
                  </Button>
                </SearchContainer>

                {error && <ErrorMessage>{error}</ErrorMessage>}

                {showImageGrid && images.length > 0 && (
                  <ImageGrid>
                    {images.map((image) => (
                      <ImageOption
                        key={image.src.medium}
                        onClick={() => handleImageSelect(image.src.medium)}
                      >
                        <img src={image.src.medium} alt="House" />
                      </ImageOption>
                    ))}
                  </ImageGrid>
                )}
              </>
            ) : (
              <SelectedImageContainer>
                <img src={selectedImage} alt="Selected house" />
                <button type="button" onClick={handleRemoveSelectedImage}>
                  <Cross2Icon />
                </button>
              </SelectedImageContainer>
            )}
          </FormGroup>

          <FormGroup>
            <Label>Members</Label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Input
                type="email"
                value={newMemberEmail}
                onChange={e => setNewMemberEmail(e.target.value)}
                placeholder="Enter member email"
              />
              <Button type="button" variant="secondary" size="small" onClick={handleAddMember}>Add</Button>
            </div>
            {permissions.map(email => (
              <div key={email} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{email}</span>
                <Button type="button" variant="secondary" size="small" onClick={() => handleRemoveMember(email)}>Remove</Button>
              </div>
            ))}
          </FormGroup>

          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </SubmitButton>
        </Form>
      </Content>
    </Container>
  );
};
