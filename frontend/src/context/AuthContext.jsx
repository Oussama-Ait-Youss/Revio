import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Sync Axios headers whenever the token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const response = await api.get('/user');
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (error) {
          console.error("Session expired or invalid:", error);
          handleLocalLogout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const handleLocalLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
  };

  const login = async (email, password) => {
    try {
      // Laravel Sanctum standard check
      const response = await api.post('/login', { email, password });
      
      // IMPORTANT: Matching the keys we defined in AuthController.php
      // We used 'access_token' and 'user'
      const { access_token, user: userData } = response.data; 
      
      if (!access_token) throw new Error("No token received");

      setToken(access_token);
      setUser(userData);
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(userData));

      return { success: true, role: userData.role };
    } catch (error) {
      console.error("Login attempt failed:", error.response?.data || error.message);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Invalid credentials or server error' 
      };
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error("Logout error on server:", error);
    } finally {
      handleLocalLogout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);