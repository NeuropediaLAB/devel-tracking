#!/usr/bin/env python3
"""
Script para revisar y corregir asociaciones video-hito basándose en nombres de archivos
"""

import sqlite3
import json
import re
from typing import Dict, List, Tuple

def conectar_db() -> sqlite3.Connection:
    """Conecta a la base de datos"""
    return sqlite3.connect('docker-data/desarrollo.db')

def obtener_videos_y_hitos():
    """Obtiene videos y hitos de la base de datos"""
    conn = conectar_db()
    cursor = conn.cursor()
    
    # Obtener videos
    cursor.execute("SELECT id, titulo, descripcion FROM videos ORDER BY id")
    videos = cursor.fetchall()
    
    # Obtener hitos CDC
    cursor.execute("""
        SELECT id, descripcion, edad_meses, fuente 
        FROM hitos 
        WHERE fuente LIKE '%CDC%' 
        ORDER BY edad_meses, descripcion
    """)
    hitos = cursor.fetchall()
    
    conn.close()
    return videos, hitos

def analizar_nombre_video(titulo: str) -> Dict:
    """Analiza el nombre del video para extraer información"""
    info = {
        'edad_meses': None,
        'habilidad': None,
        'palabras_clave': []
    }
    
    # Buscar edad en meses
    edad_match = re.search(r'(\d+)\s*(mes|month|mo)', titulo.lower())
    if edad_match:
        info['edad_meses'] = int(edad_match.group(1))
    
    # Palabras clave comunes para habilidades
    habilidades = {
        'sonrie': ['sonrisa', 'smile', 'sonrie'],
        'camina': ['camina', 'walk', 'caminando'],
        'habla': ['habla', 'dice', 'palabra', 'talk', 'speech'],
        'juega': ['juego', 'juega', 'play'],
        'agarra': ['agarra', 'toma', 'grasp', 'hold'],
        'come': ['come', 'eat', 'comida'],
        'gatea': ['gatea', 'crawl'],
        'salta': ['salta', 'jump'],
        'corre': ['corre', 'run'],
        'baila': ['baila', 'dance']
    }
    
    titulo_lower = titulo.lower()
    for habilidad, palabras in habilidades.items():
        if any(palabra in titulo_lower for palabra in palabras):
            info['habilidad'] = habilidad
            info['palabras_clave'].extend([p for p in palabras if p in titulo_lower])
    
    return info

def buscar_hitos_compatibles(info_video: Dict, hitos: List[Tuple]) -> List[Tuple]:
    """Busca hitos compatibles con el video"""
    compatibles = []
    
    for hito_id, descripcion, edad_meses, fuente in hitos:
        score = 0
        desc_lower = descripcion.lower()
        
        # Coincidencia de edad (±2 meses)
        if info_video['edad_meses']:
            if abs(edad_meses - info_video['edad_meses']) <= 2:
                score += 3
        
        # Coincidencia de habilidad
        if info_video['habilidad'] and info_video['habilidad'] in desc_lower:
            score += 5
        
        # Coincidencia de palabras clave
        for palabra in info_video['palabras_clave']:
            if palabra in desc_lower:
                score += 2
        
        if score >= 3:  # Umbral mínimo
            compatibles.append((hito_id, descripcion, edad_meses, fuente, score))
    
    # Ordenar por score descendente
    compatibles.sort(key=lambda x: x[4], reverse=True)
    return compatibles

def main():
    """Función principal"""
    print("🔍 Analizando asociaciones video-hito...")
    
    videos, hitos = obtener_videos_y_hitos()
    
    print(f"\n📊 Videos encontrados: {len(videos)}")
    print(f"📊 Hitos CDC encontrados: {len(hitos)}")
    
    asociaciones_sugeridas = {}
    
    print("\n🎯 Análisis de compatibilidad:")
    print("=" * 80)
    
    for video_id, titulo, descripcion in videos:
        print(f"\n🎬 Video {video_id}: {titulo}")
        
        info_video = analizar_nombre_video(titulo)
        print(f"   📝 Edad detectada: {info_video['edad_meses']} meses")
        print(f"   📝 Habilidad detectada: {info_video['habilidad']}")
        print(f"   📝 Palabras clave: {info_video['palabras_clave']}")
        
        compatibles = buscar_hitos_compatibles(info_video, hitos)
        
        if compatibles:
            print(f"   ✅ Hitos compatibles encontrados: {len(compatibles)}")
            for i, (hito_id, desc, edad, fuente, score) in enumerate(compatibles[:3]):
                print(f"      {i+1}. (Score: {score}) {desc} - {edad} meses")
            
            # Guardar la mejor sugerencia
            asociaciones_sugeridas[str(video_id)] = [compatibles[0][0]]
        else:
            print(f"   ❌ No se encontraron hitos compatibles")
    
    # Guardar sugerencias
    with open('asociaciones_sugeridas_revisadas.json', 'w', encoding='utf-8') as f:
        json.dump(asociaciones_sugeridas, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Asociaciones sugeridas guardadas en 'asociaciones_sugeridas_revisadas.json'")
    print(f"📊 Total de asociaciones generadas: {len(asociaciones_sugeridas)}")

if __name__ == "__main__":
    main()