#!/usr/bin/env python3
"""
Script para autoasociar videos con hitos basándose en el nombre del video
"""

import sqlite3
import re
import json

def conectar_bd():
    """Conectar a la base de datos SQLite"""
    try:
        conn = sqlite3.connect('server/neurodesarrollo_dev_new.db')
        return conn
    except Exception as e:
        print(f"Error conectando a la base de datos: {e}")
        return None

def obtener_videos(cursor):
    """Obtener todos los videos de la base de datos"""
    try:
        cursor.execute("SELECT id, titulo, fuente FROM videos WHERE fuente = 'CDC'")
        return cursor.fetchall()
    except Exception as e:
        print(f"Error obteniendo videos: {e}")
        return []

def obtener_hitos(cursor):
    """Obtener todos los hitos de la base de datos"""
    try:
        cursor.execute("""
            SELECT hn.id, hn.nombre, hn.descripcion, d.nombre as dominio, fn.nombre as fuente
            FROM hitos_normativos hn
            JOIN dominios d ON hn.dominio_id = d.id
            JOIN fuentes_normativas fn ON hn.fuente_normativa_id = fn.id
            WHERE hn.nombre NOT LIKE '[CUARENTENA]%'
        """)
        return cursor.fetchall()
    except Exception as e:
        print(f"Error obteniendo hitos: {e}")
        return []

def buscar_coincidencias(titulo_video, hitos):
    """Buscar hitos que coincidan con el título del video"""
    coincidencias = []
    titulo_limpio = titulo_video.lower().strip()
    
    # Mapeo de palabras clave específicas
    mapeo_palabras = {
        'sonrie': ['sonríe', 'sonrisa', 'smile'],
        'risa': ['ríe', 'risa', 'laugh'],
        'gorjea': ['gorgea', 'gorjeo', 'vocaliza'],
        'balbucea': ['balbuceo', 'babble'],
        'habla': ['hablar', 'palabra', 'dice'],
        'mira': ['mirar', 'observa', 'seguir'],
        'cabeza': ['mantiene', 'control', 'cefálico'],
        'manos': ['mano', 'brazos', 'dedo'],
        'juguete': ['juguetes', 'objeto'],
        'sienta': ['sentado', 'sin apoyo'],
        'camina': ['caminata', 'cruising'],
        'aplaude': ['palmita', 'aplaudir'],
        'señala': ['señalar', 'indica'],
        'torre': ['bloques', 'apila']
    }
    
    # Extraer palabras clave del título
    palabras_titulo = re.findall(r'\b\w+\b', titulo_limpio)
    
    for hito in hitos:
        hito_id, nombre, descripcion, dominio, fuente = hito
        
        # Buscar coincidencias en nombre y descripción
        textos_hito = [
            nombre.lower() if nombre else '',
            descripcion.lower() if descripcion else ''
        ]
        
        puntuacion = 0
        detalles_coincidencia = []
        
        # Buscar coincidencias directas
        for palabra in palabras_titulo:
            if len(palabra) > 2:
                for texto in textos_hito:
                    if palabra in texto:
                        puntuacion += 2
                        detalles_coincidencia.append(f"'{palabra}' en hito")
        
        # Buscar coincidencias usando el mapeo
        for clave, sinonimos in mapeo_palabras.items():
            if clave in titulo_limpio:
                for sinonimo in sinonimos:
                    for texto in textos_hito:
                        if sinonimo in texto:
                            puntuacion += 3
                            detalles_coincidencia.append(f"'{clave}' -> '{sinonimo}'")
        
        # Bonificación por fuente CDC
        if fuente and 'CDC' in fuente:
            puntuacion += 1
        
        # Si hay coincidencias, añadir a la lista
        if puntuacion >= 3:
            coincidencias.append((hito_id, puntuacion, nombre, detalles_coincidencia))
    
    # Ordenar por puntuación descendente
    coincidencias.sort(key=lambda x: x[1], reverse=True)
    
    return coincidencias[:3]  # Máximo 3 coincidencias

def main():
    conn = conectar_bd()
    if not conn:
        return
    
    cursor = conn.cursor()
    
    # Obtener datos
    videos = obtener_videos(cursor)
    hitos = obtener_hitos(cursor)
    
    print(f"Videos encontrados: {len(videos)}")
    print(f"Hitos encontrados: {len(hitos)}")
    
    if not videos or not hitos:
        print("No se pueden procesar los datos")
        conn.close()
        return
    
    # Procesar autoasociaciones
    asociaciones = {}
    
    for video in videos:
        video_id, titulo, fuente = video
        print(f"\nProcesando video ID {video_id}: {titulo}")
        
        coincidencias = buscar_coincidencias(titulo, hitos)
        
        if coincidencias:
            print(f"  Coincidencias encontradas:")
            for hito_id, puntuacion, nombre_hito, detalles in coincidencias:
                print(f"    - Hito {hito_id}: {nombre_hito} (puntuación: {puntuacion})")
                print(f"      Detalles: {', '.join(detalles)}")
            
            # Tomar solo la mejor coincidencia para asociación automática
            mejor_coincidencia = coincidencias[0]
            asociaciones[video_id] = [mejor_coincidencia[0]]
        else:
            print(f"  No se encontraron coincidencias automáticas")
    
    # Guardar asociaciones en archivo JSON
    with open('asociaciones_automaticas.json', 'w', encoding='utf-8') as f:
        json.dump(asociaciones, f, indent=2, ensure_ascii=False)
    
    print(f"\nProceso completado. {len(asociaciones)} videos con asociaciones automáticas.")
    print("Asociaciones guardadas en 'asociaciones_automaticas.json'")
    
    conn.close()

if __name__ == "__main__":
    main()
