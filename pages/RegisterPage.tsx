import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Logo from '../components/Logo';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { registerUser } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
        setError("Password must be at least 6 characters long.");
        return;
    }
    setError('');
    const result = await registerUser(name, email, password);
    if (result === 'Success') {
      navigate('/courses');
    } else {
      setError(result);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
      <div className="w-full max-w-md p-8 space-y-8 bg-secondary rounded-lg shadow-lg">
        <div className="text-center">
            <Link to="/">
                 <Logo className="h-12 w-auto mx-auto mb-4"/>
            </Link>
            <h2 className="text-3xl font-extrabold text-text-primary">
                Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-text-secondary">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-accent-blue hover:text-accent-blue/80">
                    Sign in here
                </Link>
            </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
             <div>
              <label htmlFor="name" className="sr-only">Full Name</label>
              <input 
                id="name" 
                name="name" 
                type="text" 
                autoComplete="name" 
                required 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-primary placeholder-text-secondary text-text-primary rounded-t-md focus:outline-none focus:ring-accent-blue focus:border-accent-blue focus:z-10 sm:text-sm" 
                placeholder="Full Name" 
              />
            </div>
            <div>
              <label htmlFor="email-address-register" className="sr-only">Email address</label>
              <input 
                id="email-address-register" 
                name="email" 
                type="email" 
                autoComplete="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-primary placeholder-text-secondary text-text-primary focus:outline-none focus:ring-accent-blue focus:border-accent-blue focus:z-10 sm:text-sm" 
                placeholder="Email address" 
              />
            </div>
            <div>
              <label htmlFor="password-register" className="sr-only">Password</label>
              <input 
                id="password-register" 
                name="password" 
                type="password" 
                autoComplete="new-password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 bg-primary placeholder-text-secondary text-text-primary rounded-b-md focus:outline-none focus:ring-accent-blue focus:border-accent-blue focus:z-10 sm:text-sm" 
                placeholder="Password" 
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <div>
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary bg-accent-blue hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-blue">
              Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;