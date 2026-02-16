
import os
import shutil
import glob

# Configuration
SOURCE_DIR = "/Users/andy/Learning/cleanArchitectureCoWork/funtionalProgramming/functionalProgrammingChapters"
DEST_DIR = "/Users/andy/Learning/cleanArchitectureCoWork/keyChapters"

# Mapping of keywords to identify source files -> Target filename
# Order matters for priority (01_, 02_, etc.)
CHAPTER_MAPPING = [
    ("11 Monads", "01_Monads.pdf"),
    ("6 Purely functional state", "02_Purely_Functional_State.pdf"),
    ("13 External effects and IO", "03_External_Effects_and_IO.pdf"),
    ("4 Handling errors without exceptions", "04_Handling_Errors_Without_Exceptions.pdf"),
    ("7 Purely functional parallelism", "05_Purely_Functional_Parallelism.pdf"),
    ("15 Stream processing and incremental IO", "06_Stream_Processing_and_Incremental_IO.pdf"),
    ("8 Property-based testing", "07_Property_Based_Testing.pdf"),
    ("3 Functional data structures", "08_Functional_Data_Structures.pdf"),
    ("12 Applicative and traversable functors", "09_Applicative_and_Traversable_Functors.pdf"),
    ("1 What is functional programming", "10_Introduction_to_Functional_Programming.pdf")
]

def curate_chapters():
    if not os.path.exists(DEST_DIR):
        os.makedirs(DEST_DIR)
        print(f"Created directory: {DEST_DIR}")

    # Get list of all source files
    source_files = os.listdir(SOURCE_DIR)
    
    for i, (keyword, target_name) in enumerate(CHAPTER_MAPPING):
        # Find the matching source file
        matched_file = None
        for file in source_files:
            if keyword.lower() in file.lower():
                matched_file = file
                break
        
        if matched_file:
            source_path = os.path.join(SOURCE_DIR, matched_file)
            dest_path = os.path.join(DEST_DIR, target_name)
            
            shutil.copy2(source_path, dest_path)
            print(f"Copied: {matched_file} -> {target_name}")
        else:
            print(f"WARNING: Could not find chapter matching '{keyword}'")

if __name__ == "__main__":
    curate_chapters()
