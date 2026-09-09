import shutil
import subprocess
import sys
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
PYTHON = Path(r"C:\Users\garim\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe")
RENDERER = Path(r"C:\Users\garim\.codex\plugins\cache\openai-primary-runtime\documents\26.905.11957\skills\documents\render_docx.py")


def render(source, output_dir, expected_pages):
    output_dir.mkdir(parents=True, exist_ok=True)
    subprocess.run([str(PYTHON), str(RENDERER), str(source), "--output_dir", str(output_dir), "--emit_pdf"], check=True)
    pages = sorted(output_dir.glob("page-*.png"), key=lambda path: int(path.stem.split("-")[-1]))
    if len(pages) != expected_pages:
        raise RuntimeError(f"{source} rendered {len(pages)} pages, expected {expected_pages}")
    pdf_path = output_dir / f"{source.stem}.pdf"
    if not pdf_path.exists() or len(PdfReader(str(pdf_path)).pages) != expected_pages:
        raise RuntimeError(f"Rendered PDF page count failed for {source}")
    return pages


def main():
    term = (sys.argv[1] if len(sys.argv) > 1 else "spring").lower()
    if term not in {"autumn", "spring", "summer"}:
        raise RuntimeError("Choose Autumn, Spring or Summer.")
    evaluation_only = len(sys.argv) > 2 and sys.argv[2] == "evaluation"
    lesson_root = ROOT / "public" / "lessons" / "year-6-maths" / term
    if not evaluation_only:
        plans = sorted(lesson_root.rglob("editable-teacher-plan.docx"))
        if len(plans) != 50:
            raise RuntimeError(f"Expected 50 teacher plans, found {len(plans)}")
        qa_root = ROOT / ".qa" / f"year6-{term}-teacher-plan-render"
        for index, source in enumerate(plans, 1):
            relative = source.relative_to(lesson_root).parent
            render(source, qa_root / relative, 1)
            print(f"teacher plan {index}/50")

    evaluation_root = ROOT / "public" / "lessons" / "year-6-maths" / "evaluations" / term
    record = evaluation_root / "editable-teacher-evaluation-record.docx"
    evaluation_qa = ROOT / ".qa" / f"year6-{term}-evaluation-record"
    pages = render(record, evaluation_qa, 2)
    public_preview = evaluation_root / "preview" / "teacher-record"
    public_preview.mkdir(parents=True, exist_ok=True)
    for page in pages:
        shutil.copy2(page, public_preview / page.name)
    print(f"evaluation record {term}: 2 pages")


if __name__ == "__main__":
    main()
