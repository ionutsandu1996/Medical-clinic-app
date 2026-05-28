import { useState, useEffect } from 'react';
import { getDoctors, createDoctor, updateDoctor, deleteDoctor } from '../api/index';
import axios from 'axios';
import useRole from '../hooks/useRole';

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    specialization_id: '',
    bio: ''
  });

  // Obtinem permisiunile userului logat
  const { canManageUsers } = useRole();

  useEffect(() => {
    fetchDoctors();
    fetchSpecializations();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await getDoctors();
      setDoctors(response.data.data);
      setError(null);
    } catch (err) {
      setError('Eroare la incarcarea doctorilor!');
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecializations = async () => {
    try {
      const response = await axios.get('/api/specializations');
      setSpecializations(response.data.data);
    } catch (err) {
      console.error('Eroare la incarcarea specializarilor:', err);
    }
  };

  const handleAdd = () => {
    setFormData({ first_name: '', last_name: '', email: '', phone: '', specialization_id: '', bio: '' });
    setSelectedDoctor(null);
    setShowModal(true);
  };

  const handleEdit = (doctor) => {
    setFormData({
      first_name: doctor.first_name,
      last_name: doctor.last_name,
      email: doctor.email,
      phone: doctor.phone || '',
      specialization_id: doctor.specialization_id || '',
      bio: doctor.bio || ''
    });
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Esti sigur ca vrei sa stergi acest doctor?')) return;
    try {
      await deleteDoctor(id);
      fetchDoctors();
    } catch (err) {
      alert('Eroare la stergerea doctorului!');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedDoctor) {
        await updateDoctor(selectedDoctor.id, formData);
      } else {
        await createDoctor(formData);
      }
      setShowModal(false);
      fetchDoctors();
    } catch (err) {
      alert('Eroare la salvarea doctorului!');
    }
  };

  if (loading) return <div className="loading">Se incarca...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Doctori</h1>
        {/* Butonul de adaugare apare doar pentru superadmin si admin */}
        {canManageUsers && (
          <button className="btn btn-primary" onClick={handleAdd}>
            + Adauga Doctor
          </button>
        )}
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nume</th>
              <th>Email</th>
              <th>Telefon</th>
              <th>Specializare</th>
              {/* Coloana actiuni apare doar daca ai permisiuni */}
              {canManageUsers && <th>Actiuni</th>}
            </tr>
          </thead>
          <tbody>
            {doctors.length === 0 ? (
              <tr><td colSpan={canManageUsers ? 6 : 5}><div className="empty">Nu exista doctori inregistrati.</div></td></tr>
            ) : (
              doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.id}</td>
                  <td>{doctor.first_name} {doctor.last_name}</td>
                  <td>{doctor.email}</td>
                  <td>{doctor.phone || '-'}</td>
                  <td>{doctor.specialization || '-'}</td>
                  {canManageUsers && (
                    <td>
                      <div className="actions">
                        <button className="btn btn-warning" onClick={() => handleEdit(doctor)}>Editeaza</button>
                        <button className="btn btn-danger" onClick={() => handleDelete(doctor.id)}>Sterge</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && canManageUsers && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{selectedDoctor ? 'Editeaza Doctor' : 'Adauga Doctor'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Prenume</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Nume</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label>Telefon</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label>Specializare</label>
                <select name="specialization_id" value={formData.specialization_id} onChange={handleChange}>
                  <option value="">-- Selecteaza specializarea --</option>
                  {specializations.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea name="bio" value={formData.bio} onChange={handleChange} />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Anuleaza</button>
                <button type="submit" className="btn btn-primary">Salveaza</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Doctors;