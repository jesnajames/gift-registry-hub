import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Error signing out:', error);
      // Handle error display if needed
    } else {
      navigate('/'); // Redirect to home after sign out
    }
    setIsMenuOpen(false); // Close menu on sign out
  };

  const handleSignIn = () => {
    navigate('/auth');
    setIsMenuOpen(false);
  }

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
                <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
              </svg>
              <span className="ml-2 text-xl font-bold text-gradient">Gift Registry Hub</span>
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link to="/" className="inline-flex items-center px-1 pt-1 border-b-2 border-primary text-sm font-medium text-gray-900">
                Home
              </Link>
              {/* TODO: Add link to My Registries page (needs implementation) */}
              {user && (
                 <Link to="/my-registries" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                   My Registries
                 </Link>
              )}
              {/* <a href="#" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                Discover
              </a>
              <a href="#" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
                How It Works
              </a> */}
            </div>
          </div>
          <div className="hidden md:flex items-center">
            {loading ? (
              <div className="animate-pulse h-8 w-24 bg-gray-200 rounded-md"></div>
            ) : user ? (
              <>
                <span className="text-sm text-gray-600 mr-4">Hi, {user.email}</span>
                <button onClick={handleSignOut} className="btn-outline">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button onClick={handleSignIn} className="btn-outline mr-3">
                  Sign In
                </button>
                <button onClick={handleSignIn} className="btn-primary">
                  Create Account
                </button>
              </>
            )}
          </div>
          <div className="flex md:hidden">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg rounded-b-lg animate-fade-in">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="block pl-3 pr-4 py-2 border-l-4 border-primary text-base font-medium text-primary bg-primary/5">
              Home
            </Link>
             {user && (
                 <Link to="/my-registries" onClick={() => setIsMenuOpen(false)} className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                   My Registries
                 </Link>
              )}
            {/* Add other mobile links here */}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-4">
              {loading ? (
                 <div className="animate-pulse h-8 w-full bg-gray-200 rounded-md mb-2"></div>
              ) : user ? (
                <>
                  <div className="text-base font-medium text-gray-800 mb-1">{user.email}</div>
                  <button onClick={handleSignOut} className="btn-outline w-full">
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleSignIn} className="btn-outline w-full mb-2">
                    Sign In
                  </button>
                  <button onClick={handleSignIn} className="btn-primary w-full">
                    Create Account
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
