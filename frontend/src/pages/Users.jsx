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

  // Filtrare si sortare
  const [filterRole, setFilterRole] = useState('all');
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('email');

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

  const handleDeactivate = async (id) => {
    if (!window.confirm('Esti sigur ca vrei sa dezactivezi acest user?')) return;
    try {
      await axios.delete(`/api/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Eroare la dezactivarea userului!');
    }
  };

  const handleResetPassword = async (user) => {
    if (!window.confirm(`Trimite email de resetare parola la ${user.email}?`)) return;
    try {
      await axios.post(`/api/users/${user.id}/reset-password`);
      alert(`Email de resetare trimis la ${user.email}!`);
    } catch (err) {
      alert(err.response?.data?.error || 'Eroare la trimiterea emailului!');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
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

  // Filtrare + sortare
  const filteredUsers = users
    .filter(u => filterRole === 'all' ? true : u.role === filterRole)
    .sort((a, b) => {
      let valA = a[sortBy] || '';
      let valB = b[sortBy] || '';
      if (sortBy === 'created_at' || sortBy === 'last_login') {
        valA = new Date(valA || 0);
        valB = new Date(valB || 0);
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

  if (loading) return <div className="loading">Se incarca...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <h1>Management Useri</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Adauga User
        </button>
      </div>

      {/* Filtre */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        alignItems: 'center',
        background: 'white',
        padding: '16px',
        borderRadius: '10px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        {/* Filtru rol */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>Rol:</label>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
          >
            <option value="all">Toti</option>
            <option value="superadmin">Superadmin</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="doctor">Doctor</option>
          </select>
        </div>

        {/* Sortare dupa */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>Sorteaza dupa:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
          >
            <option value="email">Email</option>
            <option value="role">Rol</option>
            <option value="created_at">Data crearii</option>
            <option value="last_login">Ultima autentificare</option>
          </select>
        </div>

        {/* Ordine */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', fontWeight: '500', color: '#555' }}>Ordine:</label>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px' }}
          >
            <option value="asc">Ascendent ↑</option>
            <option value="desc">Descendent ↓</option>
          </select>
        </div>

        {/* Counter */}
        <span style={{ marginLeft: 'auto', fontSize: '13px', color: '#888' }}>
          {filteredUsers.length} useri
        </span>
      </div>

      {/* Tabel */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Status</th>
              <th>Data crearii</th>
              <th>Ultima autentificare</th>
              <th>Actiuni</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr><td colSpan="7"><div className="empty">Nu exista useri.</div></td></tr>
            ) : (
              filteredUsers.map((user) => (
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
                    <span style={{
                      color: user.is_active ? '#198754' : '#dc3545',
                      fontWeight: 'bold',
                      fontSize: '13px'
                    }}>
                      {user.is_active ? '● Activ' : '● Inactiv'}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString('ro-RO')}</td>
                  <td>{user.last_login ? new Date(user.last_login).toLocaleDateString('ro-RO') : 'Niciodata'}</td>
                  <td>
                    <div className="actions">
                      {/* Reset Password */}
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleResetPassword(user)}
                        title="Trimite email resetare parola"
                      >
                        Reset Parola
                      </button>

                      {/* Dezactivare — doar superadmin, nu pe propriul cont */}
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

      {/* Modal adaugare user */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Adauga User</h2>
            <form onSubmit={handleSubmit}>
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
              <div className="form-group">
                <label>Rol</label>
                <select name="role" value={formData.role} onChange={handleChange} required>
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              {formData.role === 'doctor' && (
                <div className="form-group">
                  <label>Doctor asociat</label>
                  <select name="doctor_id" value={formData.doctor_id} onChange={handleChange} required>
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