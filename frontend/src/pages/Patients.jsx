// Importam hook-urile React necesare
import { useState, useEffect } from 'react';

// Importam functiile API pentru pacienti
import { getPatients, createPatient, updatePatient, deletePatient } from '../api/index';

function Patients() {
  // State pentru lista de pacienti
  const [patients, setPatients] = useState([]);

  // State pentru loading
  const [loading, setLoading] = useState(true);

  // State pentru erori
  const [error, setError] = useState(null);

  // State pentru modal
  const [showModal, setShowModal] = useState(false);

  // State pentru pacientul selectat pentru editare
  const [selectedPatient, setSelectedPatient] = useState(null);

  // State pentru datele din formular
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact: ''
  });

  // useEffect - incarca pacientii la montarea componentei
  useEffect(() => {
    fetchPatients();
  }, []);

  // Functie pentru a incarca pacientii din backend
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await getPatients();
      setPatients(response.data.data);
      setError(null);
    } catch (err) {
      setError('Eroare la incarcarea pacientilor!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Functie pentru a deschide modalul de adaugare
  const handleAdd = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      date_of_birth: '',
      gender: '',
      address: '',
      emergency_contact: ''
    });
    setSelectedPatient(null);
    setShowModal(true);
  };

  // Functie pentru a deschide modalul de editare
  const handleEdit = (patient) => {
    setFormData({
      first_name: patient.first_name,
      last_name: patient.last_name,
      email: patient.email,
      phone: patient.phone || '',
      date_of_birth: patient.date_of_birth
        ? patient.date_of_birth.split('T')[0]
        : '',
      gender: patient.gender || '',
      address: patient.address || '',
      emergency_contact: patient.emergency_contact || ''
    });
    setSelectedPatient(patient);
    setShowModal(true);
  };

  // Functie pentru a sterge un pacient
  const handleDelete = async (id) => {
    if (!window.confirm('Esti sigur ca vrei sa stergi acest pacient?')) return;

    try {
      await deletePatient(id);
      fetchPatients();
    } catch (err) {
      alert('Eroare la stergerea pacientului!');
      console.error(err);
    }
  };

  // Functie pentru a gestiona schimbarile din formular
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Functie pentru a salva pacientul
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (selectedPatient) {
        await updatePatient(selectedPatient.id, formData);
      } else {
        await createPatient(formData);
      }
      setShowModal(false);
      fetchPatients();
    } catch (err) {
      alert('Eroare la salvarea pacientului!');
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Se incarca...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      {/* Header pagina */}
      <div className="page-header">
        <h1>🧑‍🤝‍🧑 Pacienti</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Adauga Pacient
        </button>
      </div>

      {/* Tabelul cu pacienti */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nume</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Data nasterii</th>
              <th>Gen</th>
              <th>Actiuni</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <div className="empty">Nu exista pacienti inregistrati.</div>
                </td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.id}</td>
                  <td>{patient.first_name} {patient.last_name}</td>
                  <td>{patient.email}</td>
                  <td>{patient.phone || '-'}</td>
                  <td>
                    {patient.date_of_birth
                      ? new Date(patient.date_of_birth).toLocaleDateString('ro-RO')
                      : '-'}
                  </td>
                  <td>{patient.gender || '-'}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-warning"
                        onClick={() => handleEdit(patient)}
                      >
                        Editeaza
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(patient.id)}
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
            <h2>{selectedPatient ? 'Editeaza Pacient' : 'Adauga Pacient'}</h2>

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
                <label>Data nasterii</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Gen</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Selecteaza...</option>
                  <option value="male">Masculin</option>
                  <option value="female">Feminin</option>
                  <option value="other">Altul</option>
                </select>
              </div>

              <div className="form-group">
                <label>Adresa</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Contact urgenta</label>
                <input
                  type="text"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Anuleaza
                </button>
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

export default Patients;