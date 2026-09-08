from pathlib import Path

from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_ROW_HEIGHT_RULE
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Inches, Pt, RGBColor
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public/lessons/year-1-maths/week-1/sort-objects-into-groups"
OUT.mkdir(parents=True, exist_ok=True)

RED = "B4232B"
CORAL = "F15B4A"
CREAM = "FFF7EA"
PALE = "FFF0E7"
INK = "17253A"
SLATE = "40516A"
MUTED = "6B788A"
LINE = "D9DEE7"
BLUE = "3F7DC0"
SKY = "E9F4FB"
GREEN = "4D9A72"
PURPLE = "76469A"

FONT = r"C:\Windows\Fonts\arial.ttf"
FONT_BOLD = r"C:\Windows\Fonts\arialbd.ttf"
FONT_HAND = r"C:\Windows\Fonts\segoepr.ttf"
FONT_HAND_BOLD = r"C:\Windows\Fonts\segoeprb.ttf"
pdfmetrics.registerFont(TTFont("BPArial", FONT))
pdfmetrics.registerFont(TTFont("BPArialBold", FONT_BOLD))
pdfmetrics.registerFont(TTFont("BPHand", FONT_HAND))
pdfmetrics.registerFont(TTFont("BPHandBold", FONT_HAND_BOLD))


def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def margins(cell, top=90, start=110, bottom=90, end=110):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for m, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{m}"))
        if node is None:
            node = OxmlElement(f"w:{m}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_repeat_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    header = OxmlElement("w:tblHeader")
    header.set(qn("w:val"), "true")
    tr_pr.append(header)


def keep_row(row):
    tr_pr = row._tr.get_or_add_trPr()
    tr_pr.append(OxmlElement("w:cantSplit"))


def cell_text(cell, text, *, bold=False, color=INK, size=9.5, align=None):
    cell.text = ""
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    if align is not None:
        p.alignment = align
    r = p.add_run(str(text))
    r.bold = bold
    r.font.name = "Arial"
    r.font.size = Pt(size)
    r.font.color.rgb = RGBColor.from_string(color)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    margins(cell)


def set_table_borders(table, color=LINE, size="8"):
    tbl = table._tbl
    tbl_pr = tbl.tblPr
    borders = tbl_pr.first_child_found_in("w:tblBorders")
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = borders.find(qn(f"w:{edge}"))
        if tag is None:
            tag = OxmlElement(f"w:{edge}")
            borders.append(tag)
        tag.set(qn("w:val"), "single")
        tag.set(qn("w:sz"), size)
        tag.set(qn("w:color"), color)


def set_fixed_widths(table, widths):
    table.autofit = False
    for row in table.rows:
        for cell, width in zip(row.cells, widths):
            cell.width = width
            tc_pr = cell._tc.get_or_add_tcPr()
            tc_w = tc_pr.find(qn("w:tcW"))
            if tc_w is None:
                tc_w = OxmlElement("w:tcW")
                tc_pr.append(tc_w)
            tc_w.set(qn("w:w"), str(width.twips))
            tc_w.set(qn("w:type"), "dxa")


def add_brand_header(doc, eyebrow, title, subtitle):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(3)
    r = p.add_run("BRIGHTPATH PRIMARY LEARNING")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(9)
    r.font.color.rgb = RGBColor.from_string(RED)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run(title)
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(22)
    r.font.color.rgb = RGBColor.from_string(INK)
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_after = Pt(7)
    r = p.add_run(f"{eyebrow}  |  {subtitle}")
    r.font.name = "Arial"
    r.font.size = Pt(9)
    r.font.color.rgb = RGBColor.from_string(MUTED)


def heading(doc, text, level=1):
    p = doc.add_paragraph()
    p.style = f"Heading {level}"
    p.paragraph_format.keep_with_next = True
    p.paragraph_format.space_before = Pt(7)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(text)
    r.font.color.rgb = RGBColor.from_string(INK)
    return p


def bullets(doc, items, check=False):
    for item in items:
        p = doc.add_paragraph(style="List Bullet")
        p.paragraph_format.space_after = Pt(2)
        p.add_run(("[ ] " if check else "") + item)


def two_col_table(doc, rows, left_width=4.4, right_width=12.2):
    table = doc.add_table(rows=0, cols=2)
    table.autofit = False
    table.columns[0].width = Cm(left_width)
    table.columns[1].width = Cm(right_width)
    for i, (label, value) in enumerate(rows):
        cells = table.add_row().cells
        shade(cells[0], RED if i % 2 == 0 else CORAL)
        cell_text(cells[0], label, bold=True, color="FFFFFF")
        shade(cells[1], "FFFFFF" if i % 2 == 0 else CREAM)
        cell_text(cells[1], value)
        keep_row(table.rows[-1])
    set_table_borders(table)
    return table


def create_teacher_plan():
    doc = Document()
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Inches(8.27), Inches(11.69)
    sec.top_margin = sec.bottom_margin = Cm(1.25)
    sec.left_margin = sec.right_margin = Cm(1.45)
    styles = doc.styles
    styles["Normal"].font.name = "Arial"
    styles["Normal"].font.size = Pt(9.25)
    for name, size in (("Title", 22), ("Heading 1", 16), ("Heading 2", 12)):
        styles[name].font.name = "Arial"
        styles[name].font.size = Pt(size)

    add_brand_header(doc, "YEAR 1 MATHS", "Sort objects into groups", "Autumn | Week 1 | Day 1 | Editable teacher plan")
    two_col_table(doc, [
        ("Teacher / class", "[Type here]"),
        ("Date / time", "[Type here]"),
        ("Learning intention", "To sort objects into groups."),
        ("National Curriculum", "Use concrete objects and pictorial representations; identify and describe properties; compare and classify objects using mathematical language. This lesson establishes the sorting and reasoning language needed for Year 1 number and geometry work."),
        ("Prior learning", "Children can name familiar colours, simple 2-D shapes and everyday objects; they can say one way two objects are the same or different."),
        ("Key vocabulary", "sort, group, property, rule, same, different, colour, shape, size, type"),
    ])
    heading(doc, "Success criteria", 2)
    bullets(doc, [
        "I can notice a property of an object.",
        "I can place objects that are the same in one group.",
        "I can say and keep one clear sorting rule.",
        "I can explain why an object belongs in its group.",
    ])
    heading(doc, "Classroom readiness checklist", 2)
    bullets(doc, [
        "Sharp pencils and erasers are ready.",
        "Mini whiteboards and pens are working.",
        "Mixed sorting objects or counters are in trays for each pair.",
        "Two hoops, trays or sorting circles are visible.",
        "Lower/CUSP pre-teach group and adult support are confirmed.",
        "Slides are open in presentation mode; date on Slide 1 has been changed.",
    ], check=True)
    heading(doc, "Resources and equipment", 2)
    bullets(doc, [
        "Interactive PowerPoint and display; real mixed objects such as buttons, blocks, counters or classroom items.",
        "Two sorting hoops/trays per pair; colour, shape and size prompt cards; mini whiteboards.",
        "Printed pre-teach resource; lower, expected and higher/early-finisher sheets.",
        "Optional: visual timer, now/next board, larger objects or adapted grip for pupils who need them.",
    ])

    doc.add_page_break()
    add_brand_header(doc, "LESSON SEQUENCE", "Detailed teaching plan", "60 minutes | Fully adaptable")
    table = doc.add_table(rows=1, cols=5)
    table.autofit = False
    widths = [Cm(2.0), Cm(2.6), Cm(6.7), Cm(3.7), Cm(2.2)]
    for col, width in zip(table.columns, widths):
        col.width = width
    headers = ["Time", "Phase", "Teacher and pupil activity", "Assessment / adaptation", "Slides"]
    for cell, text in zip(table.rows[0].cells, headers):
        shade(cell, RED)
        cell_text(cell, text, bold=True, color="FFFFFF", size=8.5)
    set_repeat_header(table.rows[0])
    sequence = [
        ("0–5", "Ready + LI", "Change the date. Check pencils, whiteboards, objects and partners. Read the LI together. Ask what the hoops might help us do.", "Notice who needs language prompting or extra processing time.", "1"),
        ("5–10", "Revisit", "Silent notice, then think-pair-share: what is the same and different about the four shapes? Recast answers using property.", "Use real objects and one binary question at a time for pupils needing support.", "2–3"),
        ("10–15", "Vocabulary", "Teach sort, group, property and rule with gestures. Introduce Pip, who will make a deliberate mistake.", "Ask pupils to point, act or repeat before giving a full verbal answer.", "4"),
        ("15–25", "Explicit model", "Model sorting red and blue shapes by colour. Say the rule before moving each object. Check every object against the same rule.", "Think aloud. Use: ‘It belongs here because…’. Change only one variable at a time.", "5"),
        ("25–33", "Guided practice", "Pupils point to the correct group for a blue triangle, rehearse the sentence stem, then justify. Repeat with real objects.", "No calling out. Scan pointing and partner explanations before cold-call.", "6"),
        ("33–40", "Misconception", "Show Pip’s sort. Pupils identify the blue triangle in the red group, explain why it breaks the colour rule, then view the correction.", "Probe whether pupils follow the named rule rather than their preferred rule.", "7–8"),
        ("40–45", "Change rule", "Re-sort the same red/blue circles and squares by shape. Discuss what changed and what stayed the same.", "Check pupils understand that one set can be sorted validly in more than one way.", "9–10"),
        ("45–56", "Independent", "Allocate lower, expected or higher/early-finisher sheet according to today’s evidence. Circulate with: What is your rule? Does every object follow it?", "Lower may use real objects; expected records independently; higher proves two rules.", "11–12"),
        ("56–60", "Exit check", "Answer the three exit questions. Pupils self-assess, but teacher records readiness from explanation and work, not confidence alone.", "Record initials for tomorrow’s pre-teach and extension groups.", "13"),
    ]
    for i, row in enumerate(sequence):
        cells = table.add_row().cells
        for cell, text in zip(cells, row):
            shade(cell, "FFFFFF" if i % 2 == 0 else CREAM)
            cell_text(cell, text, bold=False, size=8.1)
        keep_row(table.rows[-1])
    set_table_borders(table)

    doc.add_page_break()
    add_brand_header(doc, "BEFORE THE LESSON", "Pre-teach plan", "Lower/CUSP group | 10–12 minutes")
    two_col_table(doc, [
        ("Purpose", "Secure the language and attention skills needed to access the whole-class lesson; this is preparation, not a different learning intention."),
        ("Group / initials", "[Type initials here]"),
        ("Adult", "[Type here]"),
        ("Resources", "Two hoops/trays; 2 red and 2 blue objects; one deliberately misplaced object; colour cards; pre-teach sheet."),
        ("Vocabulary", "same, different, colour, sort, group, rule"),
    ])
    heading(doc, "Short teaching sequence", 2)
    steps = [
        ("1. Notice", "Show one red and one blue object. Name the colours; pupils point and repeat."),
        ("2. Match", "Place the red and blue objects in separate hoops. Add one matching object to each."),
        ("3. State rule", "Say together: ‘We are sorting by colour. Red here; blue here.’"),
        ("4. Check mistake", "Put one blue object in the red hoop. Ask pupils to point, move it and explain."),
        ("5. Quick check", "Ask the four questions on the pre-teach sheet. Record independence, prompted or not yet."),
    ]
    for title, body in steps:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(4)
        r = p.add_run(title + ": ")
        r.bold = True
        r.font.color.rgb = RGBColor.from_string(RED)
        p.add_run(body)
    heading(doc, "Pre-teach assessment record", 2)
    table = doc.add_table(rows=1, cols=4)
    headers = ["Pupil initials", "Names colours", "Keeps one rule", "Language / next support"]
    for cell, text in zip(table.rows[0].cells, headers):
        shade(cell, BLUE)
        cell_text(cell, text, bold=True, color="FFFFFF", size=8.5)
    for _ in range(6):
        cells = table.add_row().cells
        for cell in cells:
            cell_text(cell, "\n")
        table.rows[-1].height = Cm(1.0)
        table.rows[-1].height_rule = WD_ROW_HEIGHT_RULE.AT_LEAST
        keep_row(table.rows[-1])
    set_table_borders(table)
    heading(doc, "If pupils are not ready", 2)
    bullets(doc, [
        "Reduce the set to two objects; use only colour; repeat the same sentence stem.",
        "Offer a forced choice: red or blue? Point before speaking.",
        "Pre-place the first object in each hoop and ask the pupil to match one item.",
        "Keep these objects available during the whole-class lesson; pair with a calm verbal model.",
    ])

    doc.add_page_break()
    add_brand_header(doc, "INCLUSION", "Editable adaptation and reasonable-adjustment plan", "Use initials, not full pupil names")
    heading(doc, "Plan by individual need", 2)
    table = doc.add_table(rows=1, cols=4)
    headers = ["Pupil initials / group", "Need or barrier", "Adaptation / adult action", "Review after lesson"]
    for cell, text in zip(table.rows[0].cells, headers):
        shade(cell, RED)
        cell_text(cell, text, bold=True, color="FFFFFF", size=8.4)
    set_repeat_header(table.rows[0])
    for _ in range(7):
        cells = table.add_row().cells
        for cell in cells:
            cell_text(cell, "\n\n")
        table.rows[-1].height = Cm(1.25)
        table.rows[-1].height_rule = WD_ROW_HEIGHT_RULE.AT_LEAST
        keep_row(table.rows[-1])
    set_table_borders(table)
    heading(doc, "Starting points to adapt", 2)
    two_col_table(doc, [
        ("SEND / cognition", "Use concrete objects, reduced item count, uncluttered workspace, one instruction at a time, extra rehearsal and overlearning."),
        ("ADHD / attention", "Seat for clear view; give an active object-moving role; use a visual timer; chunk the task; brief movement reset; praise return to the rule."),
        ("ODD / demand avoidance", "Use calm choices: red or blue first? Offer a helper/expert role; avoid public correction; use collaborative language and predictable boundaries."),
        ("Communication / EAL", "Pre-teach vocabulary with objects and gestures; allow pointing before speaking; use the sentence stem; partner rehearsal; accept home-language rehearsal where helpful."),
        ("Fine-motor / sensory", "Use larger objects and hoops; offer pointing or adult scribing; minimise visual clutter; allow adapted grip or alternative recording."),
        ("Higher prior attainment", "Require two valid rules, compare the resulting groups, create a counterexample, and justify why every object follows the chosen rule."),
    ])

    doc.add_page_break()
    add_brand_header(doc, "ASSESSMENT", "Misconceptions, questions and answers", "Use throughout the lesson")
    heading(doc, "Key misconception and response", 2)
    two_col_table(doc, [
        ("Changes rule midway", "Pause. Ask the pupil to restate the rule, then check every object against only that property."),
        ("Sorts by preference", "Ask: ‘What property are we using?’ Give two possible groups and require a because sentence."),
        ("Treats one object as having one property", "Revisit that the same object has colour, shape, size and type; the chosen rule tells us which property matters now."),
        ("Thinks a different sort is wrong", "Use the same set twice. Compare sorting by colour and by shape; verify both are valid when applied consistently."),
        ("Cannot explain verbally", "Allow pointing and object movement, then co-construct: ‘It belongs here because it is ___.’"),
    ])
    heading(doc, "Planned formative questions", 2)
    bullets(doc, [
        "What property are you looking at?",
        "What is your sorting rule?",
        "How do you know this object belongs here?",
        "Does every object follow the same rule? Prove it.",
        "Could the same objects be sorted in another correct way?",
        "What mistake did Pip make, and how would you fix it?",
    ])
    heading(doc, "Answer guide", 2)
    two_col_table(doc, [
        ("Pre-teach", "1 red hoop; 2 yes; 3 sort by colour; 4 move the blue object to the blue group; 5 pupils state one consistent rule."),
        ("Lower", "Red circle and red triangle; blue button to BLUE; circle with circles; big objects together and small objects together; rule = size."),
        ("Expected", "Red: triangle/square; blue: circle/star. Yellow square does not belong in circle group. Drawings and full-sentence rules vary but must be consistent."),
        ("Higher", "Valid rules include colour and shape. Explanations must match the created set; all six objects must be placeable under both rules."),
    ])

    doc.add_page_break()
    add_brand_header(doc, "AFTER THE LESSON", "Editable assessment and reflection", "Complete before planning Day 2")
    heading(doc, "Pupil outcome record", 2)
    table = doc.add_table(rows=1, cols=4)
    headers = ["Outcome", "Pupil initials", "Evidence seen", "Next action"]
    for cell, text in zip(table.rows[0].cells, headers):
        shade(cell, GREEN)
        cell_text(cell, text, bold=True, color="FFFFFF", size=8.5)
    rows = [
        ("Needs pre-teach again", "[Type here]", "[Type here]", "Repeat with two groups and real objects."),
        ("Developing", "[Type here]", "[Type here]", "Rehearse rule and because sentence."),
        ("Secure", "[Type here]", "[Type here]", "Move to sorting a wider mixed collection."),
        ("Ready to deepen", "[Type here]", "[Type here]", "Two-rule reasoning and counterexample."),
    ]
    for row in rows:
        cells = table.add_row().cells
        for cell, text in zip(cells, row):
            cell_text(cell, text)
        table.rows[-1].height = Cm(1.4)
        table.rows[-1].height_rule = WD_ROW_HEIGHT_RULE.AT_LEAST
        keep_row(table.rows[-1])
    set_table_borders(table)
    heading(doc, "Teacher reflection", 2)
    two_col_table(doc, [
        ("What pupils understood", "[Type here]"),
        ("Who needs further support", "[Type initials and reason here]"),
        ("Which adaptation helped", "[Type here]"),
        ("What to change next time", "[Type here]"),
        ("Resources to prepare for Day 2", "[Type here]"),
    ])
    heading(doc, "Safeguarding and professional note", 2)
    p = doc.add_paragraph("Use pupil initials only. Adaptations should be based on the child’s current need and school support plan. The named examples above are starting points, not fixed assumptions about any pupil or diagnosis.")
    p.runs[0].italic = True
    p.runs[0].font.color.rgb = RGBColor.from_string(MUTED)

    path = OUT / "editable-teacher-plan.docx"
    doc.save(path)
    return path


def compact_cell_text(cell, text, *, bold=False, color=INK, size=7.0, align=None):
    cell_text(cell, text, bold=bold, color=color, size=size, align=align)
    margins(cell, top=35, start=55, bottom=35, end=55)


def create_teacher_plan_one_page():
    """One-page, supply-teacher-ready plan with enough detail to teach the lesson."""
    doc = Document()
    sec = doc.sections[0]
    sec.orientation = WD_ORIENT.LANDSCAPE
    sec.page_width, sec.page_height = Inches(11.69), Inches(8.27)
    sec.top_margin = sec.bottom_margin = Cm(0.55)
    sec.left_margin = sec.right_margin = Cm(0.65)
    styles = doc.styles
    styles["Normal"].font.name = "Arial"
    styles["Normal"].font.size = Pt(7.2)

    top = doc.add_table(rows=1, cols=3)
    top.autofit = False
    widths = [Cm(5.4), Cm(14.6), Cm(6.0)]
    cells = top.rows[0].cells
    shade(cells[0], RED)
    compact_cell_text(cells[0], "BRIGHTPATH PRIMARY LEARNING\nYEAR 1 MATHS", bold=True, color="FFFFFF", size=8.2)
    shade(cells[1], CREAM)
    compact_cell_text(cells[1], "SORT OBJECTS INTO GROUPS\nAutumn | Week 1 | Day 1 | 60 minutes", bold=True, color=INK, size=12.5, align=WD_ALIGN_PARAGRAPH.CENTER)
    shade(cells[2], "FFFFFF")
    compact_cell_text(cells[2], "Teacher/class: __________________\nDate/time: ______________________", size=7.4)
    set_table_borders(top)
    set_fixed_widths(top, widths)

    overview = doc.add_table(rows=2, cols=4)
    overview.autofit = False
    overview_widths = [Cm(3.2), Cm(9.8), Cm(3.2), Cm(9.8)]
    overview_rows = [
        ("LI / LO", "To sort objects into groups and explain one clear sorting rule.", "Success", "Notice a property; keep one rule; explain with because."),
        ("Prior learning", "Name colours and simple 2-D shapes; say how two objects are the same/different.", "Vocabulary", "sort, group, property, rule, same, different, colour, shape, size, type"),
    ]
    for r_idx, row in enumerate(overview_rows):
        for c_idx, text in enumerate(row):
            cell = overview.rows[r_idx].cells[c_idx]
            if c_idx % 2 == 0:
                shade(cell, RED if r_idx == 0 else BLUE)
                compact_cell_text(cell, text, bold=True, color="FFFFFF", size=7.2)
            else:
                shade(cell, "FFFFFF" if r_idx == 0 else SKY)
                compact_cell_text(cell, text, size=7.0)
    set_table_borders(overview)
    set_fixed_widths(overview, overview_widths)

    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(1)
    r = p.add_run("DETAILED TEACHING SEQUENCE — follow in order; slide numbers refer to the teaching PowerPoint")
    r.bold = True
    r.font.name = "Arial"
    r.font.size = Pt(8)
    r.font.color.rgb = RGBColor.from_string(RED)

    table = doc.add_table(rows=1, cols=4)
    sequence_widths = [Cm(1.2), Cm(1.4), Cm(11.8), Cm(11.6)]
    for cell, text in zip(table.rows[0].cells, ["Time", "Slides", "Teacher does / says", "Children, check and adapt"]):
        shade(cell, RED)
        compact_cell_text(cell, text, bold=True, color="FFFFFF", size=7.0, align=WD_ALIGN_PARAGRAPH.CENTER)
    set_repeat_header(table.rows[0])
    sequence = [
        ("0–4", "1", "Before pupils enter, place mixed objects and two hoops on each table. Change the editable date. Check sharp pencils, mini-whiteboards and partners. Read: ‘Today we will sort objects into groups.’", "Children collect equipment, read the LI and predict how hoops may be used. If resources are missing, use one teacher set and the slide shapes."),
        ("4–9", "2", "TEACH the definition: sorting means putting objects into groups using one clear rule. Contrast the colour example with the mixed non-example. Explain that a sort must be stated and checked.", "Children identify the rule in the first example. Ask: ‘Can we check the mixed box without a rule?’ Expected: no—not until the rule is stated."),
        ("9–14", "3–5", "REVISIT same/different, reveal the word property, then teach sort, group, property and rule with gestures. Introduce Pip: ‘Pip makes mistakes; we explain them kindly.’", "Children use ‘same/different because…’, repeat vocabulary and name one property. Lower/CUSP pupils may point before speaking."),
        ("14–22", "6–7", "TEACH four steps: notice, choose, say/place, check. MODEL sorting by colour. Say: ‘I am sorting by colour. This is red, so it belongs in red.’ Check every object at the end.", "Children repeat the four steps and track each placement. Emphasise: an object has many properties, but the chosen rule tells us which matters now."),
        ("22–29", "8", "GUIDED: pupils point first, rehearse, then explain: ‘The blue triangle belongs in the blue group because it is blue.’ Repeat with 2–3 real objects. Do not take shouted answers.", "Point, partner-rehearse and justify with because. If a child uses shape, ask: ‘What is our rule?’ Give forced choice red/blue if needed."),
        ("29–36", "9–10", "MISCONCEPTION: Show Pip’s sort. Ask: ‘What rule did Pip say? Which object breaks it? How do you know?’ Reveal the correction only after pupils explain.", "Expected: ‘The blue triangle belongs in blue because the rule is colour.’ If pupils move a red square, restate that shape does not matter under this rule."),
        ("36–43", "11–12", "RE-TEACH/DEEPEN: mix the same objects and sort by shape. Ask what changed/stayed the same. Partners choose a rule and repeat each other’s explanation.", "Children explain that objects stayed the same but the rule/groups changed. Verify both colour and shape sorts are valid when applied consistently."),
        ("43–56", "13–14", "INDEPENDENT: Lower—real objects and one shown property. Expected—sort pictures and record rule. Higher/finisher—same six objects, two rules, compare. Circulate asking: ‘What is your rule?’ ‘Does every object follow it?’", "Children complete the assigned sheet and show thinking. Move a pupil to more/less support if evidence changes. Higher pupils prove both rules for every object."),
        ("56–60", "15", "EXIT: ask all three questions. Answers: sort = put into groups; property = colour/shape/size/type; same rule = check every object fairly. Collect sheets and record initials.", "Children answer orally/on whiteboard. Use explanations and sheet, not confidence alone. Repeat pre-teach tomorrow if a child cannot state or keep a rule."),
    ]
    for r_idx, row in enumerate(sequence):
        cells = table.add_row().cells
        for cell, text in zip(cells, row):
            shade(cell, "FFFFFF" if r_idx % 2 == 0 else CREAM)
            compact_cell_text(cell, text, size=6.35)
        keep_row(table.rows[-1])
    set_table_borders(table)
    set_fixed_widths(table, sequence_widths)

    bottom = doc.add_table(rows=2, cols=3)
    bottom.autofit = False
    bottom_widths = [Cm(8.66), Cm(8.66), Cm(8.66)]
    bottom_content = [
        ("RESOURCES + READINESS", "2 hoops/trays per pair; mixed red/blue circles, squares and triangles; mini-whiteboards; slides; three worksheets; pre-teach sheet. Check projector, date, pencils, object trays and named adult before pupils arrive."),
        ("SEND / ADHD / ODD / EAL", "Concrete objects; one instruction at a time; pointing before speaking; sentence stem; reduced set; visual timer; active object-moving role; calm choice of which group first; private correction; larger objects/alternative recording. Initials/adult: __________________________"),
        ("MISCONCEPTIONS + RESPONSE", "Changes rule → restate it and check every object. Sorts by preference → ask which property matters. Different sort judged wrong → show same set sorted twice. Cannot explain → point/move, then co-construct ‘because’."),
        ("PRE-TEACH (10–12 MIN BEFORE)", "Group/initials: __________________  Adult: __________  Use 2 red + 2 blue objects. Name colours; place first object in each hoop; match one object; state ‘sort by colour’; insert one error; pupil moves and explains. Mark independent / prompted / not yet."),
        ("FORMATIVE ASSESSMENT", "Listen for the words property and rule; check every placement; photograph one correct concrete sort if useful. Secure = states and applies one rule independently. Developing = sorts correctly but needs language prompt. Not yet = changes rule or matches randomly."),
        ("AFTER / NEXT STEP", "Needs repeat pre-teach: __________________  Secure: __________________  Ready to deepen: __________________  Adult notes: __________________________________________________________________________________"),
    ]
    for idx, (head, body) in enumerate(bottom_content):
        row, col = divmod(idx, 3)
        cell = bottom.rows[row].cells[col]
        shade(cell, SKY if row == 0 else PALE)
        cell.text = ""
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(1)
        run = p.add_run(head)
        run.bold = True
        run.font.name = "Arial"
        run.font.size = Pt(6.8)
        run.font.color.rgb = RGBColor.from_string(BLUE if row == 0 else RED)
        p = cell.add_paragraph()
        p.paragraph_format.space_after = Pt(0)
        run = p.add_run(body)
        run.font.name = "Arial"
        run.font.size = Pt(5.9)
        run.font.color.rgb = RGBColor.from_string(INK)
        margins(cell, top=40, start=60, bottom=40, end=60)
    set_table_borders(bottom)
    set_fixed_widths(bottom, bottom_widths)

    path = OUT / "editable-teacher-plan-one-page.docx"
    doc.save(path)
    return path


def hc(hex_value):
    return HexColor("#" + hex_value)


def pdf_header(c, title, subtitle, page_no=1):
    width, height = A4
    c.setFillColor(hc(RED))
    c.rect(0, height - 24, width, 24, fill=1, stroke=0)
    c.setFillColor(hc("FFFFFF"))
    c.setFont("BPArialBold", 9)
    c.drawString(42, height - 16, "BRIGHTPATH PRIMARY LEARNING")
    c.setFillColor(hc(INK))
    c.setFont("BPArialBold", 20)
    c.drawString(42, height - 62, title)
    c.setFillColor(hc(RED))
    c.setFont("BPArialBold", 9)
    c.drawString(42, height - 80, subtitle.upper())
    c.setFillColor(hc(MUTED))
    c.setFont("BPArial", 8)
    c.drawRightString(width - 42, height - 80, f"Year 1 Maths | Autumn Week 1 Day 1 | Page {page_no}")


def name_date(c, y):
    c.setFillColor(hc(CREAM))
    c.roundRect(42, y - 34, A4[0] - 84, 34, 8, fill=1, stroke=0)
    c.setFillColor(hc(INK))
    c.setFont("BPHand", 10)
    c.drawString(56, y - 22, "Name: __________________________________________")
    c.drawRightString(A4[0] - 56, y - 22, "Date: __________________")


def footer(c, label):
    c.setStrokeColor(hc(LINE))
    c.line(42, 32, A4[0] - 42, 32)
    c.setFillColor(hc(MUTED))
    c.setFont("BPArial", 7.5)
    c.drawString(42, 20, label)
    c.drawRightString(A4[0] - 42, 20, "Free classroom resource")


def draw_object(c, kind, x, y, size, colour):
    c.setFillColor(hc(colour))
    c.setStrokeColor(hc(INK))
    c.setLineWidth(1)
    if kind == "circle":
        c.circle(x + size / 2, y + size / 2, size / 2, fill=1, stroke=1)
    elif kind == "triangle":
        p = c.beginPath()
        p.moveTo(x + size / 2, y + size)
        p.lineTo(x, y)
        p.lineTo(x + size, y)
        p.close()
        c.drawPath(p, fill=1, stroke=1)
    else:
        c.rect(x, y, size, size, fill=1, stroke=1)


def question_box(c, number, prompt, y, height=78, fill="FFFFFF", accent=RED):
    width = A4[0] - 84
    c.setFillColor(hc(fill))
    c.setStrokeColor(hc(LINE))
    c.roundRect(42, y - height, width, height, 8, fill=1, stroke=1)
    c.setFillColor(hc(accent))
    c.circle(64, y - 23, 12, fill=1, stroke=0)
    c.setFillColor(hc("FFFFFF"))
    c.setFont("BPArialBold", 9)
    c.drawCentredString(64, y - 26, str(number))
    c.setFillColor(hc(INK))
    c.setFont("BPHand", 10.5)
    text = c.beginText(86, y - 20)
    text.setFont("BPHand", 10.5)
    for line in wrap(prompt, 66):
        text.textLine(line)
    c.drawText(text)
    return y - height - 10


def wrap(text, chars):
    words = text.split()
    lines, line = [], ""
    for word in words:
        trial = (line + " " + word).strip()
        if len(trial) > chars and line:
            lines.append(line)
            line = word
        else:
            line = trial
    if line:
        lines.append(line)
    return lines


def create_preteach():
    path = OUT / "pre-teach.pdf"
    c = canvas.Canvas(str(path), pagesize=A4)
    w, h = A4
    pdf_header(c, "Pre-teach: sort by colour", "10–12 minute adult-led preparation", 1)
    c.setFillColor(hc(SKY))
    c.roundRect(42, h - 190, w - 84, 82, 10, fill=1, stroke=0)
    c.setFillColor(hc(INK))
    c.setFont("BPArialBold", 11)
    c.drawString(58, h - 132, "Purpose")
    c.setFont("BPArial", 9.5)
    text = c.beginText(58, h - 151)
    for line in wrap("Prepare the lower/CUSP group to notice colour, keep one sorting rule and explain where an object belongs. Use real objects throughout.", 82):
        text.textLine(line)
    c.drawText(text)
    c.setFillColor(hc(CREAM))
    c.roundRect(42, h - 286, w - 84, 78, 10, fill=1, stroke=0)
    c.setFillColor(hc(INK))
    c.setFont("BPArialBold", 10)
    c.drawString(58, h - 230, "You need")
    c.setFont("BPArial", 9)
    c.drawString(58, h - 248, "2 hoops or trays | 2 red objects | 2 blue objects | colour cards | this sheet")
    c.drawString(58, h - 266, "Say together: sort | group | same | different | rule | colour")
    c.setFont("BPArialBold", 11)
    c.setFillColor(hc(RED))
    c.drawString(42, h - 324, "Teach in five small steps")
    steps = [
        "Show one red and one blue object. Name and point to each colour.",
        "Place them in separate hoops. Say: red here; blue here.",
        "Add one matching object to each hoop. Pupils copy and say the rule.",
        "Make a mistake by putting blue in red. Pupils point, move and explain.",
        "Repeat once with fewer adult words. Praise checking the rule, not speed.",
    ]
    y = h - 350
    for i, step in enumerate(steps, 1):
        c.setFillColor(hc(RED))
        c.circle(58, y + 2, 10, fill=1, stroke=0)
        c.setFillColor(hc("FFFFFF"))
        c.setFont("BPArialBold", 8)
        c.drawCentredString(58, y - 1, str(i))
        c.setFillColor(hc(INK))
        c.setFont("BPArial", 9.5)
        c.drawString(78, y - 2, step)
        y -= 42
    c.setFillColor(hc(PALE))
    c.roundRect(42, 110, w - 84, 112, 10, fill=1, stroke=0)
    c.setFillColor(hc(INK))
    c.setFont("BPArialBold", 10)
    c.drawString(58, 199, "Adaptive prompts")
    c.setFont("BPArial", 9)
    prompts = ["Point first, then speak.", "Give a choice: red or blue?", "Use: It belongs here because it is ____.", "Reduce to one object at a time."]
    for i, p in enumerate(prompts):
        c.drawString(58 + (i % 2) * 245, 177 - (i // 2) * 30, "- " + p)
    footer(c, "Pre-teach adult guide")
    c.showPage()

    pdf_header(c, "Pre-teach quick check", "Pupil practice with an adult", 2)
    name_date(c, h - 100)
    c.setFillColor(hc(INK))
    c.setFont("BPArialBold", 11)
    c.drawString(42, h - 164, "Use real objects. Point, move and explain.")
    y = h - 188
    y = question_box(c, 1, "Put the red button in the red hoop. Where does it go?", y, 74, "FFF7EA")
    y = question_box(c, 2, "Are two blue objects the same colour? Point to both and say your answer.", y, 74, "E9F4FB", BLUE)
    y = question_box(c, 3, "Say the rule: We are sorting by ____________.", y, 74, "FFFFFF")
    y = question_box(c, 4, "The blue object is in the red group. Move it and explain the mistake.", y, 88, "FFF0E7")
    y = question_box(c, 5, "Make your own two colour groups. Does every object follow your rule?", y, 100, "FFFFFF")
    c.setFillColor(hc(CREAM))
    c.roundRect(42, 72, w - 84, 54, 8, fill=1, stroke=0)
    c.setFillColor(hc(INK))
    c.setFont("BPArialBold", 9)
    c.drawString(56, 101, "Adult record:  independent [ ]   prompted [ ]   not yet [ ]")
    c.setFont("BPArial", 8.5)
    c.drawString(56, 83, "Initials / next support: __________________________________________________________")
    footer(c, "Pre-teach pupil quick check")
    c.save()
    return path


def create_lower():
    path = OUT / "lower-worksheet.pdf"
    c = canvas.Canvas(str(path), pagesize=A4)
    w, h = A4
    pdf_header(c, "Sort objects into groups", "Lower support | use real objects if helpful", 1)
    name_date(c, h - 100)
    c.setFillColor(hc(INK))
    c.setFont("BPArial", 9)
    c.drawString(42, h - 158, "Say the rule before you answer. An adult may read the words.")
    y = h - 184
    y = question_box(c, 1, "Circle the red shapes.", y, 108, "FFF7EA")
    draw_object(c, "circle", 120, y + 30, 34, RED)
    draw_object(c, "square", 225, y + 30, 34, BLUE)
    draw_object(c, "triangle", 330, y + 30, 34, RED)
    y = question_box(c, 2, "Draw a line from the blue button to the BLUE group.", y, 108, "E9F4FB", BLUE)
    draw_object(c, "circle", 150, y + 30, 34, BLUE)
    c.setStrokeColor(hc(BLUE)); c.setLineWidth(2); c.roundRect(390, y + 20, 120, 52, 8, fill=0, stroke=1)
    c.setFillColor(hc(BLUE)); c.setFont("BPArialBold", 11); c.drawCentredString(450, y + 39, "BLUE")
    y = question_box(c, 3, "Which belongs with two circles? Circle your answer.", y, 110, "FFFFFF")
    draw_object(c, "circle", 165, y + 30, 38, CORAL)
    draw_object(c, "square", 350, y + 30, 38, CORAL)
    y = question_box(c, 4, "Sort by size. Draw the big objects in one group and the small objects in the other.", y, 130, "FFF0E7")
    c.setStrokeColor(hc(LINE)); c.roundRect(95, y + 20, 180, 68, 8, fill=0, stroke=1); c.roundRect(330, y + 20, 180, 68, 8, fill=0, stroke=1)
    c.setFillColor(hc(MUTED)); c.setFont("BPArial", 8); c.drawCentredString(185, y + 52, "BIG GROUP"); c.drawCentredString(420, y + 52, "SMALL GROUP")
    c.setFillColor(hc(CREAM)); c.roundRect(42, 55, w - 84, 62, 8, fill=1, stroke=0)
    c.setFillColor(hc(INK)); c.setFont("BPArialBold", 10); c.drawString(56, 90, "5. Finish the sentence:")
    c.setFont("BPArial", 10); c.drawString(56, 70, "I sorted by ________________________________.")
    footer(c, "Lower support worksheet")
    c.save()
    return path


def create_expected():
    path = OUT / "expected-worksheet.pdf"
    c = canvas.Canvas(str(path), pagesize=A4)
    w, h = A4
    pdf_header(c, "Sort objects into groups", "Expected standard | independent core practice", 1)
    name_date(c, h - 100)
    y = h - 166
    y = question_box(c, 1, "Sort by colour. Write or draw the red objects in one box and the blue objects in the other.", y, 150, "FFF7EA")
    draw_object(c, "triangle", 105, y + 92, 30, RED); draw_object(c, "circle", 180, y + 92, 30, BLUE)
    draw_object(c, "square", 255, y + 92, 30, RED); draw_object(c, "triangle", 330, y + 92, 30, BLUE)
    c.setStrokeColor(hc(RED)); c.roundRect(80, y + 22, 200, 58, 8, fill=0, stroke=1)
    c.setStrokeColor(hc(BLUE)); c.roundRect(315, y + 22, 200, 58, 8, fill=0, stroke=1)
    c.setFont("BPArialBold", 8); c.setFillColor(hc(RED)); c.drawString(90, y + 64, "RED"); c.setFillColor(hc(BLUE)); c.drawString(325, y + 64, "BLUE")
    y = question_box(c, 2, "A yellow square is in the circle group. Is the sort correct? Explain.", y, 102, "FFFFFF")
    c.setStrokeColor(hc(LINE)); c.line(88, y + 28, 515, y + 28); c.line(88, y + 12, 515, y + 12)
    y = question_box(c, 3, "Draw four objects that can be sorted into two colour groups.", y, 120, "E9F4FB", BLUE)
    c.setStrokeColor(hc(LINE)); c.roundRect(88, y + 16, 427, 62, 8, fill=0, stroke=1)
    y = question_box(c, 4, "Write your rule in a full sentence.", y, 92, "FFFFFF")
    c.setStrokeColor(hc(LINE)); c.line(88, y + 20, 515, y + 20)
    c.setFillColor(hc(CREAM)); c.roundRect(42, 55, w - 84, 58, 8, fill=1, stroke=0)
    c.setFillColor(hc(INK)); c.setFont("BPArialBold", 9); c.drawString(56, 87, "5. Check every object:")
    c.setFont("BPArial", 9); c.drawString(56, 68, "Does every object follow the same rule?  Yes [ ]   Not yet [ ]")
    footer(c, "Expected worksheet")
    c.save()
    return path


def create_higher():
    path = OUT / "higher-worksheet.pdf"
    c = canvas.Canvas(str(path), pagesize=A4)
    w, h = A4
    pdf_header(c, "One set, two correct sorts", "Higher challenge and early-finisher reasoning", 1)
    name_date(c, h - 100)
    c.setFillColor(hc(INK)); c.setFont("BPArialBold", 11)
    c.drawString(42, h - 158, "Use the same six objects for both rules. Prove that both sorts work.")
    c.setFillColor(hc(CREAM)); c.roundRect(42, h - 310, w - 84, 126, 10, fill=1, stroke=0)
    c.setFillColor(hc(INK)); c.setFont("BPArialBold", 10); c.drawString(58, h - 208, "1. Create a set of six objects that has at least two colours and two shapes.")
    c.setStrokeColor(hc(LINE)); c.roundRect(58, h - 294, w - 116, 70, 8, fill=0, stroke=1)
    c.setFillColor(hc(SKY)); c.roundRect(42, h - 500, (w - 96) / 2, 168, 10, fill=1, stroke=0)
    c.setFillColor(hc(PALE)); c.roundRect(54 + (w - 96) / 2, h - 500, (w - 96) / 2, 168, 10, fill=1, stroke=0)
    c.setFillColor(hc(BLUE)); c.setFont("BPArialBold", 11); c.drawCentredString(42 + (w - 96) / 4, h - 356, "2. RULE 1")
    c.setFillColor(hc(RED)); c.drawCentredString(54 + 3 * (w - 96) / 4, h - 356, "3. RULE 2")
    c.setFillColor(hc(INK)); c.setFont("BPArial", 9)
    c.drawString(58, h - 380, "I sorted by __________________.")
    c.drawString(58 + (w - 96) / 2, h - 380, "I sorted by __________________.")
    c.setStrokeColor(hc(LINE)); c.roundRect(58, h - 486, (w - 132) / 2, 88, 8, fill=0, stroke=1)
    c.roundRect(70 + (w - 96) / 2, h - 486, (w - 132) / 2, 88, 8, fill=0, stroke=1)
    y = h - 528
    y = question_box(c, 4, "Which rule makes the most useful groups? Explain why. There may be more than one good answer.", y, 112, "FFFFFF")
    c.setStrokeColor(hc(LINE)); c.line(88, y + 30, 515, y + 30); c.line(88, y + 14, 515, y + 14)
    y = question_box(c, 5, "Pip puts a small red circle with big red circles. What rule might Pip be using? Give two possibilities.", y, 106, "FFF0E7")
    c.setFillColor(hc(CREAM)); c.roundRect(42, 55, w - 84, 62, 8, fill=1, stroke=0)
    c.setFillColor(hc(INK)); c.setFont("BPArialBold", 9); c.drawString(56, 90, "Extra proof:")
    c.setFont("BPArial", 9); c.drawString(56, 70, "Choose one object. Explain why it belongs under Rule 1 and under Rule 2.")
    footer(c, "Higher challenge worksheet")
    c.save()
    return path


if __name__ == "__main__":
    files = [create_teacher_plan_one_page(), create_preteach(), create_lower(), create_expected(), create_higher()]
    for file in files:
        print(file)
