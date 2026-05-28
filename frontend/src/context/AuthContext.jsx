import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Cream contextul — e ca un "magazin global" accesibil din orice componenta
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // La pornirea aplicatiei, daca exista token in localStorage
  // il punem in headerul axios si verificam daca e inca valid
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  // Verificam daca tokenul e valid si luam datele userului
  const fetchMe = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      setUser(response.data.data);
    } catch (error) {
      // Tokenul e invalid sau expirat — logout
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await axios.post('/api/auth/login', { email, password });
    const { token: newToken, user: newUser } = response.data;

    // Salvam tokenul in localStorage ca sa ramana dupa refresh
    localStorage.setItem('token', newToken);

    // Setam tokenul in headerul axios pentru toate requesturile viitoare
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook custom pentru a folosi contextul mai usor
// In loc de useContext(AuthContext) scriem useAuth()
export const useAuth = () => useContext(AuthContext);