
import sys

libs = ['PyPDF2', 'pypdf', 'pdfminer', 'fitz'] # fitz is pymupdf
available = []

for lib in libs:
    try:
        __import__(lib)
        available.append(lib)
    except ImportError:
        pass

print(f"Available PDF libraries: {available}")
