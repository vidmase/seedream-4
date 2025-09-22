import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LandingPage from './LandingPage';
import App from '../App';

const AppWrapper: React.FC = () => {
  const { isAuthenticated, authenticate } = useAuth();

  if (!isAuthenticated) {
    return <LandingPage onAuthenticated={authenticate} />;
  }

  return <App />;
};

export default AppWrapper;
