import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useRole from '../hooks/useRole';

function Navbar() {
  const { user, logout } = useAuth();
  const { canManageUsers } = useRole();

  return (
    <nav className="navbar">
      <div className="navbar-brand">🏥 Medical Clinic</div>

      <ul className="navbar-links">
        <li>
          <NavLink to="/doctors" className={({ isActive }) => isActive ? 'active' : ''}>
            Doctori
          </NavLink>
        </li>
        <li>
          <NavLink to="/patients" className={({ isActive }) => isActive ? 'active' : ''}>
            Pacienti
          </NavLink>
        </li>
        <li>
          <NavLink to="/appointments" className={({ isActive }) => isActive ? 'active' : ''}>
            Programari
          </NavLink>
        </li>
        <li>
          <NavLink to="/medical-records" className={({ isActive }) => isActive ? 'active' : ''}>
            Fise Medicale
          </NavLink>
        </li>
        {/* Linkul spre useri apare doar pentru superadmin si admin */}
        {canManageUsers && (
          <li>
            <NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''}>
              Useri
            </NavLink>
          </li>
        )}
      </ul>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: 'white', fontSize: '0.9rem' }}>
          {user?.email} ({user?.role})
        </span>
        <button className="btn btn-danger" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;