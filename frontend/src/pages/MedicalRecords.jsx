// Importam hook-urile React necesare
import { useState, useEffect } from 'react';

// Importam functiile API necesare
import {
  getPatients,
  getPatientRecords,
  createRecord,
  updateRecord
} from '../api/index';

function MedicalRecords() {
  // State pentru lista de pacienti - pentru dropdown selector
  const [patients, setPatients] = useState([]);

  // State pentru pacientul selectat
  const [selectedPatientId, setSelectedPatientId] = useState('');

  // State pentru fisele medicale ale pacientului selectat
  const [records, setRecords] = useState([]);

  // State pentru loading
  const [loading, setLoading] = useState(false);

  // State pentru erori
  const [error, setError] = useState(null);

  // State pentru modal
  const [showModal, setShowModal] = useState(false);

  // State pentru fisa selectata pentru editare
  const [selectedRecord, setSelectedRecord] = useState(null);

  // State pentru datele din formular
  const [formData, setFormData] = useState({
    appointment_id: '',
    patient_id: '',
    doctor_id: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    notes: ''
  });

  // useEffect - incarca pacientii la montarea componentei
  useEffect(() => {
    fetchPatients();
  }, []);

  // useEffect - incarca fisele medicale cand se schimba pacientul selectat
  // Ruleaza de fiecare data cand selectedPatientId se schimba
  useEffect(() => {
    if (selectedPatientId) {
      fetchRecords(selectedPatientId);
    } else {
      setRecords([]);
    }
  }, [selectedPatientId]);

  // Functie pentru a incarca pacientii
  const fetchPatients = async () => {
    try {
      const response = await getPatients();
      setPatients(response.data.data);
    } catch (err) {
      console.error('Eroare la incarcarea pacientilor:', err);
    }
  };

  // Functie pentru a incarca fisele medicale ale unui pacient
  const fetchRecords = async (patientId) => {
    try {
      setLoading(true);
      const response = await getPatientRecords(patientId);
      setRecords(response.data.data);
      setError(null);
    } catch (err) {
      setError('Eroare la incarcarea fiselor medicale!');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Functie pentru a deschide modalul de adaugare
  const handleAdd = () => {
    setFormData({
      appointment_id: '',
      patient_id: selectedPatientId,
      doctor_id: '',
      diagnosis: '',
      treatment: '',
      prescription: '',
      notes: ''
    });
    setSelectedRecord(null);
    setShowModal(true);
  };

  // Functie pentru a deschide modalul de editare
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

  // Functie pentru a gestiona schimbarile din formular
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Functie pentru a salva fisa medicala
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (selectedRecord) {
        await updateRecord(selectedRecord.id, formData);
      } else {
        await createRecord(formData);
      }
      setShowModal(false);
      fetchRecords(selectedPatientId);
    } catch (err) {
      alert('Eroare la salvarea fisei medicale!');
      console.error(err);
    }
  };

  return (
    <div>
      {/* Header pagina */}
      <div className="page-header">
        <h1>🩺 Fise Medicale</h1>
        {selectedPatientId && (
          <button className="btn btn-primary" onClick={handleAdd}>
            + Adauga Fisa
          </button>
        )}
      </div>

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

      {/* Loading */}
      {loading && <div className="loading">Se incarca...</div>}

      {/* Eroare */}
      {error && <div className="error">{error}</div>}

      {/* Tabelul cu fise medicale */}
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
                <tr>
                  <td colSpan="8">
                    <div className="empty">
                      Nu exista fise medicale pentru acest pacient.
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td>
                      {new Date(record.appointment_date).toLocaleDateString('ro-RO')}
                    </td>
                    <td>
                      Dr. {record.doctor_first_name} {record.doctor_last_name}
                    </td>
                    <td>{record.specialization || '-'}</td>
                    <td>{record.diagnosis || '-'}</td>
                    <td>{record.treatment || '-'}</td>
                    <td>{record.prescription || '-'}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="btn btn-warning"
                          onClick={() => handleEdit(record)}
                        >
                          Editeaza
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Mesaj daca nu e selectat niciun pacient */}
      {!selectedPatientId && !loading && (
        <div className="table-container">
          <div className="empty" style={{ padding: '40px' }}>
            Selecteaza un pacient pentru a vedea fisele medicale.
          </div>
        </div>
      )}

      {/* Modal pentru adaugare/editare */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{selectedRecord ? 'Editeaza Fisa' : 'Adauga Fisa Medicala'}</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>ID Programare</label>
                <input
                  type="number"
                  name="appointment_id"
                  value={formData.appointment_id}
                  onChange={handleChange}
                  required
                />
              </div>

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

              <div className="form-group">
                <label>Diagnostic</label>
                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Tratament</label>
                <textarea
                  name="treatment"
                  value={formData.treatment}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Reteta</label>
                <textarea
                  name="prescription"
                  value={formData.prescription}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Note</label>
                <textarea
                  name="notes"
                  value={formData.notes}
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

export default MedicalRecords;