import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
POPPLER = Path(r"C:\Users\garim\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe")


def render(source, output_dir, expected_pages):
    output_dir.mkdir(parents=True, exist_ok=True)
    prefix = output_dir / "page"
    subprocess.run([str(POPPLER), "-png", "-r", "90", str(source), str(prefix)], check=True)
    pages = sorted(output_dir.glob("page-*.png"), key=lambda p: int(p.stem.split("-")[-1]))
    if len(pages) != expected_pages:
        raise RuntimeError(f"{source} rendered {len(pages)} pages, expected {expected_pages}")


def main():
    term = (sys.argv[1] if len(sys.argv) > 1 else "autumn").lower()
    if term not in {"autumn", "spring", "summer"}:
        raise RuntimeError(f"Unknown term: {term}")
    evaluation_only = len(sys.argv) > 2 and sys.argv[2] == "evaluation"
    lesson_root = ROOT / "public" / "lessons" / "year-6-maths" / term
    if not evaluation_only:
        preteach = sorted(lesson_root.rglob("pre-teach.pdf"))
        worksheets = sorted(lesson_root.rglob("differentiated-worksheets.pdf"))
        if len(preteach) != 50 or len(worksheets) != 50:
            raise RuntimeError(f"Expected 50 pre-teach and 50 worksheet PDFs, found {len(preteach)} and {len(worksheets)}")
        for index, source in enumerate(preteach, 1):
            render(source, source.parent / "preview" / "preteach", 2)
            print(f"pre-teach {index}/50")
        for index, source in enumerate(worksheets, 1):
            render(source, source.parent / "preview" / "worksheets", 6)
            print(f"worksheets {index}/50")

    evaluation_root = ROOT / "public" / "lessons" / "year-6-maths" / "evaluations" / term
    assessment = evaluation_root / "term-assessment-and-mark-scheme.pdf"
    if assessment.exists():
        render(assessment, evaluation_root / "preview" / "assessment", 5)
        print(f"evaluation assessment {term}: 5 pages")


if __name__ == "__main__":
    main()
