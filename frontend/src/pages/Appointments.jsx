import { useState, useEffect } from 'react';
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getDoctors,
  getPatients
} from '../api/index';
import axios from 'axios';
import useRole from '../hooks/useRole';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    duration_minutes: 30,
    reason: '',
    status: 'pending',
    notes: ''
  });

  const { canManageAppointments, isDoctor } = useRole();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, doctorsRes, patientsRes, specializationsRes] = await Promise.all([
        getAppointments(),
        getDoctors(),
        getPatients(),
        axios.get('/api/specializations')
      ]);
      setAppointments(appointmentsRes.data.data);
      setDoctors(doctorsRes.data.data);
      setPatients(patientsRes.data.data);
      setSpecializations(specializationsRes.data.data);
      setError(null);
    } catch (err) {
      setError('Eroare la incarcarea datelor!');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      patient_id: '', doctor_id: '', appointment_date: '',
      appointment_time: '', duration_minutes: 30, reason: '',
      status: 'pending', notes: ''
    });
    setSelectedSpecialization('');
    setSelectedAppointment(null);
    setShowModal(true);
  };

  const handleEdit = (appointment) => {
    const doctor = doctors.find(
      d => d.first_name === appointment.doctor_first_name &&
           d.last_name === appointment.doctor_last_name
    );

    // Doctorul vede doar campul notes in modal
    // Ceilalti vad toate campurile
    setFormData({
      patient_id: patients.find(
        p => p.first_name === appointment.patient_first_name &&
             p.last_name === appointment.patient_last_name
      )?.id || '',
      doctor_id: doctor?.id || '',
      appointment_date: appointment.appointment_date
        ? appointment.appointment_date.split('T')[0] : '',
      appointment_time: appointment.appointment_time || '',
      duration_minutes: appointment.duration_minutes || 30,
      reason: appointment.reason || '',
      status: appointment.status || 'pending',
      notes: appointment.notes || ''
    });

    setSelectedSpecialization(doctor?.specialization_id || '');
    setSelectedAppointment(appointment);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Esti sigur ca vrei sa anulezi aceasta programare?')) return;
    try {
      await deleteAppointment(id);
      fetchAll();
    } catch (err) {
      alert('Eroare la anularea programarii!');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSpecializationChange = (e) => {
    setSelectedSpecialization(e.target.value);
    setFormData({ ...formData, doctor_id: '' });
  };

  const filteredDoctors = selectedSpecialization
    ? doctors.filter(d => String(d.specialization_id) === String(selectedSpecialization))
    : doctors;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAppointment) {
        // Doctorul trimite doar notes
        const payload = isDoctor
          ? { notes: formData.notes }
          : formData;
        await updateAppointment(selectedAppointment.id, payload);
      } else {
        await createAppointment(formData);
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      alert('Eroare la salvarea programarii!');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'badge badge-pending',
      confirmed: 'badge badge-confirmed',
      cancelled: 'badge badge-cancelled',
      completed: 'badge badge-completed'
    };
    return badges[status] || 'badge';
  };

  if (loading) return <div className="loading">Se incarca...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Programari</h1>
        {/* Doctorul nu poate adauga programari */}
        {canManageAppointments && (
          <button className="btn btn-primary" onClick={handleAdd}>
            + Adauga Programare
          </button>
        )}
      </div>

      {isDoctor && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#e8f4fd', borderRadius: '4px', color: '#1a6fa3' }}>
          Vizualizezi doar programarile tale. Poti adauga note la fiecare programare.
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Pacient</th>
              <th>Doctor</th>
              <th>Data</th>
              <th>Ora</th>
              <th>Status</th>
              <th>Motiv</th>
              <th>Actiuni</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr><td colSpan="8"><div className="empty">Nu exista programari inregistrate.</div></td></tr>
            ) : (
              appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.id}</td>
                  <td>{appointment.patient_first_name} {appointment.patient_last_name}</td>
                  <td>Dr. {appointment.doctor_first_name} {appointment.doctor_last_name}</td>
                  <td>{new Date(appointment.appointment_date).toLocaleDateString('ro-RO')}</td>
                  <td>{appointment.appointment_time}</td>
                  <td><span className={getStatusBadge(appointment.status)}>{appointment.status}</span></td>
                  <td>{appointment.reason || '-'}</td>
                  <td>
                    <div className="actions">
                      {/* Doctorul poate doar adauga note — buton diferit */}
                      <button
                        className="btn btn-warning"
                        onClick={() => handleEdit(appointment)}
                      >
                        {isDoctor ? 'Adauga nota' : 'Editeaza'}
                      </button>
                      {/* Doctorul nu poate anula programari */}
                      {canManageAppointments && (
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(appointment.id)}
                        >
                          Anuleaza
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
            <h2>
              {isDoctor
                ? 'Adauga nota programare'
                : selectedAppointment ? 'Editeaza Programare' : 'Adauga Programare'}
            </h2>
            <form onSubmit={handleSubmit}>

              {/* Doctorul vede doar campul notes */}
              {isDoctor ? (
                <div className="form-group">
                  <label>Note</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Adauga note despre aceasta programare..."
                  />
                </div>
              ) : (
                <>
                  <div className="form-group">
                    <label>Pacient</label>
                    <select name="patient_id" value={formData.patient_id} onChange={handleChange} required>
                      <option value="">Selecteaza pacient...</option>
                      {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                          {patient.first_name} {patient.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Specializare</label>
                    <select value={selectedSpecialization} onChange={handleSpecializationChange}>
                      <option value="">Toate specializarile</option>
                      {specializations.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Doctor</label>
                    <select name="doctor_id" value={formData.doctor_id} onChange={handleChange} required>
                      <option value="">Selecteaza doctor...</option>
                      {filteredDoctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          Dr. {doctor.first_name} {doctor.last_name}
                          {!selectedSpecialization && doctor.specialization ? ` - ${doctor.specialization}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Data</label>
                    <input type="date" name="appointment_date" value={formData.appointment_date} onChange={handleChange} required />
                  </div>

                  <div className="form-group">
                    <label>Ora</label>
                    <input type="time" name="appointment_time" value={formData.appointment_time} onChange={handleChange} required />
                  </div>

                  <div className="form-group">
                    <label>Durata (minute)</label>
                    <input type="number" name="duration_minutes" value={formData.duration_minutes} onChange={handleChange} min="15" max="120" />
                  </div>

                  <div className="form-group">
                    <label>Motiv</label>
                    <textarea name="reason" value={formData.reason} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Note</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} />
                  </div>

                  {selectedAppointment && (
                    <div className="form-group">
                      <label>Status</label>
                      <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  )}
                </>
              )}

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

export default Appointments;