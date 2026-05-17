// Importam hook-urile React necesare
// useState - gestioneaza state-ul componentei
// useEffect - ruleaza cod dupa ce componenta se randeaza
import { useState, useEffect } from 'react';

// Importam functiile API pentru doctori
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '../api/index';

function Doctors() {
  // State pentru lista de doctori
  const [doctors, setDoctors] = useState([]);

  // State pentru loading - aratam "Se incarca..." cat timp asteptam raspunsul
  const [loading, setLoading] = useState(true);

  // State pentru erori
  const [error, setError] = useState(null);

  // State pentru modal - true = modal deschis, false = modal inchis
  const [showModal, setShowModal] = useState(false);

  // State pentru doctorul selectat pentru editare
  // null = adaugam doctor nou, altfel = editam doctorul selectat
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // State pentru datele din formular
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialization_id: '',
    bio: ''
  });

  // useEffect - ruleaza o singura data la montarea componentei (array-ul gol [])
  // Incarca lista de doctori din backend
  useEffect(() => {
    fetchDoctors();
  }, []);

  // Functie pentru a incarca doctorii din backend
  const fetchDoctors = async () => {
    try {
      // Setam loading true cat timp asteptam raspunsul
      setLoading(true);

      // Facem request-ul GET catre backend
      const response = await getDoctors();

      // Salvam doctorii in state
      setDoctors(response.data.data);

      // Resetam eroarea
      setError(null);
    } catch (err) {
      // Daca apare o eroare, o salvam in state
      setError('Eroare la incarcarea doctorilor!');
      console.error(err);
    } finally {
      // Indiferent de rezultat, oprim loading-ul
      setLoading(false);
    }
  };

  // Functie pentru a deschide modalul de adaugare
  const handleAdd = () => {
    // Resetam formularul
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      specialization_id: '',
      bio: ''
    });

    // Nu avem doctor selectat - inseamna ca adaugam unul nou
    setSelectedDoctor(null);

    // Deschidem modalul
    setShowModal(true);
  };

  // Functie pentru a deschide modalul de editare
  const handleEdit = (doctor) => {
    // Populam formularul cu datele doctorului selectat
    setFormData({
      first_name: doctor.first_name,
      last_name: doctor.last_name,
      email: doctor.email,
      phone: doctor.phone || '',
      specialization_id: doctor.specialization_id || '',
      bio: doctor.bio || ''
    });

    // Salvam doctorul selectat
    setSelectedDoctor(doctor);

    // Deschidem modalul
    setShowModal(true);
  };

  // Functie pentru a sterge un doctor
  const handleDelete = async (id) => {
    // Cerem confirmare inainte de stergere
    if (!window.confirm('Esti sigur ca vrei sa stergi acest doctor?')) return;

    try {
      // Facem request-ul DELETE catre backend
      await deleteDoctor(id);

      // Reincarcam lista de doctori
      fetchDoctors();
    } catch (err) {
      alert('Eroare la stergerea doctorului!');
      console.error(err);
    }
  };

  // Functie pentru a gestiona schimbarile din formular
  // e = evenimentul de schimbare (onChange)
  const handleChange = (e) => {
    // Actualizam field-ul corespunzator din formData
    setFormData({
      ...formData, // pastram valorile existente
      [e.target.name]: e.target.value // actualizam doar field-ul modificat
    });
  };

  // Functie pentru a salva doctorul (adaugare sau editare)
  const handleSubmit = async (e) => {
    // Prevenim comportamentul default al formularului (reload pagina)
    e.preventDefault();

    try {
      if (selectedDoctor) {
        // Daca avem doctor selectat - facem update
        await updateDoctor(selectedDoctor.id, formData);
      } else {
        // Altfel - cream un doctor nou
        await createDoctor(formData);
      }

      // Inchidem modalul
      setShowModal(false);

      // Reincarcam lista de doctori
      fetchDoctors();
    } catch (err) {
      alert('Eroare la salvarea doctorului!');
      console.error(err);
    }
  };

  // Daca loading e true, aratam mesajul de incarcare
  if (loading) return <div className="loading">Se incarca...</div>;

  // Daca avem eroare, o afisam
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      {/* Header pagina cu titlu si buton adaugare */}
      <div className="page-header">
        <h1>👨‍⚕️ Doctori</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Adauga Doctor
        </button>
      </div>

      {/* Tabelul cu doctori */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nume</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Specializare</th>
              <th>Actiuni</th>
            </tr>
          </thead>
          <tbody>
            {/* Daca nu avem doctori, afisam un mesaj */}
            {doctors.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div className="empty">Nu exista doctori inregistrati.</div>
                </td>
              </tr>
            ) : (
              // Iteram prin lista de doctori si cream un rand pentru fiecare
              // key={doctor.id} e obligatoriu pentru React sa identifice elementele
              doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.id}</td>
                  <td>{doctor.first_name} {doctor.last_name}</td>
                  <td>{doctor.email}</td>
                  <td>{doctor.phone || '-'}</td>
                  <td>{doctor.specialization || '-'}</td>
                  <td>
                    <div className="actions">
                      {/* Buton editare */}
                      <button
                        className="btn btn-warning"
                        onClick={() => handleEdit(doctor)}
                      >
                        Editeaza
                      </button>

                      {/* Buton stergere */}
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(doctor.id)}
                      >
                        Sterge
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal pentru adaugare/editare */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{selectedDoctor ? 'Editeaza Doctor' : 'Adauga Doctor'}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Prenume</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Nume</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Telefon</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Specializare ID</label>
                <input
                  type="number"
                  name="specialization_id"
                  value={formData.specialization_id}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions">
                {/* Buton anulare - inchide modalul fara a salva */}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Anuleaza
                </button>

                {/* Buton salvare */}
                <button type="submit" className="btn btn-primary">
                  Salveaza
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Doctors;