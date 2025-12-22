#!/bin/bash

# Script para gestión completa del Sistema de Seguimiento del Neurodesarrollo
# Incluye soporte para los nuevos roles médicos implementados

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
PROJECT_NAME="neurodesarrollo"
VERSION="0.3.2"
COMPOSE_FILE="docker-compose.yml"
COMPOSE_PROD_FILE="docker-compose.prod.yml"

# Funciones de utilidad
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Mostrar banner
show_banner() {
    echo -e "${BLUE}"
    echo "🏥 =============================================="
    echo "   SISTEMA DE SEGUIMIENTO DEL NEURODESARROLLO"
    echo "   Versión: $VERSION"
    echo "   Roles Médicos: ✅ IMPLEMENTADOS"
    echo "============================================== 🏥"
    echo -e "${NC}"
}

# Verificar dependencias
check_dependencies() {
    log_info "Verificando dependencias..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker no está instalado"
        exit 1
    fi
    
    # Verificar docker compose (plugin o standalone)
    if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose no está instalado"
        exit 1
    fi
    
    log_success "Dependencias verificadas"
}

# Función helper para docker compose
dc() {
    if command -v docker-compose &> /dev/null; then
        docker-compose "$@"
    else
        docker compose "$@"
    fi
}

# Construir imágenes
build() {
    log_info "Construyendo imágenes Docker..."
    dc -f $COMPOSE_FILE build --no-cache
    log_success "Imágenes construidas exitosamente"
}

# Iniciar en modo desarrollo
dev() {
    log_info "Iniciando en modo desarrollo..."
    dc -f $COMPOSE_FILE up --build
}

# Iniciar en modo producción
prod() {
    log_info "Iniciando en modo producción..."
    
    # Crear directorios necesarios
    mkdir -p ./server/data
    mkdir -p ./logs/nginx
    mkdir -p ./ssl
    
    # Verificar archivo .env
    if [ ! -f ".env" ]; then
        log_warning "Archivo .env no encontrado, creando uno por defecto..."
        cp .env.example .env 2>/dev/null || log_warning "Archivo .env.example no encontrado"
    fi
    
    dc -f $COMPOSE_PROD_FILE up -d --build
    log_success "Servicios iniciados en modo producción"
    
    # Mostrar información de acceso
    show_access_info
}

# Parar servicios
stop() {
    log_info "Parando servicios..."
    dc -f $COMPOSE_FILE down 2>/dev/null || true
    dc -f $COMPOSE_PROD_FILE down 2>/dev/null || true
    log_success "Servicios parados"
}

# Limpiar todo
clean() {
    log_info "Limpiando contenedores, volúmenes e imágenes..."
    
    # Parar servicios
    stop
    
    # Eliminar contenedores
    dc -f $COMPOSE_FILE down -v --rmi all 2>/dev/null || true
    dc -f $COMPOSE_PROD_FILE down -v --rmi all 2>/dev/null || true
    
    # Limpiar imágenes huérfanas
    docker system prune -f
    
    log_success "Limpieza completada"
}

# Mostrar logs
logs() {
    local service=${1:-""}
    
    if [ -z "$service" ]; then
        log_info "Mostrando logs de todos los servicios..."
        dc -f $COMPOSE_FILE logs -f
    else
        log_info "Mostrando logs del servicio: $service"
        dc -f $COMPOSE_FILE logs -f $service
    fi
}

# Estado de los servicios
status() {
    log_info "Estado de los servicios:"
    echo ""
    
    if dc -f $COMPOSE_FILE ps | grep -q "Up"; then
        log_success "Servicios de desarrollo ejecutándose:"
        dc -f $COMPOSE_FILE ps
    elif dc -f $COMPOSE_PROD_FILE ps | grep -q "Up"; then
        log_success "Servicios de producción ejecutándose:"
        dc -f $COMPOSE_PROD_FILE ps
    else
        log_warning "No hay servicios ejecutándose"
    fi
    
    echo ""
    log_info "Uso de recursos:"
    docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" 2>/dev/null || log_warning "No se pudo obtener estadísticas de recursos"
}

# Backup de la base de datos
backup() {
    local backup_dir="./backups/$(date +%Y%m%d_%H%M%S)"
    log_info "Creando backup en: $backup_dir"
    
    mkdir -p "$backup_dir"
    
    # Backup de la base de datos
    if [ -f "./server/neurodesarrollo_dev_new.db" ]; then
        cp "./server/neurodesarrollo_dev_new.db" "$backup_dir/"
        log_success "Base de datos respaldada"
    else
        log_warning "Base de datos no encontrada"
    fi
    
    # Backup de configuración
    cp docker-compose*.yml "$backup_dir/" 2>/dev/null || true
    cp .env "$backup_dir/" 2>/dev/null || true
    cp nginx.conf "$backup_dir/" 2>/dev/null || true
    
    log_success "Backup completado en: $backup_dir"
}

# Mostrar información de acceso
show_access_info() {
    echo ""
    log_success "🎉 Sistema iniciado exitosamente!"
    echo ""
    log_info "📋 ACCESO AL SISTEMA:"
    echo "   🌐 Frontend: http://localhost:5173"
    echo "   🔧 API Backend: http://localhost:8001"
    echo "   ⚡ Proxy Nginx: http://localhost"
    echo ""
    log_info "👥 USUARIOS DE PRUEBA (ROLES MÉDICOS):"
    echo "   👑 Admin:        admin@neuropedialab.org        (admin123)"
    echo "   🧠 Neuropediatra: neuropediatra@hospital.es     (neuro123)"
    echo "   👨‍⚕️ Pediatra AP:  pediatra@centrosalud.es       (ped123)"
    echo "   👩‍⚕️ Enfermería:   enfermeria@hospital.es        (enf123)"
    echo ""
    log_info "📊 MONITOREO:"
    echo "   📈 Estado:   docker-compose ps"
    echo "   📋 Logs:     docker-compose logs -f"
    echo "   💾 Backup:   ./docker-manager.sh backup"
    echo ""
}

# Test de conectividad
test() {
    log_info "Ejecutando tests de conectividad..."
    
    # Test backend
    if curl -s http://localhost:8001/api/health >/dev/null; then
        log_success "Backend: ✅ Respondiendo"
    else
        log_error "Backend: ❌ No responde"
    fi
    
    # Test frontend
    if curl -s http://localhost:5173 >/dev/null; then
        log_success "Frontend: ✅ Respondiendo"
    else
        log_error "Frontend: ❌ No responde"
    fi
    
    # Test login
    local login_response=$(curl -s -X POST http://localhost:8001/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@neuropedialab.org","password":"admin123"}')
    
    if echo "$login_response" | grep -q "token"; then
        log_success "Login de Admin: ✅ Funcional"
    else
        log_error "Login de Admin: ❌ Fallo"
    fi
}

# Actualizar sistema
update() {
    log_info "Actualizando sistema..."
    
    # Backup antes de actualizar
    backup
    
    # Reconstruir imágenes
    build
    
    log_success "Sistema actualizado"
}

# Mostrar ayuda
help() {
    show_banner
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "COMANDOS:"
    echo "  dev         Iniciar en modo desarrollo"
    echo "  prod        Iniciar en modo producción"
    echo "  build       Construir imágenes Docker"
    echo "  stop        Parar todos los servicios"
    echo "  clean       Limpiar contenedores y volúmenes"
    echo "  logs [srv]  Mostrar logs (opcional: servicio específico)"
    echo "  status      Mostrar estado de servicios"
    echo "  backup      Crear backup de la base de datos"
    echo "  test        Ejecutar tests de conectividad"
    echo "  update      Actualizar sistema (con backup)"
    echo "  help        Mostrar esta ayuda"
    echo ""
    echo "EJEMPLOS:"
    echo "  $0 dev                 # Desarrollo"
    echo "  $0 prod                # Producción"
    echo "  $0 logs backend        # Logs del backend"
    echo "  $0 status              # Estado general"
    echo ""
    echo "🏥 Sistema con roles médicos completos implementados"
}

# Función principal
main() {
    show_banner
    check_dependencies
    
    case "$1" in
        dev)
            dev
            ;;
        prod)
            prod
            ;;
        build)
            build
            ;;
        stop)
            stop
            ;;
        clean)
            clean
            ;;
        logs)
            logs "$2"
            ;;
        status)
            status
            ;;
        backup)
            backup
            ;;
        test)
            test
            ;;
        update)
            update
            ;;
        help|--help|-h)
            help
            ;;
        *)
            log_error "Comando no reconocido: $1"
            echo ""
            help
            exit 1
            ;;
    esac
}

# Ejecutar función principal
main "$@"