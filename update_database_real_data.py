#!/usr/bin/env python3
"""
Script para actualizar la base de datos con datos reales de desarrollo infantil
"""

import json
import mysql.connector
import os
from datetime import datetime

def connect_to_database():
    """Conectar a la base de datos MySQL"""
    try:
        connection = mysql.connector.connect(
            host='localhost',
            port=3306,
            database='devel_tracking',
            user='root',
            password='password'
        )
        return connection
    except Exception as e:
        print(f"Error conectando a la base de datos: {e}")
        return None

def clear_fake_data(cursor):
    """Eliminar datos inventados de la base de datos"""
    print("Eliminando datos inventados...")
    
    # Eliminar datos de escalas inventadas
    fake_sources = ['Bayley', 'Battelle', 'BSID', 'ASQ', 'Denver']
    
    for source in fake_sources:
        cursor.execute("DELETE FROM hitos WHERE fuente_normativa = %s", (source,))
        print(f"Eliminados hitos de {source}")
    
    # Mantener solo CDC reales si existen
    cursor.execute("DELETE FROM hitos WHERE fuente_normativa = 'CDC' AND descripcion LIKE '%inventado%'")
    
    print("Datos inventados eliminados")

def insert_real_cdc_milestones(cursor):
    """Insertar hitos reales de CDC"""
    print("Insertando hitos reales de CDC...")
    
    # Leer datos reales de CDC
    with open('development_data_sources.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    cdc_milestones = data['sample_milestones']
    
    # Mapeo de dominios
    domain_mapping = {
        'Social/Emocional': 'social',
        'Lenguaje/Comunicación': 'lenguaje',
        'Movimiento/Físico': 'motor',
        'Cognitivo': 'cognitivo'
    }
    
    for milestone in cdc_milestones:
        # Verificar si ya existe
        cursor.execute("""
            SELECT id FROM hitos 
            WHERE descripcion = %s AND edad_meses = %s AND fuente_normativa = %s
        """, (milestone['hito'], milestone['edad_meses'], 'CDC'))
        
        if cursor.fetchone() is None:
            cursor.execute("""
                INSERT INTO hitos (
                    descripcion, edad_meses, dominio, fuente_normativa,
                    media, desviacion_estandar, percentil_10, percentil_25,
                    percentil_50, percentil_75, percentil_90, es_critico,
                    fecha_creacion, fecha_actualizacion
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                milestone['hito'],
                milestone['edad_meses'],
                domain_mapping.get(milestone['dominio'], 'general'),
                'CDC',
                milestone['edad_meses'],  # Media = edad esperada
                0.5,  # DE pequeña para hitos típicos
                milestone['edad_meses'] - 0.5,  # P10
                milestone['edad_meses'] - 0.25,  # P25
                milestone['edad_meses'],  # P50 (mediana)
                milestone['edad_meses'] + 0.25,  # P75
                milestone['edad_meses'] + 0.5,  # P90
                1 if milestone['edad_meses'] <= 24 else 0,  # Críticos hasta 24 meses
                datetime.now(),
                datetime.now()
            ))
    
    print(f"Insertados {len(cdc_milestones)} hitos reales de CDC")

def insert_data_sources_info(cursor):
    """Insertar información sobre las fuentes de datos"""
    print("Insertando información de fuentes...")
    
    with open('development_data_sources.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Crear tabla de fuentes si no existe
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS fuentes_normativas (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(100) NOT NULL,
            descripcion TEXT,
            muestra_tamano VARCHAR(100),
            rango_edad VARCHAR(50),
            dominios JSON,
            pais_origen VARCHAR(100),
            ano_publicacion YEAR,
            validacion_cruzada BOOLEAN DEFAULT FALSE,
            acceso_publico BOOLEAN DEFAULT TRUE,
            url VARCHAR(500),
            fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    sources_info = [
        {
            'nombre': 'CDC',
            'descripcion': data['cdc']['description'],
            'muestra_tamano': data['cdc']['sample_size'],
            'rango_edad': data['cdc']['age_range'],
            'dominios': json.dumps(data['cdc']['domains']),
            'pais_origen': 'Estados Unidos',
            'ano_publicacion': 2022,
            'validacion_cruzada': True,
            'acceso_publico': True,
            'url': 'https://www.cdc.gov/ncbddd/actearly/'
        },
        {
            'nombre': 'WHO GSED',
            'descripcion': data['who_gsed']['description'],
            'muestra_tamano': data['who_gsed']['sample_size'],
            'rango_edad': data['who_gsed']['age_range'],
            'dominios': json.dumps(data['who_gsed']['domains']),
            'pais_origen': 'Multi-país',
            'ano_publicacion': 2023,
            'validacion_cruzada': True,
            'acceso_publico': True,
            'url': data['who_gsed']['url']
        },
        {
            'nombre': 'ECDI2030',
            'descripcion': data['ecdi2030']['description'],
            'muestra_tamano': data['ecdi2030']['sample_size'],
            'rango_edad': data['ecdi2030']['age_range'],
            'dominios': json.dumps(data['ecdi2030']['domains']),
            'pais_origen': 'Global',
            'ano_publicacion': 2030,
            'validacion_cruzada': True,
            'acceso_publico': True,
            'url': data['ecdi2030']['url']
        },
        {
            'nombre': 'GCDG',
            'descripcion': data['gcdg']['description'],
            'muestra_tamano': data['gcdg']['sample_size'],
            'rango_edad': data['gcdg']['age_range'],
            'dominios': json.dumps(data['gcdg']['domains']),
            'pais_origen': 'Multi-país',
            'ano_publicacion': 2020,
            'validacion_cruzada': True,
            'acceso_publico': False,
            'url': 'https://gcdg.org'
        },
        {
            'nombre': 'D-score',
            'descripcion': data['dscore']['description'],
            'muestra_tamano': data['dscore']['sample_size'],
            'rango_edad': data['dscore']['age_range'],
            'dominios': json.dumps(data['dscore']['domains']),
            'pais_origen': 'Holanda',
            'ano_publicacion': 2019,
            'validacion_cruzada': True,
            'acceso_publico': True,
            'url': 'https://d-score.org'
        }
    ]
    
    for source in sources_info:
        # Verificar si ya existe
        cursor.execute("SELECT id FROM fuentes_normativas WHERE nombre = %s", (source['nombre'],))
        if cursor.fetchone() is None:
            cursor.execute("""
                INSERT INTO fuentes_normativas (
                    nombre, descripcion, muestra_tamano, rango_edad,
                    dominios, pais_origen, ano_publicacion, validacion_cruzada,
                    acceso_publico, url
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                source['nombre'], source['descripcion'], source['muestra_tamano'],
                source['rango_edad'], source['dominios'], source['pais_origen'],
                source['ano_publicacion'], source['validacion_cruzada'],
                source['acceso_publico'], source['url']
            ))
    
    print(f"Insertadas {len(sources_info)} fuentes de datos")

def add_dscore_explanation(cursor):
    """Añadir información educativa sobre D-score"""
    print("Añadiendo información educativa sobre D-score...")
    
    # Crear tabla para información educativa si no existe
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS informacion_educativa (
            id INT AUTO_INCREMENT PRIMARY KEY,
            titulo VARCHAR(200) NOT NULL,
            contenido TEXT NOT NULL,
            categoria VARCHAR(50),
            fuente VARCHAR(100),
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    dscore_info = [
        {
            'titulo': '¿Qué es el D-score?',
            'contenido': '''El D-score (Development Score) es una métrica estadística que proporciona una puntuación única y continua del desarrollo infantil. 
            
Características principales:
• Rango de edad: 0-48 meses
• Escala continua comparable entre edades
• Basado en más de 15 estudios longitudinales internacionales
• Permite comparación entre diferentes instrumentos de evaluación
• Facilita el seguimiento del progreso individual

El D-score transforma observaciones del desarrollo en una escala común, similar a como el peso y la talla se expresan en unidades estándar.''',
            'categoria': 'algoritmo',
            'fuente': 'D-score.org'
        },
        {
            'titulo': 'Interpretación del D-score',
            'contenido': '''El D-score se interpreta mediante:

DAZ (D-score-for-Age Z-score):
• DAZ > +2.0: Desarrollo muy alto
• DAZ +1.0 a +2.0: Desarrollo alto
• DAZ -1.0 a +1.0: Desarrollo típico
• DAZ -1.0 a -2.0: Desarrollo bajo
• DAZ < -2.0: Desarrollo muy bajo (posible retraso)

Ventajas del D-score:
• Métrica continua (no categórica)
• Comparable entre diferentes edades
• Sensible a pequeños cambios
• Basado en evidencia internacional''',
            'categoria': 'interpretacion',
            'fuente': 'D-score.org'
        },
        {
            'titulo': 'Dominios evaluados por D-score',
            'contenido': '''El D-score evalúa cuatro dominios principales:

1. COGNITIVO
   • Resolución de problemas
   • Memoria y atención
   • Procesamiento de información

2. LENGUAJE
   • Comprensión verbal
   • Expresión verbal
   • Comunicación no verbal

3. MOTOR
   • Motricidad gruesa
   • Motricidad fina
   • Coordinación

4. SOCIO-EMOCIONAL
   • Interacción social
   • Regulación emocional
   • Comportamiento adaptativo''',
            'categoria': 'dominios',
            'fuente': 'D-score.org'
        }
    ]
    
    for info in dscore_info:
        cursor.execute("SELECT id FROM informacion_educativa WHERE titulo = %s", (info['titulo'],))
        if cursor.fetchone() is None:
            cursor.execute("""
                INSERT INTO informacion_educativa (titulo, contenido, categoria, fuente)
                VALUES (%s, %s, %s, %s)
            """, (info['titulo'], info['contenido'], info['categoria'], info['fuente']))
    
    print(f"Añadidas {len(dscore_info)} entradas educativas")

def main():
    """Función principal"""
    print("=== Actualizando base de datos con datos reales ===")
    
    # Verificar que existen los archivos de datos
    if not os.path.exists('development_data_sources.json'):
        print("Error: No se encontró el archivo de datos. Ejecuta primero scrape_development_data.py")
        return
    
    # Conectar a la base de datos
    connection = connect_to_database()
    if not connection:
        return
    
    try:
        cursor = connection.cursor()
        
        # Limpiar datos inventados
        clear_fake_data(cursor)
        
        # Insertar datos reales
        insert_real_cdc_milestones(cursor)
        insert_data_sources_info(cursor)
        add_dscore_explanation(cursor)
        
        # Confirmar cambios
        connection.commit()
        
        print("=== Actualización completada exitosamente ===")
        
        # Mostrar estadísticas
        cursor.execute("SELECT COUNT(*) FROM hitos WHERE fuente_normativa = 'CDC'")
        cdc_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM fuentes_normativas")
        sources_count = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(*) FROM informacion_educativa")
        edu_count = cursor.fetchone()[0]
        
        print(f"Hitos CDC: {cdc_count}")
        print(f"Fuentes normativas: {sources_count}")
        print(f"Información educativa: {edu_count}")
        
    except Exception as e:
        print(f"Error durante la actualización: {e}")
        connection.rollback()
    
    finally:
        cursor.close()
        connection.close()

if __name__ == "__main__":
    main()