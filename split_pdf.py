
import os
import sys
import re

try:
    import pypdf
except ImportError:
    print("pypdf not installed. Please install it using 'pip install pypdf'")
    sys.exit(1)

def clean_filename(filename):
    # Remove invalid characters for filenames
    return re.sub(r'[\\/*?:"<>|]', "", filename).strip()

def split_pdf_by_chapters(pdf_path, output_dir):
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    try:
        reader = pypdf.PdfReader(pdf_path)
        outlines = reader.outline
        total_pages = len(reader.pages)
        
        chapter_list = []

        def process_outline(outlines_list):
            for outline in outlines_list:
                if isinstance(outline, list):
                    process_outline(outline)
                else:
                    try:
                        title = getattr(outline, 'title', None) or outline.get('/Title')
                        page_num = reader.get_destination_page_number(outline)
                        chapter_list.append({'title': title, 'page': page_num})
                    except Exception as e:
                        # Skip if we can't get the page number
                        pass

        process_outline(outlines)

        # Sort chapters by page number
        chapter_list.sort(key=lambda x: x['page'])

        # Filter out duplicates or invalid chapters if any
        unique_chapters = []
        seen_pages = set()
        for chap in chapter_list:
            if chap['page'] not in seen_pages and chap['page'] >= 0:
                 unique_chapters.append(chap)
                 seen_pages.add(chap['page'])
        
        chapter_list = unique_chapters

        print(f"Found {len(chapter_list)} chapters.")

        for i in range(len(chapter_list)):
            current_chapter = chapter_list[i]
            start_page = current_chapter['page']
            
            # Determine end page
            if i < len(chapter_list) - 1:
                end_page = chapter_list[i+1]['page']
            else:
                end_page = total_pages
            
            # Create writer for this chapter
            writer = pypdf.PdfWriter()
            for page_num in range(start_page, end_page):
                writer.add_page(reader.pages[page_num])
            
            # Construct filename
            safe_title = clean_filename(current_chapter['title'])
            # Add index to keep order
            filename = f"{i+1:02d}_{safe_title}.pdf"
            output_path = os.path.join(output_dir, filename)
            
            with open(output_path, "wb") as f_out:
                writer.write(f_out)
            
            print(f"Created: {filename} (Pages {start_page}-{end_page-1})")

    except Exception as e:
        print(f"Error processing PDF: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    pdf_path = "/Users/andy/Learning/cleanArchitectureCoWork/funtionalProgramming/book/Functional-Programming-in-Scala.pdf"
    output_dir = "/Users/andy/Learning/cleanArchitectureCoWork/functionalProgrammingChapters"
    
    print(f"Splitting '{pdf_path}'...")
    split_pdf_by_chapters(pdf_path, output_dir)
    print("Done.")
