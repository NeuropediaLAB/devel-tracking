#!/bin/sh
set -e

echo "🚀 Iniciando Sistema de Seguimiento del Neurodesarrollo v0.3.2"
echo "📅 $(date)"
echo "👥 Con soporte para roles: admin, neuropediatra, pediatra_ap, enfermeria"

# Crear directorios necesarios
mkdir -p /app/server/data
mkdir -p /app/dist

# Verificar que la base de datos existe y tiene los permisos correctos
if [ ! -f "/app/server/neurodesarrollo_dev_new.db" ]; then
    echo "⚠️  Base de datos no encontrada. Se creará automáticamente al iniciar el servidor."
fi

# Función para inicializar la base de datos con usuarios de prueba
init_database() {
    echo "🗄️  Verificando inicialización de base de datos..."
    
    # El servidor se encarga de crear usuarios predeterminados
    echo "✅ La base de datos se inicializará automáticamente con:"
    echo "   👑 admin@neuropedialab.org (admin123)"
    echo "   🧠 neuropediatra@hospital.es (neuro123)"
    echo "   👨‍⚕️ pediatra@centrosalud.es (ped123)"
    echo "   👩‍⚕️ enfermeria@hospital.es (enf123)"
}

# Función para ejecutar el servidor backend
start_server() {
    echo "🔙 Iniciando servidor backend en puerto $PORT..."
    init_database
    exec node server/server.js
}

# Función para ejecutar el frontend
start_frontend() {
    echo "🎨 Iniciando frontend en modo desarrollo..."
    
    # Si existe el build, servir archivos estáticos, sino modo desarrollo
    if [ -d "/app/dist" ] && [ "$(ls -A /app/dist 2>/dev/null)" ]; then
        echo "📦 Sirviendo build de producción..."
        npx serve -s dist -l 3000
    else
        echo "🛠️  Modo desarrollo..."
        npm run dev -- --host 0.0.0.0 --port 3000
    fi
}

# Función para ejecutar ambos servicios
start_both() {
    echo "🔄 Iniciando frontend y backend..."
    
    # Iniciar backend en segundo plano
    echo "🔙 Iniciando backend..."
    start_server &
    BACKEND_PID=$!
    
    # Esperar a que el backend esté listo
    echo "⏳ Esperando a que el backend esté disponible..."
    timeout 180 sh -c 'until nc -z localhost 8001; do sleep 1; done' || {
        echo "❌ Error: Backend no pudo iniciarse en 180 segundos"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    }
    
    echo "✅ Backend listo en puerto 8001"
    
    # Iniciar frontend
    echo "🎨 Iniciando frontend..."
    start_frontend
}

# Función de health check
health_check() {
    if wget --quiet --tries=1 --spider "http://localhost:$PORT/api/health" 2>/dev/null; then
        echo "✅ Servicio saludable"
        exit 0
    else
        echo "❌ Servicio no responde"
        exit 1
    fi
}

# Manejo de señales para shutdown graceful
cleanup() {
    echo "🛑 Recibida señal de apagado. Cerrando servicios..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    exit 0
}

trap cleanup SIGTERM SIGINT

# Manejar diferentes comandos
case "$1" in
    server)
        start_server
        ;;
    dev)
        start_frontend
        ;;
    both)
        start_both
        ;;
    health)
        health_check
        ;;
    *)
        echo "📖 Uso: $0 {server|dev|both|health}"
        echo "  server - Solo backend API"
        echo "  dev    - Solo frontend"
        echo "  both   - Frontend y backend (recomendado)"
        echo "  health - Verificar estado del servicio"
        echo ""
        echo "🏥 Sistema con roles médicos implementados:"
        echo "  • Administrador"
        echo "  • Neuropediatra" 
        echo "  • Pediatra de Atención Primaria"
        echo "  • Enfermería"
        exit 1
        ;;
esac