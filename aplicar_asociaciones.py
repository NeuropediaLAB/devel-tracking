#!/usr/bin/env python3
"""
Script para aplicar las asociaciones automáticas de videos con hitos a la base de datos
"""

import sqlite3
import json
import os

def conectar_bd():
    """Conectar a la base de datos SQLite"""
    try:
        conn = sqlite3.connect('server/neurodesarrollo_dev_new.db')
        return conn
    except Exception as e:
        print(f"Error conectando a la base de datos: {e}")
        return None

def cargar_asociaciones():
    """Cargar asociaciones desde el archivo JSON"""
    if not os.path.exists('asociaciones_automaticas.json'):
        print("Archivo de asociaciones no encontrado")
        return {}
    
    try:
        with open('asociaciones_automaticas.json', 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error cargando asociaciones: {e}")
        return {}

def limpiar_asociaciones_existentes(cursor, video_id):
    """Eliminar asociaciones existentes de un video"""
    try:
        cursor.execute("DELETE FROM videos_hitos WHERE video_id = ?", (video_id,))
        return True
    except Exception as e:
        print(f"Error limpiando asociaciones del video {video_id}: {e}")
        return False

def aplicar_asociacion(cursor, video_id, hito_id):
    """Aplicar una asociación video-hito"""
    try:
        cursor.execute("""
            INSERT OR IGNORE INTO videos_hitos (video_id, hito_id)
            VALUES (?, ?)
        """, (video_id, hito_id))
        return True
    except Exception as e:
        print(f"Error aplicando asociación video {video_id} - hito {hito_id}: {e}")
        return False

def main():
    conn = conectar_bd()
    if not conn:
        return
    
    cursor = conn.cursor()
    
    # Cargar asociaciones
    asociaciones = cargar_asociaciones()
    
    if not asociaciones:
        print("No hay asociaciones para aplicar")
        conn.close()
        return
    
    print(f"Aplicando {len(asociaciones)} asociaciones automáticas...")
    
    aplicaciones_exitosas = 0
    errores = 0
    
    for video_id_str, hitos_ids in asociaciones.items():
        video_id = int(video_id_str)
        
        # Limpiar asociaciones existentes
        if not limpiar_asociaciones_existentes(cursor, video_id):
            errores += 1
            continue
        
        # Aplicar nuevas asociaciones
        for hito_id in hitos_ids:
            if aplicar_asociacion(cursor, video_id, hito_id):
                aplicaciones_exitosas += 1
                print(f"✓ Video {video_id} asociado con hito {hito_id}")
            else:
                errores += 1
                print(f"✗ Error asociando video {video_id} con hito {hito_id}")
    
    # Confirmar cambios
    conn.commit()
    
    print(f"\nResumen:")
    print(f"- Asociaciones aplicadas exitosamente: {aplicaciones_exitosas}")
    print(f"- Errores: {errores}")
    
    conn.close()

if __name__ == "__main__":
    main()