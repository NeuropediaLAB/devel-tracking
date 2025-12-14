#!/usr/bin/env python3
"""
Script para corregir manualmente las asociaciones video-hito
basándose en nombres de videos conocidos y patrones CDC
"""

import json
import re

# Mapeo manual de patrones de nombres de video a habilidades/edades
PATRONES_VIDEOS_CDC = {
    # Patrones comunes en videos CDC
    'sonrie': {
        'habilidades': ['sonrisa', 'smile', 'sonrie'],
        'edad_tipica': [2, 3, 4]  # meses típicos para sonrisas
    },
    'camina': {
        'habilidades': ['camina', 'walk', 'caminando', 'pasos'],
        'edad_tipica': [12, 15, 18]
    },
    'habla': {
        'habilidades': ['habla', 'dice', 'palabra', 'talk', 'speech', 'vocabulario'],
        'edad_tipica': [12, 18, 24]
    },
    'juega': {
        'habilidades': ['juego', 'juega', 'play', 'juguete'],
        'edad_tipica': [6, 9, 12]
    },
    'agarra': {
        'habilidades': ['agarra', 'toma', 'grasp', 'hold', 'pinza'],
        'edad_tipica': [6, 9, 12]
    },
    'come': {
        'habilidades': ['come', 'eat', 'comida', 'alimenta'],
        'edad_tipica': [6, 9, 12]
    },
    'gatea': {
        'habilidades': ['gatea', 'crawl', 'gateo'],
        'edad_tipica': [9, 10, 11]
    },
    'salta': {
        'habilidades': ['salta', 'jump', 'salto'],
        'edad_tipica': [18, 24, 30]
    },
    'corre': {
        'habilidades': ['corre', 'run', 'correr'],
        'edad_tipica': [18, 24, 30]
    },
    'baila': {
        'habilidades': ['baila', 'dance', 'música'],
        'edad_tipica': [12, 18, 24]
    },
    'mama_papa': {
        'habilidades': ['mama', 'papa', 'mamá', 'papá', 'first words'],
        'edad_tipica': [9, 12, 15]
    },
    'siguue_objeto': {
        'habilidades': ['sigue', 'follow', 'objeto', 'visual'],
        'edad_tipica': [2, 4, 6]
    },
    'control_cabeza': {
        'habilidades': ['cabeza', 'head', 'control', 'sostiene'],
        'edad_tipica': [2, 3, 4]
    }
}

# Hitos CDC típicos (basado en los milestone conocidos)
HITOS_CDC_CONOCIDOS = [
    {'id': 7433, 'desc': 'Sonríe a las personas', 'edad': 3},
    {'id': 7408, 'desc': 'Sigue objetos con los ojos', 'edad': 2},
    {'id': 7443, 'desc': 'Sostiene la cabeza erguida', 'edad': 2},
    {'id': 7439, 'desc': 'Hace sonidos además del llanto', 'edad': 2},
    {'id': 7406, 'desc': 'Se calma cuando lo hablan o lo cargan', 'edad': 2},
    {'id': 7404, 'desc': 'Mira las caras atentamente', 'edad': 2},
    {'id': 8448, 'desc': 'Dice "mamá" y "papá"', 'edad': 12},
    {'id': 7840, 'desc': 'Camina sostenido de la mano', 'edad': 12},
    {'id': 9503, 'desc': 'Camina solo', 'edad': 15},
    {'id': 7808, 'desc': 'Gatea', 'edad': 9},
    {'id': 7421, 'desc': 'Juega a "peek-a-boo"', 'edad': 9},
    {'id': 7426, 'desc': 'Se pone de pie solo', 'edad': 12},
    {'id': 7416, 'desc': 'Bebe de una taza', 'edad': 12},
    {'id': 7409, 'desc': 'Encuentra objetos escondidos', 'edad': 9},
    {'id': 7432, 'desc': 'Imita gestos', 'edad': 9},
    {'id': 7415, 'desc': 'Usa pinza para agarrar', 'edad': 9},
    {'id': 7414, 'desc': 'Transfiere objetos de mano en mano', 'edad': 6},
    {'id': 9501, 'desc': 'Corre', 'edad': 18},
    {'id': 7411, 'desc': 'Se sienta sin apoyo', 'edad': 6},
    {'id': 7424, 'desc': 'Responde a su nombre', 'edad': 6},
    {'id': 8827, 'desc': 'Señala con el dedo', 'edad': 12},
    {'id': 9508, 'desc': 'Salta con ambos pies', 'edad': 24},
    {'id': 7796, 'desc': 'Sube escaleras', 'edad': 18}
]

def analizar_nombre_video(titulo):
    """Analiza el nombre del video y sugiere asociaciones"""
    titulo_lower = titulo.lower()
    sugerencias = []
    
    # Extraer edad si está en el nombre
    edad_match = re.search(r'(\d+)\s*(mes|month|mo)', titulo_lower)
    edad_video = int(edad_match.group(1)) if edad_match else None
    
    print(f"\n🎬 Analizando: '{titulo}'")
    if edad_video:
        print(f"   📅 Edad detectada: {edad_video} meses")
    
    # Buscar patrones conocidos
    for patron, info in PATRONES_VIDEOS_CDC.items():
        if any(habilidad in titulo_lower for habilidad in info['habilidades']):
            print(f"   🎯 Patrón detectado: {patron}")
            
            # Buscar hitos compatibles
            for hito in HITOS_CDC_CONOCIDOS:
                desc_lower = hito['desc'].lower()
                
                # Verificar si el hito coincide con la habilidad
                coincide_habilidad = any(hab in desc_lower for hab in info['habilidades'])
                
                # Verificar edad (si está disponible)
                coincide_edad = True
                if edad_video:
                    coincide_edad = abs(hito['edad'] - edad_video) <= 3
                
                if coincide_habilidad and coincide_edad:
                    score = 5 if coincide_habilidad else 0
                    score += 3 if edad_video and abs(hito['edad'] - edad_video) <= 1 else 1
                    
                    sugerencias.append({
                        'hito_id': hito['id'],
                        'descripcion': hito['desc'],
                        'edad': hito['edad'],
                        'score': score,
                        'razon': f"Habilidad: {patron}, Edad: {hito['edad']}m"
                    })
    
    # Ordenar por score
    sugerencias.sort(key=lambda x: x['score'], reverse=True)
    
    return sugerencias[:3]  # Top 3 sugerencias

def revisar_asociaciones_actuales():
    """Revisa las asociaciones actuales y sugiere mejoras"""
    
    # Cargar asociaciones actuales
    try:
        with open('asociaciones_automaticas.json', 'r') as f:
            asociaciones_actuales = json.load(f)
    except FileNotFoundError:
        print("❌ No se encontró el archivo de asociaciones")
        return
    
    # Nombres de ejemplo (puedes actualizarlos con los nombres reales)
    nombres_videos_ejemplo = {
        "179": "CDC - Sonrie a los 2 meses",
        "181": "CDC - Sigue objetos con la mirada",
        "182": "CDC - Sostiene la cabeza",
        "183": "CDC - Hace sonidos",
        "184": "CDC - Se calma al hablarle",
        "185": "CDC - Mira caras",
        "186": "CDC - Observa rostros atentamente",
        "187": "CDC - Dice mama y papa",
        "188": "CDC - Camina de la mano",
        "189": "CDC - Camina solo",
        "190": "CDC - Gatea",
        # Añadir más según los nombres reales
    }
    
    nuevas_asociaciones = {}
    
    print("🔍 Revisando asociaciones video-hito...")
    print("=" * 80)
    
    for video_id, hitos_actuales in asociaciones_actuales.items():
        titulo = nombres_videos_ejemplo.get(video_id, f"Video {video_id}")
        
        print(f"\n🎬 Video {video_id}: {titulo}")
        print(f"   📍 Asociación actual: Hito {hitos_actuales[0] if hitos_actuales else 'Ninguno'}")
        
        # Analizar y sugerir
        sugerencias = analizar_nombre_video(titulo)
        
        if sugerencias:
            print("   💡 Sugerencias:")
            for i, sug in enumerate(sugerencias, 1):
                print(f"      {i}. (Score: {sug['score']}) {sug['descripcion']} - {sug['edad']}m")
                print(f"         Razón: {sug['razon']}")
            
            # Tomar la mejor sugerencia
            mejor_sugerencia = sugerencias[0]['hito_id']
            
            # Comparar con la asociación actual
            if hitos_actuales and hitos_actuales[0] != mejor_sugerencia:
                print(f"   ⚠️  CAMBIO SUGERIDO: {hitos_actuales[0]} → {mejor_sugerencia}")
                nuevas_asociaciones[video_id] = [mejor_sugerencia]
            elif not hitos_actuales:
                print(f"   ✨ NUEVA ASOCIACIÓN: {mejor_sugerencia}")
                nuevas_asociaciones[video_id] = [mejor_sugerencia]
            else:
                print(f"   ✅ Asociación actual parece correcta")
                nuevas_asociaciones[video_id] = hitos_actuales
        else:
            print("   ❌ No se encontraron sugerencias")
            nuevas_asociaciones[video_id] = hitos_actuales
    
    # Guardar nuevas asociaciones si hay cambios
    if nuevas_asociaciones != asociaciones_actuales:
        with open('asociaciones_corregidas.json', 'w') as f:
            json.dump(nuevas_asociaciones, f, indent=2)
        print(f"\n💾 Asociaciones corregidas guardadas en 'asociaciones_corregidas.json'")
        
        # Mostrar resumen de cambios
        cambios = 0
        for video_id in asociaciones_actuales:
            if (nuevas_asociaciones.get(video_id) != asociaciones_actuales.get(video_id)):
                cambios += 1
        
        print(f"📊 Cambios realizados: {cambios} de {len(asociaciones_actuales)} videos")
    else:
        print(f"\n✅ No se detectaron cambios necesarios")

if __name__ == "__main__":
    revisar_asociaciones_actuales()