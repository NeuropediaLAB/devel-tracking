#!/bin/bash
set -e

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias..."
    npm install
fi

# Función para ejecutar el servidor backend
start_server() {
    echo "Iniciando servidor backend en puerto 8001..."
    npm run server
}

# Función para ejecutar el frontend
start_frontend() {
    echo "Iniciando frontend en modo desarrollo..."
    npm run dev -- --host 0.0.0.0 --port 3000
}

# Manejar diferentes comandos
case "$1" in
    server)
        start_server
        ;;
    dev)
        start_frontend
        ;;
    both)
        echo "Iniciando frontend y backend..."
        start_server &
        start_frontend
        ;;
    *)
        echo "Uso: $0 {server|dev|both}"
        echo "  server - Solo backend"
        echo "  dev    - Solo frontend"
        echo "  both   - Frontend y backend"
        exit 1
        ;;
esac