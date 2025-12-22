# Configuración de Nginx Proxy Manager para dev.neuropedialab.org

## Problema
El frontend se carga correctamente por HTTPS, pero las peticiones a la API fallan con error "Mixed Content" porque intentan conectar a `http://backend:8001/api`.

## Solución
El frontend ahora usa rutas relativas (`/api`), por lo que el Nginx Proxy Manager debe redirigir:
- `https://dev.neuropedialab.org/*` → Frontend (puerto 5173 o 8080)
- `https://dev.neuropedialab.org/api/*` → Backend (puerto 8001)

## Configuración en Nginx Proxy Manager

### Opción 1: Host Proxy con Custom Location (Recomendado)

1. **Edita el Proxy Host existente** para `dev.neuropedialab.org`

2. En la pestaña **Custom Locations**, añade:
   ```
   Location: /api/
   Scheme: http
   Forward Hostname/IP: [IP_DE_TU_RPI]
   Forward Port: 8001
   ```
   
   Marca estas opciones:
   - ✓ Websockets Support
   - ✓ Block Common Exploits

3. En la pestaña **Details**, el host principal debe apuntar a:
   ```
   Scheme: http
   Forward Hostname/IP: [IP_DE_TU_RPI]
   Forward Port: 8080 (o 5173 si accedes directo al contenedor)
   ```

4. En la pestaña **Advanced**, añade (opcional):
   ```nginx
   # Headers para proxying correcto
   proxy_set_header X-Forwarded-Proto $scheme;
   proxy_set_header X-Real-IP $remote_addr;
   proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
   ```

### Opción 2: Dos Proxy Hosts separados

Si la opción 1 no funciona, crea dos configuraciones:

**Host 1: API Backend**
- Domain Names: `dev.neuropedialab.org/api`
- Forward to: `http://[IP]:8001`

**Host 2: Frontend**
- Domain Names: `dev.neuropedialab.org`
- Forward to: `http://[IP]:8080`

### Verificación

Después de configurar, verifica:

```bash
# Debe responder el frontend
curl -I https://dev.neuropedialab.org/

# Debe responder el backend
curl -I https://dev.neuropedialab.org/api/health
```

## Configuración actual de Docker

El docker-compose ahora tiene:
- Frontend en puerto 5173 con `VITE_API_URL=/api` (usa rutas relativas)
- Backend en puerto 8001
- Nginx interno en puerto 8080 (hace proxy interno entre frontend y backend)

**Recomendación:** Apunta NPM al puerto 8080 para que use el nginx interno que ya tiene configurado el proxy entre frontend y backend.

```
NPM (puerto 443) 
  → nginx interno (puerto 8080)
    → frontend (puerto 5173/3000)
    → backend (puerto 8001) cuando ruta es /api/*
```

