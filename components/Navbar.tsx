
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Logo from './Logo';

const Navbar: React.FC = () => {
  const { isAdminAuthenticated, logoutAdmin, cart, currentUser, logoutUser, theme, toggleTheme } = useAppContext();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAdminLogout = () => {
    logoutAdmin();
    navigate('/');
  };

  const handleUserLogout = () => {
    logoutUser();
    navigate('/');
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300 ${
      isActive
        ? 'bg-secondary text-accent-blue shadow-[0_0_15px_rgba(0,191,255,0.5)]'
        : 'text-text-secondary hover:bg-secondary hover:text-text-primary'
    }`;
  
  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
    isActive
      ? 'bg-secondary text-accent-blue'
      : 'text-text-secondary hover:bg-secondary hover:text-text-primary'
  }`;

  return (
    <nav className="bg-primary/80 backdrop-blur-lg fixed w-full z-50 top-0 border-b border-secondary transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <NavLink to="/" className="flex-shrink-0 flex items-center gap-2">
              <Logo className="h-8 w-auto" />
              <span className="text-xl font-bold text-text-primary">M-Sec</span>
            </NavLink>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to="/" className={navLinkClass}>Home</NavLink>
                <NavLink to="/courses" className={navLinkClass}>Courses</NavLink>
                <NavLink to="/tools" className={navLinkClass}>Tools</NavLink>
                <NavLink to="/ai-chat" className={navLinkClass}>AI Chat</NavLink>
                {isAdminAuthenticated && (
                  <NavLink to="/admin" className={navLinkClass}>Dashboard</NavLink>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
             {/* Theme Toggle Button */}
             <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-secondary transition-colors"
                aria-label="Toggle Theme"
             >
                {theme === 'dark' ? (
                   /* Sun Icon */
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                   </svg>
                ) : (
                   /* Moon Icon */
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                   </svg>
                )}
             </button>

             <NavLink to="/checkout" className="relative p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-secondary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {cart.length > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-accent-blue text-primary text-xs font-bold text-center flex items-center justify-center">{cart.length}</span>
                )}
             </NavLink>

             {currentUser ? (
               <div className="flex items-center gap-4">
                  <span className="text-text-secondary text-sm">Welcome, {currentUser.name}!</span>
                  <NavLink to="/my-courses" className={navLinkClass}>My Courses</NavLink>
                   <button onClick={handleUserLogout} className="bg-secondary text-text-secondary px-3 py-2 rounded-md text-sm font-medium hover:text-text-primary transition">
                      Logout
                   </button>
               </div>
             ) : (
                <div className="flex items-center gap-2">
                  <NavLink to="/login" className={navLinkClass}>Login</NavLink>
                  <NavLink to="/register" className="bg-accent-blue text-primary px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-80 transition">
                    Sign Up
                  </NavLink>
                </div>
             )}
            
             {isAdminAuthenticated ? (
              <button onClick={handleAdminLogout} className="bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-opacity-80 transition">
                Logout Admin
              </button>
            ) : (
              <NavLink to="/admin-login" className="text-xs text-text-secondary hover:text-accent-blue transition ml-4">
                Admin
              </NavLink>
            )}
          </div>
          <div className="-mr-2 flex md:hidden gap-2">
             {/* Mobile Theme Toggle */}
             <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-secondary transition-colors"
             >
                 {theme === 'dark' ? (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                   </svg>
                ) : (
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                   </svg>
                )}
             </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              type="button"
              className="bg-secondary inline-flex items-center justify-center p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary border-b border-secondary">
            <NavLink to="/" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Home</NavLink>
            <NavLink to="/courses" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Courses</NavLink>
            <NavLink to="/tools" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Tools</NavLink>
            <NavLink to="/ai-chat" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>AI Chat</NavLink>
             <NavLink to="/checkout" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Cart ({cart.length})</NavLink>
            
            <div className="border-t border-secondary pt-4 mt-4 space-y-1">
              {currentUser ? (
                <>
                  <div className="px-3 py-2 text-text-primary">Welcome, {currentUser.name}</div>
                  <NavLink to="/my-courses" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>My Courses</NavLink>
                  <button onClick={() => { handleUserLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:bg-secondary hover:text-text-primary">
                    Logout
                  </button>
                </>
              ) : (
                 <>
                  <NavLink to="/login" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Login</NavLink>
                  <NavLink to="/register" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Sign Up</NavLink>
                 </>
              )}
               {isAdminAuthenticated ? (
                <>
                  <NavLink to="/admin" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</NavLink>
                  <button onClick={() => { handleAdminLogout(); setIsMobileMenuOpen(false); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-text-secondary hover:bg-secondary hover:text-text-primary">
                    Logout Admin
                  </button>
                </>
              ) : (
                <NavLink to="/admin-login" className={mobileNavLinkClass} onClick={() => setIsMobileMenuOpen(false)}>Admin Login</NavLink>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
