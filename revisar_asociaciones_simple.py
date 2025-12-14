#!/usr/bin/env python3
"""
Script simple para revisar asociaciones basándose en el archivo JSON existente
"""

import json
import requests

def obtener_datos_api():
    """Obtiene datos de la API"""
    try:
        # Primero intentamos obtener un token (usuario invitado)
        login_response = requests.post('http://localhost:8001/api/login', 
                                     json={'usuario': 'invitado', 'password': 'invitado'})
        
        if login_response.status_code == 200:
            token = login_response.json().get('token')
            headers = {'Authorization': f'Bearer {token}'}
            
            # Obtener videos
            videos_response = requests.get('http://localhost:8001/api/videos', headers=headers)
            hitos_response = requests.get('http://localhost:8001/api/hitos', headers=headers)
            
            if videos_response.status_code == 200 and hitos_response.status_code == 200:
                return videos_response.json(), hitos_response.json()
        
        print("No se pudo obtener datos de la API")
        return None, None
        
    except Exception as e:
        print(f"Error conectando a la API: {e}")
        return None, None

def analizar_asociaciones():
    """Analiza las asociaciones actuales"""
    # Cargar asociaciones actuales
    try:
        with open('asociaciones_automaticas.json', 'r', encoding='utf-8') as f:
            asociaciones = json.load(f)
    except FileNotFoundError:
        print("No se encontró el archivo de asociaciones")
        return
    
    # Obtener datos de la API
    videos, hitos = obtener_datos_api()
    
    if not videos or not hitos:
        print("❌ No se pudieron obtener los datos necesarios")
        return
    
    # Crear diccionarios para búsqueda rápida
    videos_dict = {str(v['id']): v for v in videos}
    hitos_dict = {h['id']: h for h in hitos}
    
    print("🔍 Revisando asociaciones actuales...")
    print("=" * 80)
    
    problemas = []
    
    for video_id, hitos_asociados in asociaciones.items():
        video = videos_dict.get(video_id)
        if not video:
            print(f"❌ Video {video_id} no encontrado")
            continue
        
        print(f"\n🎬 Video {video_id}: {video['titulo']}")
        
        for hito_id in hitos_asociados:
            hito = hitos_dict.get(hito_id)
            if not hito:
                print(f"   ❌ Hito {hito_id} no encontrado")
                problemas.append(f"Hito {hito_id} no existe (video {video_id})")
                continue
            
            print(f"   📍 Asociado a: {hito['descripcion']} ({hito['edad_meses']} meses) - {hito.get('fuente', 'Sin fuente')}")
            
            # Verificar coherencia básica
            titulo_lower = video['titulo'].lower()
            desc_lower = hito['descripcion'].lower()
            
            # Buscar inconsistencias obvias
            if 'mes' in titulo_lower or 'month' in titulo_lower:
                import re
                edad_match = re.search(r'(\d+)\s*(mes|month)', titulo_lower)
                if edad_match:
                    edad_video = int(edad_match.group(1))
                    edad_hito = hito['edad_meses']
                    if abs(edad_video - edad_hito) > 3:  # Diferencia mayor a 3 meses
                        problemas.append(f"Posible inconsistencia de edad: Video '{video['titulo']}' (~{edad_video} meses) asociado a hito de {edad_hito} meses")
    
    if problemas:
        print(f"\n⚠️  Problemas detectados ({len(problemas)}):")
        for i, problema in enumerate(problemas, 1):
            print(f"   {i}. {problema}")
    else:
        print(f"\n✅ No se detectaron problemas obvios en las asociaciones")
    
    print(f"\n📊 Resumen:")
    print(f"   - Videos analizados: {len(asociaciones)}")
    print(f"   - Asociaciones totales: {sum(len(hitos) for hitos in asociaciones.values())}")
    print(f"   - Problemas encontrados: {len(problemas)}")

if __name__ == "__main__":
    analizar_asociaciones()