
import os
import PyPDF2
import sys

# Force utf-8 for any print outputs
sys.stdout.reconfigure(encoding='utf-8')

SOURCE_DIR = "Reference"
TARGET_DIR = "Reference_Text_Extracts"

def extract_text_from_pdf(pdf_path):
    text_content = []
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text_content.append(f"Source File: {pdf_path}\n")
            text_content.append("-" * 40 + "\n")
            for i, page in enumerate(reader.pages):
                text_content.append(f"[Page {i+1}]\n")
                extracted = page.extract_text()
                if extracted:
                    text_content.append(extracted)
                text_content.append("\n" + "-" * 20 + "\n")
    except Exception as e:
        text_content.append(f"ERROR reading {pdf_path}: {e}\n")
    
    return "".join(text_content)

def main():
    abs_source = os.path.abspath(SOURCE_DIR)
    abs_target = os.path.abspath(TARGET_DIR)
    
    print(f"Starting batch extraction from '{abs_source}' to '{abs_target}'...")

    for root, dirs, files in os.walk(abs_source):
        # Determine relative path to mirror structure
        rel_path = os.path.relpath(root, abs_source)
        target_subdir = os.path.join(abs_target, rel_path)
        
        # Create target directory if it doesn't exist
        os.makedirs(target_subdir, exist_ok=True)
        
        for file in files:
            if file.lower().endswith(".pdf"):
                source_file_path = os.path.join(root, file)
                # Create a text filename
                target_filename = f"{os.path.splitext(file)[0]}.txt"
                target_file_path = os.path.join(target_subdir, target_filename)
                
                print(f"Processing: {file}...")
                
                extracted_text = extract_text_from_pdf(source_file_path)
                
                with open(target_file_path, "w", encoding="utf-8") as f:
                    f.write(extracted_text)

    print("Batch extraction complete.")

if __name__ == "__main__":
    main()
