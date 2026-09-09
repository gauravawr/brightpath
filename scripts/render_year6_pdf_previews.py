import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LESSON_ROOT = ROOT / "public" / "lessons" / "year-6-maths" / "autumn"
POPPLER = Path(r"C:\Users\garim\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe")


def render(source, output_dir, expected_pages):
    output_dir.mkdir(parents=True, exist_ok=True)
    prefix = output_dir / "page"
    subprocess.run([str(POPPLER), "-png", "-r", "90", str(source), str(prefix)], check=True)
    pages = sorted(output_dir.glob("page-*.png"), key=lambda p: int(p.stem.split("-")[-1]))
    if len(pages) != expected_pages:
        raise RuntimeError(f"{source} rendered {len(pages)} pages, expected {expected_pages}")


def main():
    preteach = sorted(LESSON_ROOT.rglob("pre-teach.pdf"))
    worksheets = sorted(LESSON_ROOT.rglob("differentiated-worksheets.pdf"))
    if len(preteach) != 50 or len(worksheets) != 50:
        raise RuntimeError(f"Expected 50 pre-teach and 50 worksheet PDFs, found {len(preteach)} and {len(worksheets)}")
    for index, source in enumerate(preteach, 1):
        render(source, source.parent / "preview" / "preteach", 2)
        print(f"pre-teach {index}/50")
    for index, source in enumerate(worksheets, 1):
        render(source, source.parent / "preview" / "worksheets", 6)
        print(f"worksheets {index}/50")


if __name__ == "__main__":
    main()

