import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('Parolele nu coincid.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Parola trebuie sa aiba cel putin 6 caractere.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/reset-password', { token, newPassword });
      setSuccess(true);
      // Redirectam la login dupa 3 secunde
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Eroare la resetarea parolei.');
    } finally {
      setLoading(false);
    }
  };

  // Daca nu exista token in URL
  if (!token) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#f0f2f5'
      }}>
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#c00', marginBottom: '1rem' }}>Link invalid</h2>
          <p>Acest link de resetare nu este valid.</p>
          <button
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
            onClick={() => navigate('/login')}
          >
            Inapoi la Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <div style={{
        background: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          🏥 Medical Clinic
        </h1>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#666' }}>
          Resetare Parola
        </h2>

        {/* Success */}
        {success ? (
          <div style={{
            background: '#e8f5e9',
            color: '#2e7d32',
            padding: '1rem',
            borderRadius: '4px',
            textAlign: 'center'
          }}>
            <p>✅ Parola a fost resetata cu succes!</p>
            <p style={{ fontSize: '13px', marginTop: '0.5rem' }}>
              Vei fi redirectat la pagina de login in 3 secunde...
            </p>
          </div>
        ) : (
          <>
            {error && (
              <div style={{
                background: '#fee',
                color: '#c00',
                padding: '0.75rem',
                borderRadius: '4px',
                marginBottom: '1rem'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Parola noua</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  autoFocus
                  placeholder="Minim 6 caractere"
                />
              </div>

              <div className="form-group">
                <label>Confirma parola</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Repeta parola"
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                {loading ? 'Se reseteaza...' : 'Reseteaza Parola'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;