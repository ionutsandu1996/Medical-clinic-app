import { useState, useEffect } from 'react';
import {
  getPatients,
  getPatientRecords,
  createRecord,
  updateRecord
} from '../api/index';
import { getAppointments } from '../api/index';
import useRole from '../hooks/useRole';

function MedicalRecords() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [formData, setFormData] = useState({
    appointment_id: '',
    patient_id: '',
    doctor_id: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    notes: ''
  });

  const { canCreateMedicalRecords, canFullEditMedicalRecords, isDoctor, user } = useRole();

  useEffect(() => {
    fetchPatients();
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchRecords(selectedPatientId);
    } else {
      setRecords([]);
    }
  }, [selectedPatientId]);

  const fetchPatients = async () => {
    try {
      const response = await getPatients();
      setPatients(response.data.data);
    } catch (err) {
      console.error('Eroare la incarcarea pacientilor:', err);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await getAppointments();
      setAppointments(response.data.data);
    } catch (err) {
      console.error('Eroare la incarcarea programarilor:', err);
    }
  };

  const fetchRecords = async (patientId) => {
    try {
      setLoading(true);
      const response = await getPatientRecords(patientId);
      setRecords(response.data.data);
      setError(null);
    } catch (err) {
      setError('Eroare la incarcarea fiselor medicale!');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      appointment_id: '',
      patient_id: selectedPatientId,
      // Doctorul are doctor_id setat automat din contul lui
      doctor_id: isDoctor ? user.doctor_id : '',
      diagnosis: '',
      treatment: '',
      prescription: '',
      notes: ''
    });
    setSelectedRecord(null);
    setShowModal(true);
  };

  const handleEdit = (record) => {
    setFormData({
      appointment_id: record.appointment_id || '',
      patient_id: selectedPatientId,
      doctor_id: record.doctor_id || '',
      diagnosis: record.diagnosis || '',
      treatment: record.treatment || '',
      prescription: record.prescription || '',
      notes: record.notes || ''
    });
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedRecord) {
        // Doctorul trimite doar notes
        const payload = isDoctor
          ? { notes: formData.notes }
          : formData;
        await updateRecord(selectedRecord.id, payload);
      } else {
        await createRecord(formData);
      }
      setShowModal(false);
      fetchRecords(selectedPatientId);
    } catch (err) {
      alert('Eroare la salvarea fisei medicale!');
    }
  };

  // Filtram programarile pentru pacientul selectat
  // Doctorul vede doar programarile lui cu acest pacient
  const filteredAppointments = appointments.filter(a => {
    if (!selectedPatientId) return false;
    const matchPatient = String(a.patient_id) === String(selectedPatientId) ||
      (patients.find(p => p.id === parseInt(selectedPatientId))?.first_name === a.patient_first_name);
    if (isDoctor) {
      return matchPatient && String(a.doctor_id) === String(user.doctor_id);
    }
    return matchPatient;
  });

  return (
    <div>
      <div className="page-header">
        <h1>Fise Medicale</h1>
        {selectedPatientId && canCreateMedicalRecords && (
          <button className="btn btn-primary" onClick={handleAdd}>
            + Adauga Fisa
          </button>
        )}
      </div>

      {isDoctor && (
        <div style={{ marginBottom: '1rem', padding: '0.75rem', background: '#e8f4fd', borderRadius: '4px', color: '#1a6fa3' }}>
          Vizualizezi fisele medicale ale pacientilor tai. Poti crea fise noi si modifica notele.
        </div>
      )}

      {/* Selector pacient */}
      <div className="table-container" style={{ padding: '20px', marginBottom: '20px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Selecteaza Pacient</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
          >
            <option value="">Selecteaza un pacient...</option>
            {patients.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.first_name} {patient.last_name} - {patient.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <div className="loading">Se incarca...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && selectedPatientId && (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Data Consultatie</th>
                <th>Doctor</th>
                <th>Specializare</th>
                <th>Diagnostic</th>
                <th>Tratament</th>
                <th>Reteta</th>
                <th>Actiuni</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan="8"><div className="empty">Nu exista fise medicale pentru acest pacient.</div></td></tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td>{new Date(record.appointment_date).toLocaleDateString('ro-RO')}</td>
                    <td>Dr. {record.doctor_first_name} {record.doctor_last_name}</td>
                    <td>{record.specialization || '-'}</td>
                    <td>{record.diagnosis || '-'}</td>
                    <td>{record.treatment || '-'}</td>
                    <td>{record.prescription || '-'}</td>
                    <td>
                      <div className="actions">
                        {/* Doctorul poate edita doar fisele lui */}
                        {(canFullEditMedicalRecords ||
                          (isDoctor && record.doctor_id === user.doctor_id)) && (
                          <button
                            className="btn btn-warning"
                            onClick={() => handleEdit(record)}
                          >
                            {isDoctor ? 'Adauga nota' : 'Editeaza'}
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
      )}

      {!selectedPatientId && !loading && (
        <div className="table-container">
          <div className="empty" style={{ padding: '40px' }}>
            Selecteaza un pacient pentru a vedea fisele medicale.
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{selectedRecord
              ? isDoctor ? 'Adauga nota' : 'Editeaza Fisa'
              : 'Adauga Fisa Medicala'}
            </h2>
            <form onSubmit={handleSubmit}>

              {/* Doctorul la editare vede doar notes */}
              {isDoctor && selectedRecord ? (
                <div className="form-group">
                  <label>Note</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Adauga note..."
                  />
                </div>
              ) : (
                <>
                  {/* Dropdown programari in loc de input numeric */}
                  <div className="form-group">
                    <label>Programare</label>
                    <select
                      name="appointment_id"
                      value={formData.appointment_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecteaza programarea...</option>
                      {filteredAppointments.map((a) => (
                        <option key={a.id} value={a.id}>
                          {new Date(a.appointment_date).toLocaleDateString('ro-RO')} {a.appointment_time} - Dr. {a.doctor_first_name} {a.doctor_last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Doctorul are doctor_id setat automat, nu il poate schimba */}
                  {!isDoctor && (
                    <div className="form-group">
                      <label>ID Doctor</label>
                      <input
                        type="number"
                        name="doctor_id"
                        value={formData.doctor_id}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label>Diagnostic</label>
                    <textarea name="diagnosis" value={formData.diagnosis} onChange={handleChange} required />
                  </div>

                  <div className="form-group">
                    <label>Tratament</label>
                    <textarea name="treatment" value={formData.treatment} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Reteta</label>
                    <textarea name="prescription" value={formData.prescription} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Note</label>
                    <textarea name="notes" value={formData.notes} onChange={handleChange} />
                  </div>
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

export default MedicalRecords;