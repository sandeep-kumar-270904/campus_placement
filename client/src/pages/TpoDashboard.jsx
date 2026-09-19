import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const TpoDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">TPO Dashboard</h1>
      <p>Welcome, {user?.firstName} (TPO)</p>
      <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Logout</button>
    </div>
  );
};

export default TpoDashboard;
