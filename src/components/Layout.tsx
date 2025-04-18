import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo and nav links */}
            <div className="flex items-center">
              <Link to="/dashboard" className="font-bold text-xl text-black">
                SafeNest
              </Link>
              
              {user && (
                <nav className="ml-8 hidden md:flex space-x-6">
                  <Link 
                    to="/dashboard" 
                    className={`text-gray-600 hover:text-black ${
                      location.pathname === '/dashboard' ? 'font-medium' : ''
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/cameras" 
                    className={`text-gray-600 hover:text-black ${
                      location.pathname.startsWith('/cameras') ? 'font-medium' : ''
                    }`}
                  >
                    Cameras
                  </Link>
                  <Link 
                    to="/settings" 
                    className={`text-gray-600 hover:text-black ${
                      location.pathname === '/settings' ? 'font-medium' : ''
                    }`}
                  >
                    Settings
                  </Link>
                </nav>
              )}
            </div>
            
            {/* User menu and notification bell */}
            {user ? (
              <div className="flex items-center space-x-4">
                <NotificationBell />
                
                <div className="relative">
                  <button 
                    className="flex items-center space-x-2 text-gray-700 hover:text-black"
                    onClick={() => logout()}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      {user.firstName?.charAt(0)}
                    </div>
                    <span className="hidden md:inline">{user.firstName} {user.lastName}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <Link 
                  to="/login" 
                  className="text-gray-600 hover:text-black mr-4"
                >
                  Log in
                </Link>
                <Link 
                  to="/signup" 
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-100 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              {new Date().getFullYear()} SafeNest. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-600 hover:text-black text-sm mr-4">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-600 hover:text-black text-sm">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
