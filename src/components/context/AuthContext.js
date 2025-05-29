import { createContext, useContext, useState, useEffect } from 'react';
import { getUserById, loginUser, updateUser } from '../../api';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user]);

  // const login = async ({ loginOrEmail, password }) => {
  //   setLoading(true);
  //   try {
  //     const response = await loginUser({ loginOrEmail, password });
  //     const { user, token } = response.data;
  //     localStorage.setItem('token', token);
  //     setUser(user);
  //   } catch (error) {
  //     console.error('Login error:', error);
  //     throw new Error(error.response?.data?.error || 'Login failed');
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const login = async ({ loginOrEmail, password }) => {
    setLoading(true);
    try {
      const isEmail = loginOrEmail.includes('@');
      const payload = {
        login: isEmail ? undefined : loginOrEmail,
        email: isEmail ? loginOrEmail : undefined,
        password,
      };
      const response = await loginUser(payload); // Pass the transformed payload
      console.log(response.data);
      
      const token = response.data.access_token;
      localStorage.setItem('token', token);
      axios.defaults.headers.common["Authorization"] = token;
      console.log(token)
      
      const user = getUserById(response.data.user);
      console.log(user)
      setUser(user);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = async (updatedData) => {
    setLoading(true);
    try {
      const response = await updateUser(updatedData);
      setUser((prevUser) => ({
        ...prevUser,
        ...response.data.user,
      }));
    } catch (error) {
      console.error('Update user error:', error);
      throw new Error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}