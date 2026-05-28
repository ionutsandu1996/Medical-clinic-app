import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import MedicalRecords from './pages/MedicalRecords';
import Login from './pages/Login';
import './App.css';

// Componenta care protejeaza rutele private
// Daca nu esti autentificat, te redirecteaza la /login
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Asteptam sa verificam tokenul din localStorage
  if (loading) return <div className="loading">Se incarca...</div>;

  // Daca nu esti logat, redirect la login
  if (!user) return <Navigate to="/login" />;

  return children;
};

function AppRoutes() {
  const { user, logout } = useAuth();

  return (
    <BrowserRouter>
      {/* Afisam Navbar doar daca esti autentificat */}
      {user && <Navbar onLogout={logout} />}

      <div className="container">
        <Routes>
          {/* Ruta publica — pagina de login */}
          <Route path="/login" element={<Login />} />

          {/* Rute private — necesita autentificare */}
          <Route path="/" element={<PrivateRoute><Navigate to="/doctors" /></PrivateRoute>} />
          <Route path="/doctors" element={<PrivateRoute><Doctors /></PrivateRoute>} />
          <Route path="/patients" element={<PrivateRoute><Patients /></PrivateRoute>} />
          <Route path="/appointments" element={<PrivateRoute><Appointments /></PrivateRoute>} />
          <Route path="/medical-records" element={<PrivateRoute><MedicalRecords /></PrivateRoute>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

function App() {
  return (
    // AuthProvider înfășoară toată aplicația
    // Toate componentele din interior pot accesa useAuth()
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;