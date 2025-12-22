# 🐳 Docker - Sistema de Seguimiento del Neurodesarrollo

Sistema completo dockerizado con soporte para **roles médicos implementados**.

## 🚀 Inicio Rápido

### Desarrollo
```bash
# Iniciar en modo desarrollo con hot-reload
./docker-manager.sh dev

# O usando docker-compose directamente
docker-compose up --build
```

### Producción
```bash
# Iniciar en modo producción optimizado
./docker-manager.sh prod

# O usando docker-compose directamente
docker-compose -f docker-compose.prod.yml up -d --build
```

## 📋 Gestión del Sistema

El script `docker-manager.sh` proporciona gestión completa:

```bash
./docker-manager.sh [COMANDO]

COMANDOS:
  dev         Iniciar en modo desarrollo
  prod        Iniciar en modo producción  
  build       Construir imágenes Docker
  stop        Parar todos los servicios
  clean       Limpiar contenedores y volúmenes
  logs [srv]  Mostrar logs (opcional: servicio específico)
  status      Mostrar estado de servicios
  backup      Crear backup de la base de datos
  test        Ejecutar tests de conectividad
  update      Actualizar sistema (con backup)
  help        Mostrar ayuda completa
```

## 🏥 Roles Médicos Implementados

### Usuarios Predeterminados
| Rol | Email | Password | Permisos |
|-----|-------|----------|----------|
| 👑 **Admin** | `admin@neuropedialab.org` | `admin123` | Acceso completo al sistema |
| 🧠 **Neuropediatra** | `neuropediatra@hospital.es` | `neuro123` | Todos los casos, funciones avanzadas |
| 👨‍⚕️ **Pediatra AP** | `pediatra@centrosalud.es` | `ped123` | Casos de su área, evaluación básica |
| 👩‍⚕️ **Enfermería** | `enfermeria@hospital.es` | `enf123` | Funciones básicas, registro |

### Control de Acceso por Rol

```javascript
// Middleware implementados
verificarAdmin()           // Solo admin
verificarRolMedico()      // admin, neuropediatra, pediatra_ap, enfermeria  
verificarNeuropediatra()  // admin, neuropediatra
verificarPediatra()       // admin, neuropediatra, pediatra_ap
```

## 🔧 Arquitectura

### Servicios Docker

#### Desarrollo (`docker-compose.yml`)
- **Backend**: Node.js + Express + SQLite
- **Frontend**: Vite + React (hot-reload)
- **Red**: Bridge network aislada

#### Producción (`docker-compose.prod.yml`)
- **Backend**: Optimizado, límites de recursos
- **Frontend**: Build estático optimizado  
- **Nginx**: Proxy reverso con SSL
- **Watchtower**: Actualizaciones automáticas
- **Health Checks**: Monitoreo continuo

### Puertos y Acceso

| Servicio | Puerto | URL | Uso |
|----------|---------|-----|-----|
| Frontend | 5173 | http://localhost:5173 | Interfaz principal |
| Backend | 8001 | http://localhost:8001 | API REST |
| Nginx | 80/443 | http://localhost | Proxy (producción) |

## 💾 Persistencia de Datos

### Volúmenes Docker
- `db-data`: Base de datos SQLite
- `./logs`: Archivos de log
- `./ssl`: Certificados SSL (producción)

### Backup Automático
```bash
# Crear backup manual
./docker-manager.sh backup

# Backups en: ./backups/YYYYMMDD_HHMMSS/
```

## 🔒 Configuración de Seguridad

### Variables de Entorno (`.env`)
```bash
# JWT y autenticación
JWT_SECRET=tu_clave_secreta_jwt

# Base de datos
DATABASE_PATH=/app/server/neurodesarrollo_dev_new.db

# CORS y seguridad
ALLOWED_ORIGINS=http://localhost:5173,https://tu-dominio.com

# SSL (producción)
SSL_CERT_PATH=./ssl/cert.pem
SSL_KEY_PATH=./ssl/key.pem
```

### Nginx Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff  
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security

## 📊 Monitoreo y Logs

### Health Checks
```bash
# Verificar estado general
./docker-manager.sh status

# Test de conectividad
./docker-manager.sh test

# Health check endpoint
curl http://localhost:8001/api/health
```

### Logs en Tiempo Real
```bash
# Todos los servicios
./docker-manager.sh logs

# Servicio específico  
./docker-manager.sh logs backend
./docker-manager.sh logs frontend
./docker-manager.sh logs nginx
```

## 🔄 Actualizaciones

### Actualización Manual
```bash
# Con backup automático
./docker-manager.sh update
```

### Actualización Automática (Producción)
El servicio **Watchtower** actualiza automáticamente a las 2 AM:
- Busca nuevas imágenes
- Actualiza contenedores
- Limpia imágenes antiguas

## 🐞 Troubleshooting

### Problemas Comunes

#### Puerto en uso
```bash
# Verificar puertos ocupados
netstat -tulpn | grep :8001
netstat -tulpn | grep :5173

# Parar servicios
./docker-manager.sh stop
```

#### Base de datos corrupta
```bash
# Restaurar desde backup
cp ./backups/FECHA/neurodesarrollo_dev_new.db ./server/
```

#### Permisos de archivos
```bash
# Verificar propietario
ls -la server/neurodesarrollo_dev_new.db

# Corregir permisos
chown $USER:$USER server/neurodesarrollo_dev_new.db
chmod 664 server/neurodesarrollo_dev_new.db
```

#### Memoria insuficiente
```bash
# Verificar uso de memoria
docker stats

# Limpiar imágenes no usadas
docker system prune -f
```

### Logs de Debugging

```bash
# Backend detallado
docker-compose logs -f backend

# Verificar inicialización de usuarios
docker-compose logs backend | grep "Usuario.*creado"

# Verificar roles en BD
docker-compose exec backend sqlite3 /app/server/neurodesarrollo_dev_new.db \
  "SELECT email, nombre, rol FROM usuarios"
```

## 🔧 Desarrollo

### Hot Reload
En modo desarrollo, los cambios se reflejan automáticamente:
- **Frontend**: Vite hot-reload
- **Backend**: Reinicio manual necesario

### Debug del Backend
```bash
# Conectar al contenedor
docker-compose exec backend sh

# Verificar base de datos
sqlite3 /app/server/neurodesarrollo_dev_new.db ".tables"
```

### Reconstruir Imágenes
```bash
# Forzar rebuild completo
./docker-manager.sh clean
./docker-manager.sh build
```

## 📈 Producción

### Requisitos del Sistema
- **CPU**: 2+ cores
- **RAM**: 2GB+ (recomendado 4GB)
- **Disco**: 10GB+ espacio libre
- **Red**: Puerto 80/443 disponibles

### SSL/HTTPS
```bash
# Generar certificados self-signed (desarrollo)
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes

# Para producción usar Let's Encrypt o certificados válidos
```

### Variables de Producción
```bash
# .env para producción
NODE_ENV=production
DOMAIN_NAME=tu-dominio.com
JWT_SECRET=clave_super_segura_jwt
SSL_CERT_PATH=./ssl/cert.pem
SSL_KEY_PATH=./ssl/key.pem
```

## 🤝 Contribuir

### Desarrollo Local
1. Fork del repositorio
2. Clonar localmente
3. `./docker-manager.sh dev`
4. Hacer cambios
5. Test con `./docker-manager.sh test`
6. Commit y PR

### Estructura de Archivos Docker
```
docker/
├── Dockerfile                 # Imagen principal
├── docker-compose.yml         # Desarrollo
├── docker-compose.prod.yml    # Producción
├── docker-manager.sh          # Script de gestión
├── docker-entrypoint.sh       # Punto de entrada
├── nginx.conf                 # Configuración proxy
├── .env                       # Variables de entorno
└── README-DOCKER.md          # Esta documentación
```

---

## 📞 Soporte

Para problemas específicos de Docker:
1. Verificar logs: `./docker-manager.sh logs`
2. Probar conectividad: `./docker-manager.sh test`
3. Verificar estado: `./docker-manager.sh status`
4. En caso de problemas graves: `./docker-manager.sh clean` y reconstruir

**Sistema implementado con roles médicos completos y listo para producción** 🏥✅