import docx
import os

try:
    doc = docx.Document(r"d:\Project\constitution-gpt\constitution-gpt\research\research-paper-format.docx")
    with open(r"d:\Project\constitution-gpt\constitution-gpt\research\extracted_format.txt", "w", encoding="utf-8") as f:
        f.write("\n".join([p.text for p in doc.paragraphs]))
    print("Successfully extracted docx.")
except Exception as e:
    print(f"Error reading docx: {e}")

try:
    import pypdf
    with open(r"d:\Project\constitution-gpt\constitution-gpt\research\extracted_pdf.txt", "w", encoding="utf-8") as out:
        reader = pypdf.PdfReader(r"d:\Project\constitution-gpt\constitution-gpt\research\research.pdf")
        for page in reader.pages:
            out.write(page.extract_text() + "\n")
    print("Successfully extracted pdf.")
except Exception as e:
    print(f"Error reading pdf: {e}")
