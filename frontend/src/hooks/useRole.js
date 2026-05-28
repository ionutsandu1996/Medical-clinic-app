import { useAuth } from '../context/AuthContext';

const useRole = () => {
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const isDoctor = user?.role === 'doctor';

  // Poate face CRUD pe doctori si pacienti
  const canManageUsers = isSuperAdmin || isAdmin;

  // Poate face CRUD pe programari
  const canManageAppointments = isSuperAdmin || isAdmin || isStaff;

  // Poate crea fise medicale
  const canCreateMedicalRecords = isSuperAdmin || isAdmin || isDoctor;

  // Poate modifica orice camp din fise medicale
  const canFullEditMedicalRecords = isSuperAdmin || isAdmin;

  return {
    user,
    isSuperAdmin,
    isAdmin,
    isStaff,
    isDoctor,
    canManageUsers,
    canManageAppointments,
    canCreateMedicalRecords,
    canFullEditMedicalRecords
  };
};

export default useRole;