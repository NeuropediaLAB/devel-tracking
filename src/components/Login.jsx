import React, { useState } from 'react';
import { API_URL } from '../config';
import { activarModoInvitado } from '../utils/authService';
import './Login.css';

export default function Login({ onLoginSuccess }) {
  const [modo, setModo] = useState('login'); // 'login' o 'registro'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState('enfermeria');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarModalInvitado, setMostrarModalInvitado] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const endpoint = modo === 'login' ? '/auth/login' : '/auth/registro';
    const body = modo === 'login' 
      ? { email, password }
      : { email, password, nombre, rol };

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la autenticación');
      }

      // Guardar token y datos del usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));

      // Notificar éxito
      onLoginSuccess(data.usuario);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  const handleInvitadoClick = () => {
    setMostrarModalInvitado(true);
  };

  const handleConfirmarInvitado = () => {
    activarModoInvitado();
    onLoginSuccess({
      id: 'invitado',
      email: 'invitado@local',
      nombre: 'Invitado',
      rol: 'invitado'
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>📊 Seguimiento del Neurodesarrollo</h1>
          <p>Sistema de evaluación del desarrollo 0-6 años</p>
        </div>

        <div className="login-tabs">
          <button
            className={modo === 'login' ? 'active' : ''}
            onClick={() => {
              setModo('login');
              setError('');
            }}
          >
            Iniciar Sesión
          </button>
          <button
            className={modo === 'registro' ? 'active' : ''}
            onClick={() => {
              setModo('registro');
              setError('');
            }}
          >
            Registrarse
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {modo === 'registro' && (
            <div className="form-group">
              <label htmlFor="nombre">Nombre completo</label>
              <input
                type="text"
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                required={modo === 'registro'}
                disabled={cargando}
              />
            </div>
          )}

          {modo === 'registro' && (
            <div className="form-group">
              <label htmlFor="rol">Rol profesional</label>
              <select
                id="rol"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                required={modo === 'registro'}
                disabled={cargando}
              >
                <option value="enfermeria">👩‍⚕️ Personal de enfermería</option>
                <option value="pediatra_ap">👨‍⚕️ Pediatra de Atención Primaria</option>
                <option value="neuropediatra">🧠 Neuropediatra</option>
                <option value="admin">⚙️ Administrador</option>
              </select>
              <small className="form-help">Selecciona tu rol profesional para habilitar funciones específicas</small>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={cargando}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              disabled={cargando}
              autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
            />
            {modo === 'registro' && (
              <small className="form-help">Mínimo 6 caracteres</small>
            )}
          </div>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-submit"
            disabled={cargando}
          >
            {cargando ? 'Procesando...' : (modo === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta')}
          </button>
        </form>

        {/* Botón Entrar como Invitado */}
        <div className="invitado-section">
          <div className="divider">
            <span>o</span>
          </div>
          <button 
            className="btn-invitado"
            onClick={handleInvitadoClick}
            disabled={cargando}
          >
            👤 Entrar como Invitado
          </button>
          <p className="invitado-info">
            💡 <strong>El registro es completamente gratuito</strong><br />
            Crea una cuenta para guardar tus datos permanentemente
          </p>
        </div>

        <div className="login-footer">
          <p>Sistema científico basado en más de una década de investigación</p>
          <small>© 2024 Neuropedia Lab</small>
        </div>
      </div>

      {/* Modal de advertencia para modo invitado */}
      {mostrarModalInvitado && (
        <div className="modal-overlay" onClick={() => setMostrarModalInvitado(false)}>
          <div className="modal-invitado" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>⚠️ Modo Invitado</h2>
              <button className="modal-close" onClick={() => setMostrarModalInvitado(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="advertencia-box">
                <h3>🚨 Importante: Limitaciones del Modo Invitado</h3>
                <ul>
                  <li><strong>Sin guardado permanente:</strong> Los datos se almacenan solo durante esta sesión</li>
                  <li><strong>Se perderá todo:</strong> Al cerrar el navegador o actualizar la página, todos los datos se borrarán</li>
                  <li><strong>No hay recuperación:</strong> Una vez cerrada la sesión, no hay forma de recuperar los datos</li>
                  <li><strong>Funcionalidad completa:</strong> Puedes usar todas las herramientas, pero sin guardar</li>
                </ul>
              </div>

              <div className="registro-gratis-box">
                <h3>✅ El Registro es GRATUITO</h3>
                <p>Crea una cuenta para:</p>
                <ul>
                  <li>✅ Guardar tus datos permanentemente</li>
                  <li>✅ Acceder desde cualquier dispositivo</li>
                  <li>✅ Seguimiento a largo plazo de múltiples niños</li>
                  <li>✅ Sin costo alguno, completamente gratis</li>
                </ul>
              </div>

              <p className="modal-question">
                ¿Estás seguro que deseas continuar como invitado?
              </p>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-modal-cancelar"
                onClick={() => setMostrarModalInvitado(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-modal-confirmar"
                onClick={handleConfirmarInvitado}
              >
                Sí, Entrar como Invitado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
