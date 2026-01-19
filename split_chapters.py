#!/usr/bin/env python3
"""
Script para dividir el libro Clean Architecture en sus capítulos individuales.
Basado en la tabla de contenido del libro.
"""

from pypdf import PdfReader, PdfWriter
import os
import re

# Path del PDF original
PDF_PATH = "/Users/andy/Learning/cleanArchitectureCoWork/CleanArchitecture.pdf"
OUTPUT_DIR = "cleanArquitectureChapters"

# Estructura del libro con páginas (basado en tabla de contenido típica de Clean Architecture)
# Las páginas son 0-indexed para pypdf
CHAPTERS = [
    # Preface and Introduction
    ("00_Preface", 0, 14),
    
    # Part I - Introduction
    ("Part_I_Introduction", 15, 16),
    ("01_What_Is_Design_and_Architecture", 17, 22),
    ("02_A_Tale_of_Two_Values", 23, 30),
    
    # Part II - Starting with the Bricks: Programming Paradigms
    ("Part_II_Programming_Paradigms", 31, 32),
    ("03_Paradigm_Overview", 33, 36),
    ("04_Structured_Programming", 37, 42),
    ("05_Object_Oriented_Programming", 43, 52),
    ("06_Functional_Programming", 53, 58),
    
    # Part III - Design Principles
    ("Part_III_Design_Principles", 59, 62),
    ("07_SRP_Single_Responsibility_Principle", 63, 68),
    ("08_OCP_Open_Closed_Principle", 69, 76),
    ("09_LSP_Liskov_Substitution_Principle", 77, 84),
    ("10_ISP_Interface_Segregation_Principle", 85, 88),
    ("11_DIP_Dependency_Inversion_Principle", 89, 96),
    
    # Part IV - Component Principles
    ("Part_IV_Component_Principles", 97, 98),
    ("12_Components", 99, 102),
    ("13_Component_Cohesion", 103, 112),
    ("14_Component_Coupling", 113, 128),
    
    # Part V - Architecture
    ("Part_V_Architecture", 129, 130),
    ("15_What_Is_Architecture", 131, 138),
    ("16_Independence", 139, 148),
    ("17_Boundaries_Drawing_Lines", 149, 160),
    ("18_Boundary_Anatomy", 161, 170),
    ("19_Policy_and_Level", 171, 176),
    ("20_Business_Rules", 177, 182),
    ("21_Screaming_Architecture", 183, 188),
    ("22_The_Clean_Architecture", 189, 198),
    ("23_Presenters_and_Humble_Objects", 199, 204),
    ("24_Partial_Boundaries", 205, 210),
    ("25_Layers_and_Boundaries", 211, 220),
    ("26_The_Main_Component", 221, 226),
    ("27_Services_Great_and_Small", 227, 234),
    ("28_The_Test_Boundary", 235, 240),
    ("29_Clean_Embedded_Architecture", 241, 256),
    
    # Part VI - Details
    ("Part_VI_Details", 257, 258),
    ("30_The_Database_Is_a_Detail", 259, 264),
    ("31_The_Web_Is_a_Detail", 265, 268),
    ("32_Frameworks_Are_Details", 269, 274),
    ("33_Case_Study_Video_Sales", 275, 284),
    ("34_The_Missing_Chapter", 285, 308),
    
    # Part VII - Appendix
    ("Part_VII_Appendix", 309, 320),
]

def split_pdf():
    """Divide el PDF en capítulos individuales."""
    
    # Crear directorio de salida si no existe
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Abrir el PDF original
    print(f"Abriendo PDF: {PDF_PATH}")
    reader = PdfReader(PDF_PATH)
    total_pages = len(reader.pages)
    print(f"Total de páginas en el PDF: {total_pages}")
    
    # Extraer cada capítulo
    for chapter_name, start_page, end_page in CHAPTERS:
        # Ajustar si la página final excede el total
        actual_end = min(end_page, total_pages - 1)
        
        if start_page >= total_pages:
            print(f"⚠️  Saltando {chapter_name}: página inicial {start_page} excede el total")
            continue
            
        writer = PdfWriter()
        
        # Agregar páginas del capítulo
        for page_num in range(start_page, actual_end + 1):
            writer.add_page(reader.pages[page_num])
        
        # Guardar el capítulo
        output_path = os.path.join(OUTPUT_DIR, f"{chapter_name}.pdf")
        with open(output_path, "wb") as output_file:
            writer.write(output_file)
        
        pages_count = actual_end - start_page + 1
        print(f"✅ {chapter_name}.pdf ({pages_count} páginas)")
    
    print(f"\n🎉 ¡Listo! Todos los capítulos han sido guardados en '{OUTPUT_DIR}/'")

if __name__ == "__main__":
    split_pdf()
