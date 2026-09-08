from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "curriculum-plans"


MATHS_UNITS: dict[int, list[str]] = {
    2: [
        "Number — place value within 20", "Number — place value within 100", "Number — count in 2s, 5s and 10s",
        "Number — compare and order numbers to 100", "Number — number bonds and related facts",
        "Calculation — addition and subtraction within 20", "Calculation — add and subtract tens and ones",
        "Calculation — addition across a ten", "Calculation — subtraction across a ten", "Autumn consolidation and assessment",
        "Measurement — recognise and use money", "Calculation — equal groups and repeated addition",
        "Calculation — 2 times table", "Calculation — 5 and 10 times tables", "Calculation — division by sharing and grouping",
        "Measurement — length and height", "Measurement — mass, capacity and temperature",
        "Fractions — halves, quarters and thirds", "Fractions — equivalence and fractions of quantities", "Spring consolidation and assessment",
        "Geometry — properties of 2-D and 3-D shapes", "Geometry — position, direction and turns",
        "Measurement — o'clock, half past and quarter times", "Measurement — tell time to five minutes",
        "Statistics — tally charts and pictograms", "Statistics — block diagrams and simple tables",
        "Calculation — mixed-operation problems", "Measurement — problem solving across measures",
        "Number — reasoning investigations", "Summer assessment and transition to Year 3",
    ],
    3: [
        "Number — place value within 1,000", "Number — compare, order and round three-digit numbers",
        "Calculation — mental addition strategies", "Calculation — formal addition", "Calculation — formal subtraction",
        "Calculation — estimate and use inverse operations", "Calculation — 3, 4 and 8 multiplication facts",
        "Calculation — multiply two-digit numbers by one digit", "Calculation — division with remainders", "Autumn consolidation and assessment",
        "Measurement — money and giving change", "Measurement — length and perimeter", "Measurement — mass and capacity",
        "Fractions — unit and non-unit fractions", "Fractions — fractions on scales and number lines",
        "Fractions — equivalent fractions", "Fractions — add and subtract with the same denominator",
        "Fractions — compare and order fractions", "Fractions — solve problems with quantities", "Spring consolidation and assessment",
        "Measurement — time, Roman numerals and 12/24-hour clocks", "Geometry — right angles and turns",
        "Geometry — properties of 2-D and 3-D shapes", "Geometry — parallel and perpendicular lines",
        "Statistics — pictograms, bar charts and tables", "Measurement — mixed measure problems",
        "Calculation — multiplication and division problems", "Number — multi-step reasoning",
        "Geometry and statistics — investigations", "Summer assessment and transition to Year 4",
    ],
    4: [
        "Number — place value within 10,000", "Number — compare, order, negative numbers and Roman numerals",
        "Number — round to the nearest 10, 100 and 1,000", "Calculation — formal addition and subtraction",
        "Calculation — estimate and use inverse operations", "Calculation — multiplication facts to 12 × 12",
        "Calculation — factor pairs and efficient multiplication", "Calculation — multiply two- and three-digit numbers by one digit",
        "Calculation — divide two- and three-digit numbers", "Autumn consolidation and assessment",
        "Measurement — convert units of length", "Measurement — perimeter of rectilinear shapes", "Measurement — area by counting squares",
        "Fractions — equivalent fractions and families", "Fractions — add and subtract fractions with the same denominator",
        "Decimals — tenths and hundredths", "Decimals — compare, order and round decimals", "Decimals — divide by 10 and 100",
        "Fractions and decimals — problem solving", "Spring consolidation and assessment",
        "Measurement — money with decimals", "Measurement — time and 12/24-hour conversion",
        "Geometry — angles, triangles and quadrilaterals", "Geometry — symmetry in 2-D shapes",
        "Geometry — coordinates and translation", "Statistics — charts, tables and time graphs",
        "Calculation — arithmetic fluency", "Number — multi-step problem solving",
        "Geometry and measure — reasoning investigations", "Summer assessment and transition to Year 5",
    ],
    5: [
        "Number — place value to 1,000,000", "Number — powers of 10 and negative numbers",
        "Number — rounding and Roman numerals", "Calculation — formal addition and subtraction",
        "Calculation — multiply up to four digits by one or two digits", "Calculation — short division",
        "Number — factors, multiples and prime numbers", "Number — squares, cubes and order of operations",
        "Calculation — multiply and divide by 10, 100 and 1,000", "Autumn consolidation and assessment",
        "Fractions — equivalent, improper and mixed numbers", "Fractions — compare and order",
        "Fractions — add and subtract", "Fractions — multiply proper fractions and mixed numbers",
        "Decimals — read, write and understand three decimal places", "Decimals — compare, order and round",
        "Percentages — understand percent as parts per hundred", "Number — connect fractions, decimals and percentages",
        "Number — fraction and decimal problem solving", "Spring consolidation and assessment",
        "Measurement — convert metric, imperial and time units", "Measurement — perimeter and area",
        "Measurement — volume and capacity", "Geometry — estimate, measure and calculate angles",
        "Geometry — properties of shapes", "Geometry — coordinates, translation and reflection",
        "Statistics — line graphs, tables and timetables", "Number — multi-step and financial problems",
        "Mathematical reasoning investigations", "Summer assessment and transition to Year 6",
    ],
    6: [
        "Number — place value to 10,000,000 and negative numbers", "Number — rounding to required accuracy",
        "Calculation — long multiplication", "Calculation — short and long division",
        "Number — common factors, multiples and prime numbers", "Calculation — order of operations",
        "Calculation — mental strategies, estimation and error checking", "Number — multi-step calculation problems",
        "Number — arithmetic fluency", "Autumn consolidation and assessment",
        "Fractions — simplify, compare and order", "Fractions — add and subtract",
        "Fractions — multiply", "Fractions — divide by whole numbers", "Decimals — calculate with decimals",
        "Number — fractions, decimals and percentages", "Percentages — calculate and solve problems",
        "Ratio — language and relationships", "Proportion — scale factors and unequal sharing", "Spring consolidation and assessment",
        "Algebra — sequences, formulae and substitutions", "Algebra — equations and missing-number problems",
        "Measurement — convert units and solve problems", "Measurement — perimeter and area of triangles and parallelograms",
        "Measurement — volume of cuboids", "Geometry — angles, circles and properties of shapes",
        "Geometry — coordinates, translation and reflection", "Statistics — pie charts, line graphs and mean",
        "Mixed reasoning and problem solving", "Summer assessment and transition to secondary Maths",
    ],
}


ENGLISH_UNITS: dict[int, list[str]] = {
    1: [
        "Reading — word reading, blending and common exception words", "Writing — oral sentences, labels and captions",
        "Grammar — spaces, capital letters and full stops", "Grammar — capital letters for names, places, days and I",
        "Grammar — join words and clauses with and", "Writing — sequence and retell a familiar story",
        "Writing — describe characters using precise words", "Grammar — questions and question marks",
        "Grammar — exclamations and exclamation marks", "Autumn consolidation — sentence writing and fluent rereading",
        "Reading and writing — traditional tales", "Writing — settings and simple descriptions",
        "Writing — instructions using ordered steps", "Writing — information texts with headings, labels and facts",
        "Poetry and spoken language — rhyme, rhythm and performance", "Spelling — plurals using s and es",
        "Spelling — verb endings ing, ed, er and est", "Spelling — prefix un and compound words",
        "Spelling — common exception words and contractions", "Spring consolidation — reading, spelling and punctuation",
        "Reading — vocabulary, prediction and sequencing", "Reading — inference from words and pictures",
        "Reading — retrieve facts from non-fiction", "Writing — a first-person recount",
        "Writing — letters, messages and invitations", "Writing — innovate a story with beginning, middle and end",
        "Poetry and spoken language — patterned poems", "Writing — reread, edit and improve sentences",
        "Writing — independent narrative or information outcome", "Summer assessment and transition to Year 2",
    ],
    2: [
        "Reading — fluent decoding, rereading and common exception words", "Spelling — suffixes and longer words",
        "Grammar — statements, questions, exclamations and commands", "Grammar — nouns and expanded noun phrases",
        "Grammar — present and past tense", "Grammar — coordination using and, but and or",
        "Grammar — subordination using when, if, that and because", "Grammar — capital letters, full stops, questions and exclamations",
        "Writing — coherent narrative sequences", "Autumn consolidation — fluency, grammar and composition",
        "Writing — traditional tales and alternative endings", "Writing — personal recounts",
        "Writing — clear instructions", "Writing — non-chronological reports", "Poetry and spoken language — patterns and performance",
        "Spelling — common suffixes and contractions", "Grammar — apostrophes for contraction and singular possession",
        "Grammar — commas in lists", "Writing — link ideas with coordination and subordination", "Spring consolidation — spelling and sentence control",
        "Reading — retrieve and explain key information", "Reading — infer characters' feelings and motives",
        "Reading — predict and sequence events", "Writing — friendly and formal letters",
        "Writing — persuasive posters and simple arguments", "Writing — innovate a narrative",
        "Writing — explanations using clear sequence", "Poetry and spoken language — recite and perform",
        "Writing — edit, proofread and publish", "Summer assessment and transition to Year 3",
    ],
    3: [
        "Reading — fluency, root words, prefixes and suffixes", "Reading — narrative structure and themes",
        "Writing — organise related ideas into paragraphs", "Grammar — expanded noun phrases for detail",
        "Grammar — conjunctions expressing time and cause", "Grammar — adverbs and prepositions expressing time and cause",
        "Grammar — present perfect and past tense", "Grammar — introduce and punctuate direct speech",
        "Spelling — prefixes, suffixes and word families", "Autumn consolidation — paragraphs, tense and punctuation",
        "Writing — myths, legends and traditional stories", "Writing — character viewpoint",
        "Writing — chronological recounts", "Writing — precise instructions", "Writing — non-chronological reports",
        "Writing — explanations organised in paragraphs", "Poetry and spoken language — read, discuss and perform",
        "Spelling — homophones and commonly misspelt words", "Spelling — dictionaries and possessive apostrophes", "Spring consolidation — composition and spelling",
        "Reading — retrieve and summarise main ideas", "Reading — infer and justify with evidence",
        "Reading — explain vocabulary in context", "Writing — persuasive letters and adverts",
        "Writing — letters for different audiences", "Writing — dialogue-led narratives",
        "Writing — information texts using headings", "Spoken language — presentation and discussion",
        "Writing — edit for meaning, grammar and spelling", "Summer assessment and transition to Year 4",
    ],
    4: [
        "Reading — fluent reading and morphological word knowledge", "Reading — themes and conventions across texts",
        "Reading — inference with evidence", "Reading — identify and summarise main ideas",
        "Writing — paragraphing around a theme", "Grammar — nouns and pronouns for cohesion",
        "Grammar — fronted adverbials", "Grammar — commas after fronted adverbials",
        "Grammar — direct speech and reporting clauses", "Autumn consolidation — cohesive paragraphs and punctuation",
        "Writing — setting and character narratives", "Writing — dilemmas and resolutions",
        "Writing — newspaper reports and recounts", "Writing — non-chronological reports", "Writing — explanations",
        "Writing — persuasive speeches and letters", "Poetry and spoken language — imagery and performance",
        "Spelling — prefixes, suffixes and word families", "Grammar — plural and irregular possessive apostrophes", "Spring consolidation — Standard English and editing",
        "Reading — vocabulary choice and authorial effect", "Reading — compare texts and viewpoints",
        "Reading — retrieve, infer and summarise", "Writing — audience and purpose",
        "Writing — balanced viewpoints", "Writing — narrative using controlled dialogue",
        "Writing — information texts with cohesive devices", "Spoken language — performance, presentation and debate",
        "Writing — revise, proofread and publish", "Summer assessment and transition to Year 5",
    ],
    5: [
        "Reading — morphology, etymology and fluent word reading", "Reading — retrieve and record key information",
        "Reading — summarise across paragraphs", "Reading — infer and justify with evidence",
        "Reading — figurative language and vocabulary", "Reading — evaluate authorial choices",
        "Grammar — relative clauses and relative pronouns", "Grammar — modal verbs and adverbs of possibility",
        "Grammar — cohesion within and across paragraphs", "Autumn consolidation — comprehension and sentence control",
        "Writing — narrative viewpoint and voice", "Writing — atmosphere through description",
        "Writing — dialogue that advances action", "Writing — non-chronological reports", "Writing — explanations",
        "Writing — persuasive and balanced arguments", "Writing — formal letters", "Poetry and spoken language — imagery, form and performance",
        "Spelling — statutory patterns, word roots and exceptions", "Spring consolidation — dictionaries, thesauruses and proofreading",
        "Grammar — parentheses, brackets and dashes", "Grammar — commas for clarity and to avoid ambiguity",
        "Grammar — tense choice and consistency", "Reading — compare themes and conventions",
        "Reading — distinguish fact, opinion and viewpoint", "Spoken language — presentation and debate",
        "Writing — plan and research for purpose", "Writing — draft and evaluate effectiveness",
        "Writing — edit, proofread and publish", "Summer assessment and transition to Year 6",
    ],
    6: [
        "Reading — fluent reading, morphology and vocabulary", "Reading — retrieve and summarise precisely",
        "Reading — infer, justify and distinguish evidence", "Reading — compare themes and viewpoints",
        "Reading — analyse language, structure and authorial technique", "Reading — evaluate fact, opinion and bias",
        "Grammar — word classes and sentence functions", "Grammar — formal register and the subjunctive",
        "Grammar — active and passive voice", "Autumn consolidation — reading analysis and grammar",
        "Writing — narrative viewpoint and controlled voice", "Writing — atmosphere, pace and precise description",
        "Writing — dialogue integrated with action", "Writing — formal reports", "Writing — explanations for specialist audiences",
        "Writing — balanced arguments and discussion texts", "Writing — formal letters, speeches and applications",
        "Poetry and spoken language — analyse, compose and perform", "Spelling — statutory words, morphology and etymology", "Spring consolidation — spelling, vocabulary and composition",
        "Grammar — semicolons, colons and dashes between clauses", "Grammar — colons for lists and semicolons within lists",
        "Grammar — hyphens to avoid ambiguity", "Grammar — parenthesis and punctuation for clarity",
        "Writing — cohesive devices across a text", "Reading and writing — précis and concise summary",
        "Writing — research, notes and integrated quotations", "Spoken language — formal presentation and debate",
        "Writing — independent drafting, editing and proofreading", "Summer assessment and transition to secondary English",
    ],
}


def maths_days(unit: str) -> list[str]:
    if "consolidation" in unit.lower() or "assessment" in unit.lower():
        return [
            f"Retrieve and revisit: {unit}",
            f"Diagnose misconceptions: {unit}",
            f"Targeted fluency: {unit}",
            f"Reasoning and problem solving: {unit}",
            f"Assess and plan next steps: {unit}",
        ]
    return [
        f"Introduce and represent: {unit}",
        f"Develop fluency: {unit}",
        f"Compare, connect and explain: {unit}",
        f"Reason and solve problems: {unit}",
        f"Apply, assess and revisit: {unit}",
    ]


def english_days(unit: str) -> list[str]:
    lower = unit.lower()
    if unit.startswith("Reading"):
        return [
            f"Build vocabulary and background knowledge: {unit}",
            f"Read fluently and discuss: {unit}",
            f"Retrieve and clarify: {unit}",
            f"Infer, explain and justify: {unit}",
            f"Respond, review and assess: {unit}",
        ]
    if unit.startswith("Spelling"):
        return [
            f"Investigate the pattern: {unit}",
            f"Sort and explain words: {unit}",
            f"Practise and apply: {unit}",
            f"Dictation and proofreading: {unit}",
            f"Review and assess: {unit}",
        ]
    if unit.startswith("Grammar"):
        return [
            f"Notice the feature in context: {unit}",
            f"Model and explain: {unit}",
            f"Guided sentence practice: {unit}",
            f"Apply in purposeful writing: {unit}",
            f"Edit, explain and assess: {unit}",
        ]
    if "consolidation" in lower or "assessment" in lower:
        return [
            f"Retrieve and revisit: {unit}",
            f"Read and discuss evidence: {unit}",
            f"Targeted grammar and spelling: {unit}",
            f"Independent application: {unit}",
            f"Assess and plan next steps: {unit}",
        ]
    if unit.startswith("Poetry") or unit.startswith("Spoken"):
        return [
            f"Read, listen and respond: {unit}",
            f"Explore language and performance: {unit}",
            f"Rehearse or compose: {unit}",
            f"Revise and refine: {unit}",
            f"Perform, present and reflect: {unit}",
        ]
    return [
        f"Read and analyse a model: {unit}",
        f"Gather vocabulary and rehearse ideas: {unit}",
        f"Plan and model: {unit}",
        f"Draft and develop: {unit}",
        f"Edit, publish and assess: {unit}",
    ]


def build_plan(subject: str, year: int, units: list[str]) -> list[dict[str, object]]:
    if len(units) != 30:
        raise ValueError(f"{subject} Year {year} has {len(units)} weeks, expected 30")
    rows: list[dict[str, object]] = []
    for index, unit in enumerate(units):
        week = index + 1
        term = "Autumn" if week <= 10 else "Spring" if week <= 20 else "Summer"
        days = maths_days(unit) if subject == "maths" else english_days(unit)
        if len(days) != 5:
            raise ValueError(f"{subject} Year {year} Week {week} does not have five lessons")
        rows.append({"week": week, "term": term, "unit": unit, "days": days})
    return rows


def main() -> None:
    for subject, curriculum in (("maths", MATHS_UNITS), ("english", ENGLISH_UNITS)):
        folder = OUTPUT / subject
        folder.mkdir(parents=True, exist_ok=True)
        for year, units in curriculum.items():
            destination = folder / f"year-{year}.json"
            destination.write_text(
                json.dumps(build_plan(subject, year, units), indent=2, ensure_ascii=False) + "\n",
                encoding="utf-8",
            )
            print(f"Created {destination.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
