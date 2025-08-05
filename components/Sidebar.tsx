'use client';

import styled from 'styled-components';
import { Home, LogOut, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/auth';
import { useMobileMenu } from '@/lib/context';

const SidebarContainer = styled.aside`
  width: 250px;
  height: 100vh;
  background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
  color: white;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    width: 280px; /* Slightly wider on mobile for better touch */
    
    &.mobile-open {
      transform: translateX(0);
    }
  }
  
  @media (max-width: 480px) {
    width: 100vw; /* Full width on very small screens */
  }
`;

const Logo = styled.div`
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  
  h1 {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
    background: linear-gradient(135deg, #60a5fa, #3b82f6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  p {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    margin: 0.25rem 0 0 0;
  }
`;

const MobileCloseButton = styled.button`
  display: none;
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.2s;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    color: white;
  }
  
  &:active {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const Navigation = styled.nav`
  flex: 1;
  padding: 1rem 0;
`;

const NavItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  &.active {
    background: rgba(59, 130, 246, 0.2);
    color: white;
    border-right: 3px solid #3b82f6;
  }
  
  svg {
    flex-shrink: 0;
  }
  
  @media (max-width: 768px) {
    padding: 1rem 1.5rem; /* Larger touch targets */
    font-size: 1rem;
    
    &:active {
      background: rgba(255, 255, 255, 0.15);
    }
  }
`;

const LogoutSection = styled.div`
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const router = useRouter();
  const { closeMobileMenu } = useMobileMenu();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <SidebarContainer className={className}>
      <Logo>
        <h1>BIX</h1>
        <p>Financial Dashboard</p>
        <MobileCloseButton onClick={closeMobileMenu} title="Close menu">
          <X size={20} />
        </MobileCloseButton>
      </Logo>
      
      <Navigation>
        <NavItem className="active">
          <Home size={18} />
          Home
        </NavItem>
      </Navigation>
      
      <LogoutSection>
        <NavItem onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </NavItem>
      </LogoutSection>
    </SidebarContainer>
  );
}