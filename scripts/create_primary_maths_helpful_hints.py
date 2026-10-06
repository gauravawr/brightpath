from __future__ import annotations

import json
import shutil
import textwrap
from pathlib import Path

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public" / "resources" / "maths"
OUTPUT = ROOT / "output" / "pdf" / "helpful-hints"
PLANS = ROOT / "public" / "curriculum-plans" / "maths"
YEAR1_SOURCE = ROOT / "lessons" / "year-1-maths" / "year1-maths-plan.json"

W, H = A4
BLUE = HexColor("#1D4ED8")
NAVY = HexColor("#172B4D")
TEAL = HexColor("#0F766E")
AMBER = HexColor("#D97706")
PALE = HexColor("#EFF6FF")
CREAM = HexColor("#FFF8E8")
LINE = HexColor("#BCD0EA")
GREY = HexColor("#52647A")


CATALOG = {
    1: {
        "number-bonds-10": ("Number bonds to 10", ["0 + 10 = 10", "1 + 9 = 10", "2 + 8 = 10", "3 + 7 = 10", "4 + 6 = 10", "5 + 5 = 10"], "The two parts join to make the whole."),
        "fact-families": ("Addition and subtraction families", ["3 + 5 = 8", "5 + 3 = 8", "8 - 3 = 5", "8 - 5 = 3"], "Use the same three numbers in every fact."),
        "shape-names": ("Shape name clues", ["Circle: curved edge", "Triangle: 3 sides", "Square: 4 equal sides", "Rectangle: 4 sides", "Cube: 6 square faces", "Sphere: one curved surface"], "Look at sides, corners, faces and surfaces."),
        "fractions": ("Halves and quarters", ["1 whole = 2 halves", "1 whole = 4 quarters", "Halves are equal", "Quarters are equal"], "Every part must be the same size."),
        "money": ("UK coins", ["1p, 2p, 5p", "10p, 20p, 50p", "100p = £1", "Choose coins by value"], "Count the value, not the number of coins."),
        "time": ("Clock helper", ["Long hand: minutes", "Short hand: hours", "O'clock: minute hand at 12", "Half past: minute hand at 6"], "Say the hour first, then the minutes."),
    },
    2: {
        "counting": ("Counting patterns", ["2, 4, 6, 8, 10", "5, 10, 15, 20", "10, 20, 30, 40", "Odd and even alternate"], "Say the pattern aloud and point to each number."),
        "bridge-ten": ("Bridge through 10", ["8 + 5 = 8 + 2 + 3", "8 + 2 = 10", "10 + 3 = 13", "13 - 5 = 13 - 3 - 2"], "Partition the second number to reach 10 first."),
        "times-tables": ("2, 5 and 10 times tables", ["2s are even", "5s end in 0 or 5", "10s end in 0", "Multiplication makes equal groups"], "Use counting patterns to recall facts."),
        "fractions": ("Halves, thirds and quarters", ["1 whole = 2 halves", "1 whole = 3 thirds", "1 whole = 4 quarters", "2 quarters = 1 half"], "The denominator tells how many equal parts."),
        "time": ("Telling time to 5 minutes", ["60 minutes = 1 hour", "15 minutes = quarter hour", "30 minutes = half hour", "Count around the clock in 5s"], "Long hand shows minutes; short hand shows hours."),
        "data": ("Pictogram key", ["Read the key first", "One picture may mean more than 1", "Half a picture means half the key", "Count, then multiply by the key"], "Use the key for every symbol."),
    },
    3: {
        "place-value": ("Place value to 1,000", ["1,000 = 10 hundreds", "100 = 10 tens", "10 = 10 ones", "H T O: hundreds, tens, ones"], "A digit's column tells its value."),
        "column-methods": ("Column addition and subtraction", ["Line up place-value columns", "Start with the ones", "Exchange 10 ones for 1 ten", "Exchange 10 tens for 1 hundred"], "Record every exchange before moving columns."),
        "times-tables": ("3, 4 and 8 times tables", ["4x facts are double 2x", "8x facts are double 4x", "3x facts add three each time", "Division is the inverse"], "Use doubles and known facts."),
        "metric": ("Metric measure facts", ["100 cm = 1 m", "1,000 m = 1 km", "1,000 g = 1 kg", "1,000 ml = 1 L"], "Check the unit before calculating."),
        "time": ("Time conversion facts", ["60 seconds = 1 minute", "60 minutes = 1 hour", "24 hours = 1 day", "7 days = 1 week", "12 months = 1 year"], "Convert to the same unit before solving."),
        "fractions": ("Fraction helper", ["Numerator: parts counted", "Denominator: equal parts", "Equivalent fractions have equal value", "Same denominator: compare numerators"], "Draw a bar model when unsure."),
        "angles": ("Turns and angles", ["Quarter turn = 90 degrees", "Half turn = 180 degrees", "Full turn = 360 degrees", "Right angle = 90 degrees"], "Use a right-angle checker."),
        "lines": ("Lines in shapes", ["Parallel: never meet", "Perpendicular: meet at 90 degrees", "Horizontal: across", "Vertical: up and down"], "Trace each line before naming it."),
    },
    4: {
        "place-value": ("Place value to 10,000", ["10 ones = 1 ten", "10 tens = 1 hundred", "10 hundreds = 1 thousand", "10 thousands = 10,000"], "Move one column left to multiply by 10."),
        "times-tables": ("Times tables to 12 x 12", ["Use commutativity: 7 x 8 = 8 x 7", "Use doubles for 4x and 8x", "Use 10x and add 2x for 12x", "Division checks multiplication"], "Build unknown facts from facts you know."),
        "metric": ("Metric conversions", ["1 km = 1,000 m", "1 m = 100 cm", "1 cm = 10 mm", "1 kg = 1,000 g", "1 L = 1,000 ml"], "Larger to smaller: multiply. Smaller to larger: divide."),
        "area-perimeter": ("Perimeter and area", ["Perimeter = distance around", "Rectangle perimeter = 2 x (L + W)", "Area = space inside", "Rectangle area = L x W"], "Write the correct unit: cm or cm squared."),
        "fractions-decimals": ("Fractions and decimals", ["1/2 = 0.5", "1/4 = 0.25", "3/4 = 0.75", "1/10 = 0.1", "1/100 = 0.01"], "Use place value to connect fractions and decimals."),
        "time": ("Time conversions", ["60 seconds = 1 minute", "60 minutes = 1 hour", "24 hours = 1 day", "7 days = 1 week"], "Convert to the same unit before comparing."),
        "angles": ("Angle facts", ["Right angle = 90 degrees", "Straight line = 180 degrees", "Full turn = 360 degrees", "Acute < 90; obtuse > 90"], "Estimate first, then measure."),
        "coordinates": ("Coordinates", ["Write x before y", "Move across, then up", "Origin = (0, 0)", "A point is written (x, y)"], "Along the corridor, up the stairs."),
    },
    5: {
        "factors-primes": ("Factors, multiples and primes", ["Factor: divides exactly", "Multiple: result of multiplying", "Prime: exactly 2 factors", "Square number = n x n", "Cube number = n x n x n"], "Test factor pairs systematically."),
        "fraction-types": ("Fraction forms", ["Proper: numerator < denominator", "Improper: numerator >= denominator", "Mixed number: whole and fraction", "Equivalent fractions have equal value"], "Use division to change an improper fraction."),
        "fdp": ("Fraction, decimal and percentage equivalents", ["1/2 = 0.5 = 50%", "1/4 = 0.25 = 25%", "3/4 = 0.75 = 75%", "1/5 = 0.2 = 20%", "1/10 = 0.1 = 10%"], "Equivalent forms have the same value."),
        "metric": ("Metric conversion chart", ["1 km = 1,000 m", "1 m = 100 cm", "1 cm = 10 mm", "1 kg = 1,000 g", "1 L = 1,000 ml"], "Larger to smaller: multiply. Smaller to larger: divide."),
        "measure-time": ("Measure and time conversions", ["60 sec = 1 min", "60 min = 1 hour", "24 hours = 1 day", "1 inch is about 2.5 cm", "1 mile is about 1.6 km"], "Choose one unit before calculating."),
        "measure-formulas": ("Perimeter, area and volume", ["Rectangle P = 2 x (L + W)", "Rectangle A = L x W", "Square A = side x side", "Cuboid V = L x W x H"], "Use squared units for area and cubed units for volume."),
        "angles": ("Angle facts", ["On a line = 180 degrees", "Around a point = 360 degrees", "Right angle = 90 degrees", "Two right angles = 180 degrees"], "Mark known angles before calculating."),
        "coordinates": ("Coordinates and transformations", ["Coordinates are (x, y)", "Translate: slide", "Reflect: mirror", "Shape size stays the same"], "Describe horizontal movement before vertical movement."),
    },
    6: {
        "place-value": ("Place value and negative numbers", ["10,000,000 = ten million", "A digit is 10x the column to its right", "Negative numbers are below zero", "Count through zero carefully"], "Use a number line to compare negatives."),
        "formal-methods": ("Long multiplication and division", ["Align place-value columns", "Record regrouping clearly", "Long multiplication: include the zero placeholder", "Division: divide, multiply, subtract, bring down"], "Estimate first and use the inverse to check."),
        "bidmas": ("Order of operations", ["B: brackets", "I: indices", "DM: division and multiplication", "AS: addition and subtraction"], "For equal-priority operations, work left to right."),
        "fractions": ("Fraction operations", ["Add/subtract: common denominator", "Multiply: numerator x numerator", "Divide by a fraction: multiply by reciprocal", "Simplify using common factors"], "Estimate the size of the answer first."),
        "fdp": ("Fractions, decimals and percentages", ["1/2 = 0.5 = 50%", "1/4 = 0.25 = 25%", "3/4 = 0.75 = 75%", "1/5 = 0.2 = 20%", "Percentage means out of 100"], "Convert to one form before comparing."),
        "ratio": ("Ratio and proportion", ["Ratio compares parts", "Keep the multiplier equal", "Scale factor multiplies every length", "Use bar models for unequal sharing"], "Find the value of one part first."),
        "algebra": ("Algebra helper", ["A letter represents a number", "Substitute before calculating", "Keep both sides of an equation balanced", "Use the inverse to find an unknown"], "Check by substituting your answer."),
        "conversions": ("Conversion facts", ["1 km = 1,000 m", "1 kg = 1,000 g", "1 L = 1,000 ml", "1 hour = 60 minutes", "1 day = 24 hours"], "Write a conversion step before solving."),
        "formulas": ("Measurement formulas", ["Triangle A = base x height / 2", "Parallelogram A = base x height", "Cuboid V = L x W x H", "Perimeter = total distance around"], "Use squared units for area and cubed units for volume."),
        "angles-circles": ("Angles and circles", ["Line = 180 degrees", "Point = 360 degrees", "Triangle = 180 degrees", "Diameter = 2 x radius", "Radius = diameter / 2"], "Label known facts on the diagram first."),
        "statistics": ("Statistics helper", ["Mean = total / number of values", "Pie chart whole = 360 degrees", "50% of a pie chart = 180 degrees", "Read scales before plotting"], "Check the title, labels, units and key."),
    },
}


WEEK_HINTS = {
    1: {4: "number-bonds-10", 7: "fact-families", 9: "shape-names", 23: "fractions", 24: "fractions", 28: "money", 29: "time"},
    2: {3: "counting", 8: "bridge-ten", 9: "bridge-ten", 13: "times-tables", 14: "times-tables", 15: "times-tables", 18: "fractions", 19: "fractions", 23: "time", 24: "time", 25: "data"},
    3: {1: "place-value", 4: "column-methods", 5: "column-methods", 7: "times-tables", 12: "metric", 13: "metric", 14: "fractions", 16: "fractions", 17: "fractions", 18: "fractions", 21: "time", 22: "angles", 24: "lines", 26: "time", 27: "times-tables"},
    4: {1: "place-value", 3: "place-value", 6: "times-tables", 7: "times-tables", 8: "times-tables", 9: "times-tables", 11: "metric", 12: "area-perimeter", 13: "area-perimeter", 14: "fractions-decimals", 17: "fractions-decimals", 18: "fractions-decimals", 21: "time", 22: "angles", 25: "coordinates", 26: "coordinates"},
    5: {6: "factors-primes", 8: "fraction-types", 13: "fdp", 14: "metric", 15: "measure-time", 16: "measure-formulas", 17: "measure-formulas", 18: "measure-formulas", 19: "angles", 21: "coordinates", 26: "fdp", 27: "metric"},
    6: {1: "place-value", 2: "place-value", 3: "formal-methods", 4: "formal-methods", 6: "bidmas", 11: "fractions", 12: "fractions", 13: "fractions", 14: "fractions", 16: "fdp", 17: "fdp", 18: "ratio", 19: "ratio", 21: "algebra", 22: "algebra", 23: "conversions", 24: "formulas", 25: "formulas", 26: "angles-circles", 28: "statistics"},
}


def draw_wrapped(c: canvas.Canvas, value: str, x: float, y: float, width_chars: int, size: float, colour=NAVY, bold=False, leading=None):
    font = "Helvetica-Bold" if bold else "Helvetica"
    c.setFont(font, size)
    c.setFillColor(colour)
    leading = leading or size * 1.25
    for line in textwrap.wrap(value, width=width_chars) or [""]:
        c.drawString(x, y, line)
        y -= leading
    return y


def create_display(path: Path, year: int, title: str, facts: list[str], note: str):
    c = canvas.Canvas(str(path), pagesize=A4)
    c.setTitle(f"Year {year} helpful hint - {title}")
    c.setFillColor(PALE)
    c.roundRect(30, H - 126, W - 60, 90, 14, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(BLUE)
    c.drawString(48, H - 64, f"YEAR {year} MATHS - HELPFUL HINT")
    draw_wrapped(c, title, 48, H - 91, 39, 23, NAVY, True, 25)

    top = H - 168
    gap = 12
    box_h = min(78, (top - 190 - gap * (len(facts) - 1)) / len(facts))
    for index, fact in enumerate(facts):
        y = top - (index + 1) * box_h - index * gap
        c.setFillColor(CREAM if index % 2 else white)
        c.setStrokeColor(AMBER if index % 2 else LINE)
        c.setLineWidth(1.5)
        c.roundRect(55, y, W - 110, box_h, 10, fill=1, stroke=1)
        c.setFillColor(AMBER)
        c.circle(78, y + box_h / 2, 11, fill=1, stroke=0)
        c.setFillColor(white)
        c.setFont("Helvetica-Bold", 11)
        c.drawCentredString(78, y + box_h / 2 - 4, str(index + 1))
        draw_wrapped(c, fact, 101, y + box_h / 2 + 7, 50, 15, NAVY, True, 18)

    c.setFillColor(PALE)
    c.roundRect(55, 72, W - 110, 78, 12, fill=1, stroke=0)
    c.setFont("Helvetica-Bold", 11)
    c.setFillColor(TEAL)
    c.drawString(74, 126, "REMEMBER")
    draw_wrapped(c, note, 74, 105, 62, 13, NAVY, True, 16)
    c.save()


def create_cards(path: Path, year: int, title: str, facts: list[str], note: str):
    c = canvas.Canvas(str(path), pagesize=A4)
    c.setTitle(f"Year {year} helpful hint book cards - {title}")
    c.setFont("Helvetica", 8)
    c.setFillColor(GREY)
    c.drawCentredString(W / 2, H - 18, f"Year {year} helpful hints - print and trim into six book copies")
    margin, top = 20, H - 30
    card_w = (W - 2 * margin) / 2
    card_h = (top - margin) / 3
    c.setDash(3, 4)
    c.setStrokeColor(HexColor("#94A3B8"))
    c.line(W / 2, margin, W / 2, top)
    c.line(margin, margin + card_h, W - margin, margin + card_h)
    c.line(margin, margin + 2 * card_h, W - margin, margin + 2 * card_h)
    c.setDash()

    for row in range(3):
        for col in range(2):
            x = margin + col * card_w
            y = margin + (2 - row) * card_h
            c.setFillColor(white)
            c.setStrokeColor(LINE)
            c.roundRect(x + 6, y + 6, card_w - 12, card_h - 12, 8, fill=1, stroke=1)
            c.setFillColor(AMBER)
            c.circle(x + 21, y + card_h - 25, 8, fill=1, stroke=0)
            c.setFillColor(white)
            c.setFont("Helvetica-Bold", 9)
            c.drawCentredString(x + 21, y + card_h - 28, "*")
            draw_wrapped(c, title, x + 34, y + card_h - 22, 34, 10, BLUE, True, 11)
            fact_y = y + card_h - 52
            c.setFont("Helvetica", 8)
            c.setFillColor(NAVY)
            for fact in facts[:6]:
                for line in textwrap.wrap(fact, width=42) or [""]:
                    c.drawString(x + 17, fact_y, "- " + line)
                    fact_y -= 10
                fact_y -= 2
            c.setFillColor(CREAM)
            c.roundRect(x + 13, y + 14, card_w - 26, 32, 5, fill=1, stroke=0)
            draw_wrapped(c, note, x + 19, y + 34, 45, 7.5, NAVY, True, 9)
    c.save()


def update_plan(year: int):
    plan_path = PLANS / f"year-{year}.json"
    if year == 1:
        PLANS.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(YEAR1_SOURCE, plan_path)
    plan = json.loads(plan_path.read_text(encoding="utf-8"))
    mapping = WEEK_HINTS[year]
    for week in plan:
        key = mapping.get(int(week["week"]))
        if not key:
            week.pop("topTip", None)
            continue
        title, facts, note = CATALOG[year][key]
        base = f"/resources/maths/year-{year}/hints/{key}"
        week["topTip"] = {
            "title": title,
            "summary": "View the class reference or print six small copies for pupils' books.",
            "facts": facts,
            "display": f"{base}-display.pdf",
            "print": f"{base}-book-cards.pdf",
            "copies": 6,
        }
    plan_path.write_text(json.dumps(plan, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main():
    created = []
    for year, topics in CATALOG.items():
        public_dir = PUBLIC / f"year-{year}" / "hints"
        output_dir = OUTPUT / f"year-{year}"
        public_dir.mkdir(parents=True, exist_ok=True)
        output_dir.mkdir(parents=True, exist_ok=True)
        for key, (title, facts, note) in topics.items():
            display = output_dir / f"{key}-display.pdf"
            cards = output_dir / f"{key}-book-cards.pdf"
            create_display(display, year, title, facts, note)
            create_cards(cards, year, title, facts, note)
            shutil.copyfile(display, public_dir / display.name)
            shutil.copyfile(cards, public_dir / cards.name)
            created.extend((display, cards))
        update_plan(year)
    print(f"Created {len(created)} PDFs across Years 1-6")
    for year in range(1, 7):
        print(f"Year {year}: {len(CATALOG[year])} topics, {len(WEEK_HINTS[year])} selected weeks")


if __name__ == "__main__":
    main()
