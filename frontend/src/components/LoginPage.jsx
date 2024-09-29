import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from './AuthForm';

const LoginPage = ({ setUser }) => {
  const navigate = useNavigate();

  const handleAuthSuccess = (user) => {
    setUser(user);
    navigate('/threads');
  };

  return (
    <div>
      <h2>Login</h2>
      <AuthForm isLogin={true} onAuthSuccess={handleAuthSuccess} />
    </div>
  );
};

export default LoginPage;