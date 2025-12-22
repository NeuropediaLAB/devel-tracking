import React, { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import NinosList from './components/NinosList';
import NinoForm from './components/NinoForm';
import HitosRegistro from './components/HitosRegistro';
import RedFlagsRegistro from './components/RedFlagsRegistro';
import GraficoDesarrollo from './components/GraficoDesarrollo';
import EjemplosPracticos from './components/EjemplosPracticos';
import Bibliografia from './components/Bibliografia';
import Fundamentos from './components/Fundamentos';
import Investigacion from './components/Investigacion';
import BibliotecaMedios from './components/BibliotecaMedios';
import BibliotecaDatos from './components/BibliotecaDatos';
import DScoreEducacion from './components/DScoreEducacion';
import DScoreResultados from './components/DScoreResultados';
import ScreeningEnfermeria from './components/ScreeningEnfermeria';
import { API_URL } from './config';
import { 
  estaAutenticado, 
  getUsuario, 
  cerrarSesion, 
  fetchConAuth,
  esAdmin,
  esEnfermeria,
  esRolMedico,
  esModoInvitado,
  getNombreRol
} from './utils/authService';

function App() {
  const [autenticado, setAutenticado] = useState(estaAutenticado());
  const [usuario, setUsuario] = useState(getUsuario());
  const [ninos, setNinos] = useState([]);
  const [ninoSeleccionado, setNinoSeleccionado] = useState(null);
  const [vistaActual, setVistaActual] = useState('lista'); // lista, hitos, redflags, grafico, tutorial, investigacion, medios, datos, dscore, screening
  const [datosRegresion, setDatosRegresion] = useState(null); // Compartir datos de regresión entre gráficas
  const [modoAvanzado, setModoAvanzado] = useState(false); // false = modo básico, true = modo avanzado
  const [subVistaInvestigacion, setSubVistaInvestigacion] = useState('limitaciones'); // 'limitaciones', 'simulacion', 'fuentes-normativas'
  const [subVistaTutorial, setSubVistaTutorial] = useState('guia'); // 'guia', 'ejemplos'
  const [subVistaBibliotecaDatos, setSubVistaBibliotecaDatos] = useState('escalas-normativas'); // 'escalas-normativas', 'cohortes-personalizadas', 'estadisticas-uso'
  const [subVistaDScore, setSubVistaDScore] = useState('guia'); // 'concepto', 'metodologia', 'interpretacion', 'grafica', 'guia', 'fuentes'

  useEffect(() => {
    if (autenticado) {
      cargarNinos();
    }
  }, [autenticado]);

  // Cambiar pestaña de D-score cuando cambia el modo
  useEffect(() => {
    if (vistaActual === 'dscore') {
      if (!modoAvanzado) {
        // En modo básico, las pestañas avanzadas no están disponibles
        // Si está en una de ellas, cambiar a 'guia'
        if (['concepto', 'metodologia', 'interpretacion', 'grafica'].includes(subVistaDScore)) {
          setSubVistaDScore('guia');
        }
      }
    }
  }, [modoAvanzado, vistaActual]);


  const handleLoginSuccess = (usuarioData) => {
    setAutenticado(true);
    setUsuario(usuarioData);
  };

  const handleLogout = () => {
    cerrarSesion();
    setAutenticado(false);
    setUsuario(null);
    setNinos([]);
    setNinoSeleccionado(null);
    setVistaActual('lista');
  };

  const handleEjemploCreado = (ninoData, hitosData) => {
    // Si recibe datos del niño y hitos, es modo invitado
    if (ninoData && hitosData && esModoInvitado()) {
      // Agregar el niño a la lista
      const ninosActuales = [...ninos, ninoData];
      setNinos(ninosActuales);
      sessionStorage.setItem('invitado_ninos', JSON.stringify(ninosActuales));
      
      // Guardar los hitos del ejemplo en sessionStorage
      const hitosKey = `invitado_hitos_${ninoData.id}`;
      sessionStorage.setItem(hitosKey, JSON.stringify(hitosData));
    } else {
      // Usuario autenticado: recargar desde DB
      cargarNinos();
    }
  };

  const cargarNinos = async () => {
    // Si es modo invitado, cargar desde sessionStorage
    if (esModoInvitado()) {
      const ninosGuardados = sessionStorage.getItem('invitado_ninos');
      if (ninosGuardados) {
        setNinos(JSON.parse(ninosGuardados));
      }
      return;
    }

    // Si no, cargar desde API
    try {
      const response = await fetchConAuth(`${API_URL}/ninos`);
      const data = await response.json();
      setNinos(data);
    } catch (error) {
      console.error('Error al cargar niños:', error);
    }
  };

  const handleNinoCreado = (nuevoNino) => {
    // En modo invitado, guardar en sessionStorage
    if (esModoInvitado()) {
      const ninosActuales = [...ninos, nuevoNino];
      setNinos(ninosActuales);
      sessionStorage.setItem('invitado_ninos', JSON.stringify(ninosActuales));
    } else {
      cargarNinos();
    }
    setNinoSeleccionado(nuevoNino);
    // Enfermería va directamente a screening, otros a hitos
    setVistaActual(esEnfermeria() ? 'screening' : 'hitos');
  };

  const handleNinoSeleccionado = (nino) => {
    setNinoSeleccionado(nino);
    // Enfermería va directamente a screening, otros a hitos
    setVistaActual(esEnfermeria() ? 'screening' : 'hitos');
  };

  const handleNinoEliminado = () => {
    cargarNinos();
    setNinoSeleccionado(null);
    setVistaActual('lista');
  };

  // Si no está autenticado, mostrar login
  if (!autenticado) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="App">
      {/* Banner de advertencia para modo invitado */}
      {esModoInvitado() && (
        <div className="banner-invitado">
          <div className="banner-content">
            <span className="banner-icon">⚠️</span>
            <div className="banner-text">
              <strong>Modo Invitado:</strong> Los datos NO se guardan permanentemente. 
              Al cerrar el navegador se perderán todos los datos. 
              <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                Registrarse gratis
              </a> para guardar permanentemente.
            </div>
          </div>
        </div>
      )}

      <header className="App-header">
        <div className="header-content">
          <div>
            <h1>📊 Seguimiento del Neurodesarrollo Infantil</h1>
            <p className="subtitle">Sistema de evaluación del desarrollo 0-6 años</p>
          </div>
          <div className="user-info">
            {/* Ocultar modo básico/avanzado para enfermería */}
            {!esEnfermeria() && (
              <div className="mode-switch-container">
                <span className="mode-label">📖 Básico</span>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={modoAvanzado}
                    onChange={() => setModoAvanzado(!modoAvanzado)}
                  />
                  <span className="toggle-slider"></span>
                </label>
                <span className="mode-label">🔬 Avanzado</span>
              </div>
            )}
            <span className="user-name">👤 {usuario.nombre}</span>
            <span className="role-badge">{getNombreRol()}</span>
            {esAdmin() && <span className="admin-badge">ADMIN</span>}
            {esModoInvitado() && <span className="invitado-badge">INVITADO</span>}
            <button className="btn-logout" onClick={handleLogout}>
              {esModoInvitado() ? 'Salir / Registrarse' : 'Cerrar Sesión'}
            </button>
          </div>
        </div>
      </header>

      <nav className="navigation">
        {/* Pestañas principales de nivel superior */}
        <div className="nav-level-1">
          <button 
            className={vistaActual === 'lista' || vistaActual === 'hitos' || vistaActual === 'redflags' || vistaActual === 'grafico' || vistaActual === 'screening' ? 'active' : ''}
            onClick={() => setVistaActual('lista')}
          >
            👶 Niños
          </button>
          {!esEnfermeria() && (
            <button 
              className={vistaActual === 'tutorial' ? 'active' : ''}
              onClick={() => {
                setVistaActual('tutorial');
                setNinoSeleccionado(null);
                setSubVistaTutorial('guia'); // Reset to default
              }}
            >
              📖 Tutorial
            </button>
          )}
          <button 
            className={vistaActual === 'dscore' ? 'active' : ''}
            onClick={() => {
              setVistaActual('dscore');
              setNinoSeleccionado(null);
              setSubVistaDScore('guia'); // Reset to default
            }}
          >
            📊 Tutorial D-Score
          </button>
          {esAdmin() && (
            <>
              <button 
                className={vistaActual === 'medios' ? 'active' : ''}
                onClick={() => {
                  setVistaActual('medios');
                  setNinoSeleccionado(null);
                }}
              >
                🎬 Biblioteca de Medios
              </button>
              <button 
                className={vistaActual === 'datos' ? 'active' : ''}
                onClick={() => {
                  setVistaActual('datos');
                  setNinoSeleccionado(null);
                }}
              >
                🗄️ Biblioteca de Datos
              </button>
            </>
          )}
          {modoAvanzado && (
            <button 
              className={vistaActual === 'investigacion' ? 'active' : ''}
              onClick={() => {
                setVistaActual('investigacion');
                setNinoSeleccionado(null);
                setSubVistaInvestigacion('limitaciones'); // Reset to default
              }}
            >
              🔬 Investigación
            </button>
          )}
        </div>

        {/* Sub-pestañas jerárquicas para el niño seleccionado */}
        {ninoSeleccionado && (
          <div className="nav-level-2">
            <div className="sub-nav-buttons">
              <div className="nino-name-tab">
                <div className="nino-nombre">👶 {ninoSeleccionado.nombre}</div>
                <div className="nino-datos">
                  <span>Edad cronológica: {calcularEdad(ninoSeleccionado.fecha_nacimiento)}</span>
                  {ninoSeleccionado.semanas_gestacion && ninoSeleccionado.semanas_gestacion < 37 && (
                    <span>Edad corregida: {calcularEdadCorregida(ninoSeleccionado.fecha_nacimiento, ninoSeleccionado.semanas_gestacion)}</span>
                  )}
                </div>
              </div>
              {/* Enfermería solo ve sub-pestañas de Screening */}
              {esEnfermeria() ? (
                <>
                  <button 
                    className={`sub-nav-btn ${vistaActual === 'screening' ? 'active' : ''}`}
                    onClick={() => setVistaActual('screening')}
                  >
                    📊 Evaluación D-Score
                  </button>
                  <button 
                    className={`sub-nav-btn ${vistaActual === 'historial' ? 'active' : ''}`}
                    onClick={() => setVistaActual('historial')}
                  >
                    📋 Historial
                  </button>
                </>
              ) : (
                /* Roles médicos ven todas las opciones */
                <>
                  {esRolMedico() && (
                    <button 
                      className={`sub-nav-btn ${vistaActual === 'screening' ? 'active' : ''}`}
                      onClick={() => setVistaActual('screening')}
                    >
                      🩺 Screening D-Score
                    </button>
                  )}
                  <button 
                    className={`sub-nav-btn ${vistaActual === 'hitos' ? 'active' : ''}`}
                    onClick={() => setVistaActual('hitos')}
                  >
                    ✅ Hitos del Desarrollo
                  </button>
                  <button 
                    className={`sub-nav-btn ${vistaActual === 'redflags' ? 'active' : ''}`}
                    onClick={() => setVistaActual('redflags')}
                  >
                    🚩 Señales de Alarma
                  </button>
                  <button 
                    className={`sub-nav-btn ${vistaActual === 'grafico' ? 'active' : ''}`}
                    onClick={() => setVistaActual('grafico')}
                  >
                    📊 Gráficas
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Sub-pestañas jerárquicas para tutorial */}
        {vistaActual === 'tutorial' && (
          <div className="nav-level-2">
            <div className="sub-nav-buttons">
              <div className="tutorial-name-tab">
                <div className="tutorial-nombre">📖 Tutorial</div>
              </div>
              <button 
                className={`sub-nav-btn ${subVistaTutorial === 'guia' ? 'active' : ''}`}
                onClick={() => setSubVistaTutorial('guia')}
              >
                📋 Guía de Trayectorias
              </button>
              <button 
                className={`sub-nav-btn ${subVistaTutorial === 'ejemplos' ? 'active' : ''}`}
                onClick={() => setSubVistaTutorial('ejemplos')}
              >
                📋 Ejemplos Prácticos
              </button>
            </div>
          </div>
        )}

        {/* Sub-pestañas jerárquicas para investigación */}
        {modoAvanzado && vistaActual === 'investigacion' && (
          <div className="nav-level-2">
            <div className="sub-nav-buttons">
              <div className="investigacion-name-tab">
                <div className="investigacion-nombre">🔬 Investigación</div>
              </div>
              <button 
                className={`sub-nav-btn ${subVistaInvestigacion === 'limitaciones' ? 'active' : ''}`}
                onClick={() => setSubVistaInvestigacion('limitaciones')}
              >
                ⚠️ Limitaciones Estadísticas
              </button>
              <button 
                className={`sub-nav-btn ${subVistaInvestigacion === 'simulacion' ? 'active' : ''}`}
                onClick={() => setSubVistaInvestigacion('simulacion')}
              >
                🧪 Simulación de Poblaciones
              </button>

              <button 
                className={`sub-nav-btn ${subVistaInvestigacion === 'fuentes-normativas' ? 'active' : ''}`}
                onClick={() => setSubVistaInvestigacion('fuentes-normativas')}
              >
                🗂️ Fuentes Normativas
              </button>
            </div>
          </div>
        )}

        {/* Sub-pestañas jerárquicas para D-score Educativo */}
        {vistaActual === 'dscore' && (
          <div className="nav-level-2">
            <div className="sub-nav-buttons">
              <div className="dscore-name-tab">
                <div className="dscore-nombre">📊 D-score Educativo</div>
              </div>
              
              {/* Pestañas solo visibles en modo avanzado */}
              {modoAvanzado && (
                <>
                  <button 
                    className={`sub-nav-btn ${subVistaDScore === 'concepto' ? 'active' : ''}`}
                    onClick={() => setSubVistaDScore('concepto')}
                  >
                    💡 Concepto
                  </button>
                  <button 
                    className={`sub-nav-btn ${subVistaDScore === 'metodologia' ? 'active' : ''}`}
                    onClick={() => setSubVistaDScore('metodologia')}
                  >
                    🔬 Metodología
                  </button>
                  <button 
                    className={`sub-nav-btn ${subVistaDScore === 'interpretacion' ? 'active' : ''}`}
                    onClick={() => setSubVistaDScore('interpretacion')}
                  >
                    📖 Interpretación
                  </button>
                  <button 
                    className={`sub-nav-btn ${subVistaDScore === 'grafica' ? 'active' : ''}`}
                    onClick={() => setSubVistaDScore('grafica')}
                  >
                    📈 Gráfica de Referencia
                  </button>
                </>
              )}
              
              {/* Pestañas visibles en todos los modos */}
              <button 
                className={`sub-nav-btn ${subVistaDScore === 'guia' ? 'active' : ''}`}
                onClick={() => setSubVistaDScore('guia')}
              >
                📋 Guía Práctica
              </button>
              <button 
                className={`sub-nav-btn ${subVistaDScore === 'fuentes' ? 'active' : ''}`}
                onClick={() => setSubVistaDScore('fuentes')}
              >
                📚 Referencias
              </button>
            </div>
          </div>
        )}

        {/* Sub-pestañas jerárquicas para biblioteca de datos */}
        {esAdmin() && vistaActual === 'datos' && (
          <div className="nav-level-2">
            <div className="sub-nav-buttons">
              <div className="biblioteca-name-tab">
                <div className="biblioteca-nombre">🗄️ Biblioteca de Datos</div>
              </div>
              <button 
                className={`sub-nav-btn ${subVistaBibliotecaDatos === 'escalas-normativas' ? 'active' : ''}`}
                onClick={() => setSubVistaBibliotecaDatos('escalas-normativas')}
              >
                📊 Escalas Normativas
              </button>
              <button 
                className={`sub-nav-btn ${subVistaBibliotecaDatos === 'cohortes-personalizadas' ? 'active' : ''}`}
                onClick={() => setSubVistaBibliotecaDatos('cohortes-personalizadas')}
              >
                👥 Cohortes Personalizadas
              </button>
              <button 
                className={`sub-nav-btn ${subVistaBibliotecaDatos === 'estadisticas-uso' ? 'active' : ''}`}
                onClick={() => setSubVistaBibliotecaDatos('estadisticas-uso')}
              >
                📈 Estadísticas de Uso
              </button>
            </div>
          </div>
        )}
      </nav>

      <main className="main-content">

        {vistaActual === 'lista' && (
          <div>
            <NinoForm onNinoCreado={handleNinoCreado} />
            <NinosList 
              ninos={ninos} 
              onNinoSeleccionado={handleNinoSeleccionado}
              onNinoEliminado={handleNinoEliminado}
            />
          </div>
        )}

        {vistaActual === 'tutorial' && (
          <>
            {subVistaTutorial === 'guia' && (
              <Fundamentos />
            )}
            {subVistaTutorial === 'ejemplos' && (
              <EjemplosPracticos 
                onEjemploCreado={handleEjemploCreado}
                onSeleccionarNino={(nino) => {
                  setNinoSeleccionado(nino);
                  setVistaActual(esEnfermeria() ? 'screening' : 'hitos');
                }}
              />
            )}
          </>
        )}

        {vistaActual === 'hitos' && ninoSeleccionado && (
          <HitosRegistro ninoId={ninoSeleccionado.id} />
        )}

        {vistaActual === 'screening' && ninoSeleccionado && (esRolMedico() || esEnfermeria()) && (
          <ScreeningEnfermeria 
            ninoId={ninoSeleccionado.id} 
            nino={ninoSeleccionado}
            onActualizarNino={cargarNinos}
            vistaInicial="evaluacion"
          />
        )}

        {vistaActual === 'historial' && ninoSeleccionado && esEnfermeria() && (
          <ScreeningEnfermeria 
            ninoId={ninoSeleccionado.id} 
            nino={ninoSeleccionado}
            onActualizarNino={cargarNinos}
            vistaInicial="historial"
          />
        )}

        {vistaActual === 'redflags' && ninoSeleccionado && (
          <RedFlagsRegistro ninoId={ninoSeleccionado.id} />
        )}

        {vistaActual === 'grafico' && ninoSeleccionado && (
          <GraficoDesarrollo 
            ninoId={ninoSeleccionado.id} 
            onDatosRegresionCalculados={setDatosRegresion}
            modoAvanzado={modoAvanzado}
          />
        )}

        {vistaActual === 'investigacion' && (
          <Investigacion subVista={subVistaInvestigacion} />
        )}
        
        {vistaActual === 'medios' && esAdmin() && (
          <BibliotecaMedios />
        )}
        
        {vistaActual === 'datos' && esAdmin() && (
          <BibliotecaDatos subVista={subVistaBibliotecaDatos} />
        )}
        
        {vistaActual === 'dscore' && (
          <DScoreEducacion activeTab={subVistaDScore} />
        )}
      </main>
    </div>
  );
}

function calcularEdad(fechaNacimiento) {
  const fechaNac = new Date(fechaNacimiento);
  const hoy = new Date();
  const diffTime = Math.abs(hoy - fechaNac);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const meses = Math.floor(diffDays / 30.44);
  const anos = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;
  
  if (anos > 0) {
    return `${anos} año${anos > 1 ? 's' : ''} y ${mesesRestantes} mes${mesesRestantes !== 1 ? 'es' : ''}`;
  } else {
    return `${meses} mes${meses !== 1 ? 'es' : ''}`;
  }
}

function calcularEdadCorregida(fechaNacimiento, semanasGestacion) {
  // Calcular semanas de prematuridad (40 semanas - semanas de gestación)
  const semanasPrematuro = 40 - semanasGestacion;
  const diasARestar = semanasPrematuro * 7;
  
  // Fecha de nacimiento corregida (como si hubiera nacido a término)
  const fechaNacCorregida = new Date(fechaNacimiento);
  fechaNacCorregida.setDate(fechaNacCorregida.getDate() + diasARestar);
  
  const hoy = new Date();
  const diffTime = Math.abs(hoy - fechaNacCorregida);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const meses = Math.floor(diffDays / 30.44);
  const anos = Math.floor(meses / 12);
  const mesesRestantes = meses % 12;
  
  // Si la edad corregida es negativa (todavía no ha llegado al término), mostrar 0
  if (diffDays < 0) {
    return '0 meses';
  }
  
  if (anos > 0) {
    return `${anos} año${anos > 1 ? 's' : ''} y ${mesesRestantes} mes${mesesRestantes !== 1 ? 'es' : ''}`;
  } else {
    return `${meses} mes${meses !== 1 ? 'es' : ''}`;
  }
}

export default App;
