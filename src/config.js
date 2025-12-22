// Configuración de la API
const getApiUrl = () => {
  // Si hay una variable de entorno definida, usarla
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Obtener el hostname y protocol actual
  const hostname = window.location.hostname;
  const protocol = window.location.protocol; // 'http:' o 'https:'
  const port = window.location.port;
  
  // IMPORTANTE: Si estamos en HTTPS desde un dominio externo,
  // necesitamos usar una ruta relativa para el proxy
  if (protocol === 'https:') {
    // En HTTPS, siempre usar ruta relativa (proxy configurado en vite.config.mjs)
    return '/api';
  }
  
  // Si accedemos por IP o hostname (no localhost), usar la misma IP/hostname con puerto 8001
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    const apiUrl = `${protocol}//${hostname}:8001/api`;
    console.log('🔗 API URL configurada:', apiUrl);
    return apiUrl;
  }
  
  // Solo en localhost con HTTP usar puerto directo
  console.log('🔗 API URL configurada: http://localhost:8001/api');
  return 'http://localhost:8001/api';
};

export const API_URL = getApiUrl();

console.log('✅ Módulo config.js cargado. API_URL:', API_URL);


