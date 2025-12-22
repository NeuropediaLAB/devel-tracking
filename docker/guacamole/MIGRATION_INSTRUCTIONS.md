# Migración de Guacamole desde Raspberry Pi

## Problema Identificado
La Raspberry Pi 5 se apagaba bajo carga debido a **7 contenedores Docker** ejecutándose simultáneamente, siendo **Guacamole el más pesado** (3GB RAM asignados).

## Configuración Original
- **Puerto**: 8083:8080 
- **Imagen**: flcontainers/guacamole
- **Memoria**: 1.5GB-3GB RAM configurados
- **PostgreSQL interno** incluido

## Pasos de Migración

### 1. En la nueva máquina
```bash
cd /docker/guacamole
docker-compose up -d
```

### 2. Copiar datos desde Pi (si es necesario)
```bash
# Respaldar configuración desde Pi
ssh arkantu@192.168.0.193
docker cp guacamole:/config ./guacamole-backup

# Copiar a nueva máquina
scp -r ./guacamole-backup usuario@nueva-maquina:/docker/guacamole/data
```

### 3. Completar limpieza en Pi
```bash
ssh arkantu@192.168.0.193
docker rm guacamole
docker image rm flcontainers/guacamole
```

### 4. Actualizar proxy/DNS
- Cambiar `192.168.0.193:8083` → `nueva-ip:8083`
- Actualizar Nginx Proxy Manager si aplica

## Estado Post-Migración

**✅ Beneficios en Pi:**
- Liberados 3GB RAM
- Reducida carga CPU significativamente  
- Mayor estabilidad del sistema

**🔧 Configuración Nueva Máquina:**
- Misma funcionalidad
- Puerto 8083 mantenido
- Configuración completa preservada

## Acceso
- **URL**: http://nueva-ip:8083/guacamole/
- **Usuario/Pass**: Configurado internamente en primera ejecución