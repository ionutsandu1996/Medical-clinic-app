// Importam axios pentru a face request-uri HTTP catre backend
import axios from 'axios';

// Cream o instanta axios cu URL-ul de baza al backend-ului
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor - add token at each request
// Read token from localStorage at the request time
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// ========================
// DOCTORS
// ========================

// Returneaza toti doctorii
export const getDoctors = () => api.get('/doctors');

// Returneaza un doctor dupa ID
export const getDoctorById = (id) => api.get(`/doctors/${id}`);

// Creeaza un doctor nou
export const createDoctor = (data) => api.post('/doctors', data);

// Actualizeaza un doctor
export const updateDoctor = (id, data) => api.put(`/doctors/${id}`, data);

// Sterge un doctor
export const deleteDoctor = (id) => api.delete(`/doctors/${id}`);

// ========================
// PATIENTS
// ========================

// Returneaza toti pacientii
export const getPatients = () => api.get('/patients');

// Returneaza un pacient dupa ID
export const getPatientById = (id) => api.get(`/patients/${id}`);

// Creeaza un pacient nou
export const createPatient = (data) => api.post('/patients', data);

// Actualizeaza un pacient
export const updatePatient = (id, data) => api.put(`/patients/${id}`, data);

// Sterge un pacient
export const deletePatient = (id) => api.delete(`/patients/${id}`);

// ========================
// APPOINTMENTS
// ========================

// Returneaza toate programarile
export const getAppointments = () => api.get('/appointments');

// Returneaza o programare dupa ID
export const getAppointmentById = (id) => api.get(`/appointments/${id}`);

// Creeaza o programare noua
export const createAppointment = (data) => api.post('/appointments', data);

// Actualizeaza o programare
export const updateAppointment = (id, data) => api.put(`/appointments/${id}`, data);

// Sterge o programare
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`);

// ========================
// MEDICAL RECORDS
// ========================

// Returneaza fisele medicale ale unui pacient
export const getPatientRecords = (patientId) => api.get(`/medical-records/patient/${patientId}`);

// Returneaza o fisa medicala dupa ID
export const getRecordById = (id) => api.get(`/medical-records/${id}`);

// Creeaza o fisa medicala noua
export const createRecord = (data) => api.post('/medical-records', data);

// Actualizeaza o fisa medicala
export const updateRecord = (id, data) => api.put(`/medical-records/${id}`, data);