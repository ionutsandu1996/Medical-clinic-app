import { useAuth } from '../context/AuthContext';

const useRole = () => {
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'superadmin';
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const isDoctor = user?.role === 'doctor';

  // Pagina Users + doctori CRUD — doar superadmin si admin
  const canManageUsers = isSuperAdmin || isAdmin;

  // Pacienti CRUD — superadmin, admin, staff
  const canManagePatients = isSuperAdmin || isAdmin || isStaff;

  // Programari CRUD — superadmin, admin, staff
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
    canManagePatients,
    canManageAppointments,
    canCreateMedicalRecords,
    canFullEditMedicalRecords
  };
};

export default useRole;