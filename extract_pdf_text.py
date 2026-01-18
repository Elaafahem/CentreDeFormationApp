
import PyPDF2
import sys

sys.stdout.reconfigure(encoding='utf-8')

def extract_text(pdf_path):
    print(f"--- Extracting text from {pdf_path} ---")
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            for i, page in enumerate(reader.pages):
                print(f"[Page {i+1}]")
                print(page.extract_text())
                print("-" * 20)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        extract_text(sys.argv[1])
    else:
        print("Please provide a PDF path.")
