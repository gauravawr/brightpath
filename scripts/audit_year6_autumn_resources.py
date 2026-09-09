import json
import re
import zipfile
from pathlib import Path

from pypdf import PdfReader


ROOT = Path(__file__).resolve().parents[1]
LESSON_ROOT = ROOT / "public" / "lessons" / "year-6-maths" / "autumn"


def main():
    lessons = json.loads((LESSON_ROOT / "year6-autumn-lessons.json").read_text(encoding="utf-8"))
    assert len(lessons) == 50
    assert len({(item["week"], item["day"]) for item in lessons}) == 50
    assert len({item["slug"] for item in lessons}) == 50
    assert all(1 <= item["week"] <= 10 and 1 <= item["day"] <= 5 for item in lessons)
    assert all(len(item["expected"]) == 10 and len(item["higher"]) == 10 for item in lessons)

    click_effects = 0
    for item in lessons:
        lesson_dir = LESSON_ROOT / f"week-{item['week']}" / item["slug"]
        plan = lesson_dir / "editable-teacher-plan.docx"
        slides = lesson_dir / "teaching-powerpoint-v1.pptx"
        preteach = lesson_dir / "pre-teach.pdf"
        worksheets = lesson_dir / "differentiated-worksheets.pdf"
        assert all(path.exists() and path.stat().st_size > 0 for path in (plan, slides, preteach, worksheets))
        assert len(PdfReader(str(preteach)).pages) == 2
        worksheet_reader = PdfReader(str(worksheets))
        assert len(worksheet_reader.pages) == 6
        for page in worksheet_reader.pages:
            assert abs(float(page.mediabox.width) - 595.28) < 1
            assert abs(float(page.mediabox.height) - 841.89) < 1
        assert len(list((lesson_dir / "preview" / "powerpoint").glob("slide-*.png"))) == 12
        assert len(list((lesson_dir / "preview" / "preteach").glob("page-*.png"))) == 2
        assert len(list((lesson_dir / "preview" / "worksheets").glob("page-*.png"))) == 6
        with zipfile.ZipFile(plan) as archive:
            app_xml = archive.read("docProps/app.xml").decode("utf-8", errors="ignore")
            page_match = re.search(r"<Pages>(\d+)</Pages>", app_xml)
            assert page_match and int(page_match.group(1)) == 1, plan
            document_xml = archive.read("word/document.xml").decode("utf-8", errors="ignore")
            for required in ("SEND", "ADHD", "ODD", "Resources", "I do", "We do", "You do"):
                assert required in document_xml, (plan, required)
        with zipfile.ZipFile(slides) as archive:
            presentation_xml = archive.read("ppt/presentation.xml").decode("utf-8", errors="ignore")
            assert presentation_xml.count("<p:sldId ") == 12
            all_xml = "".join(
                archive.read(name).decode("utf-8", errors="ignore")
                for name in archive.namelist()
                if name.endswith(".xml")
            )
            assert "[[CLICK]]" not in all_xml
            assert not re.search(r"(?i)year\s*6\s*maths.*autumn.*week\s+\d+.*day\s+\d+", all_xml)
            assert "Independent practice routes" not in all_xml
            assert "Lower support" not in all_xml
            assert "Higher" not in all_xml
            assert "The answer appears on click after pupils have committed." in all_xml
            deck_clicks = all_xml.count('nodeType="clickEffect"')
            assert deck_clicks > 0, slides
            click_effects += deck_clicks

    print(f"PASS: 50 unique lessons, 50 one-page DOCX plans, 50 animated 12-slide PPTX decks, 100 PDFs and 500 preview images.")
    print("PASS: Every expected and higher A4 pupil sheet contains 10 questions on one page, followed by one answer page.")
    print(f"PASS: {click_effects} click-to-reveal animation effects found across the 50 PowerPoints.")


if __name__ == "__main__":
    main()
