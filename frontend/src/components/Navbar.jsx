// Importam NavLink din react-router-dom pentru navigare
// NavLink adauga automat clasa 'active' pe link-ul curent
import { NavLink } from 'react-router-dom';

function Navbar() {
  return (
    // Elementul nav - bara de navigare principala
    <nav className="navbar">

      {/* Logo-ul aplicatiei */}
      <div className="navbar-brand">
        🏥 Medical Clinic
      </div>

      {/* Lista de link-uri de navigare */}
      <ul className="navbar-links">

        {/* NavLink - adauga clasa 'active' automat pe pagina curenta */}
        <li>
          <NavLink 
            to="/doctors"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Doctori
          </NavLink>
        </li>

        <li>
          <NavLink 
            to="/patients"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Pacienti
          </NavLink>
        </li>

        <li>
          <NavLink 
            to="/appointments"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Programari
          </NavLink>
        </li>

        <li>
          <NavLink 
            to="/medical-records"
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            Fise Medicale
          </NavLink>
        </li>

      </ul>
    </nav>
  );
}

export default Navbar;