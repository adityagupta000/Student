import os
from fpdf import FPDF

class PDF(FPDF):
    def header(self):
        self.set_font("Arial", "B", 14)
        self.cell(0, 10, "Project Code Files", ln=True, align="C")
        self.ln(5)

def get_code_files(directory, extensions, exclude_dirs):
    """Fetch all code files from the given directory, excluding specified directories."""
    code_files = {}
    for root, dirs, files in os.walk(directory):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]  # Exclude specified directories
        for file in files:
            if any(file.endswith(ext) for ext in extensions):
                file_path = os.path.join(root, file)
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    code_files[file_path] = f.read()
    return code_files

def create_pdf(code_data, output_pdf="Project_Code.pdf"):
    pdf = PDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    for file_path, content in code_data.items():
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, f"File: {file_path}", ln=True, align="L")
        pdf.set_font("Courier", size=8)

        # Handle encoding issues
        content = content.encode("latin-1", "replace").decode("latin-1")
        pdf.multi_cell(0, 5, content)
        pdf.ln(5)

    pdf.output(output_pdf, "F")
    print(f"✅ PDF successfully created: {output_pdf}")

if __name__ == "__main__":
    # Project root directory
    project_root = os.path.dirname(os.path.abspath(__file__))
    
    # Base directories to scan
    base_directories = [
        os.path.join(project_root, "src"),  # Include all source files in src
        os.path.join(project_root, "public"),  # Include public assets if needed
        os.path.join(project_root, "src", "app", "student")  # Include student directory
    ]
    
    # File types to include
    extensions = {".js", ".jsx", ".css", ".mjs", ".json"}
    
    # Directories to exclude
    exclude_dirs = {"node_modules", ".git", "public", "images"}

    # Fetch code files
    code_files = {}
    for directory in base_directories:
        code_files.update(get_code_files(directory, extensions, exclude_dirs))
    
    # Create the PDF
    create_pdf(code_files)
