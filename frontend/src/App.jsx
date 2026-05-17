// Importam BrowserRouter si Routes din react-router-dom pentru navigare
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Importam componentele de navigare si paginile
import Navbar from './components/Navbar';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import Appointments from './pages/Appointments';
import MedicalRecords from './pages/MedicalRecords';

// Importam stilurile globale
import './App.css';

function App() {
  return (
    // BrowserRouter - gestioneaza navigarea intre pagini fara reload
    <BrowserRouter>
      {/* Navbar - afisat pe toate paginile */}
      <Navbar />

      {/* Containerul principal al aplicatiei */}
      <div className="container">
        <Routes>
          {/* Redirectam pagina principala catre doctori */}
          <Route path="/" element={<Navigate to="/doctors" />} />

          {/* Ruta pentru pagina doctorilor */}
          <Route path="/doctors" element={<Doctors />} />

          {/* Ruta pentru pagina pacientilor */}
          <Route path="/patients" element={<Patients />} />

          {/* Ruta pentru pagina programarilor */}
          <Route path="/appointments" element={<Appointments />} />

          {/* Ruta pentru pagina fiselor medicale */}
          <Route path="/medical-records" element={<MedicalRecords />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;