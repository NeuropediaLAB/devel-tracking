const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const db = require('./database');
const { verificarToken, verificarAdmin, verificarRolMedico, verificarNeuropediatra, verificarPediatra, generarToken } = require('./authMiddleware');

const app = express();
const PORT = process.env.PORT || 8001;

// Función helper para verificar acceso a un niño
function verificarAccesoNino(ninoId, usuarioId, rol, callback) {
  // Roles con acceso completo
  if (['admin', 'neuropediatra'].includes(rol)) {
    // Admin y neuropediatra tienen acceso a todos los casos
    callback(null, true);
  } else if (rol === 'invitado') {
    // Invitados solo pueden acceder a sus propios datos temporales
    // El ninoId para invitados es el mismo que el usuarioId
    callback(null, ninoId === usuarioId);
  } else if (['pediatra_ap', 'enfermeria'].includes(rol)) {
    // Pediatras y enfermería pueden acceder a casos de su área pero con limitaciones
    // Por ahora, mismo comportamiento que usuario normal
    db.get('SELECT id FROM ninos WHERE id = ? AND usuario_id = ?', [ninoId, usuarioId], (err, row) => {
      if (err) return callback(err, false);
      callback(null, !!row);
    });
  } else {
    // Usuario normal solo puede acceder a sus propios niños
    db.get('SELECT id FROM ninos WHERE id = ? AND usuario_id = ?', [ninoId, usuarioId], (err, row) => {
      if (err) return callback(err, false);
      callback(null, !!row);
    });
  }
}

// Configuración de CORS con servidores autorizados
const allowedOrigins = [
  'http://localhost:3002',
  'http://localhost:5173',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:5173',
  'http://192.168.0.114:5173', // IP address of the development machine
  'http://neurodesarrollo-backend:8001', // Contenedor Docker interno
  'http://172.18.0.2:3000', // Red Docker
  'https://dev.neuropedialab.org',
  'https://devel-tracking.neuropedialab.org'
];

app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl requests)
    if (!origin) return callback(null, true);
    
    // Log para debug
    console.log('🔍 Intento de conexión desde origen:', origin);
    
    // Permitir cualquier origen que sea localhost o IP local en desarrollo
    const isLocalOrigin = origin.match(/^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|169\.254\.\d+\.\d+):\d+$/);
    
    if (allowedOrigins.indexOf(origin) !== -1 || isLocalOrigin) {
      console.log('✅ Origen aceptado:', origin);
      return callback(null, true);
    }
    
    const msg = 'La política CORS de este sitio no permite el acceso desde el origen especificado.';
    console.error('❌ Origen rechazado:', origin);
    console.error('✅ Orígenes permitidos:', allowedOrigins);
    return callback(new Error(msg), false);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(bodyParser.json());

// ==================== RUTAS DE AUTENTICACIÓN ====================

// Registro de nuevo usuario
app.post('/api/auth/registro', async (req, res) => {
  const { email, password, nombre, rol } = req.body;

  // Validación
  if (!email || !password || !nombre) {
    return res.status(400).json({ error: 'Email, contraseña y nombre son requeridos' });
  }

  // Validar rol
  const rolesPermitidos = ['enfermeria', 'pediatra_ap', 'neuropediatra', 'admin'];
  const rolSeleccionado = rol && rolesPermitidos.includes(rol) ? rol : 'enfermeria';

  if (password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
  }

  // Verificar si el email ya existe
  db.get('SELECT id FROM usuarios WHERE email = ?', [email], async (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(400).json({ error: 'El email ya está registrado' });

    // Hash de la contraseña
    const passwordHash = bcrypt.hashSync(password, 10);

    // Insertar nuevo usuario
    db.run(
      'INSERT INTO usuarios (email, password_hash, nombre, rol) VALUES (?, ?, ?, ?)',
      [email, passwordHash, nombre, rolSeleccionado],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });

        const nuevoUsuario = {
          id: this.lastID,
          email,
          nombre,
          rol: rolSeleccionado
        };

        const token = generarToken(nuevoUsuario);
        
        res.status(201).json({
          mensaje: 'Usuario registrado exitosamente',
          token,
          usuario: nuevoUsuario
        });
      }
    );
  });
});

// Login de usuario
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  // Validación
  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  // Buscar usuario
  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, usuario) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!usuario) return res.status(401).json({ error: 'Credenciales inválidas' });

    // Verificar contraseña
    const passwordValida = bcrypt.compareSync(password, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar si está activo
    if (!usuario.activo) {
      return res.status(403).json({ error: 'Usuario desactivado' });
    }

    // Actualizar último acceso
    db.run('UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ?', [usuario.id]);

    // Generar token
    const token = generarToken(usuario);

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol
      }
    });
  });
});

// Verificar token (para mantener sesión)
app.get('/api/auth/verificar', verificarToken, (req, res) => {
  res.json({
    valido: true,
    usuario: req.usuario
  });
});

// Obtener perfil del usuario actual
app.get('/api/auth/perfil', verificarToken, (req, res) => {
  db.get(
    'SELECT id, email, nombre, rol, creado_en, ultimo_acceso FROM usuarios WHERE id = ?',
    [req.usuario.id],
    (err, usuario) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(usuario);
    }
  );
});

// Cambiar contraseña
app.post('/api/auth/cambiar-password', verificarToken, (req, res) => {
  const { passwordActual, passwordNueva } = req.body;

  if (!passwordActual || !passwordNueva) {
    return res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
  }

  if (passwordNueva.length < 6) {
    return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
  }

  // Obtener usuario actual
  db.get('SELECT password_hash FROM usuarios WHERE id = ?', [req.usuario.id], (err, usuario) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    // Verificar contraseña actual
    const passwordValida = bcrypt.compareSync(passwordActual, usuario.password_hash);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    // Hash de nueva contraseña
    const nuevoHash = bcrypt.hashSync(passwordNueva, 10);

    // Actualizar contraseña
    db.run('UPDATE usuarios SET password_hash = ? WHERE id = ?', [nuevoHash, req.usuario.id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ mensaje: 'Contraseña actualizada exitosamente' });
    });
  });
});

// ==================== RUTAS DE ADMINISTRACIÓN (solo admin) ====================

// Obtener información de roles del sistema (solo admin)
app.get('/api/admin/roles', verificarToken, verificarAdmin, (req, res) => {
  const roles = [
    {
      id: 'admin',
      nombre: 'Administrador',
      descripcion: 'Acceso completo al sistema, gestión de usuarios y configuración',
      permisos: ['Gestión de usuarios', 'Acceso a todos los casos', 'Configuración del sistema', 'Estadísticas globales']
    },
    {
      id: 'neuropediatra',
      nombre: 'Neuropediatra',
      descripcion: 'Especialista en desarrollo neurológico infantil',
      permisos: ['Acceso a todos los casos', 'Diagnóstico especializado', 'Clasificación de trayectorias', 'Análisis avanzado']
    },
    {
      id: 'pediatra_ap',
      nombre: 'Pediatra de Atención Primaria',
      descripcion: 'Médico de primera línea en seguimiento del desarrollo',
      permisos: ['Seguimiento básico', 'Detección temprana', 'Derivación a especialistas', 'Evaluación inicial']
    },
    {
      id: 'enfermeria',
      nombre: 'Enfermería',
      descripcion: 'Personal de enfermería especializado en desarrollo infantil',
      permisos: ['Registro de hitos', 'Seguimiento rutinario', 'Apoyo familiar', 'Educación sanitaria']
    },
    {
      id: 'usuario',
      nombre: 'Usuario General',
      descripcion: 'Acceso básico para familias y otros profesionales',
      permisos: ['Acceso a casos propios', 'Registro básico', 'Consulta de datos', 'Informes básicos']
    }
  ];
  res.json(roles);
});

// Listar todos los usuarios (solo admin)
app.get('/api/admin/usuarios', verificarToken, verificarAdmin, (req, res) => {
  db.all(
    'SELECT id, email, nombre, rol, activo, creado_en, ultimo_acceso FROM usuarios ORDER BY creado_en DESC',
    (err, usuarios) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(usuarios);
    }
  );
});

// Activar/Desactivar usuario (solo admin)
app.put('/api/admin/usuarios/:id/toggle-activo', verificarToken, verificarAdmin, (req, res) => {
  const { id } = req.params;

  db.get('SELECT activo FROM usuarios WHERE id = ?', [id], (err, usuario) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const nuevoEstado = usuario.activo ? 0 : 1;

    db.run('UPDATE usuarios SET activo = ? WHERE id = ?', [nuevoEstado, id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ 
        mensaje: `Usuario ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`,
        activo: nuevoEstado
      });
    });
  });
});

// Cambiar rol de usuario (solo admin)
app.put('/api/admin/usuarios/:id/cambiar-rol', verificarToken, verificarAdmin, (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;

  const rolesValidos = ['enfermeria', 'pediatra_ap', 'neuropediatra', 'admin'];
  if (!rolesValidos.includes(rol)) {
    return res.status(400).json({ 
      error: 'Rol inválido. Debe ser uno de: ' + rolesValidos.join(', ') 
    });
  }

  db.run('UPDATE usuarios SET rol = ? WHERE id = ?', [rol, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ mensaje: 'Rol actualizado exitosamente', rol });
  });
});

// Ver todos los niños de todos los usuarios (solo admin)
app.get('/api/admin/ninos', verificarToken, verificarAdmin, (req, res) => {
  db.all(
    `SELECT n.*, u.nombre as nombre_usuario, u.email as email_usuario 
     FROM ninos n 
     LEFT JOIN usuarios u ON n.usuario_id = u.id 
     ORDER BY n.creado_en DESC`,
    (err, ninos) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(ninos);
    }
  );
});

// ==================== RUTAS DE BIBLIOTECA DE DATOS (solo admin en modo avanzado) ====================

// Endpoint de prueba para verificar conexión a la base de datos
app.get('/api/admin/test-db', verificarToken, verificarAdmin, (req, res) => {
  db.get('SELECT COUNT(*) as count FROM hitos_normativos LIMIT 1', [], (err, row) => {
    if (err) {
      console.error('Database test error:', err);
      return res.status(500).json({ error: 'Database connection failed', message: err.message });
    }
    res.json({ status: 'ok', message: 'Database connection successful', count: row.count });
  });
});

// Endpoint temporal sin autenticación para probar
app.get('/api/test-escalas', (req, res) => {
  db.all('SELECT COUNT(*) as total FROM hitos_normativos', [], (err, result) => {
    if (err) {
      console.error('Database test error:', err);
      return res.status(500).json({ error: 'Database connection failed', message: err.message });
    }
    res.json({ status: 'ok', escalas: result[0].total });
  });
});

// Obtener todas las escalas normativas del sistema
app.get('/api/admin/escalas-normativas', verificarToken, verificarAdmin, (req, res) => {
  const query = `
    SELECT h.id, h.nombre, h.descripcion, h.edad_media_meses, h.desviacion_estandar, 
           h.edad_minima_meses, h.edad_maxima_meses,
           -- Calcular percentiles aproximados basados en distribución normal
           ROUND(h.edad_media_meses - (0.674 * h.desviacion_estandar), 1) as percentil_25,
           ROUND(h.edad_media_meses, 1) as percentil_50,
           ROUND(h.edad_media_meses + (0.674 * h.desviacion_estandar), 1) as percentil_75,
           f.nombre as fuente_normativa_nombre, 
           d.nombre as dominio_nombre
    FROM hitos_normativos h
    LEFT JOIN fuentes_normativas f ON h.fuente_normativa_id = f.id
    LEFT JOIN dominios d ON h.dominio_id = d.id
    ORDER BY h.edad_media_meses, d.nombre, f.nombre
  `;
  
  db.all(query, [], (err, escalas) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(escalas);
  });
});

// Obtener cohortes personalizadas de usuarios
app.get('/api/admin/cohortes-personalizadas', verificarToken, verificarAdmin, (req, res) => {
  const query = `
    SELECT 
      u.id as usuario_id,
      u.nombre as usuario_nombre,
      u.email as usuario_email,
      'Cohorte de ' || u.nombre as nombre,
      'Datos normativos personalizados del usuario ' || u.nombre as descripcion,
      COUNT(DISTINCT n.id) as total_ninos,
      COUNT(DISTINCT hc.id) as total_evaluaciones,
      MIN(n.creado_en) as fecha_creacion,
      COALESCE(MAX(hc.fecha_registro), MAX(n.creado_en)) as fecha_actualizacion
    FROM usuarios u
    LEFT JOIN ninos n ON u.id = n.usuario_id
    LEFT JOIN hitos_conseguidos hc ON n.id = hc.nino_id
    WHERE u.rol != 'admin' AND u.rol != 'invitado' AND u.activo = 1
    GROUP BY u.id, u.nombre, u.email
    HAVING COUNT(DISTINCT n.id) > 0
    ORDER BY total_evaluaciones DESC, total_ninos DESC
  `;
  
  db.all(query, [], (err, cohortes) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(cohortes.map(c => ({
      id: c.usuario_id,
      usuario_id: c.usuario_id,
      usuario_nombre: c.usuario_nombre,
      nombre: c.nombre,
      descripcion: c.descripcion,
      total_ninos: c.total_ninos || 0,
      total_evaluaciones: c.total_evaluaciones || 0,
      fecha_creacion: c.fecha_creacion,
      fecha_actualizacion: c.fecha_actualizacion
    })));
  });
});

// Obtener estadísticas de uso del sistema
app.get('/api/admin/estadisticas-uso', verificarToken, verificarAdmin, (req, res) => {
  const query = `
    SELECT 
      u.id as usuario_id,
      u.nombre as usuario_nombre,
      u.email as usuario_email,
      u.ultimo_acceso,
      u.creado_en as fecha_registro,
      u.rol,
      u.activo,
      COUNT(DISTINCT n.id) as ninos_registrados,
      COUNT(DISTINCT hc.id) as evaluaciones_realizadas,
      COUNT(DISTINCT rfo.id) as red_flags_observadas,
      COUNT(DISTINCT ee.id) as escalas_aplicadas,
      COALESCE(
        ROUND((
          COUNT(DISTINCT hc.id) * 3 + 
          COUNT(DISTINCT n.id) * 10 + 
          COUNT(DISTINCT rfo.id) * 2 +
          COUNT(DISTINCT ee.id) * 15
        ), 0), 0
      ) as tiempo_total_minutos
    FROM usuarios u
    LEFT JOIN ninos n ON u.id = n.usuario_id
    LEFT JOIN hitos_conseguidos hc ON n.id = hc.nino_id
    LEFT JOIN red_flags_observadas rfo ON n.id = rfo.nino_id
    LEFT JOIN escalas_evaluaciones ee ON n.id = ee.nino_id
    WHERE u.rol != 'invitado'
    GROUP BY u.id, u.nombre, u.email, u.ultimo_acceso, u.creado_en, u.rol, u.activo
    ORDER BY evaluaciones_realizadas DESC, ninos_registrados DESC
  `;
  
  db.all(query, [], (err, estadisticas) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(estadisticas);
  });
});

// Obtener metadatos generales del sistema
app.get('/api/admin/metadatos-sistema', verificarToken, verificarAdmin, (req, res) => {
  const queries = {
    total_usuarios: "SELECT COUNT(*) as count FROM usuarios WHERE rol != 'invitado'",
    usuarios_activos_30d: "SELECT COUNT(*) as count FROM usuarios WHERE ultimo_acceso > datetime('now', '-30 days') AND rol != 'invitado'",
    total_evaluaciones: "SELECT COUNT(*) as count FROM hitos_conseguidos",
    total_graficas: "SELECT COUNT(DISTINCT nino_id) as count FROM hitos_conseguidos WHERE nino_id IS NOT NULL",
    total_ninos: "SELECT COUNT(*) as count FROM ninos",
    total_red_flags: "SELECT COUNT(*) as count FROM red_flags_observadas",
    total_escalas_normativas: "SELECT COUNT(*) as count FROM hitos_normativos",
    total_fuentes_normativas: "SELECT COUNT(*) as count FROM fuentes_normativas WHERE activa = 1",
    total_dominios: "SELECT COUNT(*) as count FROM dominios",
    total_videos: "SELECT COUNT(*) as count FROM videos",
    usuarios_con_datos: "SELECT COUNT(DISTINCT usuario_id) as count FROM ninos",
    promedio_ninos_por_usuario: `SELECT ROUND(AVG(ninos_count), 1) as count FROM (
      SELECT COUNT(*) as ninos_count FROM ninos GROUP BY usuario_id
    )`,
    promedio_evaluaciones_por_nino: `SELECT ROUND(AVG(eval_count), 1) as count FROM (
      SELECT COUNT(*) as eval_count FROM hitos_conseguidos GROUP BY nino_id
    )`
  };
  
  const metadatos = {};
  let completed = 0;
  const totalQueries = Object.keys(queries).length;
  
  Object.keys(queries).forEach(key => {
    db.get(queries[key], [], (err, row) => {
      if (!err && row) {
        metadatos[key] = row.count || 0;
      } else {
        metadatos[key] = 0;
      }
      
      completed++;
      if (completed === totalQueries) {
        res.json(metadatos);
      }
    });
  });
});

// ==================== RUTAS DE NIÑOS ====================

// Obtener todos los niños del usuario actual
app.get('/api/ninos', verificarToken, (req, res) => {
  // Para usuarios invitados, devolver array vacío
  if (req.usuario.rol === 'invitado') {
    return res.json([]);
  }
  
  // Si es admin, puede ver todos; si no, solo los suyos
  const query = req.usuario.rol === 'admin' 
    ? 'SELECT n.*, u.nombre as nombre_usuario, u.email as email_usuario FROM ninos n LEFT JOIN usuarios u ON n.usuario_id = u.id ORDER BY n.nombre'
    : 'SELECT * FROM ninos WHERE usuario_id = ? ORDER BY nombre';
  
  const params = req.usuario.rol === 'admin' ? [] : [req.usuario.id];

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear nuevo niño
app.post('/api/ninos', verificarToken, (req, res) => {
  const { nombre, fecha_nacimiento, semanas_gestacion } = req.body;
  
  // Validación
  if (!nombre || !fecha_nacimiento) {
    console.error('Error: Faltan campos requeridos');
    return res.status(400).json({ error: 'Nombre y fecha de nacimiento son requeridos' });
  }
  
  const semanasGest = semanas_gestacion || 40; // Default 40 si no se proporciona
  
  db.run('INSERT INTO ninos (nombre, fecha_nacimiento, semanas_gestacion, usuario_id) VALUES (?, ?, ?, ?)', 
    [nombre, fecha_nacimiento, semanasGest, req.usuario.id], 
    function(err) {
      if (err) {
        console.error('Error en base de datos:', err.message);
        return res.status(500).json({ error: err.message });
      }
      const resultado = { 
        id: this.lastID, 
        nombre, 
        fecha_nacimiento, 
        semanas_gestacion: semanasGest,
        usuario_id: req.usuario.id
      };
      res.json(resultado);
    }
  );
});

// Obtener un niño específico
app.get('/api/ninos/:id', verificarToken, (req, res) => {
  // Para usuarios invitados, devolver datos mock
  if (req.usuario.rol === 'invitado') {
    return res.json({
      id: req.params.id,
      nombre: 'Niño de Ejemplo',
      fecha_nacimiento: new Date().toISOString().split('T')[0],
      semanas_gestacion: 40,
      usuario_id: req.usuario.id
    });
  }
  
  // Verificar que el niño pertenece al usuario (o que el usuario es admin)
  const query = req.usuario.rol === 'admin'
    ? 'SELECT n.*, u.nombre as nombre_usuario, u.email as email_usuario FROM ninos n LEFT JOIN usuarios u ON n.usuario_id = u.id WHERE n.id = ?'
    : 'SELECT * FROM ninos WHERE id = ? AND usuario_id = ?';
  
  const params = req.usuario.rol === 'admin' ? [req.params.id] : [req.params.id, req.usuario.id];

  db.get(query, params, (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Niño no encontrado o no tienes acceso' });
    res.json(row);
  });
});

// Eliminar un niño (y todos sus datos relacionados)
app.delete('/api/ninos/:id', verificarToken, (req, res) => {
  const ninoId = req.params.id;
  
  // Verificar que el niño pertenece al usuario (o que el usuario es admin)
  const verificarQuery = req.usuario.rol === 'admin'
    ? 'SELECT id FROM ninos WHERE id = ?'
    : 'SELECT id FROM ninos WHERE id = ? AND usuario_id = ?';
  
  const verificarParams = req.usuario.rol === 'admin' ? [ninoId] : [ninoId, req.usuario.id];

  db.get(verificarQuery, verificarParams, (err, nino) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!nino) return res.status(404).json({ error: 'Niño no encontrado o no tienes acceso' });

    db.serialize(() => {
      db.run('DELETE FROM hitos_conseguidos WHERE nino_id = ?', [ninoId]);
      db.run('DELETE FROM hitos_no_alcanzados WHERE nino_id = ?', [ninoId]);
      db.run('DELETE FROM red_flags_observadas WHERE nino_id = ?', [ninoId]);
      
      db.run('DELETE FROM ninos WHERE id = ?', [ninoId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: 'Niño eliminado correctamente' });
      });
    });
  });
});

// ==================== RUTAS DE DOMINIOS ====================

app.get('/api/dominios', (req, res) => {
  db.all('SELECT * FROM dominios ORDER BY id', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ==================== RUTAS DE FUENTES NORMATIVAS ====================

app.get('/api/fuentes-normativas', (req, res) => {
  db.all('SELECT * FROM fuentes_normativas WHERE activa = 1 ORDER BY id', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/fuentes-normativas/:id', (req, res) => {
  db.get('SELECT * FROM fuentes_normativas WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Fuente normativa no encontrada' });
    res.json(row);
  });
});

// Informacion detallada de fuentes normativas con dominios cubiertos
app.get('/api/fuentes-normativas-detalle', (req, res) => {
  db.all('SELECT * FROM fuentes_normativas WHERE activa = 1 ORDER BY id', (err, fuentes) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const promesas = fuentes.map(fuente => {
      return new Promise((resolve, reject) => {
        const query = `
          SELECT DISTINCT d.id, d.nombre, COUNT(hn.id) as num_hitos
          FROM dominios d
          LEFT JOIN hitos_normativos hn ON d.id = hn.dominio_id AND hn.fuente_normativa_id = ?
          WHERE hn.id IS NOT NULL
          GROUP BY d.id, d.nombre
          ORDER BY d.id
        `;
        db.all(query, [fuente.id], (err, dominios) => {
          if (err) reject(err);
          else {
            const urlMatch = fuente.referencia_bibliografica.match(/(https?:\/\/[^\s]+)/);
            const url = urlMatch ? urlMatch[1] : null;
            
            const infoAdicional = getInfoAdicionalFuente(fuente.id);
            
            resolve({
              ...fuente,
              url_original: url,
              dominios_cubiertos: dominios,
              total_dominios: dominios.length,
              total_hitos: dominios.reduce((sum, d) => sum + d.num_hitos, 0),
              ...infoAdicional
            });
          }
        });
      });
    });
    
    Promise.all(promesas)
      .then(resultados => res.json(resultados))
      .catch(error => res.status(500).json({ error: error.message }));
  });
});

function getInfoAdicionalFuente(fuenteId) {
  const info = {
    1: {
      nombre_corto: 'CDC',
      tipo: 'Guia clinica',
      metodologia: 'Revision sistematica y consenso de expertos',
      fortalezas: [
        'Actualizada recientemente (2022)',
        'Enfoque practico para pediatria',
        'Criterio del 75% de niños (no 50%)',
        'Gratuita y de acceso publico'
      ],
      limitaciones: [
        'Menos rigurosa estadisticamente que escalas estandarizadas',
        'Poblacion principalmente estadounidense',
        'No es instrumento diagnostico formal'
      ],
      mejor_para: 'Screening inicial en atencion primaria',
      cobertura_dominios: 'Amplia (todos los dominios principales)',
      validacion: 'Consenso de expertos, no estandarizacion formal',
      edad_rango: '2 meses - 5 años'
    },
    2: {
      nombre_corto: 'OMS',
      tipo: 'Estudio normativo internacional',
      metodologia: 'Estudio multicentrico longitudinal',
      fortalezas: [
        'Estandar internacional',
        'Muestra multicultural',
        'Seguimiento longitudinal riguroso',
        'Ventanas de logro (no solo promedios)'
      ],
      limitaciones: [
        'Enfoque principal en motor grueso',
        'Menos hitos en otros dominios',
        'Datos de 2006',
        'Muestra con crianza optima (menos variabilidad)'
      ],
      mejor_para: 'Comparacion intercultural y seguimiento motor',
      cobertura_dominios: 'Excelente en motor grueso, limitada en otros',
      validacion: 'Estudio prospectivo multicentrico (n=816)',
      edad_rango: 'Nacimiento - 24 meses (principalmente motor)'
    },
    3: {
      nombre_corto: 'Bayley-III',
      tipo: 'Escala estandarizada diagnostica',
      metodologia: 'Estandarizacion formal con muestra estratificada',
      fortalezas: [
        'Gold standard en evaluacion del desarrollo',
        'Excelente fiabilidad (α > 0.86)',
        'Validez bien establecida',
        'Normas actualizadas y detalladas',
        'Cobertura completa de dominios'
      ],
      limitaciones: [
        'Requiere formacion especializada',
        'Administracion larga (30-90 min)',
        'Costosa (requiere licencia)',
        'Poblacion principalmente USA'
      ],
      mejor_para: 'Evaluacion diagnostica completa y seguimiento de alto riesgo',
      cobertura_dominios: 'Completa (5 escalas: Cognitivo, Lenguaje, Motor, Socio-emocional, Adaptativo)',
      validacion: 'Muestra normativa n=1,700 estratificada',
      edad_rango: '1 - 42 meses'
    },
    4: {
      nombre_corto: 'BDI-2',
      tipo: 'Inventario completo del desarrollo',
      metodologia: 'Estandarizacion con sobremuestreo de grupos especiales',
      fortalezas: [
        'Rango de edad amplio (0-7 años)',
        'Multiples metodos de evaluacion',
        'Buena para planificacion de intervencion',
        'Incluye grupos especiales en normas',
        'Subescalas detalladas'
      ],
      limitaciones: [
        'Administracion muy larga (1-2 horas completa)',
        'Requiere formacion',
        'Datos de 2005',
        'Menos sensible que Bayley en edad temprana'
      ],
      mejor_para: 'Evaluacion integral para planificacion educativa e intervencion',
      cobertura_dominios: 'Muy completa (5 dominios con 13 subescalas)',
      validacion: 'Muestra normativa n=2,500 con grupos especiales',
      edad_rango: 'Nacimiento - 7 años 11 meses'
    },
    10: {
      nombre_corto: 'D-score',
      tipo: 'Métrica continua de desarrollo basada en IRT',
      metodologia: 'Teoría de Respuesta al Ítem (Item Response Theory) con modelo de Rasch',
      fortalezas: [
        'Comparabilidad transcultural (15 países)',
        'Métrica continua sin techo',
        'Integra múltiples escalas de desarrollo',
        'Base de datos global abierta (childdevdata)',
        'Monitoreo longitudinal preciso',
        'No requiere licencia',
        'Edad equivalente del desarrollo (DAZ)'
      ],
      limitaciones: [
        'Relativamente nuevo (2019)',
        'Requiere software específico para cálculo',
        'No es herramienta diagnóstica standalone',
        'Menor reconocimiento que escalas tradicionales'
      ],
      mejor_para: 'Monitoreo poblacional, screening, investigación transcultural y seguimiento longitudinal',
      cobertura_dominios: 'Motor grueso, Motor fino, Lenguaje expresivo, Social-emocional',
      validacion: 'Global Child Development Group (GCDG) - datos de 15 países, múltiples cohortes',
      edad_rango: 'Nacimiento - 36 meses (óptimo)',
      website: 'https://d-score.org/childdevdata/',
      recursos: [
        'Base de datos: https://d-score.org/childdevdata/',
        'Paquete R: dscore',
        'Calculadora online disponible',
        'Documentación completa open-source'
      ]
    }
  };
  
  return info[fuenteId] || {};
}

// ==================== ENDPOINTS PARA FUENTES NORMATIVAS COMPLETAS ====================

// Endpoint para fuentes normativas con información completa
app.get('/api/fuentes-normativas-completas', (req, res) => {
  const query = `
    SELECT 
      fn.*,
      COUNT(DISTINCT hn.id) as total_hitos,
      MIN(hn.edad_media_meses) as edad_minima,
      MAX(hn.edad_media_meses) as edad_maxima,
      AVG(hn.edad_media_meses) as edad_media,
      AVG(hn.desviacion_estandar) as de_media
    FROM fuentes_normativas fn
    LEFT JOIN hitos_normativos hn ON fn.id = hn.fuente_normativa_id
    WHERE fn.activa = 1
    GROUP BY fn.id
    ORDER BY fn.id
  `;
  
  db.all(query, [], (err, fuentes) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Añadir información adicional conocida
    const fuentesCompletas = fuentes.map(fuente => {
      const infoAdicional = getInfoAdicionalFuente(fuente.id);
      
      return {
        ...fuente,
        ...infoAdicional,
        // Información psicométrica adicional
        año_publicacion: getAñoPublicacion(fuente.id),
        pais_region: getPaisRegion(fuente.id),
        autores: getAutores(fuente.id),
        editorial: getEditorial(fuente.id),
        descripcion: getDescripcion(fuente.id),
        metodologia: getMetodologia(fuente.id),
        limitaciones: getLimitaciones(fuente.id),
        confiabilidad: getConfiabilidad(fuente.id),
        validez: getValidez(fuente.id),
        referencias_bibliograficas: getReferencias(fuente.id),
        url_original: getUrlOriginal(fuente.id)
      };
    });
    
    res.json(fuentesCompletas);
  });
});

// Endpoint para estadísticas detalladas por fuente
app.get('/api/estadisticas-fuente/:id', (req, res) => {
  const fuenteId = req.params.id;
  
  const queryEstadisticas = `
    SELECT 
      COUNT(*) as total_hitos,
      MIN(edad_media_meses) as edad_minima,
      MAX(edad_media_meses) as edad_maxima,
      AVG(edad_media_meses) as edad_media,
      AVG(desviacion_estandar) as de_media
    FROM hitos_normativos 
    WHERE fuente_normativa_id = ?
  `;
  
  const queryDominios = `
    SELECT 
      d.nombre as dominio,
      COUNT(hn.id) as cantidad
    FROM dominios d
    JOIN hitos_normativos hn ON d.id = hn.dominio_id
    WHERE hn.fuente_normativa_id = ?
    GROUP BY d.id, d.nombre
    ORDER BY cantidad DESC
  `;
  
  db.get(queryEstadisticas, [fuenteId], (err, estadisticas) => {
    if (err) return res.status(500).json({ error: err.message });
    
    db.all(queryDominios, [fuenteId], (err, dominios) => {
      if (err) return res.status(500).json({ error: err.message });
      
      res.json({
        ...estadisticas,
        dominios_cobertura: dominios
      });
    });
  });
});

// Funciones auxiliares para información adicional
function getAñoPublicacion(fuenteId) {
  const años = {
    1: 2022, // CDC
    2: 2006, // OMS  
    3: 2005, // Bayley
    4: 1984  // Battelle
  };
  return años[fuenteId] || null;
}

function getPaisRegion(fuenteId) {
  const regiones = {
    1: 'Estados Unidos',
    2: 'Internacional (OMS)',
    3: 'Estados Unidos',
    4: 'Estados Unidos'
  };
  return regiones[fuenteId] || 'No especificado';
}

function getAutores(fuenteId) {
  const autores = {
    1: 'CDC - Centros para el Control y Prevención de Enfermedades',
    2: 'Organización Mundial de la Salud',
    3: 'Nancy Bayley',
    4: 'Newborg, Stock, Wnek, Guidubaldi, Svinicki'
  };
  return autores[fuenteId] || 'No especificado';
}

function getEditorial(fuenteId) {
  const editoriales = {
    1: 'CDC',
    2: 'OMS',
    3: 'Harcourt Assessment',
    4: 'DLM Teaching Resources'
  };
  return editoriales[fuenteId] || 'No especificado';
}

function getDescripcion(fuenteId) {
  const descripciones = {
    1: 'Guía clínica basada en evidencia para la identificación temprana de retrasos en el desarrollo en niños de 0 a 5 años.',
    2: 'Estándares internacionales de crecimiento y desarrollo motor grueso basados en estudios multicéntricos.',
    3: 'Escala de evaluación del desarrollo mental y motor para niños de 1 a 42 meses de edad.',
    4: 'Inventario comprensivo de desarrollo que evalúa habilidades en múltiples dominios desde el nacimiento hasta los 8 años.'
  };
  return descripciones[fuenteId] || 'No hay descripción disponible';
}

function getMetodologia(fuenteId) {
  const metodologias = {
    1: 'Revisión sistemática de literatura y consenso de panel de expertos. Criterio del 75% de logro poblacional.',
    2: 'Estudio longitudinal multicéntrico con 8440 niños de 6 países. Mediciones estandarizadas cada 2 semanas.',
    3: 'Estandarización con muestra normativa de 1700 niños. Evaluación directa con materiales específicos.',
    4: 'Estandarización con 800 niños típicos y atípicos. Evaluación observacional y con ítems específicos.'
  };
  return metodologias[fuenteId] || 'No especificada';
}

function getLimitaciones(fuenteId) {
  const limitaciones = {
    1: 'Basado principalmente en población estadounidense. Criterios pueden ser conservadores para algunas poblaciones.',
    2: 'Enfocado principalmente en desarrollo motor grueso. Limitada representación cultural en algunos dominios.',
    3: 'Normas de 2005 pueden no reflejar cambios poblacionales actuales. Requiere entrenamiento específico.',
    4: 'Normas de 1984 desactualizadas. Algunas subescalas con menor confiabilidad en edades tempranas.'
  };
  return limitaciones[fuenteId] || 'No especificadas';
}

function getConfiabilidad(fuenteId) {
  const confiabilidades = {
    1: 'Alta (basada en consenso de expertos)',
    2: 'Alta (α > 0.85 en estudios de seguimiento)',
    3: 'Alta (r = 0.83-0.93 test-retest)',
    4: 'Moderada-Alta (r = 0.71-0.99 según dominio)'
  };
  return confiabilidades[fuenteId] || 'No especificada';
}

function getValidez(fuenteId) {
  const valideces = {
    1: 'Validez de contenido por panel de expertos',
    2: 'Validez predictiva demostrada en estudios longitudinales',
    3: 'Validez concurrente con escalas similares (r = 0.57-0.79)',
    4: 'Validez de constructo y criterio establecida'
  };
  return valideces[fuenteId] || 'No especificada';
}

function getReferencias(fuenteId) {
  const referencias = {
    1: 'CDC. (2022). Developmental Milestones. Centers for Disease Control and Prevention.',
    2: 'WHO. (2006). WHO Motor Development Study: Windows of achievement for six gross motor development milestones.',
    3: 'Bayley, N. (2005). Bayley Scales of Infant and Toddler Development–Third Edition. Harcourt Assessment.',
    4: 'Newborg, J., Stock, J. R., Wnek, L., Guidubaldi, J., & Svinicki, J. (1984). Battelle Developmental Inventory. DLM Teaching Resources.'
  };
  return referencias[fuenteId] || 'No disponible';
}

function getUrlOriginal(fuenteId) {
  const urls = {
    1: 'https://www.cdc.gov/ncbddd/actearly/milestones/index.html',
    2: 'https://www.who.int/tools/child-growth-standards',
    3: 'https://www.pearsonassessments.com/store/usassessments/en/Store/Professional-Assessments/Developmental-Early-Childhood/Bayley-Scales-of-Infant-and-Toddler-Development-%7C-Third-Edition/p/100000123.html',
    4: 'https://www.riversidepublishing.com/products/bdi2/details.html'
  };
  return urls[fuenteId] || null;
}

// ==================== RUTAS DE HITOS NORMATIVOS ====================

app.get('/api/hitos-normativos', (req, res) => {
  const fuenteNormativaId = req.query.fuente || 1;
  
  const query = `
    SELECT hn.*, d.nombre as dominio_nombre, f.nombre as fuente_normativa_nombre,
           v.id as video_id, v.titulo as video_titulo, v.url as video_url, v.fuente as video_fuente
    FROM hitos_normativos hn
    JOIN dominios d ON hn.dominio_id = d.id
    JOIN fuentes_normativas f ON hn.fuente_normativa_id = f.id
    LEFT JOIN videos_hitos vh ON hn.id = vh.hito_id
    LEFT JOIN videos v ON vh.video_id = v.id
    WHERE hn.fuente_normativa_id = ? AND f.activa = 1
    ORDER BY hn.edad_media_meses, d.id
  `;
  
  db.all(query, [fuenteNormativaId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Agrupar videos por hito
    const hitosMap = new Map();
    rows.forEach(row => {
      const hitoId = row.id;
      if (!hitosMap.has(hitoId)) {
        hitosMap.set(hitoId, {
          ...row,
          videos_asociados: []
        });
      }
      
      if (row.video_id) {
        hitosMap.get(hitoId).videos_asociados.push({
          id: row.video_id,
          titulo: row.video_titulo,
          url: row.video_url,
          fuente: row.video_fuente
        });
      }
    });
    
    const hitosConVideos = Array.from(hitosMap.values());
    res.json(hitosConVideos);
  });
});

app.get('/api/hitos-normativos/dominio/:dominioId', (req, res) => {
  const query = `
    SELECT hn.*, d.nombre as dominio_nombre, f.nombre as fuente_normativa_nombre
    FROM hitos_normativos hn
    JOIN dominios d ON hn.dominio_id = d.id
    JOIN fuentes_normativas f ON hn.fuente_normativa_id = f.id
    WHERE hn.dominio_id = ? AND f.activa = 1
    ORDER BY hn.edad_media_meses
  `;
  db.all(query, [req.params.dominioId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ==================== RUTAS DE HITOS CONSEGUIDOS ====================

app.get('/api/hitos-conseguidos/:ninoId', verificarToken, (req, res) => {
  const ninoId = req.params.ninoId;
  
  // Para usuarios invitados, devolver array vacío (datos en memoria del cliente)
  if (req.usuario.rol === 'invitado') {
    return res.json([]);
  }
  
  verificarAccesoNino(ninoId, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

    const query = `
      SELECT hc.*, hn.nombre as hito_nombre, hn.dominio_id, 
             hn.edad_media_meses, hn.desviacion_estandar,
             d.nombre as dominio_nombre
      FROM hitos_conseguidos hc
      JOIN hitos_normativos hn ON hc.hito_id = hn.id
      JOIN dominios d ON hn.dominio_id = d.id
      WHERE hc.nino_id = ?
      ORDER BY hc.edad_conseguido_meses
    `;
    db.all(query, [ninoId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
});

app.post('/api/hitos-conseguidos', verificarToken, (req, res) => {
  const { nino_id, hito_id, edad_conseguido_meses, fecha_registro, notas, edad_perdido_meses, fecha_perdido } = req.body;
  
  verificarAccesoNino(nino_id, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

    db.run(`INSERT INTO hitos_conseguidos 
      (nino_id, hito_id, edad_conseguido_meses, fecha_registro, notas, edad_perdido_meses, fecha_perdido) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nino_id, hito_id, edad_conseguido_meses, fecha_registro, notas, edad_perdido_meses || null, fecha_perdido || null],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      }
    );
  });
});

// Nuevo endpoint para registrar pérdida de hito (regresión)
app.put('/api/hitos-conseguidos/:id/registrar-perdida', verificarToken, (req, res) => {
  const { edad_perdido_meses, fecha_perdido } = req.body;
  
  // Primero verificar que el hito conseguido pertenece a un niño del usuario
  db.get('SELECT nino_id FROM hitos_conseguidos WHERE id = ?', [req.params.id], (err, hito) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!hito) return res.status(404).json({ error: 'Hito no encontrado' });

    verificarAccesoNino(hito.nino_id, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

      db.run(`UPDATE hitos_conseguidos 
        SET edad_perdido_meses = ?, fecha_perdido = ?
        WHERE id = ?`,
        [edad_perdido_meses, fecha_perdido, req.params.id],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, changes: this.changes });
        }
      );
    });
  });
});

app.delete('/api/hitos-conseguidos/:id', verificarToken, (req, res) => {
  // Primero verificar que el hito conseguido pertenece a un niño del usuario
  db.get('SELECT nino_id FROM hitos_conseguidos WHERE id = ?', [req.params.id], (err, hito) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!hito) return res.status(404).json({ error: 'Hito no encontrado' });

    verificarAccesoNino(hito.nino_id, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

      db.run('DELETE FROM hitos_conseguidos WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    });
  });
});

// ==================== RUTAS DE HITOS NO ALCANZADOS ====================

app.get('/api/hitos-no-alcanzados/:ninoId', verificarToken, (req, res) => {
  const ninoId = req.params.ninoId;
  
  // Para usuarios invitados, devolver array vacío (datos en memoria del cliente)
  if (req.usuario.rol === 'invitado') {
    return res.json([]);
  }
  
  verificarAccesoNino(ninoId, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

    const query = `
      SELECT hna.*, hn.nombre as hito_nombre, hn.dominio_id, 
             hn.edad_media_meses, hn.desviacion_estandar,
             d.nombre as dominio_nombre
      FROM hitos_no_alcanzados hna
      JOIN hitos_normativos hn ON hna.hito_id = hn.id
      JOIN dominios d ON hn.dominio_id = d.id
      WHERE hna.nino_id = ?
      ORDER BY hna.fecha_registro DESC
    `;
    db.all(query, [ninoId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
});

app.post('/api/hitos-no-alcanzados', verificarToken, (req, res) => {
  const { nino_id, hito_id, edad_evaluacion_meses, fecha_registro, notas } = req.body;
  
  verificarAccesoNino(nino_id, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

    db.run(`INSERT INTO hitos_no_alcanzados 
      (nino_id, hito_id, edad_evaluacion_meses, fecha_registro, notas) 
      VALUES (?, ?, ?, ?, ?)`,
      [nino_id, hito_id, edad_evaluacion_meses, fecha_registro, notas],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      }
    );
  });
});

app.delete('/api/hitos-no-alcanzados/:id', verificarToken, (req, res) => {
  db.get('SELECT nino_id FROM hitos_no_alcanzados WHERE id = ?', [req.params.id], (err, hito) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!hito) return res.status(404).json({ error: 'Hito no encontrado' });

    verificarAccesoNino(hito.nino_id, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

      db.run('DELETE FROM hitos_no_alcanzados WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    });
  });
});

// ==================== RUTAS DE RED FLAGS ====================

app.get('/api/red-flags', (req, res) => {
  db.all('SELECT * FROM red_flags ORDER BY edad_relevante_meses', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/red-flags-observadas/:ninoId', verificarToken, (req, res) => {
  const ninoId = req.params.ninoId;
  
  // Para usuarios invitados, devolver array vacío
  if (req.usuario.rol === 'invitado') {
    return res.json([]);
  }
  
  verificarAccesoNino(ninoId, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

    const query = `
      SELECT rfo.*, rf.nombre as flag_nombre, rf.descripcion as flag_descripcion
      FROM red_flags_observadas rfo
      JOIN red_flags rf ON rfo.red_flag_id = rf.id
      WHERE rfo.nino_id = ?
      ORDER BY rfo.edad_observada_meses
    `;
    db.all(query, [ninoId], (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
});

app.post('/api/red-flags-observadas', verificarToken, (req, res) => {
  const { nino_id, red_flag_id, edad_observada_meses, fecha_registro, notas, severidad } = req.body;
  
  verificarAccesoNino(nino_id, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

    db.run(`INSERT INTO red_flags_observadas 
      (nino_id, red_flag_id, edad_observada_meses, fecha_registro, notas, severidad) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [nino_id, red_flag_id, edad_observada_meses, fecha_registro, notas, severidad || 1],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
      }
    );
  });
});

app.delete('/api/red-flags-observadas/:id', verificarToken, (req, res) => {
  db.get('SELECT nino_id FROM red_flags_observadas WHERE id = ?', [req.params.id], (err, flag) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!flag) return res.status(404).json({ error: 'Red flag no encontrada' });

    verificarAccesoNino(flag.nino_id, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

      db.run('DELETE FROM red_flags_observadas WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
      });
    });
  });
});

// ==================== ESTADISTICAS Y ANALISIS ====================

app.get('/api/analisis/:ninoId', verificarToken, (req, res) => {
  const ninoId = req.params.ninoId;
  const fuenteNormativaId = req.query.fuente || 1;
  
  // Para usuarios invitados, devolver datos mock vacíos
  if (req.usuario.rol === 'invitado') {
    return res.json({
      nino: {
        id: ninoId,
        nombre: 'Niño de Ejemplo',
        fecha_nacimiento: new Date().toISOString().split('T')[0],
        semanas_gestacion: 40,
        usuario_id: req.usuario.id
      },
      edad_actual_meses: 12,
      hitos_conseguidos: [],
      estadisticas_por_dominio: {},
      total_hitos: 0
    });
  }
  
  verificarAccesoNino(ninoId, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });

    db.get('SELECT * FROM ninos WHERE id = ?', [ninoId], (err, nino) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!nino) return res.status(404).json({ error: 'Niño no encontrado' });
      
      const fechaNac = new Date(nino.fecha_nacimiento);
      const hoy = new Date();
      const edadMeses = (hoy - fechaNac) / (1000 * 60 * 60 * 24 * 30.44);
      
      const queryHitos = `
        SELECT hc.*, 
               hn.nombre as hito_nombre, 
               hn.dominio_id,
             hn.edad_media_meses, 
             hn.desviacion_estandar,
             d.nombre as dominio_nombre,
             hn.fuente_normativa_id,
             (hn.edad_media_meses - hc.edad_conseguido_meses) / hn.desviacion_estandar as z_score
      FROM hitos_conseguidos hc
      JOIN hitos_normativos hn_original ON hc.hito_id = hn_original.id
      JOIN hitos_normativos hn ON (
        hn.nombre = hn_original.nombre AND 
        hn.dominio_id = hn_original.dominio_id AND
        hn.fuente_normativa_id = ?
      )
      JOIN dominios d ON hn.dominio_id = d.id
      WHERE hc.nino_id = ?
      ORDER BY hc.edad_conseguido_meses
    `;
    
    db.all(queryHitos, [fuenteNormativaId, ninoId], (err, hitos) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const estadisticasPorDominio = {};
      hitos.forEach(hito => {
        if (!estadisticasPorDominio[hito.dominio_id]) {
          estadisticasPorDominio[hito.dominio_id] = {
            dominio_nombre: hito.dominio_nombre,
            z_scores: [],
            total_hitos: 0
          };
        }
        estadisticasPorDominio[hito.dominio_id].z_scores.push(hito.z_score);
        estadisticasPorDominio[hito.dominio_id].total_hitos++;
      });
      
      Object.keys(estadisticasPorDominio).forEach(dominioId => {
        const stats = estadisticasPorDominio[dominioId];
        const zScores = stats.z_scores;
        stats.z_score_promedio = zScores.reduce((a, b) => a + b, 0) / zScores.length;
        stats.z_score_min = Math.min(...zScores);
        stats.z_score_max = Math.max(...zScores);
      });
      
      res.json({
        nino,
        edad_actual_meses: edadMeses,
        hitos_conseguidos: hitos,
        estadisticas_por_dominio: estadisticasPorDominio,
        total_hitos: hitos.length
      });
    });
  }); // Cierre de db.get nino
  }); // Cierre de verificarAccesoNino
});

// ==================== RUTAS DE ESCALAS ESTANDARIZADAS ====================

// Obtener todas las evaluaciones de un niño
app.get('/api/escalas-evaluaciones/:ninoId', verificarToken, (req, res) => {
  const { ninoId } = req.params;
  
  verificarAccesoNino(req.usuario, ninoId, (tieneAcceso) => {
    if (!tieneAcceso) {
      return res.status(403).json({ error: 'No tiene acceso a este niño' });
    }
    
    const query = `
      SELECT * FROM escalas_evaluaciones 
      WHERE nino_id = ? 
      ORDER BY fecha_evaluacion DESC
    `;
    
    db.all(query, [ninoId], (err, rows) => {
      if (err) {
        console.error('Error al obtener evaluaciones:', err);
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });
});

// Crear nueva evaluación con escala
app.post('/api/escalas-evaluaciones', verificarToken, (req, res) => {
  const { 
    nino_id, 
    escala, 
    fecha_evaluacion, 
    edad_evaluacion_meses,
    puntuaciones,
    profesional_evaluador,
    centro_evaluacion,
    notas 
  } = req.body;
  
  // Validar datos requeridos
  if (!nino_id || !escala || !fecha_evaluacion || !edad_evaluacion_meses || !puntuaciones) {
    return res.status(400).json({ 
      error: 'Faltan datos requeridos: nino_id, escala, fecha_evaluacion, edad_evaluacion_meses, puntuaciones' 
    });
  }
  
  verificarAccesoNino(req.usuario, nino_id, (tieneAcceso) => {
    if (!tieneAcceso) {
      return res.status(403).json({ error: 'No tiene acceso a este niño' });
    }
    
    const query = `
      INSERT INTO escalas_evaluaciones (
        nino_id, escala, fecha_evaluacion, edad_evaluacion_meses, 
        puntuaciones, profesional_evaluador, centro_evaluacion, notas
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(
      query,
      [
        nino_id, 
        escala, 
        fecha_evaluacion, 
        edad_evaluacion_meses,
        puntuaciones, // Ya es JSON string
        profesional_evaluador || null,
        centro_evaluacion || null,
        notas || null
      ],
      function(err) {
        if (err) {
          console.error('Error al crear evaluación:', err);
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ 
          id: this.lastID,
          mensaje: 'Evaluación creada correctamente' 
        });
      }
    );
  });
});

// Eliminar evaluación
app.delete('/api/escalas-evaluaciones/:id', verificarToken, (req, res) => {
  const { id } = req.params;
  
  // Primero verificar que la evaluación existe y el usuario tiene acceso al niño
  db.get(
    'SELECT nino_id FROM escalas_evaluaciones WHERE id = ?',
    [id],
    (err, evaluacion) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!evaluacion) {
        return res.status(404).json({ error: 'Evaluación no encontrada' });
      }
      
      verificarAccesoNino(req.usuario, evaluacion.nino_id, (tieneAcceso) => {
        if (!tieneAcceso) {
          return res.status(403).json({ error: 'No tiene acceso a esta evaluación' });
        }
        
        db.run(
          'DELETE FROM escalas_evaluaciones WHERE id = ?',
          [id],
          function(err) {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            if (this.changes === 0) {
              return res.status(404).json({ error: 'Evaluación no encontrada' });
            }
            res.json({ mensaje: 'Evaluación eliminada correctamente' });
          }
        );
      });
    }
  );
});

// ==================== D-SCORE ENDPOINTS ====================

// Guardar evaluación D-score
app.post('/api/dscore-evaluaciones', verificarToken, (req, res) => {
  const { 
    nino_id, 
    dscore, 
    daz, 
    sem,
    n_hitos,
    proporcion,
    hitos_evaluados,
    edad_meses,
    fecha_evaluacion = new Date().toISOString().split('T')[0],
    notas = ''
  } = req.body;
  
  verificarAccesoNino(nino_id, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tieneAcceso) return res.status(403).json({ error: 'No tiene acceso a este niño' });
    
    const evaluacionData = JSON.stringify({
      dscore: dscore,
      daz: daz,
      sem: sem,
      n_hitos: n_hitos,
      proporcion: proporcion,
      hitos_evaluados: hitos_evaluados
    });
    
    db.run(
      `INSERT INTO escalas_evaluaciones 
       (nino_id, escala, fecha_evaluacion, edad_evaluacion_meses, puntuaciones, notas, fecha_registro) 
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [nino_id, 'D-score', fecha_evaluacion, edad_meses, evaluacionData, notas],
      function(err) {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ 
          id: this.lastID,
          mensaje: 'Evaluación D-score guardada correctamente'
        });
      }
    );
  });
});

// Obtener historial de evaluaciones D-score de un niño
app.get('/api/dscore-evaluaciones/:ninoId', verificarToken, (req, res) => {
  const { ninoId } = req.params;
  
  verificarAccesoNino(ninoId, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tieneAcceso) return res.status(403).json({ error: 'No tiene acceso a este niño' });
    
    db.all(
      `SELECT id, fecha_evaluacion, edad_evaluacion_meses, puntuaciones, notas, fecha_registro
       FROM escalas_evaluaciones 
       WHERE nino_id = ? AND escala = 'D-score'
       ORDER BY fecha_evaluacion ASC`,
      [ninoId],
      (err, rows) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        const evaluaciones = rows.map(row => ({
          id: row.id,
          fecha: row.fecha_evaluacion,
          edad_meses: row.edad_evaluacion_meses,
          datos: JSON.parse(row.puntuaciones),
          notas: row.notas,
          fecha_registro: row.fecha_registro
        }));
        
        res.json(evaluaciones);
      }
    );
  });
});

// ==================== RUTA DE ITINERARIO (DATOS PROSPECTIVOS) ====================

// Obtener itinerario de desarrollo con evaluaciones prospectivas
app.get('/api/itinerario/:ninoId', verificarToken, (req, res) => {
  const { ninoId } = req.params;
  const fuenteNormativaId = req.query.fuente || 1;
  
  // Para usuarios invitados, devolver datos vacíos (no tienen evaluaciones prospectivas guardadas)
  if (req.usuario.rol === 'invitado') {
    return res.json({
      nino: {
        id: ninoId,
        nombre: 'Niño de Ejemplo',
        fecha_nacimiento: new Date().toISOString().split('T')[0],
        semanas_gestacion: 40,
        usuario_id: req.usuario.id
      },
      evaluaciones: [],
      fuente_normativa_id: parseInt(fuenteNormativaId)
    });
  }
  
  verificarAccesoNino(ninoId, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!tieneAcceso) return res.status(403).json({ error: 'No tienes acceso a este niño' });
    
    // Obtener datos del niño
    db.get('SELECT * FROM ninos WHERE id = ?', [ninoId], (err, nino) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!nino) return res.status(404).json({ error: 'Niño no encontrado' });
      
      // Obtener evaluaciones con escalas estandarizadas
      const queryEvaluaciones = `
        SELECT * FROM escalas_evaluaciones 
        WHERE nino_id = ? 
        ORDER BY edad_evaluacion_meses
      `;
      
      db.all(queryEvaluaciones, [ninoId], (err, evaluaciones) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // Parsear puntuaciones JSON
        const evaluacionesProcesadas = evaluaciones.map(ev => ({
          ...ev,
          puntuaciones: typeof ev.puntuaciones === 'string' ? JSON.parse(ev.puntuaciones) : ev.puntuaciones
        }));
        
        res.json({
          nino,
          evaluaciones: evaluacionesProcesadas,
          fuente_normativa_id: parseInt(fuenteNormativaId)
        });
      });
    });
  });
});

// ==================== RUTAS DE BIBLIOTECA DE MEDIOS ====================

// Obtener todos los videos
app.get('/api/videos', verificarToken, (req, res) => {
  const query = `
    SELECT v.*, 
           GROUP_CONCAT(vh.hito_id) as hitosAsociados
    FROM videos v
    LEFT JOIN videos_hitos vh ON v.id = vh.video_id
    GROUP BY v.id
    ORDER BY v.fuente, v.titulo
  `;
  
  db.all(query, [], (err, videos) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Procesar los hitos asociados
    const videosConHitos = videos.map(video => ({
      ...video,
      _id: video.id,
      hitosAsociados: video.hitosAsociados ? video.hitosAsociados.split(',').map(id => parseInt(id)) : []
    }));
    
    res.json(videosConHitos);
  });
});

// Obtener todos los hitos completos del sistema
app.get("/api/hitos-completos", (req, res) => {
  const query = `
    SELECT h.id, 
           CASE 
             WHEN f.nombre LIKE "%CDC%" THEN h.nombre || " (" || ROUND(h.edad_media_meses) || "m) - CDC" 
             WHEN f.nombre LIKE "%OMS%" THEN h.nombre || " (" || ROUND(h.edad_media_meses) || "m) - OMS" 
             WHEN f.nombre LIKE "%GCDG%" THEN h.nombre || " (" || ROUND(h.edad_media_meses) || "m) - GCDG" 
             WHEN f.nombre LIKE "%ECDI%" THEN h.nombre || " (" || ROUND(h.edad_media_meses) || "m) - ECDI2030" 
             WHEN f.nombre LIKE "%ASQ%" THEN h.nombre || " (" || ROUND(h.edad_media_meses) || "m) - ASQ" 
             WHEN f.nombre LIKE "%Haizea%" THEN h.nombre || " (" || ROUND(h.edad_media_meses) || "m) - Haizea" 
             ELSE h.nombre || " (" || ROUND(h.edad_media_meses) || "m) - " || SUBSTR(f.nombre, 1, 10) 
           END as descripcion, 
           h.edad_media_meses as edad, 
           d.nombre as area, 
           f.nombre as fuente_normativa, 
           h.video_url_cdc, h.video_url_pathways 
    FROM hitos_normativos h 
    LEFT JOIN dominios d ON h.dominio_id = d.id 
    LEFT JOIN fuentes_normativas f ON h.fuente_normativa_id = f.id 
    WHERE f.activa = 1
    ORDER BY h.edad_media_meses, d.nombre, f.nombre, h.nombre
  `;
  
  db.all(query, [], (err, hitos) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const hitosConId = hitos.map(hito => ({
      ...hito,
      _id: hito.id
    }));
    
    res.json(hitosConId);
  });
});

// Asociar video a hito
app.post('/api/videos/asociar', verificarToken, verificarAdmin, (req, res) => {
  const { videoId, hitoId } = req.body;
  
  if (!videoId || !hitoId) {
    return res.status(400).json({ error: 'videoId y hitoId son requeridos' });
  }
  
  // Verificar si ya existe la asociación
  db.get(
    'SELECT id FROM videos_hitos WHERE video_id = ? AND hito_id = ?',
    [videoId, hitoId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (row) return res.status(400).json({ error: 'Esta asociación ya existe' });
      
      // Crear la asociación
      db.run(
        'INSERT INTO videos_hitos (video_id, hito_id) VALUES (?, ?)',
        [videoId, hitoId],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ message: 'Video asociado correctamente', id: this.lastID });
        }
      );
    }
  );
});

// Desasociar video de hito
app.post('/api/videos/desasociar', verificarToken, verificarAdmin, (req, res) => {
  const { videoId, hitoId } = req.body;
  
  if (!videoId || !hitoId) {
    return res.status(400).json({ error: 'videoId y hitoId son requeridos' });
  }
  
  db.run(
    'DELETE FROM videos_hitos WHERE video_id = ? AND hito_id = ?',
    [videoId, hitoId],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Video desasociado correctamente', cambios: this.changes });
    }
  );
});

// Asociar video con múltiples hitos (para auto-asociación)
app.post('/api/videos/asociar-multiple', verificarToken, verificarAdmin, (req, res) => {
  const { videoId, hitosIds } = req.body;
  
  if (!videoId || !Array.isArray(hitosIds)) {
    return res.status(400).json({ error: 'videoId y hitosIds (array) son requeridos' });
  }
  
  let asociacionesCreadas = 0;
  let asociacionesYaExistentes = 0;
  let asociacionesEliminadas = 0;
  let errores = 0;
  
  // Primero: obtener todas las asociaciones actuales del video
  db.all(
    'SELECT hito_id FROM videos_hitos WHERE video_id = ?',
    [videoId],
    (err, asociacionesActuales) => {
      if (err) {
        return res.status(500).json({ error: 'Error al obtener asociaciones actuales' });
      }
      
      const hitosActuales = asociacionesActuales.map(a => a.hito_id);
      const hitosNuevos = hitosIds;
      
      // Identificar hitos a eliminar (están en actuales pero no en nuevos)
      const hitosAEliminar = hitosActuales.filter(id => !hitosNuevos.includes(id));
      
      console.log(`📊 Video ${videoId}:`);
      console.log(`   - Hitos actuales: ${hitosActuales.length}`);
      console.log(`   - Hitos nuevos: ${hitosNuevos.length}`);
      console.log(`   - A eliminar: ${hitosAEliminar.length}`);
      
      // Función para eliminar un hito
      const eliminarHito = (hitoId) => {
        return new Promise((resolve, reject) => {
          db.run(
            'DELETE FROM videos_hitos WHERE video_id = ? AND hito_id = ?',
            [videoId, hitoId],
            function(err) {
              if (err) {
                errores++;
                return reject(err);
              }
              asociacionesEliminadas++;
              resolve();
            }
          );
        });
      };
      
      // Función para asociar un hito
      const asociarHito = (hitoId) => {
        return new Promise((resolve, reject) => {
          // Verificar si ya existe la asociación
          db.get(
            'SELECT id FROM videos_hitos WHERE video_id = ? AND hito_id = ?',
            [videoId, hitoId],
            (err, row) => {
              if (err) {
                errores++;
                return reject(err);
              }
              
              if (row) {
                asociacionesYaExistentes++;
                return resolve({ yaExiste: true });
              }
              
              // Crear la asociación
              db.run(
                'INSERT INTO videos_hitos (video_id, hito_id) VALUES (?, ?)',
                [videoId, hitoId],
                function(err) {
                  if (err) {
                    errores++;
                    return reject(err);
                  }
                  asociacionesCreadas++;
                  resolve({ id: this.lastID });
                }
              );
            }
          );
        });
      };
      
      // Primero eliminar los hitos que ya no corresponden
      Promise.all(hitosAEliminar.map(hitoId => eliminarHito(hitoId).catch(e => console.error(e))))
        .then(() => {
          // Luego asociar los nuevos hitos
          return Promise.all(hitosNuevos.map(hitoId => asociarHito(hitoId).catch(e => console.error(e))));
        })
        .then(() => {
          console.log(`   ✅ Resultado: +${asociacionesCreadas} nuevas, ${asociacionesYaExistentes} mantenidas, -${asociacionesEliminadas} eliminadas`);
          res.json({ 
            message: 'Asociación múltiple completada',
            asociacionesCreadas,
            asociacionesYaExistentes,
            asociacionesEliminadas,
            errores,
            total: hitosNuevos.length
          });
        })
        .catch(err => {
          res.status(500).json({ 
            error: 'Error en asociación múltiple',
            detalles: err.message,
            asociacionesCreadas,
            asociacionesEliminadas,
            errores
          });
        });
    }
  );
});

// Eliminar video
app.delete('/api/videos/:id', verificarToken, verificarAdmin, (req, res) => {
  const videoId = req.params.id;
  
  // Primero eliminar todas las asociaciones
  db.run('DELETE FROM videos_hitos WHERE video_id = ?', [videoId], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Luego eliminar el video
    db.run('DELETE FROM videos WHERE id = ?', [videoId], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Video eliminado correctamente', cambios: this.changes });
    });
  });
});

// Actualizar información de video
app.put('/api/videos/:id', verificarToken, verificarAdmin, (req, res) => {
  const videoId = req.params.id;
  const { titulo, descripcion, url, fuente } = req.body;
  
  // Validar que al menos un campo esté presente
  if (!titulo && !descripcion && !url && !fuente) {
    return res.status(400).json({ error: 'Se requiere al menos un campo para actualizar' });
  }
  
  // Construir la consulta dinámicamente
  let campos = [];
  let valores = [];
  
  if (titulo !== undefined) {
    campos.push('titulo = ?');
    valores.push(titulo);
  }
  if (descripcion !== undefined) {
    campos.push('descripcion = ?');
    valores.push(descripcion);
  }
  if (url !== undefined) {
    campos.push('url = ?');
    valores.push(url);
  }
  if (fuente !== undefined) {
    campos.push('fuente = ?');
    valores.push(fuente);
  }
  
  valores.push(videoId);
  
  const query = `UPDATE videos SET ${campos.join(', ')} WHERE id = ?`;
  
  db.run(query, valores, function(err) {
    if (err) {
      console.error('Error actualizando video:', err.message);
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }
    
    res.json({ message: 'Video actualizado correctamente', cambios: this.changes });
  });
});

// ===== NUEVOS ENDPOINTS PARA DATOS REALES =====

// Obtener fuentes de datos reales
app.get('/api/fuentes-datos-reales', (req, res) => {
  db.all(`
    SELECT * FROM fuentes_datos_reales 
    ORDER BY ano_publicacion DESC
  `, [], (err, rows) => {
    if (err) {
      console.error('Error obteniendo fuentes de datos reales:', err.message);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(rows);
  });
});

// Obtener hitos reales de CDC
app.get('/api/hitos-reales-cdc', (req, res) => {
  const { dominio, edad_min, edad_max } = req.query;
  
  let query = 'SELECT * FROM hitos_reales_cdc WHERE 1=1';
  let params = [];
  
  if (dominio) {
    query += ' AND dominio = ?';
    params.push(dominio);
  }
  
  if (edad_min) {
    query += ' AND edad_meses >= ?';
    params.push(parseInt(edad_min));
  }
  
  if (edad_max) {
    query += ' AND edad_meses <= ?';
    params.push(parseInt(edad_max));
  }
  
  query += ' ORDER BY edad_meses, dominio';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error obteniendo hitos reales CDC:', err.message);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(rows);
  });
});

// Obtener información educativa
app.get('/api/informacion-educativa', (req, res) => {
  const { categoria } = req.query;
  
  let query = 'SELECT * FROM informacion_educativa';
  let params = [];
  
  if (categoria) {
    query += ' WHERE categoria = ?';
    params.push(categoria);
  }
  
  query += ' ORDER BY categoria, titulo';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error obteniendo información educativa:', err.message);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    res.json(rows);
  });
});

// Obtener estadísticas de datos reales
app.get('/api/estadisticas-datos-reales', (req, res) => {
  const stats = {};
  
  // Contar hitos por dominio
  db.all(`
    SELECT dominio, COUNT(*) as cantidad 
    FROM hitos_reales_cdc 
    GROUP BY dominio 
    ORDER BY cantidad DESC
  `, [], (err, hitosPorDominio) => {
    if (err) {
      console.error('Error obteniendo estadísticas:', err.message);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
    
    stats.hitosPorDominio = hitosPorDominio;
    
    // Contar fuentes por año
    db.all(`
      SELECT ano_publicacion, COUNT(*) as cantidad 
      FROM fuentes_datos_reales 
      GROUP BY ano_publicacion 
      ORDER BY ano_publicacion DESC
    `, [], (err, fuentesPorAno) => {
      if (err) {
        console.error('Error obteniendo fuentes por año:', err.message);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      stats.fuentesPorAno = fuentesPorAno;
      
      // Estadísticas generales
      db.get(`SELECT COUNT(*) as total FROM hitos_reales_cdc`, [], (err, totalHitos) => {
        if (err) {
          console.error('Error obteniendo total hitos:', err.message);
          return res.status(500).json({ error: 'Error interno del servidor' });
        }
        
        db.get(`SELECT COUNT(*) as total FROM fuentes_datos_reales`, [], (err, totalFuentes) => {
          if (err) {
            console.error('Error obteniendo total fuentes:', err.message);
            return res.status(500).json({ error: 'Error interno del servidor' });
          }
          
          db.get(`SELECT COUNT(*) as total FROM informacion_educativa`, [], (err, totalEducativo) => {
            if (err) {
              console.error('Error obteniendo total educativo:', err.message);
              return res.status(500).json({ error: 'Error interno del servidor' });
            }
            
            stats.totales = {
              hitos: totalHitos.total,
              fuentes: totalFuentes.total,
              educativo: totalEducativo.total
            };
            
            res.json(stats);
          });
        });
      });
    });
  });
});

// Endpoint para calcular D-score básico (implementación simple)
app.post('/api/calcular-dscore', verificarToken, (req, res) => {
  const { nino_id, hitos_conseguidos } = req.body;
  
  if (!nino_id || !Array.isArray(hitos_conseguidos)) {
    return res.status(400).json({ error: 'Datos inválidos' });
  }
  
  // Implementación básica del D-score
  // En una implementación real, esto sería mucho más complejo
  let dscore = 0;
  let edad_total = 0;
  let count = 0;
  
  hitos_conseguidos.forEach(hito => {
    if (hito.edad_conseguido_meses && hito.edad_conseguido_meses > 0) {
      edad_total += hito.edad_conseguido_meses;
      count++;
    }
  });
  
  if (count > 0) {
    const edad_media = edad_total / count;
    
    // Obtener edad cronológica del niño
    db.get(`
      SELECT 
        fecha_nacimiento,
        ROUND((julianday('now') - julianday(fecha_nacimiento)) / 30.44, 1) as edad_meses
      FROM ninos 
      WHERE id = ?
    `, [nino_id], (err, nino) => {
      if (err) {
        console.error('Error obteniendo datos del niño:', err.message);
        return res.status(500).json({ error: 'Error interno del servidor' });
      }
      
      if (!nino) {
        return res.status(404).json({ error: 'Niño no encontrado' });
      }
      
      // Cálculo simplificado del D-score
      dscore = edad_media / nino.edad_meses;
      const daz = (dscore - 1) / 0.2; // Normalización simplificada
      
      let interpretacion = '';
      if (daz > 2.0) interpretacion = 'Desarrollo muy alto';
      else if (daz > 1.0) interpretacion = 'Desarrollo alto';
      else if (daz > -1.0) interpretacion = 'Desarrollo típico';
      else if (daz > -2.0) interpretacion = 'Desarrollo bajo';
      else interpretacion = 'Desarrollo muy bajo (posible retraso)';
      
      res.json({
        dscore: dscore.toFixed(3),
        daz: daz.toFixed(2),
        interpretacion,
        edad_cronologica: nino.edad_meses,
        edad_desarrollo: edad_media.toFixed(1),
        hitos_evaluados: count,
        fecha_calculo: new Date().toISOString()
      });
    });
  } else {
    res.status(400).json({ error: 'No hay hitos válidos para calcular D-score' });
  }
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (req, res) => {
  // Verificar conexión a la base de datos
  db.get('SELECT 1', (err) => {
    if (err) {
      return res.status(503).json({ 
        status: 'error', 
        message: 'Database connection failed',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({ 
      status: 'healthy', 
      version: '0.3.2',
      roles: ['admin', 'neuropediatra', 'pediatra_ap', 'enfermeria', 'invitado'],
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  });
});

// ==================== RUTAS PARA SCREENING D-SCORE ====================

// Calcular D-Score para screening de enfermería
app.post('/api/dscore/calcular', verificarToken, verificarRolMedico, (req, res) => {
  const { nino_id, edad_meses, items_superados, items_total } = req.body;
  
  if (!nino_id || !edad_meses || !Array.isArray(items_superados) || !items_total) {
    return res.status(400).json({ error: 'Datos incompletos para el cálculo' });
  }
  
  // Verificar acceso al niño
  verificarAccesoNino(nino_id, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err || !tieneAcceso) {
      return res.status(403).json({ error: 'No tienes acceso a este niño' });
    }
    
    // Algoritmo de D-Score basado en porcentaje de items superados
    const numItemsSuperados = items_superados.length;
    const totalItemsEvaluados = items_total;
    const numItemsNoSuperados = totalItemsEvaluados - numItemsSuperados;
    
    // Cálculo del porcentaje de desarrollo
    const porcentajeSuperado = numItemsSuperados / totalItemsEvaluados;
    
    // Conversión a D-Score (escala 0-100)
    // Un D-Score de 50 representa el 50% de items superados (desarrollo típico medio)
    // Por debajo de 40 indica posible retraso
    let dscore = porcentajeSuperado * 100;
    
    // Ajuste por edad: los niños más pequeños tienen más margen
    let ajusteEdad = 0;
    if (edad_meses < 12) {
      // Bebés menores de 1 año: más permisivos
      ajusteEdad = 5;
    } else if (edad_meses < 24) {
      // 1-2 años: ajuste moderado
      ajusteEdad = 2;
    }
    
    dscore = Math.max(0, Math.min(100, dscore + ajusteEdad));
    
    // Determinar nivel de desarrollo basado en el D-Score
    let nivelDesarrollo;
    let recomendacion;
    
    if (dscore >= 75) {
      nivelDesarrollo = 'Desarrollo Adecuado';
      recomendacion = 'El desarrollo es adecuado. Continuar seguimiento rutinario.';
    } else if (dscore >= 50) {
      nivelDesarrollo = 'Desarrollo Normal';
      recomendacion = 'Desarrollo dentro del rango esperado. Seguimiento según calendario.';
    } else if (dscore >= 40) {
      nivelDesarrollo = 'Vigilancia';
      recomendacion = 'Se recomienda vigilancia estrecha y reevaluación en 1-2 meses.';
    } else if (dscore >= 25) {
      nivelDesarrollo = 'Alerta';
      recomendacion = 'Se recomienda evaluación por pediatra especializado.';
    } else {
      nivelDesarrollo = 'Derivación Urgente';
      recomendacion = 'Se recomienda derivación inmediata a neuropediatría.';
    }
    
    const resultado = {
      dscore: Math.round(dscore * 10) / 10, // Redondear a 1 decimal
      edad_meses: edad_meses,
      items_total: totalItemsEvaluados,
      items_superados: numItemsSuperados,
      items_no_superados: numItemsNoSuperados,
      porcentaje_superado: Math.round(porcentajeSuperado * 100),
      nivel_desarrollo: nivelDesarrollo,
      recomendacion: recomendacion
    };
    
    res.json(resultado);
  });
});

// ==================== RUTAS PARA EVALUACIONES ====================

// Crear nueva evaluación
app.post('/api/evaluaciones', verificarToken, verificarRolMedico, (req, res) => {
  const { nino_id, tipo, resultado, items_evaluados, edad_meses, evaluador } = req.body;
  
  if (!nino_id || !tipo || !resultado) {
    return res.status(400).json({ error: 'Datos incompletos para la evaluación' });
  }
  
  // Verificar acceso al niño
  verificarAccesoNino(nino_id, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err || !tieneAcceso) {
      return res.status(403).json({ error: 'No tienes acceso a este niño' });
    }
    
    db.run(`
      INSERT INTO evaluaciones_screening (
        nino_id, tipo, resultado, items_evaluados, edad_meses, 
        evaluador, usuario_id, fecha
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `, [
      nino_id, tipo, resultado, items_evaluados || '[]', 
      edad_meses, evaluador || req.usuario.rol, req.usuario.id
    ], function(err) {
      if (err) {
        console.error('Error guardando evaluación:', err);
        return res.status(500).json({ error: 'Error guardando evaluación' });
      }
      
      res.json({ 
        id: this.lastID, 
        mensaje: 'Evaluación guardada correctamente' 
      });
    });
  });
});

// Obtener evaluaciones de un niño
app.get('/api/evaluaciones/:nino_id', verificarToken, verificarRolMedico, (req, res) => {
  const { nino_id } = req.params;
  const { tipo } = req.query;
  
  // Verificar acceso al niño
  verificarAccesoNino(nino_id, req.usuario.id, req.usuario.rol, (err, tieneAcceso) => {
    if (err || !tieneAcceso) {
      return res.status(403).json({ error: 'No tienes acceso a este niño' });
    }
    
    let query = `
      SELECT * FROM evaluaciones_screening 
      WHERE nino_id = ?
    `;
    let params = [nino_id];
    
    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }
    
    query += ' ORDER BY fecha DESC';
    
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('Error obteniendo evaluaciones:', err);
        return res.status(500).json({ error: 'Error obteniendo evaluaciones' });
      }
      
      res.json({ evaluaciones: rows || [] });
    });
  });
});

const { fork } = require('child_process');

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor ejecutándose en http://0.0.0.0:${PORT}`);
  
  // Check and populate videos if table is empty (después de iniciar el servidor)
  setTimeout(() => {
    db.get('SELECT COUNT(*) AS count FROM videos', (err, row) => {
      if (err) {
        console.error('Error checking video table:', err.message);
        return;
      }
      if (row.count === 0) {
        console.log('No videos found. Populating video table...');
        const populateProcess = fork('./server/populate_videos.js');
        
        populateProcess.on('exit', (code) => {
          if (code === 0) {
            console.log('Video population script finished successfully.');
          } else {
            console.error(`Video population script exited with code ${code}`);
          }
        });
      } else {
        console.log(`Video table already contains ${row.count} videos.`);
      }
    });
  }, 1000);
});
