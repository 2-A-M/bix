'use client';

import styled from 'styled-components';
import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { MobileMenuProvider, useMobileMenu } from '@/lib/context';

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 250px;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    margin-left: 0;
  }
`;

const MobileOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  
  @media (min-width: 769px) {
    display: none;
  }
`;

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isMobileMenuOpen, closeMobileMenu } = useMobileMenu();

  return (
    <DashboardContainer>
      <Sidebar className={isMobileMenuOpen ? 'mobile-open' : ''} />
      <MobileOverlay $isOpen={isMobileMenuOpen} onClick={closeMobileMenu} />
      
      <MainContent>{children}</MainContent>
    </DashboardContainer>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <MobileMenuProvider>
        <DashboardContent>{children}</DashboardContent>
      </MobileMenuProvider>
    </ProtectedRoute>
  );
}