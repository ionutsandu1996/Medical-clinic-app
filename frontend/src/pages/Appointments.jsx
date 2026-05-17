// Importam hook-urile React necesare
import { useState, useEffect } from 'react';

// Importam functiile API necesare
import {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getDoctors,
  getPatients
} from '../api/index';

function Appointments() {
  // State pentru lista de programari
  const [appointments, setAppointments] = useState([]);

  // State pentru lista de doctori - pentru dropdown in formular
  const [doctors, setDoctors] = useState([]);

  // State pentru lista de pacienti - pentru dropdown in formular
  const [patients, setPatients] = useState([]);

  // State pentru loading
  const [loading, setLoading] = useState(true);

  // State pentru erori
  const [error, setError] = useState(null);

  // State pentru modal
  const [showModal, setShowModal] = useState(false);

  // State pentru programarea selectata pentru editare
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // State pentru datele din formular
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    duration_minutes: 30,
    reason: '',
    status: 'pending'
  });

  // useEffect - incarca datele la montarea componentei
  useEffect(() => {
    fetchAll();
  }, []);

  // Functie pentru a incarca toate datele necesare
  const fetchAll = async () => {
    try {
      setLoading(true);

      // Facem toate request-urile in paralel cu Promise.all
      // Mai rapid decat a le face pe rand
      const [appointmentsRes, doctorsRes, patientsRes] = await Promise.all([
        getAppointments(),
        getDoctors(),
        getPatients()
      ]);

      setAppointments(appointmentsRes.data.data);
      setDoctors(doctorsRes.data.data);
      setPatients(patientsRes.data.data);
      setError(null);
    } catch (err) {
      setError('Eroare la incarcarea datelor!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Functie pentru a deschide modalul de adaugare
  const handleAdd = () => {
    setFormData({
      patient_id: '',
      doctor_id: '',
      appointment_date: '',
      appointment_time: '',
      duration_minutes: 30,
      reason: '',
      status: 'pending'
    });
    setSelectedAppointment(null);
    setShowModal(true);
  };

  // Functie pentru a deschide modalul de editare
  const handleEdit = (appointment) => {
  setFormData({
    // Cautam pacientul in lista dupa nume
    patient_id: patients.find(
      p => p.first_name === appointment.patient_first_name &&
           p.last_name === appointment.patient_last_name
    )?.id || '',

    // Cautam doctorul in lista dupa nume
    doctor_id: doctors.find(
      d => d.first_name === appointment.doctor_first_name &&
           d.last_name === appointment.doctor_last_name
    )?.id || '',

    appointment_date: appointment.appointment_date
      ? appointment.appointment_date.split('T')[0]
      : '',
    appointment_time: appointment.appointment_time || '',
    duration_minutes: appointment.duration_minutes || 30,
    reason: appointment.reason || '',
    status: appointment.status || 'pending'
  });
  setSelectedAppointment(appointment);
  setShowModal(true);
};

  // Functie pentru a anula o programare
  const handleDelete = async (id) => {
    if (!window.confirm('Esti sigur ca vrei sa anulezi aceasta programare?')) return;

    try {
      await deleteAppointment(id);
      fetchAll();
    } catch (err) {
      alert('Eroare la anularea programarii!');
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

  // Functie pentru a salva programarea
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (selectedAppointment) {
        await updateAppointment(selectedAppointment.id, formData);
      } else {
        await createAppointment(formData);
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      alert('Eroare la salvarea programarii!');
      console.error(err);
    }
  };

  // Functie pentru a returna clasa CSS a badge-ului de status
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
      {/* Header pagina */}
      <div className="page-header">
        <h1>📅 Programari</h1>
        <button className="btn btn-primary" onClick={handleAdd}>
          + Adauga Programare
        </button>
      </div>

      {/* Tabelul cu programari */}
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
              <tr>
                <td colSpan="8">
                  <div className="empty">Nu exista programari inregistrate.</div>
                </td>
              </tr>
            ) : (
              appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.id}</td>
                  <td>
                    {appointment.patient_first_name} {appointment.patient_last_name}
                  </td>
                  <td>
                    Dr. {appointment.doctor_first_name} {appointment.doctor_last_name}
                  </td>
                  <td>
                    {new Date(appointment.appointment_date).toLocaleDateString('ro-RO')}
                  </td>
                  <td>{appointment.appointment_time}</td>
                  <td>
                    <span className={getStatusBadge(appointment.status)}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>{appointment.reason || '-'}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn btn-warning"
                        onClick={() => handleEdit(appointment)}
                      >
                        Editeaza
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(appointment.id)}
                      >
                        Anuleaza
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
            <h2>
              {selectedAppointment ? 'Editeaza Programare' : 'Adauga Programare'}
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Pacient</label>
                <select
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecteaza pacient...</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Doctor</label>
                <select
                  name="doctor_id"
                  value={formData.doctor_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecteaza doctor...</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.first_name} {doctor.last_name} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Data</label>
                <input
                  type="date"
                  name="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ora</label>
                <input
                  type="time"
                  name="appointment_time"
                  value={formData.appointment_time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Durata (minute)</label>
                <input
                  type="number"
                  name="duration_minutes"
                  value={formData.duration_minutes}
                  onChange={handleChange}
                  min="15"
                  max="120"
                />
              </div>

              <div className="form-group">
                <label>Motiv</label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                />
              </div>

              {/* Statusul se afiseaza doar la editare */}
              {selectedAppointment && (
                <div className="form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              )}

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

export default Appointments;