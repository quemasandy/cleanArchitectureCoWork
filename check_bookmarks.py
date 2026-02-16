
import sys

try:
    import pypdf
except ImportError:
    try:
        import PyPDF2 as pypdf
    except ImportError:
        print("pypdf or PyPDF2 not installed")
        sys.exit(1)

pdf_path = "/Users/andy/Learning/cleanArchitectureCoWork/funtionalProgramming/book/Functional-Programming-in-Scala.pdf"

try:
    reader = pypdf.PdfReader(pdf_path)
    outlines = reader.outline
    if not outlines:
        print("No outlines found")
    else:
        print(f"Found {len(outlines)} outlines")
        for i, outline in enumerate(outlines):
            if isinstance(outline, list):
                continue
            # Some older PyPDF2 versions return Destination objects, newer ones return OutlineItem
            title = getattr(outline, 'title', None) or outline.get('/Title')
            page = -1
            try:
                page = reader.get_destination_page_number(outline)
            except:
                pass
            print(f"{i}: {title} - Page {page}")
            if i > 10: break 
except Exception as e:
    print(f"Error reading PDF: {e}")
