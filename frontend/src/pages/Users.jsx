import { useState, useEffect } from 'react';
import axios from 'axios';
import { getDoctors } from '../api/index';
import useRole from '../hooks/useRole';

function Users() {
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'staff',
    doctor_id: ''
  });

  const { isSuperAdmin, user: currentUser } = useRole();

  useEffect(() => {
    fetchUsers();
    fetchDoctors();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/users');
      setUsers(response.data.data);
      setError(null);
    } catch (err) {
      setError('Eroare la incarcarea userilor!');
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await getDoctors();
      setDoctors(response.data.data);
    } catch (err) {
      console.error('Eroare la incarcarea doctorilor:', err);
    }
  };

  const handleAdd = () => {
    setFormData({ email: '', password: '', role: 'staff', doctor_id: '' });
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setFormData({
      email: user.email,
      password: '',
      role: user.role,
      doctor_id: user.doctor_id || ''
    });
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Esti sigur ca vrei sa dezactivezi acest user?')) return;
    try {
      await axios.delete(`/api/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Eroare la dezactivarea userului!');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        // La editare trimitem doar role, is_active, doctor_id
        await axios.put(`/api/users/${selectedUser.id}`, {
          role: formData.role,
          doctor_id: formData.doctor_id || null
        });
      } else {
        await axios.post('/api/users', formData);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || 'Eroare la salvarea userului!');
    }
  };

  // Rolurile disponibile in functie de cine e logat
  // Admin nu poate crea superadmin
  const availableRoles = isSuperAdmin
    ? ['superadmin', 'admin', 'staff', 'doctor']
    : ['admin', 'staff', 'doctor'];

  const getRoleBadgeColor = (role) => {
    const colors = {
      superadmin: '#6f42c1',
      admin: '#0d6efd',
      staff: '#198754',
      doctor: '#0dcaf0'
    };
    return colors[role] || '#6c757d';
  };

  if (loading) return <div className="loading">Se incarca...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Managament Useri</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Adauga User
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Doctor asociat</th>
              <th>Status</th>
              <th>Ultima autentificare</th>
              <th>Actiuni</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="7"><div className="empty">Nu exista useri.</div></td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{
                      background: getRoleBadgeColor(user.role),
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.doctor_id
                      ? doctors.find(d => d.id === user.doctor_id)
                        ? `Dr. ${doctors.find(d => d.id === user.doctor_id).first_name} ${doctors.find(d => d.id === user.doctor_id).last_name}`
                        : `ID: ${user.doctor_id}`
                      : '-'}
                  </td>
                  <td>
                    <span style={{
                      color: user.is_active ? '#198754' : '#dc3545',
                      fontWeight: 'bold'
                    }}>
                      {user.is_active ? 'Activ' : 'Inactiv'}
                    </span>
                  </td>
                  <td>
                    {user.last_login
                      ? new Date(user.last_login).toLocaleDateString('ro-RO')
                      : 'Niciodata'}
                  </td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-warning"
                        onClick={() => handleEdit(user)}
                      >
                        Editeaza
                      </button>
                      {/* Nu poti dezactiva propriul cont */}
                      {isSuperAdmin && user.id !== currentUser.id && (
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeactivate(user.id)}
                          disabled={!user.is_active}
                        >
                          Dezactiveaza
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{selectedUser ? 'Editeaza User' : 'Adauga User'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={!!selectedUser}
                />
              </div>

              {/* Parola doar la creare */}
              {!selectedUser && (
                <div className="form-group">
                  <label>Parola</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Rol</label>
                <select name="role" value={formData.role} onChange={handleChange} required>
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Doctor asociat — apare doar daca rolul e doctor */}
              {formData.role === 'doctor' && (
                <div className="form-group">
                  <label>Doctor asociat</label>
                  <select
                    name="doctor_id"
                    value={formData.doctor_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecteaza doctorul...</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>
                        Dr. {d.first_name} {d.last_name} - {d.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
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

export default Users;