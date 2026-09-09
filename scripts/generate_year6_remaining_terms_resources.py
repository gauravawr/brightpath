import json
from pathlib import Path

from docx import Document
from docx.enum.section import WD_ORIENT
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

import generate_year6_autumn_resources as base


ROOT = Path(__file__).resolve().parents[1]
EVALUATION_ROOT = ROOT / "public" / "lessons" / "year-6-maths" / "evaluations"


def pair(question, answer):
    return {"q": question, "a": answer}


def week(number, term, unit, prior, vocabulary, resources, steps, focuses, questions, misconception, correction):
    assert len(focuses) == 5 and len(questions) == 5
    lessons = []
    for index, (title, objective) in enumerate(focuses):
        model = questions[index]
        guided = questions[(index + 1) % 5]
        practice = questions[(index + 2) % 5]
        challenge = questions[(index + 3) % 5]
        lessons.append(base.lesson(
            title,
            objective,
            model["q"], model["a"],
            guided["q"], guided["a"],
            practice["q"], practice["a"],
            f"Prove or explain your reasoning: {challenge['q']}",
            f"{challenge['a']} The explanation must show why the method works.",
            misconception,
            correction,
        ))
    return {
        "week": number,
        "term": term,
        "unit": unit,
        "prior": prior,
        "vocabulary": vocabulary,
        "resources": resources,
        "steps": steps,
        "lessons": lessons,
    }


WEEKS = [
    week(11, "Spring", "Fractions - simplify, compare and order",
         "Recognise equivalent fractions and use common factors and multiples.",
         ["numerator", "denominator", "equivalent", "simplify", "common factor", "common denominator"],
         "Fraction strips, multiplication grid, factor cards, number lines, mini whiteboards.",
         ["Identify useful common factors or a common denominator.", "Convert or simplify without changing the fraction's value.", "Compare the new forms and justify the conclusion."],
         [("Generate equivalent fractions", "To generate equivalent fractions using multiplication and division."),
          ("Simplify fractions", "To simplify fractions using the highest common factor."),
          ("Compare fractions", "To compare fractions using a common denominator or numerator."),
          ("Order fractions", "To order fractions greater and less than one."),
          ("Reason about fraction size", "To solve problems involving the relative size of fractions.")],
         [pair("Write 5/6 with denominator 24.", "20/24."), pair("Simplify 42/56.", "3/4."),
          pair("Which is greater, 7/12 or 5/8?", "5/8 because 7/12 = 14/24 and 5/8 = 15/24."),
          pair("Order 2/3, 3/4 and 5/6 from least to greatest.", "2/3, 3/4, 5/6."),
          pair("Give a fraction between 3/5 and 2/3.", "5/8 is one possible answer.")],
         "Miro compares fractions by looking only at the denominators.",
         "Convert the fractions to equivalent forms or use a shared benchmark before comparing."),

    week(12, "Spring", "Fractions - add and subtract",
         "Add and subtract fractions with related denominators and convert improper fractions and mixed numbers.",
         ["common denominator", "equivalent fraction", "improper fraction", "mixed number", "sum", "difference"],
         "Fraction strips, multiplication grid, bar models, squared paper, mini whiteboards.",
         ["Find a common denominator before combining fractions.", "Add or subtract the numerators while keeping the denominator.", "Simplify and convert the answer when appropriate."],
         [("Add fractions with different denominators", "To add proper fractions with different denominators."),
          ("Subtract fractions with different denominators", "To subtract proper fractions with different denominators."),
          ("Add mixed numbers", "To add mixed numbers accurately."),
          ("Subtract mixed numbers", "To subtract mixed numbers using exchange where needed."),
          ("Solve fraction addition problems", "To solve multi-step problems involving fraction addition and subtraction.")],
         [pair("Calculate 3/4 + 5/6.", "1 7/12."), pair("Calculate 7/8 - 5/12.", "11/24."),
          pair("Calculate 2 1/3 + 1 5/6.", "4 1/6."), pair("Calculate 5 1/4 - 2 2/3.", "2 7/12."),
          pair("A jug contains 3 1/2 litres. 1 3/4 litres are used and 2/3 litre is added. How much is in the jug?", "2 5/12 litres.")],
         "Miro adds or subtracts both the numerators and denominators.",
         "Use equivalent fractions with a common denominator, then operate on the numerators only."),

    week(13, "Spring", "Fractions - multiply",
         "Find fractions of quantities and multiply proper fractions and mixed numbers.",
         ["multiply", "product", "fraction of", "cancel", "simplify", "mixed number"],
         "Fraction strips, bar models, multiplication grid, squared paper, mini whiteboards.",
         ["Convert mixed numbers to improper fractions when needed.", "Multiply numerators and denominators, cancelling common factors efficiently.", "Simplify the product and check its size."],
         [("Multiply a fraction by a whole number", "To multiply proper fractions by whole numbers."),
          ("Multiply proper fractions", "To multiply two proper fractions."),
          ("Simplify before multiplying", "To use cancellation to simplify fraction multiplication."),
          ("Multiply mixed numbers", "To multiply a mixed number by a fraction."),
          ("Solve fraction multiplication problems", "To apply fraction multiplication in measures and scaling problems.")],
         [pair("Calculate 4/7 of 21.", "12."), pair("Calculate 1/4 x 3/5.", "3/20."),
          pair("Calculate 2/3 x 9/10 using cancellation.", "3/5."), pair("Calculate 2 1/2 x 3/4.", "1 7/8."),
          pair("A ribbon is 3/5 m long. Maya uses 2/3 of it. How much ribbon does she use?", "2/5 m.")],
         "Miro thinks multiplying always makes a number larger.",
         "Multiplying by a proper fraction finds a part, so the result can be smaller than the starting number."),

    week(14, "Spring", "Fractions - divide by whole numbers",
         "Share unit and non-unit fractions equally and connect division with multiplication by a unit fraction.",
         ["divide", "share", "quotient", "unit fraction", "non-unit fraction", "reciprocal"],
         "Fraction strips, bar models, counters, squared paper, mini whiteboards.",
         ["Represent the fraction as equal parts or use an equivalent multiplication.", "Divide the numerator when possible or multiply the denominator by the whole number.", "Simplify and check by multiplying back."],
         [("Divide unit fractions", "To divide unit fractions by whole numbers."),
          ("Divide non-unit fractions", "To divide proper fractions by whole numbers."),
          ("Use equivalent fractions when dividing", "To choose an equivalent fraction that supports division."),
          ("Divide mixed numbers", "To divide mixed numbers by whole numbers."),
          ("Solve fraction division problems", "To solve sharing problems involving fractional quantities.")],
         [pair("Calculate 1/3 divided by 4.", "1/12."), pair("Calculate 3/4 divided by 2.", "3/8."),
          pair("Calculate 5/6 divided by 3.", "5/18."), pair("Calculate 2 1/4 divided by 3.", "3/4."),
          pair("Seven eighths of a litre is shared equally between 3 cups. How much is in each cup?", "7/24 litre.")],
         "Miro divides both the numerator and denominator by the whole number.",
         "Division changes the size of each share. Use a bar model or multiply by the unit fraction, then simplify."),

    week(15, "Spring", "Decimals - calculate with decimals",
         "Read, write, compare and calculate with decimals to three decimal places.",
         ["decimal point", "place value", "tenths", "hundredths", "thousandths", "exchange"],
         "Decimal place-value chart, base-ten representations, squared paper, money and measure contexts.",
         ["Align digits by place value and include placeholder zeros.", "Calculate using the chosen mental or written method.", "Estimate and check that the decimal point is reasonable."],
         [("Add decimals", "To add decimals with different numbers of decimal places."),
          ("Subtract decimals", "To subtract decimals using exchange."),
          ("Multiply decimals by whole numbers", "To multiply decimals by whole numbers."),
          ("Divide decimals by whole numbers", "To divide decimals by whole numbers."),
          ("Solve decimal problems", "To solve multi-step problems involving decimals and measures.")],
         [pair("Calculate 34.75 + 8.906.", "43.656."), pair("Calculate 50 - 17.485.", "32.515."),
          pair("Calculate 6.408 x 7.", "44.856."), pair("Calculate 28.56 divided by 8.", "3.57."),
          pair("A runner completes 3 laps of 2.375 km and then 1.85 km. How far altogether?", "8.975 km.")],
         "Miro lines up the final digits instead of the decimal points.",
         "Align ones with ones and decimal points vertically so each place-value column stays correct."),

    week(16, "Spring", "Number - fractions, decimals and percentages",
         "Recognise common equivalences and convert between fractions, decimals and percentages.",
         ["fraction", "decimal", "percentage", "equivalent", "hundredths", "convert"],
         "Hundred squares, fraction strips, double number lines, conversion grids, mini whiteboards.",
         ["Choose a representation out of 100 or use division.", "Convert carefully while preserving the value.", "Check the three forms against a benchmark such as one half."],
         [("Convert fractions to decimals", "To convert fractions to terminating decimals."),
          ("Convert decimals to percentages", "To convert decimals to percentages."),
          ("Convert percentages to fractions", "To express percentages as simplified fractions."),
          ("Compare fractions decimals and percentages", "To compare values written in different forms."),
          ("Solve equivalence problems", "To solve missing-value problems using fraction decimal percentage equivalence.")],
         [pair("Write 7/20 as a decimal.", "0.35."), pair("Write 0.625 as a percentage.", "62.5%."),
          pair("Write 35% as a fraction in simplest form.", "7/20."),
          pair("Order 3/5, 0.58 and 62% from least to greatest.", "0.58, 3/5, 62%."),
          pair("Complete: 9/25 = __ = __%.", "0.36 and 36%.")],
         "Miro moves the decimal point without considering the value.",
         "Use a hundred-square model or multiplication and division by 100, then check against a known benchmark."),

    week(17, "Spring", "Percentages - calculate and solve problems",
         "Find percentages of amounts and use percentages in multi-step problems.",
         ["percentage", "per cent", "amount", "discount", "increase", "decrease"],
         "Hundred squares, bar models, double number lines, calculators for checking, mini whiteboards.",
         ["Find a useful percentage such as 10%, 5% or 1%.", "Combine or scale the known percentage to reach the required value.", "Check the result against the whole amount and context."],
         [("Find benchmark percentages", "To calculate 10%, 25%, 50% and 75% of amounts."),
          ("Find non-benchmark percentages", "To calculate percentages by combining known parts."),
          ("Use one per cent", "To calculate any whole-number percentage using the value of 1%."),
          ("Solve percentage change problems", "To solve problems involving percentage discounts and increases."),
          ("Find the whole from a percentage", "To work backwards from a percentage to find the original amount.")],
         [pair("Find 25% of 360.", "90."), pair("Find 35% of 480.", "168."),
          pair("Find 17% of 650.", "110.5."), pair("A £240 coat is reduced by 15%. What is the sale price?", "£204."),
          pair("84 is 35% of a number. What is the number?", "240.")],
         "Miro subtracts the percentage number rather than the percentage amount.",
         "Calculate the percentage of the original amount first, then apply that change in the context."),

    week(18, "Spring", "Ratio - language and relationships",
         "Use multiplicative relationships, ratio notation and equivalent ratios.",
         ["ratio", "for every", "part", "whole", "equivalent", "simplify"],
         "Coloured counters, ratio tables, double number lines, bar models, mini whiteboards.",
         ["Identify which quantities the ratio compares and keep their order.", "Scale both parts by the same factor.", "Check the relationship using a table, bar or sentence."],
         [("Describe ratio relationships", "To describe multiplicative relationships using ratio language."),
          ("Write and interpret ratio notation", "To write ratios in the correct order."),
          ("Generate equivalent ratios", "To generate equivalent ratios by scaling both parts."),
          ("Simplify ratios", "To simplify ratios using common factors."),
          ("Solve ratio problems", "To solve problems using ratio tables and bar models.")],
         [pair("There are 8 red and 12 blue counters. Write red to blue as a ratio.", "8:12, which simplifies to 2:3."),
          pair("Explain the ratio 5:2 in a sentence.", "For every 5 of the first quantity, there are 2 of the second."),
          pair("Complete the equivalent ratio 7:4 = 28:__.", "16."), pair("Simplify 36:48.", "3:4."),
          pair("Paint is mixed red to white in the ratio 3:5. How much white is needed with 18 ml red?", "30 ml.")],
         "Miro adds the same number to both parts to make an equivalent ratio.",
         "Equivalent ratios come from multiplying or dividing both parts by the same factor."),

    week(19, "Spring", "Proportion - scale factors and unequal sharing",
         "Use scale factors and ratio parts to solve proportional problems.",
         ["proportion", "scale factor", "corresponding", "share", "ratio part", "total parts"],
         "Scale drawings, recipes, ratio bars, double number lines, rulers, mini whiteboards.",
         ["Identify the multiplicative scale or total number of ratio parts.", "Apply the factor consistently or find the value of one part.", "Recombine and check the total or corresponding measure."],
         [("Use scale factors", "To enlarge and reduce quantities using scale factors."),
          ("Scale recipes", "To solve recipe problems using direct proportion."),
          ("Find the value of one ratio part", "To find one part before scaling a ratio."),
          ("Share in a ratio", "To divide a quantity into unequal parts."),
          ("Solve multi-step proportion problems", "To combine scale factors and unequal sharing in context.")],
         [pair("A length of 7 cm is enlarged by scale factor 3.5. What is the new length?", "24.5 cm."),
          pair("A recipe for 6 uses 450 g flour. How much flour is needed for 14?", "1,050 g."),
          pair("In the ratio 4:7, the smaller part is 20. What is the larger part?", "35."),
          pair("Share £420 in the ratio 3:4.", "£180 and £240."),
          pair("A map scale is 1 cm to 8 km. Two towns are 6.5 cm apart. Find the real distance.", "52 km.")],
         "Miro uses the scale factor on only one corresponding quantity.",
         "Apply the same multiplicative relationship to every corresponding measure or ratio part."),

    week(20, "Spring", "Spring consolidation and assessment",
         "Spring learning about fractions, decimals, percentages, ratio and proportion.",
         ["retrieve", "represent", "calculate", "justify", "misconception", "next step"],
         "Mini whiteboards, fraction strips, ratio tables, assessment questions, reflection sheet.",
         ["Identify the domain and retrieve the relevant representation or method.", "Show a complete calculation with precise vocabulary.", "Check the result and record a specific next step."],
         [("Retrieve fraction methods", "To retrieve fraction equivalence and calculation methods."),
          ("Retrieve decimal and percentage methods", "To retrieve decimal and percentage calculation methods."),
          ("Diagnose ratio misconceptions", "To identify and correct misconceptions in ratio and proportion."),
          ("Apply spring reasoning", "To solve mixed spring term reasoning problems."),
          ("Assess learning and plan next steps", "To demonstrate spring learning and identify a precise next step.")],
         [pair("Calculate 5/6 + 7/12.", "1 5/12."), pair("Find 37.5% of 640.", "240."),
          pair("Simplify 45:60 and find an equivalent ratio with first part 12.", "3:4 and 12:16."),
          pair("A recipe uses 3/4 kg for 6 people. How much is needed for 14 people?", "1 3/4 kg."),
          pair("Order 0.72, 7/10 and 73%.", "7/10, 0.72, 73%.")],
         "Miro chooses a familiar method before identifying the number type and relationship.",
         "Name the domain first, represent the relationship, then choose and check the calculation."),

    week(21, "Summer", "Algebra - sequences, formulae and substitutions",
         "Recognise rules in number sequences and use simple formulae and symbols.",
         ["sequence", "term", "rule", "variable", "formula", "substitute"],
         "Number cards, function machines, algebra tiles, sequence tables, mini whiteboards.",
         ["Identify what changes and what stays constant.", "Express the relationship with words, a table or a formula.", "Substitute carefully and check against known terms."],
         [("Continue and describe sequences", "To continue sequences and describe their term-to-term rule."),
          ("Find missing terms", "To reason backwards and find missing values in sequences."),
          ("Use simple formulae", "To express a relationship using a formula."),
          ("Substitute into formulae", "To substitute values into formulae accurately."),
          ("Generate terms from a position rule", "To generate sequence terms from a position-to-term rule.")],
         [pair("Continue 7, 12, 17, 22 and state the rule.", "27, 32; add 5."),
          pair("Find the missing terms: 84, __, 62, __, 40.", "73 and 51."),
          pair("Write a formula for the cost C of n tickets at £6 each plus a £4 booking fee.", "C = 6n + 4."),
          pair("Find A when A = 3b + 2c, b = 7 and c = 5.", "31."),
          pair("Find the first five terms of 4n - 1.", "3, 7, 11, 15, 19.")],
         "Miro treats a variable as a label instead of a number that can vary.",
         "State what the variable represents, substitute its value and preserve the operation structure."),

    week(22, "Summer", "Algebra - equations and missing-number problems",
         "Use inverse operations and the structure of equations to find unknown values.",
         ["equation", "unknown", "inverse", "balance", "expression", "solution"],
         "Balance models, function machines, algebra tiles, bar models, mini whiteboards.",
         ["Keep both sides balanced and identify the outer operation.", "Undo operations in reverse order.", "Substitute the solution to check the original equation."],
         [("Solve one-step equations", "To solve one-step equations using inverse operations."),
          ("Solve two-step equations", "To solve two-step equations in a logical order."),
          ("Solve equations with brackets", "To solve equations containing grouped operations."),
          ("Represent word problems with equations", "To form and solve equations from contexts."),
          ("Reason about equivalent equations", "To compare equations and justify whether they have the same solution.")],
         [pair("Solve x + 38 = 91.", "x = 53."), pair("Solve 5x - 7 = 48.", "x = 11."),
          pair("Solve 6(x + 4) = 72.", "x = 8."),
          pair("A number is tripled and 14 is added to make 65. Find the number.", "17."),
          pair("Do 4x + 12 = 40 and 2x + 6 = 20 have the same solution?", "Yes, both give x = 7.")],
         "Miro changes one side of an equation without making the same balanced change to the other side.",
         "Use an inverse operation on the whole equation and check by substitution."),

    week(23, "Summer", "Measurement - convert units and solve problems",
         "Convert between standard units using decimal notation and solve measure problems.",
         ["convert", "metric", "imperial", "scale", "decimal", "equivalent"],
         "Conversion charts, rulers, measuring jugs, scales, double number lines, mini whiteboards.",
         ["Write the conversion fact and identify whether the unit becomes larger or smaller.", "Multiply or divide by the correct scale factor.", "Attach the unit and check the answer's size in context."],
         [("Convert metric lengths", "To convert between millimetres, centimetres, metres and kilometres."),
          ("Convert mass and capacity", "To convert between grams, kilograms, millilitres and litres."),
          ("Use decimal notation in conversions", "To express converted measures using decimals to three places."),
          ("Use approximate imperial conversions", "To use common approximate conversions between imperial and metric units."),
          ("Solve multi-step measure problems", "To solve problems involving more than one unit conversion.")],
         [pair("Convert 4.375 km to metres.", "4,375 m."), pair("Convert 2.65 kg to grams and 3,750 ml to litres.", "2,650 g and 3.75 litres."),
          pair("Write 845 mm in metres.", "0.845 m."), pair("Use 5 miles is about 8 km. Estimate 30 miles in kilometres.", "About 48 km."),
          pair("A 12.5 m roll is cut into 40 cm pieces. How many complete pieces can be cut?", "31 complete pieces, with 10 cm left.")],
         "Miro multiplies whenever converting, regardless of the direction between units.",
         "Use the size of the target unit to decide the direction, then check whether the numerical value should grow or shrink."),

    week(24, "Summer", "Measurement - perimeter and area of triangles and parallelograms",
         "Calculate areas of rectangles and use dimensions and formulae accurately.",
         ["perimeter", "area", "base", "perpendicular height", "triangle", "parallelogram"],
         "Rulers, squared paper, cut-out shapes, formula cards, mini whiteboards.",
         ["Identify the required measure and mark the relevant lengths.", "Use the perpendicular height, not a sloping side, in the area formula.", "Include squared units for area and check by decomposition."],
         [("Distinguish perimeter and area", "To choose whether a problem requires perimeter or area."),
          ("Find the area of parallelograms", "To calculate the area of parallelograms using base and perpendicular height."),
          ("Find the area of triangles", "To calculate the area of triangles."),
          ("Find missing dimensions", "To use a known area to find a missing base or height."),
          ("Solve compound area problems", "To solve problems involving combined triangles and parallelograms.")],
         [pair("A rectangle is 14 cm by 9 cm. Find its area and perimeter.", "Area 126 cm2; perimeter 46 cm."),
          pair("Find the area of a parallelogram with base 12 cm and perpendicular height 7 cm.", "84 cm2."),
          pair("Find the area of a triangle with base 15 cm and perpendicular height 8 cm.", "60 cm2."),
          pair("A triangle has area 54 cm2 and base 12 cm. Find its perpendicular height.", "9 cm."),
          pair("A shape combines a 10 cm by 6 cm rectangle and a triangle with base 10 cm and height 4 cm. Find total area.", "80 cm2.")],
         "Miro uses the sloping side as the height and forgets to halve a triangle's area.",
         "Mark the perpendicular height, use base times height, and divide by two only for a triangle."),

    week(25, "Summer", "Measurement - volume of cuboids",
         "Recognise, estimate and calculate the volume of cubes and cuboids.",
         ["volume", "cuboid", "cube", "length", "width", "height", "cubic unit"],
         "Unit cubes, cuboid nets, multilink cubes, squared paper, rulers, mini whiteboards.",
         ["Identify the three perpendicular dimensions in one unit.", "Multiply length by width by height.", "Use cubic units and compare the result with an estimate."],
         [("Build and count cubic units", "To understand volume as the number of unit cubes filling a space."),
          ("Calculate cuboid volume", "To calculate volume using three dimensions."),
          ("Find missing dimensions", "To find a missing cuboid dimension from its volume."),
          ("Compare cuboid volumes", "To compare volumes when dimensions change."),
          ("Solve volume problems", "To solve multi-step problems involving cuboid volume.")],
         [pair("A solid has 5 layers of 24 unit cubes. What is its volume?", "120 cubic units."),
          pair("Find the volume of a cuboid 12 cm by 7 cm by 5 cm.", "420 cm3."),
          pair("A cuboid has volume 360 cm3, length 12 cm and width 5 cm. Find its height.", "6 cm."),
          pair("Cuboid A is 8 x 6 x 5 cm. Cuboid B is 10 x 6 x 4 cm. Compare their volumes.", "Both are 240 cm3."),
          pair("A box is 40 cm by 25 cm by 30 cm. How many 5 cm cubes fit exactly by volume?", "240 cubes.")],
         "Miro calculates the surface area or adds the three dimensions.",
         "Volume measures space inside a solid, so multiply all three perpendicular dimensions and use cubic units."),

    week(26, "Summer", "Geometry - angles, circles and properties of shapes",
         "Recognise angle relationships and describe circles and two-dimensional shapes.",
         ["angle", "vertically opposite", "interior", "radius", "diameter", "circumference"],
         "Protractors, rulers, compasses, angle cards, shape sets, mini whiteboards.",
         ["Mark known properties and angle facts on the diagram.", "Form a calculation using angles on a line, around a point or inside a shape.", "Check the angle size and label it with degrees."],
         [("Use angles on a line and around a point", "To calculate missing angles using full turns and straight lines."),
          ("Use vertically opposite angles", "To identify and use vertically opposite angles."),
          ("Find angles in triangles and quadrilaterals", "To calculate missing interior angles in polygons."),
          ("Name parts of circles", "To describe radius, diameter and circumference."),
          ("Reason from shape properties", "To classify shapes and solve problems using their properties.")],
         [pair("Angles around a point are 85 degrees, 140 degrees and x. Find x.", "135 degrees."),
          pair("One angle where two straight lines cross is 68 degrees. Find the vertically opposite angle.", "68 degrees."),
          pair("A triangle has angles 47 degrees and 68 degrees. Find the third angle.", "65 degrees."),
          pair("A circle has radius 4.5 cm. What is its diameter?", "9 cm."),
          pair("A quadrilateral has three angles of 92 degrees, 88 degrees and 105 degrees. Find the fourth.", "75 degrees.")],
         "Miro estimates from the drawing even when the diagram is not to scale.",
         "Use labelled values and known geometric facts, then check the total angle relationship."),

    week(27, "Summer", "Geometry - coordinates, translation and reflection",
         "Describe positions in four quadrants and transform shapes on coordinate grids.",
         ["coordinate", "quadrant", "x-axis", "y-axis", "translate", "reflect"],
         "Four-quadrant grids, tracing paper, mirrors, coordinate cards, mini whiteboards.",
         ["Read or record x before y and note the quadrant.", "Apply the same vector or mirror line to every vertex.", "Check side lengths and orientation after the transformation."],
         [("Plot points in four quadrants", "To read and plot coordinates in all four quadrants."),
          ("Describe translations", "To describe translations using horizontal and vertical movement."),
          ("Translate shapes", "To translate every vertex by a given vector."),
          ("Reflect shapes", "To reflect shapes in coordinate axes and other mirror lines."),
          ("Reason about transformations", "To determine missing coordinates after transformations.")],
         [pair("Plot A(-4, 3). Which quadrant contains A?", "Quadrant II."),
          pair("Point P moves from (2, -5) to (-3, 1). Describe the translation.", "5 left and 6 up."),
          pair("Translate (4, -2) by 3 left and 5 up.", "(1, 3)."),
          pair("Reflect (-6, 2) in the y-axis.", "(6, 2)."),
          pair("A point becomes (7, -4) after moving 9 right and 3 down. Find its start.", "(-2, -1).")],
         "Miro changes x and y in the same way without checking the direction or mirror line.",
         "Track horizontal and vertical changes separately and apply the exact transformation to every point."),

    week(28, "Summer", "Statistics - pie charts, line graphs and mean",
         "Interpret and construct statistical representations and calculate the mean.",
         ["data", "frequency", "pie chart", "line graph", "mean", "scale"],
         "Graph paper, rulers, protractors, data tables, calculators for checking, mini whiteboards.",
         ["Read the title, labels, scale and total before calculating.", "Use proportional reasoning or add then divide for the mean.", "State the answer in context and check it against the data range."],
         [("Interpret line graphs", "To read and compare information in line graphs."),
          ("Interpret pie charts", "To use fractions and angles to interpret pie charts."),
          ("Construct pie chart sectors", "To calculate sector angles from frequencies."),
          ("Calculate the mean", "To calculate and interpret the mean average."),
          ("Solve statistical problems", "To compare datasets and explain conclusions from evidence.")],
         [pair("A line graph rises from 18 to 46. What is the increase?", "28."),
          pair("A quarter of a 240-pupil pie chart represents walkers. How many pupils walk?", "60 pupils."),
          pair("In a survey of 60 pupils, 15 choose art. Find the pie-chart angle.", "90 degrees."),
          pair("Find the mean of 12, 15, 18, 11 and 19.", "15."),
          pair("Dataset A has mean 24 over 8 values. Dataset B has total 207 over 9 values. Which mean is greater?", "Dataset A: 24; Dataset B: 23, so A is greater.")],
         "Miro divides by the largest value instead of the number of values when finding the mean.",
         "Add every value, count how many values there are, then divide the total by that count."),

    week(29, "Summer", "Mixed reasoning and problem solving",
         "Select and connect Year 6 methods in unfamiliar and multi-step problems.",
         ["reason", "represent", "strategy", "constraint", "prove", "evaluate"],
         "Problem-solving mats, bar models, rulers, squared paper, mini whiteboards.",
         ["Identify the goal, constraints and useful information before calculating.", "Choose a representation and complete each labelled step.", "Check the solution and explain why it satisfies every condition."],
         [("Choose efficient representations", "To select a diagram, table, equation or written method for a problem."),
          ("Solve multi-step number problems", "To solve problems that connect number domains."),
          ("Solve mixed measure problems", "To combine conversion, area and volume reasoning."),
          ("Solve geometry and statistics problems", "To connect geometric and statistical information."),
          ("Create and critique solutions", "To create, compare and improve mathematical solutions.")],
         [pair("A quantity increases from 240 by 15%, then decreases by 20%. Find the final quantity.", "244.8."),
          pair("Three fifths of a number is 84. Find 35% of the number.", "49."),
          pair("A cuboid is 12 cm by 8 cm by 5 cm. A third of its volume is filled. What volume remains empty?", "320 cm3."),
          pair("A pie-chart sector is 126 degrees and represents 42 pupils. How many pupils are in the survey?", "120 pupils."),
          pair("Create two different calculations using 3/4, 0.6 and 25% that both give 30.", "Answers vary and must preserve the stated values and give 30.")],
         "Miro starts calculating before deciding what the problem asks and which information matters.",
         "Represent the relationships first, label each subtotal and test the final answer against every condition."),

    week(30, "Summer", "Summer assessment and transition to secondary Maths",
         "Year 6 learning across number, ratio, algebra, measure, geometry and statistics.",
         ["retrieve", "apply", "justify", "review", "transition", "next step"],
         "Mini whiteboards, assessment questions, formula reminders, reflection and transition sheet.",
         ["Retrieve the relevant fact, representation or formula.", "Show a complete method and explain the mathematical decision.", "Check the result and record a precise transition target."],
         [("Retrieve number and ratio", "To retrieve and apply number, fraction, percentage and ratio methods."),
          ("Retrieve algebra and measure", "To retrieve algebraic and measurement methods."),
          ("Retrieve geometry and statistics", "To retrieve geometric and statistical methods."),
          ("Apply Year 6 reasoning", "To solve mixed Year 6 reasoning problems."),
          ("Assess learning and plan transition", "To demonstrate Year 6 learning and identify a secondary transition target.")],
         [pair("Calculate 2 1/4 divided by 3, then write the answer as a decimal.", "3/4 or 0.75."),
          pair("Solve 5x + 8 = 73 and convert 3.45 km to metres.", "x = 13 and 3,450 m."),
          pair("Find the area of a triangle with base 18 cm and height 11 cm, then find the mean of 18, 22, 25 and 15.", "99 cm2 and 20."),
          pair("A £640 item is reduced by 12.5%. Find the sale price.", "£560."),
          pair("A cuboid has volume 756 cm3, length 12 cm and width 7 cm. Find its height.", "9 cm.")],
         "Miro records a general target such as 'get better at maths'.",
         "Use assessment evidence to name the exact concept, method, example and support required next."),
]


SCORE_BANDS = [
    {"name": "Lower", "minimum": 0, "maximum": 15, "guidance": "Immediate structured intervention. Re-teach prerequisite concepts with concrete and visual representations."},
    {"name": "Cuspy", "minimum": 16, "maximum": 23, "guidance": "Targeted short intervention. Address two or three misconceptions, then reassess within two weeks."},
    {"name": "Expected", "minimum": 24, "maximum": 31, "guidance": "Secure core understanding. Revisit any domain below half marks and continue mixed retrieval."},
    {"name": "Higher", "minimum": 32, "maximum": 40, "guidance": "Strong understanding. Use proof, generalisation and unfamiliar multi-step problems for depth."},
]


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def create_evaluation_record(term):
    folder = EVALUATION_ROOT / term.lower()
    folder.mkdir(parents=True, exist_ok=True)
    doc = Document()
    section = doc.sections[0]
    section.orientation = WD_ORIENT.LANDSCAPE
    section.page_width = Inches(11)
    section.page_height = Inches(8.5)
    section.top_margin = Inches(0.35)
    section.bottom_margin = Inches(0.35)
    section.left_margin = Inches(0.4)
    section.right_margin = Inches(0.4)
    normal = doc.styles["Normal"]
    normal.font.name = "Arial"
    normal.font.size = Pt(8)
    title_style = doc.styles["Title"]
    title_style.font.name = "Arial"
    title_style.font.size = Pt(18)
    title_style.font.bold = True
    title_style.font.color.rgb = RGBColor(0, 0, 0)

    title = doc.add_paragraph(style="Title")
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.paragraph_format.space_after = Pt(1)
    title.add_run(f"Year 6 Maths {term} Term Evaluation Record")
    meta = doc.add_paragraph()
    meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    meta.paragraph_format.space_after = Pt(4)
    run = meta.add_run("Teacher and class: [Type here]    Assessment date: [Type here]    Review date: [Type here]")
    run.bold = True
    run.font.name = "Arial"
    run.font.size = Pt(8.5)
    run.font.color.rgb = RGBColor.from_string(base.TEAL)

    band_table = doc.add_table(rows=2, cols=4)
    for index, band in enumerate(SCORE_BANDS):
        cell = band_table.cell(0, index)
        base.shade(cell, base.NAVY if index < 2 else base.TEAL)
        base.set_cell(cell, f"{band['name']}  {band['minimum']}-{band['maximum']} / 40", bold=True, color=base.WHITE, size=8, align=WD_ALIGN_PARAGRAPH.CENTER)
        base.shade(band_table.cell(1, index), base.WHITE if index % 2 == 0 else base.PALE)
        base.set_cell(band_table.cell(1, index), band["guidance"], size=7.2)
    base.format_table(band_table)

    note = doc.add_paragraph()
    note.paragraph_format.space_before = Pt(3)
    note.paragraph_format.space_after = Pt(3)
    run = note.add_run("Use the score band as a starting point. Confirm the group from question-level evidence, classroom work and reasonable adjustments. Record one precise intervention and review it.")
    run.font.name = "Arial"
    run.font.size = Pt(7.7)
    run.font.color.rgb = RGBColor.from_string(base.MUTED)

    headers = ["Pupil name", "Score /40", "Band", "Secure knowledge", "Misconception or gap", "Intervention and adult support", "Review evidence"]
    widths = [1.1, .65, .7, 1.65, 1.65, 2.45, 1.65]
    for page in range(2):
        table = doc.add_table(rows=1, cols=len(headers))
        table.autofit = False
        for cell, header, width in zip(table.rows[0].cells, headers, widths):
            cell.width = Inches(width)
            base.shade(cell, base.NAVY)
            base.set_cell(cell, header, bold=True, color=base.WHITE, size=7.1, align=WD_ALIGN_PARAGRAPH.CENTER)
        set_repeat_table_header(table.rows[0])
        for row_number in range(15):
            cells = table.add_row().cells
            values = [f"[{page * 15 + row_number + 1}]", "", "", "", "", "", ""]
            for cell, value, width in zip(cells, values, widths):
                cell.width = Inches(width)
                base.shade(cell, base.WHITE if row_number % 2 == 0 else base.PALE)
                base.set_cell(cell, value, size=7.2)
                cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        base.format_table(table)
        if page == 0:
            doc.add_page_break()
            continuation = doc.add_paragraph()
            continuation.alignment = WD_ALIGN_PARAGRAPH.CENTER
            continuation.paragraph_format.space_after = Pt(4)
            run = continuation.add_run(f"Year 6 Maths {term} Term Evaluation Record  pupils 16-30")
            run.bold = True
            run.font.name = "Arial"
            run.font.size = Pt(13)
            run.font.color.rgb = RGBColor(0, 0, 0)

    path = folder / "editable-teacher-evaluation-record.docx"
    doc.save(path)
    return path


def assessment_page(c, term, questions, page_number, start_number):
    width, height = A4
    c.setFillColor(HexColor("#" + base.NAVY))
    c.rect(0, height - 36, width, 36, fill=1, stroke=0)
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("BPArialBold", 9)
    c.drawString(34, height - 23, "BRIGHTPATH PRIMARY LEARNING")
    c.drawRightString(width - 34, height - 23, f"YEAR 6 MATHS  |  {term.upper()} TERM EVALUATION")
    c.setFillColor(HexColor("#" + base.INK))
    c.setFont("BPArialBold", 19)
    c.drawString(38, height - 72, f"{term} term assessment")
    c.setFont("BPArial", 8.5)
    c.setFillColor(HexColor("#" + base.MUTED))
    c.drawString(38, height - 92, "Answer every question. Show methods and explanations. Each question is worth 2 marks.")
    c.setStrokeColor(HexColor("#" + base.LINE))
    c.roundRect(38, height - 127, width - 76, 23, 5, fill=0, stroke=1)
    c.setFont("BPArial", 8)
    c.drawString(47, height - 120, "Name: ____________________________________________    Date: __________________")
    top = height - 148
    rows = 5
    gap = 10
    column_width = (width - 76 - gap) / 2
    box_height = (top - 42) / rows
    for position, item in enumerate(questions):
        column = position // rows
        row = position % rows
        x = 38 + column * (column_width + gap)
        row_top = top - row * box_height
        bottom = row_top - box_height
        c.setFillColor(HexColor("#FFFFFF" if position % 2 == 0 else "#" + base.PALE))
        c.setStrokeColor(HexColor("#" + base.LINE))
        c.roundRect(x, bottom + 4, column_width, box_height - 8, 5, fill=1, stroke=1)
        c.setFillColor(HexColor("#" + base.TEAL))
        c.setFont("BPArialBold", 8)
        c.drawString(x + 8, row_top - 16, f"{start_number + position}.  [2]")
        base.draw_wrapped(c, item["q"], x + 44, row_top - 16, column_width - 52, size=7.4, leading=9, max_lines=5)
    c.setFillColor(HexColor("#" + base.MUTED))
    c.setFont("BPArial", 7.5)
    c.drawString(34, 22, f"Pupil assessment  |  {term} term")
    c.drawRightString(width - 34, 22, f"Page {page_number} of 5")
    c.showPage()


def mark_scheme_page(c, term, questions, page_number, start_number):
    width, height = A4
    c.setFillColor(HexColor("#" + base.NAVY))
    c.rect(0, height - 36, width, 36, fill=1, stroke=0)
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("BPArialBold", 9)
    c.drawString(34, height - 23, "BRIGHTPATH PRIMARY LEARNING")
    c.drawRightString(width - 34, height - 23, f"{term.upper()} TERM MARK SCHEME")
    c.setFillColor(HexColor("#" + base.INK))
    c.setFont("BPArialBold", 19)
    c.drawString(38, height - 72, "Answers and evidence")
    y = height - 106
    for position, item in enumerate(questions):
        number = start_number + position
        c.setFillColor(HexColor("#" + base.TEAL))
        c.setFont("BPArialBold", 8)
        c.drawString(40, y, f"{number}. [2]")
        y = base.draw_wrapped(c, item["q"], 84, y, width - 126, size=7.5, leading=9, max_lines=3)
        c.setFont("BPArialBold", 7.5)
        c.setFillColor(HexColor("#" + base.INK))
        c.drawString(84, y - 1, "Answer")
        y = base.draw_wrapped(c, item["a"], 126, y - 1, width - 168, size=7.5, leading=9, max_lines=3) - 10
    c.setFillColor(HexColor("#" + base.MUTED))
    c.setFont("BPArial", 7.5)
    c.drawString(34, 22, "Award 1 mark for a sound method and 1 mark for an accurate answer unless professional judgement requires an adjustment.")
    c.drawRightString(width - 34, 22, f"Page {page_number} of 5")
    c.showPage()


def band_guidance_page(c, term):
    width, height = A4
    c.setFillColor(HexColor("#" + base.NAVY))
    c.rect(0, height - 36, width, 36, fill=1, stroke=0)
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("BPArialBold", 9)
    c.drawString(34, height - 23, "BRIGHTPATH PRIMARY LEARNING")
    c.drawRightString(width - 34, height - 23, f"{term.upper()} TERM EVALUATION GUIDE")
    c.setFillColor(HexColor("#" + base.INK))
    c.setFont("BPArialBold", 19)
    c.drawString(38, height - 76, "Score bands and intervention response")
    y = height - 125
    for band in SCORE_BANDS:
        c.setFillColor(HexColor("#" + (base.NAVY if band["name"] in ("Lower", "Cuspy") else base.TEAL)))
        c.roundRect(38, y - 78, width - 76, 68, 7, fill=1, stroke=0)
        c.setFillColor(HexColor("#FFFFFF"))
        c.setFont("BPArialBold", 13)
        c.drawString(54, y - 34, f"{band['name']}  {band['minimum']}-{band['maximum']} / 40")
        base.draw_wrapped(c, band["guidance"], 220, y - 30, width - 280, font="BPArial", size=8.5, leading=11, max_lines=4)
        y -= 92
    c.setFillColor(HexColor("#" + base.INK))
    c.setFont("BPArialBold", 11)
    c.drawString(38, y - 8, "Teacher decision")
    base.draw_wrapped(c, "Use the band as a starting point. Review which questions were secure, classroom evidence, attendance, language needs and reasonable adjustments. Record a precise intervention, named adult, frequency and review date in the editable evaluation record.", 38, y - 30, width - 76, size=9, leading=13, max_lines=6)
    c.setFillColor(HexColor("#" + base.MUTED))
    c.setFont("BPArial", 7.5)
    c.drawString(34, 22, "The score band supports teacher judgement and does not replace it.")
    c.drawRightString(width - 34, 22, "Page 5 of 5")
    c.showPage()


def create_term_assessment(term, lessons):
    selected = []
    for week_number in range(min(item["week"] for item in lessons), max(item["week"] for item in lessons) + 1):
        week_items = [item for item in lessons if item["week"] == week_number]
        selected.extend([{"q": week_items[0]["practiceQuestion"], "a": week_items[0]["practiceAnswer"]},
                         {"q": week_items[3]["challengeQuestion"], "a": week_items[3]["challengeAnswer"]}])
    assert len(selected) == 20
    folder = EVALUATION_ROOT / term.lower()
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / "term-assessment-and-mark-scheme.pdf"
    c = canvas.Canvas(str(path), pagesize=A4)
    assessment_page(c, term, selected[:10], 1, 1)
    assessment_page(c, term, selected[10:], 2, 11)
    mark_scheme_page(c, term, selected[:10], 3, 1)
    mark_scheme_page(c, term, selected[10:], 4, 11)
    band_guidance_page(c, term)
    c.save()
    metadata = {
        "term": term,
        "totalMarks": 40,
        "assessmentPages": 5,
        "recordPages": 2,
        "bands": SCORE_BANDS,
    }
    (folder / "evaluation.json").write_text(json.dumps(metadata, indent=2) + "\n", encoding="utf-8")
    return path


def build_term(term):
    term_weeks = [item for item in WEEKS if item["term"] == term]
    base.TERM = term
    base.OUT = ROOT / "public" / "lessons" / "year-6-maths" / term.lower()
    base.WEEKS = term_weeks
    lessons = base.build_lessons()
    base.OUT.mkdir(parents=True, exist_ok=True)
    data_path = base.OUT / f"year6-{term.lower()}-lessons.json"
    data_path.write_text(json.dumps(lessons, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    base.update_curriculum(lessons)
    for item in lessons:
        base.create_teacher_plan(item)
        base.create_preteach(item)
        base.create_worksheet_pack(item)
    return lessons


def main():
    all_terms = {}
    for term in ("Spring", "Summer"):
        all_terms[term] = build_term(term)
        print(f"Created {len(all_terms[term])} {term} lesson records, plans and PDF packs")
    autumn = json.loads((ROOT / "public" / "lessons" / "year-6-maths" / "autumn" / "year6-autumn-lessons.json").read_text(encoding="utf-8"))
    for term, lessons in (("Autumn", autumn), ("Spring", all_terms["Spring"]), ("Summer", all_terms["Summer"])):
        create_evaluation_record(term)
        create_term_assessment(term, lessons)
        print(f"Created {term} evaluation assessment and editable record")


if __name__ == "__main__":
    main()
