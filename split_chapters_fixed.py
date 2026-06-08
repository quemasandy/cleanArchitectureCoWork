#!/usr/bin/env python3
"""
Script CORREGIDO para dividir el libro Clean Architecture en sus capítulos individuales.
Basado en los BOOKMARKS REALES del PDF (0-indexed), no en la numeración impresa.

El libro tiene 429 páginas (0-428).
"""

from pypdf import PdfReader, PdfWriter
import os

# Path del PDF original
PDF_PATH = "/Users/andy/Learning/cleanArchitectureCoWork/cleanArchitecture.pdf"
OUTPUT_DIR = "cleanArquitectureChapters"

# Estructura del libro con páginas REALES del PDF (0-indexed)
# Basado en los bookmarks extraídos del PDF
CHAPTERS = [
    # Front Matter
    ("00_Front_Matter", 0, 23),          # Title, Copyright, Dedication, Contents, Foreword, Preface, Acknowledgments, About Author

    # Part I - Introduction (págs 24-39)
    ("Part_I_Introduction", 24, 25),
    ("01_What_Is_Design_and_Architecture", 26, 34),
    ("02_A_Tale_of_Two_Values", 35, 39),

    # Part II - Programming Paradigms (págs 40-70)
    ("Part_II_Programming_Paradigms", 40, 41),
    ("03_Paradigm_Overview", 42, 44),
    ("04_Structured_Programming", 45, 50),
    ("05_Object_Oriented_Programming", 51, 63),
    ("06_Functional_Programming", 64, 70),

    # Part III - Design Principles (págs 71-102)
    ("Part_III_Design_Principles", 71, 73),
    ("07_SRP_Single_Responsibility_Principle", 74, 80),
    ("08_OCP_Open_Closed_Principle", 81, 87),
    ("09_LSP_Liskov_Substitution_Principle", 88, 93),
    ("10_ISP_Interface_Segregation_Principle", 94, 97),
    ("11_DIP_Dependency_Inversion_Principle", 98, 102),

    # Part IV - Component Principles (págs 103-138)
    ("Part_IV_Component_Principles", 103, 103),
    ("12_Components", 104, 110),
    ("13_Component_Cohesion", 111, 117),
    ("14_Component_Coupling", 118, 138),

    # Part V - Architecture (págs 139-252)
    ("Part_V_Architecture", 139, 139),
    ("15_What_Is_Architecture", 140, 149),
    ("16_Independence", 150, 159),
    ("17_Boundaries_Drawing_Lines", 160, 172),
    ("18_Boundary_Anatomy", 173, 178),
    ("19_Policy_and_Level", 179, 183),
    ("20_Business_Rules", 184, 189),
    ("21_Screaming_Architecture", 190, 193),
    ("22_The_Clean_Architecture", 194, 200),
    ("23_Presenters_and_Humble_Objects", 201, 204),
    ("24_Partial_Boundaries", 205, 208),
    ("25_Layers_and_Boundaries", 209, 217),
    ("26_The_Main_Component", 218, 222),
    ("27_Services_Great_and_Small", 223, 231),
    ("28_The_Test_Boundary", 232, 235),
    ("29_Clean_Embedded_Architecture", 236, 252),

    # Part VI - Details (págs 253-291)
    ("Part_VI_Details", 253, 253),
    ("30_The_Database_Is_a_Detail", 254, 259),
    ("31_The_Web_Is_a_Detail", 260, 263),
    ("32_Frameworks_Are_Details", 264, 267),
    ("33_Case_Study_Video_Sales", 268, 273),
    ("34_The_Missing_Chapter", 274, 291),

    # Part VII - Appendix (págs 292-333)
    ("Part_VII_Appendix", 292, 292),
    ("Appendix_A_Architecture_Archaeology", 293, 333),

    # Index (págs 334-428)
    ("Index", 334, 428),
]


def verify_continuity():
    """Verifica que no hay gaps ni solapamientos."""
    issues = []
    for i in range(len(CHAPTERS) - 1):
        name_cur, _, end_cur = CHAPTERS[i]
        name_next, start_next, _ = CHAPTERS[i + 1]

        if end_cur + 1 < start_next:
            gap = list(range(end_cur + 1, start_next))
            issues.append(f"⚠️  GAP entre '{name_cur}' (fin {end_cur}) y '{name_next}' (inicio {start_next}): págs {gap}")
        elif end_cur + 1 > start_next:
            overlap = list(range(start_next, end_cur + 1))
            issues.append(f"⚠️  SOLAPAMIENTO entre '{name_cur}' (fin {end_cur}) y '{name_next}' (inicio {start_next}): págs {overlap}")

    return issues


def split_pdf():
    """Divide el PDF en capítulos individuales."""

    # Verificar continuidad antes de dividir
    issues = verify_continuity()
    if issues:
        print("❌ Se encontraron problemas de continuidad:")
        for issue in issues:
            print(f"  {issue}")
        print("\nCorrige los rangos antes de continuar.")
        return

    print("✅ Verificación de continuidad pasada (sin gaps ni solapamientos)")
    print()

    # Crear directorio de salida si no existe
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Abrir el PDF original
    print(f"Abriendo PDF: {PDF_PATH}")
    reader = PdfReader(PDF_PATH)
    total_pages = len(reader.pages)
    print(f"Total de páginas en el PDF: {total_pages}")

    # Verificar cobertura
    last_page_covered = CHAPTERS[-1][2]
    if last_page_covered < total_pages - 1:
        print(f"⚠️  Advertencia: el script cubre hasta pág {last_page_covered}, el libro tiene {total_pages - 1}")
    elif last_page_covered > total_pages - 1:
        print(f"❌ Error: el script va más allá del libro (pág {last_page_covered} > {total_pages - 1})")
        return

    print()

    # Extraer cada capítulo
    for chapter_name, start_page, end_page in CHAPTERS:
        actual_end = min(end_page, total_pages - 1)

        if start_page >= total_pages:
            print(f"⚠️  Saltando {chapter_name}: página inicial {start_page} excede el total")
            continue

        writer = PdfWriter()

        for page_num in range(start_page, actual_end + 1):
            writer.add_page(reader.pages[page_num])

        output_path = os.path.join(OUTPUT_DIR, f"{chapter_name}.pdf")
        with open(output_path, "wb") as output_file:
            writer.write(output_file)

        pages_count = actual_end - start_page + 1
        print(f"✅ {chapter_name}.pdf ({pages_count} páginas)")

    print(f"\n🎉 ¡Listo! Todos los capítulos han sido guardados en '{OUTPUT_DIR}/'")
    print(f"   Cobertura: pág 0 a pág {last_page_covered} ({last_page_covered + 1} de {total_pages} páginas)")


if __name__ == "__main__":
    split_pdf()
