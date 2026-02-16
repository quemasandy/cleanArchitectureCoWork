
import os
import shutil

SOURCE_DIR = "/Users/andy/Learning/cleanArchitectureCoWork/keyChapters"
DEST_DIR = "/Users/andy/Learning/cleanArchitectureCoWork/funtionalProgramming/keyChapters"

FILES_TO_MOVE = [
    "01_Monads.pdf",
    "02_Purely_Functional_State.pdf",
    "03_External_Effects_and_IO.pdf",
    "04_Handling_Errors_Without_Exceptions.pdf",
    "05_Purely_Functional_Parallelism.pdf",
    "06_Stream_Processing_and_Incremental_IO.pdf",
    "07_Property_Based_Testing.pdf",
    "08_Functional_Data_Structures.pdf",
    "09_Applicative_and_Traversable_Functors.pdf",
    "10_Introduction_to_Functional_Programming.pdf",
    "README.md"
]

def move_chapters():
    if not os.path.exists(DEST_DIR):
        os.makedirs(DEST_DIR)
        print(f"Created directory: {DEST_DIR}")

    for filename in FILES_TO_MOVE:
        source_path = os.path.join(SOURCE_DIR, filename)
        dest_path = os.path.join(DEST_DIR, filename)
        
        if os.path.exists(source_path):
            shutil.move(source_path, dest_path)
            print(f"Moved: {filename}")
        else:
            print(f"WARNING: File not found in source: {filename}")

if __name__ == "__main__":
    move_chapters()
