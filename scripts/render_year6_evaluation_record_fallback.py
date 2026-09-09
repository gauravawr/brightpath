import shutil
import subprocess
import sys
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import landscape, letter
from reportlab.pdfgen import canvas

import generate_year6_autumn_resources as base
from generate_year6_remaining_terms_resources import SCORE_BANDS


ROOT = Path(__file__).resolve().parents[1]
POPPLER = Path(r"C:\Users\garim\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe")


def wrapped(c, value, x, y, width, size=6.4, leading=7.4, max_lines=4):
    return base.draw_wrapped(c, value, x, y, width, size=size, leading=leading, max_lines=max_lines)


def make_preview(term):
    qa = ROOT / ".qa" / f"year6-{term.lower()}-evaluation-record-fallback"
    qa.mkdir(parents=True, exist_ok=True)
    pdf = qa / "teacher-record-preview.pdf"
    c = canvas.Canvas(str(pdf), pagesize=landscape(letter))
    width, height = landscape(letter)
    headers = ["Pupil name", "Score /40", "Band", "Secure knowledge", "Misconception or gap", "Intervention and adult support", "Review evidence"]
    col_widths = [78, 48, 54, 116, 116, 172, 118]

    for page in range(2):
        c.setFillColor(HexColor("#" + base.NAVY))
        c.rect(0, height - 34, width, 34, fill=1, stroke=0)
        c.setFillColor(HexColor("#FFFFFF"))
        c.setFont("BPArialBold", 8.5)
        c.drawString(28, height - 22, "BRIGHTPATH PRIMARY LEARNING")
        c.drawRightString(width - 28, height - 22, f"YEAR 6 MATHS  |  {term.upper()} TERM")
        c.setFillColor(HexColor("#" + base.INK))
        c.setFont("BPArialBold", 15)
        title = f"Year 6 Maths {term} Term Evaluation Record"
        if page == 1:
            title += "  pupils 16-30"
        c.drawCentredString(width / 2, height - 58, title)

        y = height - 78
        if page == 0:
            c.setFont("BPArialBold", 7.2)
            c.setFillColor(HexColor("#" + base.TEAL))
            c.drawCentredString(width / 2, y, "Teacher and class: [Type here]    Assessment date: [Type here]    Review date: [Type here]")
            y -= 16
            band_width = (width - 56) / 4
            for index, band in enumerate(SCORE_BANDS):
                x = 28 + index * band_width
                c.setFillColor(HexColor("#" + (base.NAVY if index < 2 else base.TEAL)))
                c.rect(x, y - 18, band_width, 18, fill=1, stroke=0)
                c.setFillColor(HexColor("#FFFFFF"))
                c.setFont("BPArialBold", 6.8)
                c.drawCentredString(x + band_width / 2, y - 12, f"{band['name']}  {band['minimum']}-{band['maximum']} / 40")
            y -= 25
            c.setFillColor(HexColor("#" + base.MUTED))
            c.setFont("BPArial", 6.2)
            c.drawCentredString(width / 2, y, "Use the score band as a starting point; confirm it from question-level evidence, classroom work and reasonable adjustments.")
            y -= 13

        table_x = 28
        header_h = 25
        row_h = (y - 30 - header_h) / 15
        x = table_x
        c.setStrokeColor(HexColor("#" + base.LINE))
        for header, col_width in zip(headers, col_widths):
            c.setFillColor(HexColor("#" + base.NAVY))
            c.rect(x, y - header_h, col_width, header_h, fill=1, stroke=1)
            c.setFillColor(HexColor("#FFFFFF"))
            c.setFont("BPArialBold", 5.8)
            c.drawCentredString(x + col_width / 2, y - 15, header)
            x += col_width
        y -= header_h
        for row in range(15):
            x = table_x
            fill = "#FFFFFF" if row % 2 == 0 else "#" + base.PALE
            for column, col_width in enumerate(col_widths):
                c.setFillColor(HexColor(fill))
                c.rect(x, y - row_h, col_width, row_h, fill=1, stroke=1)
                if column == 0:
                    c.setFillColor(HexColor("#" + base.MUTED))
                    c.setFont("BPArial", 6)
                    c.drawString(x + 4, y - 10, f"[{page * 15 + row + 1}]")
                x += col_width
            y -= row_h
        c.setFillColor(HexColor("#" + base.MUTED))
        c.setFont("BPArial", 6.2)
        c.drawRightString(width - 28, 14, f"Editable teacher record  |  Page {page + 1} of 2")
        c.showPage()
    c.save()

    subprocess.run([str(POPPLER), "-png", "-r", "110", str(pdf), str(qa / "page")], check=True)
    public = ROOT / "public" / "lessons" / "year-6-maths" / "evaluations" / term.lower() / "preview" / "teacher-record"
    public.mkdir(parents=True, exist_ok=True)
    pages = sorted(qa.glob("page-*.png"))
    if len(pages) != 2:
        raise RuntimeError(f"Expected 2 preview pages for {term}, found {len(pages)}")
    for page in pages:
        shutil.copy2(page, public / page.name)
    print(f"evaluation record preview {term}: 2 pages")


if __name__ == "__main__":
    selected = (sys.argv[1] if len(sys.argv) > 1 else "all").lower()
    terms = [selected.title()] if selected in {"autumn", "spring", "summer"} else ["Autumn", "Spring", "Summer"]
    for value in terms:
        make_preview(value)
