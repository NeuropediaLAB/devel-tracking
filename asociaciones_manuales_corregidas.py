#!/usr/bin/env python3
"""
Script para crear asociaciones manuales corregidas basadas en el conocimiento del desarrollo infantil
"""

import sqlite3
import json

def conectar_bd():
    """Conectar a la base de datos SQLite"""
    try:
        conn = sqlite3.connect('server/neurodesarrollo_dev_new.db')
        return conn
    except Exception as e:
        print(f"Error conectando a la base de datos: {e}")
        return None

def obtener_videos_cdc(cursor):
    """Obtener todos los videos CDC"""
    cursor.execute("SELECT id, titulo FROM videos WHERE fuente = 'CDC' ORDER BY id")
    return cursor.fetchall()

def obtener_hito_por_nombre(cursor, nombre_parcial):
    """Buscar hitos que contengan un nombre específico"""
    cursor.execute("""
        SELECT id, nombre FROM hitos_normativos 
        WHERE LOWER(nombre) LIKE LOWER(?) 
        AND nombre NOT LIKE '[CUARENTENA]%'
        ORDER BY nombre
    """, (f'%{nombre_parcial}%',))
    return cursor.fetchall()

def crear_asociaciones_manuales():
    """Crear asociaciones manuales corregidas basadas en conocimiento del desarrollo"""
    
    # Asociaciones manuales correctas basadas en el desarrollo infantil
    asociaciones_correctas = {
        # Videos de comportamientos visuales y de atención
        191: {  # "Video CDC 13 mira sus manos"
            'hitos': [7526, 7440],  # Fija la mirada, Mira las caras y establece contacto visual
            'razon': 'Comportamiento de exploración visual propia'
        },
        
        # Videos de sonrisa y expresiones
        179: {  # "Video CDC 1 sonrie cuando usted le habla"
            'hitos': [7404, 7442],  # Sonrisa social
            'razon': 'Sonrisa social en respuesta'
        },
        
        185: {  # "Video CDC 7 sonrie"
            'hitos': [7404, 7409],  # Sonrisa social, Sonríe espontáneamente
            'razon': 'Sonrisa espontánea'
        },
        
        # Videos de comunicación vocal
        180: {  # "Video CDC 2 gorgea"
            'hitos': [7505, 7840],  # Gorjea, Vocaliza actitudes
            'razon': 'Vocalización temprana'
        },
        
        188: {  # "Video CDC 10 gorjea"
            'hitos': [7505, 7840, 9500],  # Gorjea, Vocaliza actitudes, Vocaliza cuando se le habla
            'razon': 'Vocalización en respuesta'
        },
        
        # Videos de reacciones a sonidos
        181: {  # "Video CDC 3 reacciona a sonidos fuertes"
            'hitos': [7417, 7807],  # Responde a sonidos haciendo sonidos, Se voltea hacia sonidos
            'razon': 'Respuesta auditiva'
        },
        
        # Videos de control motor
        183: {  # "Video CDC 5 mueve ambos brazos y piernas"
            'hitos': [7439],  # Mueve brazos y piernas vigorosamente
            'razon': 'Movimiento motor simétrico'
        },
        
        # Videos de manipulación manual
        184: {  # "Video CDC 6 abre las manos"
            'hitos': [7406],  # Abre y cierra las manos
            'razon': 'Control manual voluntario'
        },
        
        # Videos de seguimiento visual
        182: {  # "Video CDC 4 te sigue con la mirada cuando te mueves"
            'hitos': [7484, 7564, 7806],  # Sigue objetos con la mirada
            'razon': 'Seguimiento visual de objetos en movimiento'
        },
        
        # Videos de comunicación gestual
        200: {  # "Video CDC 22 cierra los labios para mostrar que no quiere más"
            'hitos': [8858],  # Indicate wants
            'razon': 'Comunicación no verbal de preferencias'
        },
        
        # Videos de desarrollo del lenguaje
        214: {  # "Video CDC 36 dice mamá o papá"
            'hitos': [7428, 9504],  # Dice 'mama' y 'dada', Dice 3-5 palabras además de mamá/papá
            'razon': 'Primeras palabras con significado'
        },
        
        # Videos de habilidades motoras finas
        220: {  # "Video CDC 42 utiliza la pinza"
            'hitos': [7426, 7450],  # Usa el agarre de pinza
            'razon': 'Desarrollo del agarre de pinza'
        },
        
        # Videos de construcción
        226: {  # "Video CDC 48 hace torres de 2 bloques"
            'hitos': [7431, 9496],  # Puede construir torres de 2 bloques, Apila 2 bloques
            'razon': 'Habilidad constructiva básica'
        },
        
        # Videos de comunicación gestual y social
        207: {  # "Video CDC 29 levanta los brazos para que le alces"
            'hitos': [7434, 7520],  # Muestra afecto por personas familiares, Muestra afecto
            'razon': 'Gesto de solicitud de interacción social'
        },
        
        # Videos de expresión emocional
        196: {  # "Video CDC 18 se ríe"
            'hitos': [7409, 7809],  # Sonríe espontáneamente, Se ríe
            'razon': 'Expresión de alegría y placer'
        },
        
        # Videos de autoexploración
        195: {  # "Video CDC 17 se lleva las manos a la boca"
            'hitos': [7416],  # Se lleva las manos a la boca
            'razon': 'Autoexploración oral'
        },
        
        # Videos de desarrollo motor grueso
        201: {  # "Video CDC 23 se voltea"
            'hitos': [7415, 7471],  # Se voltea de boca abajo a boca arriba, Se voltea de boca arriba a boca abajo
            'razon': 'Control motor grueso - voltearse'
        },
        
        # Videos de desarrollo cognitivo y atención
        208: {  # "Video CDC 30 busca objetos cuando caen y no se pueden ver"
            'hitos': [7527, 7528],  # Busca objetos con la mirada, Permanencia del objeto
            'razon': 'Desarrollo de permanencia del objeto'
        },
        
        # Videos de juego social
        205: {  # "Video CDC 27 juega al cucu-tras"
            'hitos': [7424, 7452],  # Juega juegos como 'peek-a-boo', Juega peek-a-boo
            'razon': 'Juego social interactivo'
        },
        
        # Videos de comunicación y lenguaje
        206: {  # "Video CDC 28 balbucea"
            'hitos': [7506, 8827],  # Balbucea cadenas de consonantes, Emite consonantes
            'razon': 'Desarrollo del balbuceo'
        },
        
        # Videos de comprensión social
        225: {  # "Video CDC 47 señala con la mano para pedir algo"
            'hitos': [7432, 8858],  # Señala para mostrar a otros algo interesante, Indicate wants
            'razon': 'Comunicación gestual intencional'
        }
    }
    
    return asociaciones_correctas

def aplicar_asociaciones_manuales(cursor, asociaciones_correctas):
    """Aplicar las asociaciones manuales a la base de datos"""
    
    aplicaciones_exitosas = 0
    errores = 0
    
    for video_id, config in asociaciones_correctas.items():
        # Limpiar asociaciones existentes
        try:
            cursor.execute("DELETE FROM videos_hitos WHERE video_id = ?", (video_id,))
            print(f"Limpiando asociaciones existentes para video {video_id}")
        except Exception as e:
            print(f"Error limpiando video {video_id}: {e}")
            errores += 1
            continue
        
        # Aplicar nuevas asociaciones
        for hito_id in config['hitos']:
            try:
                cursor.execute("""
                    INSERT OR IGNORE INTO videos_hitos (video_id, hito_id)
                    VALUES (?, ?)
                """, (video_id, hito_id))
                aplicaciones_exitosas += 1
                print(f"✓ Video {video_id} asociado con hito {hito_id} - {config['razon']}")
            except Exception as e:
                print(f"✗ Error asociando video {video_id} con hito {hito_id}: {e}")
                errores += 1
    
    return aplicaciones_exitosas, errores

def main():
    conn = conectar_bd()
    if not conn:
        return
    
    cursor = conn.cursor()
    
    print("Aplicando asociaciones manuales corregidas...")
    
    # Crear asociaciones manuales
    asociaciones_correctas = crear_asociaciones_manuales()
    
    # Aplicar asociaciones
    aplicaciones_exitosas, errores = aplicar_asociaciones_manuales(cursor, asociaciones_correctas)
    
    # Confirmar cambios
    conn.commit()
    
    print(f"\nResumen:")
    print(f"- Asociaciones aplicadas exitosamente: {aplicaciones_exitosas}")
    print(f"- Videos corregidos: {len(asociaciones_correctas)}")
    print(f"- Errores: {errores}")
    
    # Mostrar algunas correcciones específicas
    print(f"\nEjemplos de correcciones:")
    cursor.execute("""
        SELECT v.titulo, h.nombre 
        FROM videos v 
        JOIN videos_hitos vh ON v.id = vh.video_id
        JOIN hitos_normativos h ON vh.hito_id = h.id 
        WHERE v.id = 191
    """)
    
    print(f"Video 'mira sus manos' ahora asociado con:")
    for titulo, hito in cursor.fetchall():
        print(f"  - {hito}")
    
    conn.close()

if __name__ == "__main__":
    main()