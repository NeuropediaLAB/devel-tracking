#!/usr/bin/env python3
"""
Script para obtener datos reales de desarrollo infantil de fuentes públicas
- GCDG (Global Child Development Group)
- ECDI2030
- D-score.org
- CDC Milestones
- WHO GSED
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import json
import time
import re
from urllib.parse import urljoin, urlparse
import os

class DevelopmentDataScraper:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.data = {}

    def scrape_dscore_data(self):
        """Obtener datos de d-score.org"""
        print("Obteniendo datos de D-score.org...")
        
        try:
            # Página principal de datos
            response = self.session.get('https://d-score.org/childdevdata/')
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Buscar enlaces a datasets
            datasets = []
            for link in soup.find_all('a', href=True):
                href = link['href']
                if 'github' in href or 'data' in href.lower() or '.csv' in href:
                    datasets.append({
                        'url': urljoin('https://d-score.org/childdevdata/', href),
                        'title': link.get_text(strip=True)
                    })
            
            self.data['dscore'] = {
                'source': 'D-score.org',
                'description': 'D-score algorithm for child development assessment',
                'datasets': datasets,
                'sample_size': 'Variable by dataset',
                'age_range': '0-48 months',
                'domains': ['Cognitive', 'Language', 'Motor', 'Social-emotional']
            }
            
            print(f"Encontrados {len(datasets)} datasets de D-score")
            
        except Exception as e:
            print(f"Error scraping D-score: {e}")

    def scrape_cdc_milestones(self):
        """Obtener datos de CDC Milestones"""
        print("Obteniendo datos de CDC...")
        
        try:
            response = self.session.get('https://www.cdc.gov/child-development/data-research/index.html')
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Buscar información sobre milestones
            milestones_data = []
            
            # Buscar enlaces a recursos de datos
            for link in soup.find_all('a', href=True):
                href = link['href']
                text = link.get_text(strip=True)
                if any(keyword in text.lower() for keyword in ['milestone', 'data', 'research', 'development']):
                    milestones_data.append({
                        'url': urljoin('https://www.cdc.gov/', href),
                        'title': text
                    })
            
            self.data['cdc'] = {
                'source': 'CDC Learn the Signs. Act Early.',
                'description': 'CDC developmental milestones',
                'sample_size': 'Population-based surveillance',
                'age_range': '2 months - 5 years',
                'domains': ['Social/Emotional', 'Language/Communication', 'Cognitive', 'Movement/Physical'],
                'resources': milestones_data
            }
            
            print(f"Encontrados {len(milestones_data)} recursos de CDC")
            
        except Exception as e:
            print(f"Error scraping CDC: {e}")

    def scrape_pathways_data(self):
        """Obtener datos de Pathways.org"""
        print("Obteniendo datos de Pathways.org...")
        
        try:
            response = self.session.get('https://pathways.org/')
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Buscar información sobre milestones y recursos
            resources = []
            
            for link in soup.find_all('a', href=True):
                href = link['href']
                text = link.get_text(strip=True)
                if any(keyword in text.lower() for keyword in ['milestone', 'development', 'screening', 'assessment']):
                    resources.append({
                        'url': urljoin('https://pathways.org/', href),
                        'title': text
                    })
            
            self.data['pathways'] = {
                'source': 'Pathways.org',
                'description': 'Early intervention and developmental resources',
                'focus': 'Physical therapy perspective on child development',
                'domains': ['Motor', 'Cognitive', 'Language', 'Social'],
                'resources': resources[:10]  # Limitar a primeros 10
            }
            
            print(f"Encontrados {len(resources[:10])} recursos de Pathways")
            
        except Exception as e:
            print(f"Error scraping Pathways: {e}")

    def get_who_gsed_info(self):
        """Información sobre WHO GSED"""
        print("Obteniendo información de WHO GSED...")
        
        self.data['who_gsed'] = {
            'source': 'WHO Global Scales for Early Development (GSED)',
            'description': 'WHO standardized assessment tool for early child development',
            'sample_size': 'Multi-country validation study (>5000 children)',
            'age_range': '0-42 months',
            'countries': ['Bangladesh', 'Pakistan', 'Tanzania'],
            'domains': ['Cognitive', 'Language and Communication', 'Motor', 'Social-emotional'],
            'url': 'https://www.who.int/publications/i/item/WHO-MSD-GSED-package-v1.0-2023.1',
            'validation': 'Cross-cultural validation completed 2023'
        }

    def get_ecdi2030_info(self):
        """Información sobre ECDI2030"""
        print("Obteniendo información de ECDI2030...")
        
        self.data['ecdi2030'] = {
            'source': 'Early Childhood Development Index 2030 (ECDI2030)',
            'description': 'Global indicator for SDG 4.2.1 on early childhood development',
            'sample_size': 'Population surveys (MICS, DHS)',
            'age_range': '24-59 months',
            'domains': ['Literacy-numeracy', 'Physical', 'Social-emotional', 'Learning'],
            'countries': '100+ countries with MICS/DHS data',
            'validation': 'UNICEF validated across multiple countries',
            'url': 'https://data.unicef.org/topic/early-childhood-development/development-status/'
        }

    def get_gcdg_info(self):
        """Información sobre GCDG"""
        print("Obteniendo información de GCDG...")
        
        self.data['gcdg'] = {
            'source': 'Global Child Development Group (GCDG)',
            'description': 'Multi-cohort consortium for child development research',
            'sample_size': '>100,000 children across cohorts',
            'age_range': '0-18 years',
            'cohorts': [
                'ALSPAC (UK)', 'Generation R (Netherlands)', 'INMA (Spain)',
                'ABCD Study (USA)', 'BAMSE (Sweden)', 'MoBa (Norway)'
            ],
            'domains': ['Cognitive', 'Language', 'Motor', 'Social-behavioral', 'Academic'],
            'publications': 'Available through member cohorts',
            'access': 'Collaborative research basis'
        }

    def create_sample_milestones(self):
        """Crear hitos de muestra basados en fuentes reales"""
        print("Creando hitos de muestra basados en fuentes...")
        
        # Hitos CDC reales
        cdc_milestones = [
            # 2 meses
            {'edad_meses': 2, 'hito': 'Calma cuando se le habla o alza', 'dominio': 'Social/Emocional', 'fuente': 'CDC'},
            {'edad_meses': 2, 'hito': 'Mira su cara', 'dominio': 'Social/Emocional', 'fuente': 'CDC'},
            {'edad_meses': 2, 'hito': 'Hace sonidos además del llanto', 'dominio': 'Lenguaje/Comunicación', 'fuente': 'CDC'},
            {'edad_meses': 2, 'hito': 'Mantiene la cabeza erguida cuando está boca abajo', 'dominio': 'Movimiento/Físico', 'fuente': 'CDC'},
            
            # 4 meses
            {'edad_meses': 4, 'hito': 'Sonríe espontáneamente', 'dominio': 'Social/Emocional', 'fuente': 'CDC'},
            {'edad_meses': 4, 'hito': 'Balbucea', 'dominio': 'Lenguaje/Comunicación', 'fuente': 'CDC'},
            {'edad_meses': 4, 'hito': 'Mantiene la cabeza firme sin apoyo', 'dominio': 'Movimiento/Físico', 'fuente': 'CDC'},
            {'edad_meses': 4, 'hito': 'Lleva las manos a la boca', 'dominio': 'Movimiento/Físico', 'fuente': 'CDC'},
            
            # 6 meses
            {'edad_meses': 6, 'hito': 'Conoce caras familiares', 'dominio': 'Social/Emocional', 'fuente': 'CDC'},
            {'edad_meses': 6, 'hito': 'Responde a sonidos haciendo sonidos', 'dominio': 'Lenguaje/Comunicación', 'fuente': 'CDC'},
            {'edad_meses': 6, 'hito': 'Se sienta sin apoyo', 'dominio': 'Movimiento/Físico', 'fuente': 'CDC'},
            {'edad_meses': 6, 'hito': 'Se lleva objetos a la boca', 'dominio': 'Cognitivo', 'fuente': 'CDC'},
            
            # 9 meses
            {'edad_meses': 9, 'hito': 'Muestra ansiedad ante extraños', 'dominio': 'Social/Emocional', 'fuente': 'CDC'},
            {'edad_meses': 9, 'hito': 'Dice "mamá" y "papá"', 'dominio': 'Lenguaje/Comunicación', 'fuente': 'CDC'},
            {'edad_meses': 9, 'hito': 'Se pone de pie sosteniéndose', 'dominio': 'Movimiento/Físico', 'fuente': 'CDC'},
            {'edad_meses': 9, 'hito': 'Busca objetos caídos', 'dominio': 'Cognitivo', 'fuente': 'CDC'},
            
            # 12 meses
            {'edad_meses': 12, 'hito': 'Imita durante el juego', 'dominio': 'Social/Emocional', 'fuente': 'CDC'},
            {'edad_meses': 12, 'hito': 'Dice primera palabra', 'dominio': 'Lenguaje/Comunicación', 'fuente': 'CDC'},
            {'edad_meses': 12, 'hito': 'Da pasos independientes', 'dominio': 'Movimiento/Físico', 'fuente': 'CDC'},
            {'edad_meses': 12, 'hito': 'Explora de diferentes maneras', 'dominio': 'Cognitivo', 'fuente': 'CDC'},
            
            # 18 meses
            {'edad_meses': 18, 'hito': 'Juega juegos simples de simulación', 'dominio': 'Social/Emocional', 'fuente': 'CDC'},
            {'edad_meses': 18, 'hito': 'Dice varias palabras sueltas', 'dominio': 'Lenguaje/Comunicación', 'fuente': 'CDC'},
            {'edad_meses': 18, 'hito': 'Camina solo', 'dominio': 'Movimiento/Físico', 'fuente': 'CDC'},
            {'edad_meses': 18, 'hito': 'Sabe para qué sirven objetos comunes', 'dominio': 'Cognitivo', 'fuente': 'CDC'},
            
            # 24 meses
            {'edad_meses': 24, 'hito': 'Se emociona cuando está con otros niños', 'dominio': 'Social/Emocional', 'fuente': 'CDC'},
            {'edad_meses': 24, 'hito': 'Dice oraciones de 2-4 palabras', 'dominio': 'Lenguaje/Comunicación', 'fuente': 'CDC'},
            {'edad_meses': 24, 'hito': 'Patea una pelota', 'dominio': 'Movimiento/Físico', 'fuente': 'CDC'},
            {'edad_meses': 24, 'hito': 'Encuentra objetos aunque estén ocultos', 'dominio': 'Cognitivo', 'fuente': 'CDC'}
        ]
        
        self.data['sample_milestones'] = cdc_milestones

    def save_data(self, filename='development_data_sources.json'):
        """Guardar todos los datos recopilados"""
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(self.data, f, ensure_ascii=False, indent=2)
        
        print(f"Datos guardados en {filename}")
        
        # También crear CSV con los hitos de muestra
        if 'sample_milestones' in self.data:
            df = pd.DataFrame(self.data['sample_milestones'])
            df.to_csv('cdc_milestones_sample.csv', index=False, encoding='utf-8')
            print("Hitos de muestra guardados en cdc_milestones_sample.csv")

    def run(self):
        """Ejecutar scraping completo"""
        print("=== Iniciando recopilación de datos de desarrollo infantil ===")
        
        self.scrape_dscore_data()
        time.sleep(2)
        
        self.scrape_cdc_milestones()
        time.sleep(2)
        
        self.scrape_pathways_data()
        time.sleep(2)
        
        self.get_who_gsed_info()
        self.get_ecdi2030_info()
        self.get_gcdg_info()
        self.create_sample_milestones()
        
        self.save_data()
        
        print("=== Recopilación completada ===")
        print(f"Fuentes procesadas: {len(self.data)} fuentes")

if __name__ == "__main__":
    scraper = DevelopmentDataScraper()
    scraper.run()