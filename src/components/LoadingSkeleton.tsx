import React from 'react';
import styled from 'styled-components';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: var(--gray-1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
`;

const SkeletonCard = styled.div`
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

export const LoadingSkeleton: React.FC = () => {
  return (
    <Container>
      <Header>
        <Skeleton width={200} height={40} />
        <Skeleton width={120} height={40} />
      </Header>
      <SkeletonGrid>
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i}>
            <Skeleton height={200} />
            <div style={{ padding: '1rem' }}>
              <Skeleton height={24} width="60%" />
            </div>
          </SkeletonCard>
        ))}
      </SkeletonGrid>
    </Container>
  );
};
