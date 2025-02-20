import React, { useState } from 'react';
import styled from 'styled-components';
import * as Dialog from '@radix-ui/react-dialog';
import * as Form from '@radix-ui/react-form';
import { createClient, Photos, ErrorResponse } from 'pexels';
import { Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Button } from './Button';

const StyledOverlay = styled(Dialog.Overlay)`
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  inset: 0;
  animation: overlayShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
`;

const StyledContent = styled(Dialog.Content)`
  background-color: white;
  border-radius: 6px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.12);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90vw;
  max-width: 600px;
  max-height: 85vh;
  padding: 25px;
  animation: contentShow 150ms cubic-bezier(0.16, 1, 0.3, 1);
  overflow-y: auto;
`;

const StyledTitle = styled(Dialog.Title)`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--gray-12);
`;

const CloseButton = styled(Dialog.Close)`
  position: absolute;
  top: 10px;
  right: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--gray-11);
  &:hover { color: var(--gray-12); }
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--gray-7);
  border-radius: 4px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: var(--blue-8);
    box-shadow: 0 0 0 1px var(--blue-8);
  }
`;

const SearchContainer = styled.div`
  margin-bottom: 1rem;
  display: flex;
  gap: 0.5rem;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  max-height: 300px;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid var(--gray-6);
  border-radius: 4px;
  background: var(--gray-2);
`;

const ImageOption = styled.div<{ selected?: boolean }>`
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  border: 2px solid ${props => props.selected ? 'var(--blue-9)' : 'transparent'};
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }

  img {
    width: 100%;
    height: 100px;
    object-fit: cover;
  }
`;

const ErrorMessage = styled.div`
  color: var(--red-9);
  font-size: 0.875rem;
  margin-top: 0.5rem;
`;

const FormField = styled(Form.Field)`
  margin-bottom: 1.5rem;
`;

const FormLabel = styled(Form.Label)`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--gray-12);
`;

const SelectedImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 6px;
  overflow: hidden;
  margin-top: 1rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  button {
    position: absolute;
    top: 8px;
    right: 8px;
    background: rgba(0, 0, 0, 0.5);
    border: none;
    border-radius: 4px;
    color: white;
    padding: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: rgba(0, 0, 0, 0.7);
    }
  }
`;

const StyledForm = styled(Form.Root)`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  margin-right: 8px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const SubmitButton = styled(Button)`
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

interface CreateHouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateHouse: (name: string, imageUrl: string) => Promise<void>;
}

export const CreateHouseDialog: React.FC<CreateHouseDialogProps> = ({
  open,
  onOpenChange,
  onCreateHouse
}) => {
  const [houseName, setHouseName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState<Photos['photos']>([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [showImageGrid, setShowImageGrid] = useState(false);

  const pexelsClient = createClient(import.meta.env.VITE_PEXELS_API);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    setError('');
    try {
      const response = await pexelsClient.photos.search({
        query: searchQuery,
        per_page: 15
      });
      
      if ('error' in response) {
        setError(response.error);
        return;
      }
      
      setImages(response.photos);
      setShowImageGrid(true);
    } catch (error) {
      console.error('Error searching images:', error);
      setError('Failed to search images. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setShowImageGrid(false);
    setSearchQuery('');
  };

  const handleRemoveSelectedImage = () => {
    setSelectedImage('');
    setImages([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseName.trim() || !selectedImage || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onCreateHouse(houseName, selectedImage);
      onOpenChange(false);
      setHouseName('');
      setSelectedImage('');
      setImages([]);
      setSearchQuery('');
      setShowImageGrid(false);
    } catch (error) {
      console.error('Error creating house:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <StyledOverlay />
        <StyledContent>
          <StyledTitle>Add New House</StyledTitle>
          <CloseButton>
            <Cross2Icon />
          </CloseButton>

          <StyledForm onSubmit={handleSubmit}>
            <FormField name="houseName">
              <FormLabel>House Name</FormLabel>
              <Form.Control asChild>
                <FormInput
                  type="text"
                  value={houseName}
                  onChange={(e) => setHouseName(e.target.value)}
                  required
                  placeholder="Enter house name"
                />
              </Form.Control>
              <Form.Message match="valueMissing">
                Please enter a house name
              </Form.Message>
            </FormField>

            <FormField name="houseImage">
              <FormLabel>Choose Image</FormLabel>
              {!selectedImage ? (
                <>
                  <SearchContainer>
                    <Form.Control asChild>
                      <FormInput
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
                    </Form.Control>
                    <Button 
                      type="button"
                      onClick={handleSearch}
                      disabled={isLoading || !searchQuery.trim()}
                      size="small"
                      variant="secondary"
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
            </FormField>

            <Form.Submit asChild>
              <SubmitButton
                type="submit"
                disabled={!houseName.trim() || !selectedImage || isSubmitting}
                fullWidth
              >
                {isSubmitting && <Spinner />}
                {isSubmitting ? 'Creating...' : 'Create House'}
              </SubmitButton>
            </Form.Submit>
          </StyledForm>
        </StyledContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
