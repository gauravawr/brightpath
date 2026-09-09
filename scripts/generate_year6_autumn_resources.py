import json
import re
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
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "lessons" / "year-6-maths" / "autumn"
CURRICULUM = ROOT / "public" / "curriculum-plans" / "maths" / "year-6.json"
TERM = "Autumn"

NAVY = "18324A"
TEAL = "2C6E73"
RED = "B4232B"
INK = "17253A"
MUTED = "5F6E7C"
LINE = "D9E0E6"
PALE = "F1F6F6"
WARM = "FBF7F0"
WHITE = "FFFFFF"

FONT = r"C:\Windows\Fonts\arial.ttf"
FONT_BOLD = r"C:\Windows\Fonts\arialbd.ttf"
pdfmetrics.registerFont(TTFont("BPArial", FONT))
pdfmetrics.registerFont(TTFont("BPArialBold", FONT_BOLD))


def slugify(value):
    value = value.lower().replace("'", "")
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")


def lesson(title, objective, model_q, model_a, guided_q, guided_a, practice_q,
           practice_a, challenge_q, challenge_a, misconception, correction,
           *, prior=None, vocabulary=None, resources=None, steps=None):
    return {
        "title": title,
        "objective": objective,
        "modelQuestion": model_q,
        "modelAnswer": model_a,
        "guidedQuestion": guided_q,
        "guidedAnswer": guided_a,
        "practiceQuestion": practice_q,
        "practiceAnswer": practice_a,
        "challengeQuestion": challenge_q,
        "challengeAnswer": challenge_a,
        "misconception": misconception,
        "correction": correction,
        "prior": prior,
        "vocabulary": vocabulary,
        "resources": resources,
        "modelSteps": steps,
    }


WEEKS = [
    {
        "week": 1,
        "unit": "Place value to 10,000,000 and negative numbers",
        "prior": "Read, write, order and compare numbers to 1,000,000 and use negative numbers in familiar contexts.",
        "vocabulary": ["million", "place value", "digit", "partition", "compare", "negative"],
        "resources": "Place value chart to ten million, digit cards, number line crossing zero, mini whiteboards.",
        "steps": ["Read the number in three-digit periods from left to right.", "Record each digit in the correct place-value column.", "Check the value of every zero and compare from the greatest place."],
        "lessons": [
            lesson("Read and write numbers to ten million", "To read and write numbers up to 10,000,000 accurately.", "Read 6,407,215 aloud and write it in words.", "Six million, four hundred and seven thousand, two hundred and fifteen.", "Write 8,030,006 in words.", "Eight million, thirty thousand and six.", "Write in digits: five million, two hundred thousand and nineteen.", "5,200,019.", "Use 8, 8, 0, 0, 3, 1 and 5 once each to make the smallest seven-digit number.", "1,003,588.", "Miro reads 6,407,215 as six million, forty-seven thousand, two hundred and fifteen.", "The zero holds the ten-thousands place, so the middle period is four hundred and seven thousand."),
            lesson("Determine the value of each digit", "To identify and explain the value of digits in numbers to 10,000,000.", "What is the value of 3 in 8,364,219?", "300,000.", "Partition 5,082,407.", "5,000,000 + 80,000 + 2,000 + 400 + 7.", "What is the value of 7 in 4,271,650?", "70,000.", "A number has 6 millions, 4 ten-thousands, 9 hundreds and 2 ones. What is it?", "6,040,902.", "Miro says the 8 in 5,082,407 is worth 8,000.", "The 8 sits in the ten-thousands column, so it is worth 80,000."),
            lesson("Compare and order large numbers", "To compare and order numbers up to 10,000,000.", "Compare 5,906,120 and 5,960,102.", "5,906,120 < 5,960,102.", "Order 7,405,090, 7,450,009 and 7,045,900 from least to greatest.", "7,045,900, 7,405,090, 7,450,009.", "Insert <, > or =: 9,099,999 __ 9,100,001.", "9,099,999 < 9,100,001.", "Find a whole number that lies between 6,799,999 and 6,800,010.", "Any integer from 6,800,000 to 6,800,009, for example 6,800,004.", "Miro compares the final digits first because they are on the right.", "Compare from the greatest place value on the left and stop at the first different digit."),
            lesson("Calculate intervals across zero", "To use negative numbers and calculate intervals across zero.", "What is the difference between -4 and 7?", "11.", "The temperature is -6 C and rises by 9 C. What is it now?", "3 C.", "How far is -12 from 5 on a number line?", "17.", "What number is halfway between -8 and 6?", "-1.", "Miro counts both zero and the starting number when finding the interval from -4 to 7.", "Count the jumps between numbers: 4 jumps to zero and 7 more to reach 7, giving 11."),
            lesson("Solve place-value problems", "To solve and explain problems using large and negative numbers.", "A city has 3,804,215 people. Another has 398,760 fewer. What is the second population?", "3,405,455.", "A lift moves from level -5 to level 18. How many floors does it travel?", "23 floors.", "What is 100,000 more than 6,945,120?", "7,045,120.", "A number rounds to 4,000,000 to the nearest million. Give the smallest possible whole number.", "3,500,000.", "Miro changes more than one digit when adding 100,000 to 6,945,120.", "Add one hundred-thousand and regroup only when needed. The answer is 7,045,120."),
        ],
    },
    {
        "week": 2,
        "unit": "Rounding to a required degree of accuracy",
        "prior": "Round whole numbers to the nearest 10, 100, 1,000, 10,000 and 100,000.",
        "vocabulary": ["round", "nearest", "boundary", "multiple", "accuracy", "estimate"],
        "resources": "Open number lines, place-value chart, digit cards, highlighters, mini whiteboards.",
        "steps": ["Underline the place named in the question.", "Check the digit immediately to its right or locate the two boundaries.", "Round to the nearer multiple and replace following digits with zeros."],
        "lessons": [
            lesson("Round to ten, hundred and thousand", "To round whole numbers to the nearest 10, 100 and 1,000.", "Round 468,753 to the nearest 10, 100 and 1,000.", "468,750; 468,800; 469,000.", "Round 905,449 to the nearest 100.", "905,400.", "Round 279,650 to the nearest 1,000.", "280,000.", "Give three numbers that round to 52,000 to the nearest 1,000.", "Any three from 51,500 to 52,499.", "Miro always rounds up when the number contains a 5 anywhere.", "Only the digit immediately to the right of the rounding place decides the direction."),
            lesson("Round to ten thousand, hundred thousand and one million", "To round large whole numbers to greater powers of ten.", "Round 6,748,219 to the nearest 10,000, 100,000 and 1,000,000.", "6,750,000; 6,700,000; 7,000,000.", "Round 3,451,200 to the nearest 100,000.", "3,500,000.", "Round 8,249,999 to the nearest 1,000,000.", "8,000,000.", "Find the greatest number that rounds to 6,000,000 to the nearest million.", "6,499,999.", "Miro keeps all the digits after the rounding place unchanged.", "After rounding, every digit to the right becomes zero."),
            lesson("Choose the required accuracy", "To round a number to a stated degree of accuracy.", "Round 384,650 to the nearest 10,000 and then to the nearest 1,000.", "380,000 and 385,000.", "Round 2,749,501 to the nearest 100,000.", "2,700,000.", "Round 999,499 to the nearest 1,000.", "999,000.", "A number rounds to 730,000 to the nearest 10,000. State its full possible range.", "725,000 to 734,999.", "Miro rounds to the largest place value he can see instead of the place named.", "The question controls the accuracy. Mark that place before deciding."),
            lesson("Estimate calculations by rounding", "To use rounding to estimate and check calculations.", "Estimate 398,742 + 203,118 by rounding each number to the nearest 100,000.", "400,000 + 200,000 = 600,000.", "Estimate 8,102 x 49 using convenient rounded numbers.", "8,000 x 50 = 400,000.", "Estimate 623,590 - 188,420 to the nearest 100,000.", "600,000 - 200,000 = 400,000.", "Choose an efficient estimate for 48,912 x 198 and explain the accuracy.", "About 50,000 x 200 = 10,000,000. Other justified close estimates are acceptable.", "Miro believes an estimate must equal the exact answer.", "An estimate is deliberately approximate and should show the likely size of the exact answer."),
            lesson("Reason about rounding boundaries", "To solve problems involving rounding ranges and errors.", "What is the smallest whole number that rounds to 86,000 to the nearest 1,000?", "85,500.", "A number rounds to 4,300,000 to the nearest 100,000. What is the greatest possible number?", "4,349,999.", "Is 2,650,000 rounded to the nearest million 3,000,000?", "Yes.", "Two different numbers both round to 720,000 to the nearest 10,000. What is the greatest possible difference?", "9,999, using 715,000 and 724,999.", "Miro includes 85,499 in the range that rounds to 86,000.", "85,499 is nearer 85,000. The lower boundary is 85,500."),
        ],
    },
    {
        "week": 3,
        "unit": "Formal long multiplication",
        "prior": "Multiply up to four digits by one digit and use place value when multiplying by 10 and 100.",
        "vocabulary": ["factor", "product", "partial product", "exchange", "placeholder", "estimate"],
        "resources": "Place-value counters, squared paper, multiplication grid, highlighters, mini whiteboards.",
        "steps": ["Estimate the product before calculating.", "Multiply by the ones, then multiply by the tens using correct place value.", "Add the partial products and compare the answer with the estimate."],
        "lessons": [
            lesson("Revisit multiplication by one digit", "To multiply numbers up to four digits by one digit accurately.", "Calculate 3,482 x 6.", "20,892.", "Calculate 4,706 x 7.", "32,942.", "Calculate 8,035 x 4.", "32,140.", "A product is 27,648 and one factor is 8. What is the other factor?", "3,456.", "Miro forgets to include the exchanged tens when multiplying the next digit.", "Record each exchange clearly and add it to the next place-value product."),
            lesson("Multiply two-digit numbers", "To use long multiplication for two-digit by two-digit calculations.", "Calculate 47 x 36.", "1,692.", "Calculate 68 x 24.", "1,632.", "Calculate 93 x 57.", "5,301.", "Find the missing factor: __ x 48 = 3,456.", "72.", "Miro writes the second partial product directly under the first without a zero placeholder.", "Multiplying by 30 gives tens, so the second row begins in the tens column."),
            lesson("Multiply up to four digits by two digits", "To multiply a number up to four digits by a two-digit number.", "Calculate 2,304 x 27.", "62,208.", "Calculate 4,216 x 34.", "143,344.", "Calculate 3,075 x 46.", "141,450.", "Use compensation to calculate 4,999 x 62.", "309,938.", "Miro treats the 2 in 27 as 2 rather than 20.", "The 2 represents two tens, so its partial product is twenty times the first factor."),
            lesson("Solve long multiplication problems", "To apply long multiplication in multi-step contexts.", "A theatre has 1,248 seats in each of 24 identical sections. How many seats are there?", "29,952 seats.", "A factory packs 2,315 items each day for 32 days. How many items?", "74,080 items.", "A school orders 48 boxes of 1,275 pencils. How many pencils?", "61,200 pencils.", "The school gives 18 pencils to each of 3,200 pupils. How many remain from 61,200?", "3,600 pencils.", "Miro calculates correctly but gives a product with no unit or context.", "Return to the question, label the answer and complete every step in the context."),
            lesson("Explain and check long multiplication", "To identify errors and justify long multiplication methods.", "Miro calculates 326 x 45 as 1,467. Identify the likely place-value error.", "He treated 40 as 4. The correct product is 14,670.", "Which is closer to 4,208 x 29: 120,000 or 1,200,000?", "120,000.", "Calculate and check 6,014 x 38.", "228,532.", "Create a four-digit by two-digit multiplication with a product between 200,000 and 210,000.", "Answers vary, for example 5,000 x 41 = 205,000.", "Miro trusts a written answer without estimating first.", "An estimate reveals place-value errors before the exact calculation is accepted."),
        ],
    },
    {
        "week": 4,
        "unit": "Short and long division",
        "prior": "Use short division by one digit, recall multiplication facts and identify multiples.",
        "vocabulary": ["dividend", "divisor", "quotient", "remainder", "multiple", "estimate"],
        "resources": "Multiplication grids, place-value counters, squared paper, remainder context cards.",
        "steps": ["Estimate the quotient using a nearby multiple.", "Divide one place at a time and record any remainder or exchange.", "Multiply the quotient by the divisor to check the result."],
        "lessons": [
            lesson("Estimate quotients using multiples", "To estimate quotients before using a written method.", "Estimate and then calculate 7,392 / 24.", "About 300; exactly 308.", "Estimate 5,985 / 31.", "About 200 because 6,000 / 30 is 200.", "Which is a better estimate for 8,316 / 42: 20, 200 or 2,000?", "200.", "Find a divisor between 20 and 30 that makes 6,048 divide exactly.", "Possible answers include 21, 24 or 28.", "Miro estimates division by rounding only the dividend.", "Round both numbers to compatible values that are easy to divide."),
            lesson("Use short division with two-digit divisors", "To divide by a two-digit number using short division where appropriate.", "Calculate 3,744 / 12.", "312.", "Calculate 5,616 / 18.", "312.", "Calculate 8,064 / 21.", "384.", "Explain why short division is efficient for 9,600 / 24.", "Known multiples of 24 make each stage manageable; the quotient is 400.", "Miro uses a one-digit division fact and forgets the full two-digit divisor.", "Each quotient digit must represent a multiple of the complete divisor."),
            lesson("Use long division with exact answers", "To divide up to four digits by a two-digit number using long division.", "Calculate 8,736 / 24.", "364.", "Calculate 9,408 / 32.", "294.", "Calculate 7,245 / 35.", "207.", "Calculate 9,984 / 48 and prove the answer by multiplication.", "208 because 208 x 48 = 9,984.", "Miro subtracts the multiple correctly but forgets to bring down the next digit.", "After each subtraction, bring down exactly one next place-value digit."),
            lesson("Interpret division remainders", "To interpret remainders as whole numbers, fractions or rounded answers.", "Calculate 6,745 / 32 and interpret the answer for 32-seat coaches.", "210 remainder 25, so 211 coaches are needed.", "Calculate 5,126 / 24 and write the remainder as a fraction.", "213 remainder 14, or 213 7/12.", "Share 3,850 stickers equally among 16 classes. How many each and how many left?", "240 each with 10 left.", "A 2,500 ml drink fills 180 ml cups. How many full cups?", "13 full cups with 160 ml left.", "Miro always rounds a quotient with a remainder up.", "The context decides whether to round up, round down, keep the remainder or express it as a fraction."),
            lesson("Solve and check division problems", "To select, solve and check division calculations.", "A charity packs 9,360 tins equally into 36 crates. How many tins per crate?", "260.", "4,725 pupils travel in coaches holding 48. How many coaches are needed?", "99 coaches.", "Calculate 7,488 / 26 and check by multiplication.", "288 because 288 x 26 = 7,488.", "Create a division with divisor 28, quotient 135 and remainder 7.", "3,787 / 28 = 135 remainder 7.", "Miro accepts a remainder that is larger than the divisor.", "A valid remainder must be smaller than the divisor."),
        ],
    },
    {
        "week": 5,
        "unit": "Factors, multiples and prime numbers",
        "prior": "Recall multiplication facts, recognise factor pairs and identify square and cube numbers.",
        "vocabulary": ["factor", "multiple", "common", "prime", "composite", "square", "cube"],
        "resources": "Multiplication grids, factor rainbows, counters, hundred square, mini whiteboards.",
        "steps": ["State whether the task concerns factors or multiples.", "Work systematically from the smallest possible factor or multiple.", "Check that the list is complete and use it to justify the conclusion."],
        "lessons": [
            lesson("Find factor pairs systematically", "To identify all factor pairs of a number.", "List every factor pair of 72.", "1 and 72; 2 and 36; 3 and 24; 4 and 18; 6 and 12; 8 and 9.", "List all factors of 48.", "1, 2, 3, 4, 6, 8, 12, 16, 24, 48.", "How many factors does 36 have?", "9 factors.", "Find a number below 100 with exactly 10 factors.", "48 is one example.", "Miro stops checking factor pairs after reaching 5.", "Continue until the first factor meets or passes its paired factor."),
            lesson("Identify common factors", "To find common factors and the highest common factor.", "Find the highest common factor of 84 and 126.", "42.", "List the common factors of 36 and 60.", "1, 2, 3, 4, 6 and 12.", "Find the HCF of 96 and 144.", "48.", "Two numbers have HCF 18. Give a possible pair greater than 50.", "54 and 72 is one example.", "Miro chooses the largest factor from either list rather than the largest shared factor.", "A common factor must divide both numbers exactly."),
            lesson("Find common multiples", "To identify common multiples and the lowest common multiple.", "Find the lowest common multiple of 18 and 24.", "72.", "Write the first three common multiples of 6 and 8.", "24, 48 and 72.", "Find the LCM of 15 and 20.", "60.", "Two traffic lights flash every 12 and 18 seconds. They flash together now. When next?", "After 36 seconds.", "Miro lists factors when the question asks for multiples.", "Multiples continue from repeated multiplication. Factors divide the number exactly."),
            lesson("Classify prime, square and cube numbers", "To identify prime, square and cube numbers.", "Classify 97, 144 and 125.", "97 is prime; 144 is square; 125 is cube.", "Is 91 prime? Explain.", "No, because 91 = 7 x 13.", "Write the square numbers between 50 and 150.", "64, 81, 100, 121 and 144.", "Find a number below 200 that is both a square and a cube.", "64.", "Miro says 1 is prime because it has no factor pairs apart from itself.", "A prime number has exactly two factors. The number 1 has only one factor."),
            lesson("Reason with number properties", "To solve problems using factors, multiples and primes.", "Find the smallest number divisible by 6, 8 and 9.", "72.", "A rectangle has area 96 square units and whole-number sides. Give every possible side pair.", "1 x 96, 2 x 48, 3 x 32, 4 x 24, 6 x 16 and 8 x 12.", "Which prime factors make 84?", "2 x 2 x 3 x 7.", "Find two prime numbers with a sum of 60 and a difference of 14.", "23 and 37.", "Miro assumes every odd number is prime.", "Odd composite numbers have factors other than 1 and themselves, for example 9 and 15."),
        ],
    },
    {
        "week": 6,
        "unit": "Order of operations",
        "prior": "Calculate accurately with the four operations and understand grouping with brackets.",
        "vocabulary": ["operation", "expression", "brackets", "order", "inverse", "equivalent"],
        "resources": "Operation cards, bracket cards, mini whiteboards, four-function examples.",
        "steps": ["Identify brackets and multiplication or division before calculating.", "Work through operations of equal priority from left to right.", "Check by estimating or comparing with an equivalent expression."],
        "lessons": [
            lesson("Read and structure expressions", "To identify the operations and structure of an expression.", "Describe the calculation 48 - 6 x 5 without solving it.", "Multiply 6 by 5, then subtract the product from 48.", "Which operation happens first in 72 / 8 + 4?", "Division.", "Write an expression for subtract 7 from the product of 9 and 6.", "9 x 6 - 7.", "Insert brackets into 8 + 4 x 3 to make the answer 36.", "(8 + 4) x 3 = 36.", "Miro reads every expression strictly from left to right.", "The structure of the expression determines the order, not reading direction alone."),
            lesson("Use multiplication and division before addition and subtraction", "To apply the order of operations without brackets.", "Calculate 18 + 6 x 7.", "60.", "Calculate 90 - 36 / 6.", "84.", "Calculate 120 / 5 + 8 x 3.", "48.", "Use the digits 2, 4 and 8 once to make an expression with answer 34.", "One answer is 2 + 4 x 8 = 34.", "Miro adds 18 and 6 before multiplying by 7.", "Multiplication has priority, so calculate 6 x 7 first."),
            lesson("Use brackets to change the order", "To calculate expressions containing brackets.", "Calculate 240 / (8 + 4).", "20.", "Calculate (75 - 27) x 6.", "288.", "Compare 16 + 8 x 5 with (16 + 8) x 5.", "56 and 120.", "Place one pair of brackets in 100 - 20 / 4 + 1 to make the answer 21.", "(100 - 20) / 4 + 1 = 21.", "Miro ignores brackets because division normally comes first.", "Brackets override the usual priority and must be completed first."),
            lesson("Solve missing-number expressions", "To use inverse operations and structure to find missing values.", "Solve 6 x (n + 5) = 72.", "n = 7.", "Solve 180 / (n - 2) = 30.", "n = 8.", "Find n: 14 + n x 5 = 64.", "n = 10.", "Create two different expressions using n = 4 that both equal 36.", "Examples include 5 x (4 + 3) + 1 and 40 - 4.", "Miro divides 72 by 6 but forgets to subtract the 5 inside the brackets.", "Undo the outer multiplication first, then undo the addition inside the brackets."),
            lesson("Reason about equivalent expressions", "To compare and justify expressions using the order of operations.", "Are 7 x (20 + 3) and 7 x 20 + 7 x 3 equivalent?", "Yes, both equal 161.", "Which is greater: 100 - 8 x 9 or (100 - 8) x 9?", "(100 - 8) x 9 is greater: 828 compared with 28.", "Insert operations between 6, 5 and 4 to make 26.", "6 x 5 - 4 = 26.", "Find three expressions with answer 50 using at least two different operations.", "Answers vary, for example 8 x 6 + 2; 100 / 2; (15 - 5) x 5.", "Miro thinks changing brackets never changes an answer.", "Brackets can change which values combine first, producing a different result."),
        ],
    },
    {
        "week": 7,
        "unit": "Mental strategies, estimation and error checking",
        "prior": "Recall number facts and use place value, partitioning, compensation and inverse operations.",
        "vocabulary": ["mental", "compensation", "partition", "estimate", "inverse", "reasonable"],
        "resources": "Mini whiteboards, place-value chart, empty number lines, strategy cards.",
        "steps": ["Notice the number structure before choosing a method.", "Use a known fact, partition or compensation to calculate efficiently.", "Check the size of the result using estimation or an inverse operation."],
        "lessons": [
            lesson("Use mental addition and subtraction strategies", "To calculate mentally with large numbers using efficient strategies.", "Calculate 499,999 + 235,678 mentally.", "735,677.", "Calculate 802,000 - 399,998 mentally.", "402,002.", "Calculate 675,450 + 99,999.", "775,449.", "Explain two mental methods for 1,000,000 - 456,789.", "543,211. Methods may include complementing or partitioning.", "Miro adds 500,000 instead of 499,999 and forgets to adjust.", "Compensate by subtracting 1 after adding 500,000."),
            lesson("Use mental multiplication and division strategies", "To use factors and place value for mental multiplication and division.", "Calculate 25 x 3,600 mentally.", "90,000.", "Calculate 4,800 / 16 mentally.", "300.", "Calculate 125 x 64 using factors.", "8,000.", "Find three efficient mental methods for 48 x 250.", "12,000. Methods may use 250 = 1,000 / 4 or 48 / 4 x 1,000.", "Miro divides by 4 when multiplying by 25 but forgets to multiply by 100.", "Since 25 = 100 / 4, divide by 4 and then multiply by 100."),
            lesson("Estimate the size of answers", "To estimate answers and identify unreasonable results.", "Estimate 6,782 x 49.", "About 6,800 x 50 = 340,000.", "Estimate 92,410 / 31.", "About 90,000 / 30 = 3,000.", "Estimate 487,205 + 218,770 - 96,420.", "About 490,000 + 220,000 - 100,000 = 610,000.", "A calculator shows 7,204 x 58 = 41,783. Explain without exact calculation why it is wrong.", "The product should be about 7,200 x 60 = 432,000, so the displayed answer is far too small.", "Miro rounds every number to one significant digit even when this gives a poor estimate.", "Choose compatible rounded values that keep the calculation easy and reasonably close."),
            lesson("Check with inverse operations", "To use inverse operations to check calculations.", "Check 7,056 / 24 = 294.", "294 x 24 = 7,056, so the quotient is correct.", "Check 4,398 + 6,725 = 11,123.", "11,123 - 6,725 = 4,398.", "Check 8,402 - 3,765 = 4,637.", "4,637 + 3,765 = 8,402.", "A division has quotient 318 remainder 7 and divisor 29. Find the dividend.", "9,229 because 318 x 29 + 7 = 9,229.", "Miro repeats the same operation and calls it an inverse check.", "Use the opposite operation so the result returns to the starting value."),
            lesson("Choose an efficient calculation method", "To choose and justify mental, written or calculator-supported checking methods.", "Choose an efficient method for 3,998 + 2,507 and calculate.", "Compensation: 4,000 + 2,507 - 2 = 6,505.", "Choose an efficient method for 6,300 / 25.", "Multiply by 4 then divide by 100, or use known multiples: 252.", "Would you use mental or written calculation for 7,382 x 46? Explain and solve.", "A written method is efficient; the product is 339,572.", "Create one calculation best solved mentally and one best solved using a written method. Justify both choices.", "Answers vary. The justification should refer to number structure and accuracy.", "Miro believes the longest written method is always the safest choice.", "An efficient method fits the numbers and still allows a reliable check."),
        ],
    },
    {
        "week": 8,
        "unit": "Multi-step calculation problems",
        "prior": "Select operations, use formal methods and interpret answers in context.",
        "vocabulary": ["multi-step", "operation", "information", "sequence", "sub-total", "solution"],
        "resources": "Bar-model templates, highlighters, problem-solving mats, mini whiteboards.",
        "steps": ["Read the whole problem and mark the question and useful information.", "Plan the operations in order before calculating.", "Complete each step, label sub-totals and check the final answer in context."],
        "lessons": [
            lesson("Plan operations in multi-step problems", "To identify the operations and order needed to solve a problem.", "A shop receives 48 boxes of 125 books and sells 3,760 books. How many remain?", "48 x 125, then subtract 3,760. The answer is 2,240.", "A club collects £18 from each of 236 members, then spends £1,875. How much remains?", "£2,373.", "Write an operation plan for sharing 9,450 items into 35 equal groups and adding 12 spare items to each group.", "Divide 9,450 by 35, then add 12. Each group has 282 items.", "Write a two-step problem represented by (64 x 28) - 950.", "Answers vary. The final answer to the expression is 842.", "Miro begins calculating every number in the order it appears.", "Plan the relationships first. The order of numbers in the text may not match the calculation order."),
            lesson("Solve multi-step addition and subtraction problems", "To solve multi-step problems using addition and subtraction.", "A venue has 125,000 seats. It sells 48,675 morning tickets and 39,890 evening tickets. How many remain?", "36,435 seats.", "A charity target is £500,000. It raises £187,650 then £204,875. How much more is needed?", "£107,475.", "A reservoir holds 2,500,000 litres. It loses 384,750 litres and gains 275,600 litres. New volume?", "2,390,850 litres.", "Create a three-step addition and subtraction problem with final answer 250,000.", "Answers vary. Every step must be labelled and accurate.", "Miro subtracts the two ticket sales separately from the original but loses track of the first subtotal.", "Combine the tickets first or label each new subtotal before continuing."),
            lesson("Solve multi-step multiplication and division problems", "To solve problems involving multiplication and division in sequence.", "A warehouse has 36 pallets with 24 boxes each. It shares all boxes equally among 18 shops. Boxes per shop?", "48 boxes.", "A printer makes 1,250 leaflets per hour for 28 hours and packs them in bundles of 50. How many bundles?", "700 bundles.", "A farmer packs 9,216 apples in trays of 24, then places 16 trays on each trolley. How many trolleys?", "24 trolleys.", "A result is 315 after a two-step multiply-then-divide calculation. Create a valid problem.", "Answers vary, for example 45 x 21 / 3 = 315.", "Miro rounds an intermediate exact answer before completing the second step.", "Keep exact sub-totals unless the context or question asks for rounding."),
            lesson("Solve problems involving money and measures", "To use all four operations in problems with money and measures.", "A class has a £2,500 budget and buys 18 tablets cases at £76 each. How much remains?", "£1,132.", "A 12 km route is split into 8 equal stages. How many metres per stage?", "1,500 m.", "A tank contains 4,500 litres. It fills 28 containers of 125 litres. How much remains?", "1,000 litres.", "A £6,000 budget must cover 48 identical items and leave at least £720. What is the greatest whole-pound price per item?", "£110.", "Miro mixes pounds and pence or kilometres and metres in one calculation.", "Convert to one unit before calculating and label the final unit."),
            lesson("Explain and evaluate multi-step solutions", "To compare solution paths and evaluate the reasonableness of answers.", "Two methods solve 48 x 125 - 3,760. One multiplies first; one subtracts first. Which is valid?", "Multiplication must represent the total books first, so multiply first. The answer is 2,240.", "A solution to 3,840 / 24 x 15 gives 10. Find the error and correct it.", "3,840 / 24 = 160, then 160 x 15 = 2,400.", "Solve 96 x 45 + 8,640 / 32.", "4,590.", "Write a multi-step problem with an unnecessary piece of information and explain why it is unnecessary.", "Answers vary. The unused information must not affect the required calculation.", "Miro assumes every number in a word problem must be used.", "Use only information that changes the quantity asked for."),
        ],
    },
    {
        "week": 9,
        "unit": "Arithmetic fluency and connections",
        "prior": "Use formal methods with whole numbers and prior learning about decimals and fractions.",
        "vocabulary": ["fluency", "efficient", "decimal", "fraction", "equivalent", "simplify", "check"],
        "resources": "Place-value chart, fraction strips, multiplication grid, squared paper, mini whiteboards.",
        "steps": ["Identify the number type and choose an efficient method.", "Keep place values or denominators aligned and record each stage.", "Simplify where needed and check the result for size and reasonableness."],
        "lessons": [
            lesson("Fluency with the four operations", "To calculate accurately with all four operations.", "Calculate 638,475 + 274,806 and 902,140 - 386,759.", "913,281 and 515,381.", "Calculate 6,304 x 27.", "170,208.", "Calculate 8,736 / 24.", "364.", "Choose operations to make a true equation using 48, 12 and 4.", "Examples include 48 / 12 = 4 and 12 x 4 = 48.", "Miro switches methods without checking which operation the question uses.", "Mark the operation and estimate before beginning the exact method."),
            lesson("Revisit decimal calculation", "To add, subtract, multiply and divide decimals accurately.", "Calculate 34.75 + 8.906.", "43.656.", "Calculate 50 - 17.485.", "32.515.", "Calculate 6.4 x 7.", "44.8.", "A number divided by 8 is 3.75. What is the number?", "30.", "Miro lines up the final digits rather than the decimal points.", "Align decimal points so ones, tenths, hundredths and thousandths stay in their columns."),
            lesson("Revisit fraction calculation", "To use equivalent fractions in addition and subtraction.", "Calculate 3/4 + 5/8.", "11/8 or 1 3/8.", "Calculate 2 1/3 - 5/6.", "1 1/2.", "Find 7/12 of 360.", "210.", "Create two different fractions greater than 1 whose sum is 3.", "Answers vary, for example 3/2 + 3/2 = 3.", "Miro adds both numerators and denominators when adding unlike fractions.", "Find equivalent fractions with a common denominator, then add the numerators."),
            lesson("Complete mixed arithmetic efficiently", "To switch accurately between whole-number, decimal and fraction calculations.", "Calculate 3,250 / 25 + 4.8 x 6.", "158.8.", "Calculate 2/3 of 450, then subtract 75.", "225.", "Calculate 6,000 - 48 x 75.", "2,400.", "Write a mixed calculation with answer 100 using a fraction and a whole-number operation.", "Answers vary, for example 1/2 of 240 - 20 = 100.", "Miro carries a method from one number type into the next without checking place value or equivalence.", "Pause at each operation and identify the number representation before choosing the method."),
            lesson("Reason about arithmetic relationships", "To use number relationships to solve arithmetic problems.", "If 4,725 / 35 = 135, find 4,725 / 350.", "13.5.", "If 48 x 125 = 6,000, find 4.8 x 125.", "600.", "Which is greater: 5/6 of 420 or 0.82 of 420?", "5/6 of 420 = 350; 0.82 of 420 = 344.4, so 5/6 is greater.", "Create a chain of three related facts from 2,304 x 27 = 62,208.", "Answers vary, for example 62,208 / 27 = 2,304 and 230.4 x 27 = 6,220.8.", "Miro changes one factor by ten but expects the product to stay unchanged.", "Changing a factor by a power of ten changes the product by the same scale unless another factor compensates."),
        ],
    },
    {
        "week": 10,
        "unit": "Autumn consolidation and assessment",
        "prior": "Autumn learning about place value, rounding, calculation, number properties and problem solving.",
        "vocabulary": ["retrieve", "explain", "justify", "method", "misconception", "next step"],
        "resources": "Mini whiteboards, assessment questions, number lines, multiplication grid, reflection sheet.",
        "steps": ["Retrieve the relevant fact or method before answering.", "Show a clear calculation or representation and explain the decision.", "Check the result, identify any misconception and record the next step."],
        "lessons": [
            lesson("Retrieve place value and rounding", "To retrieve and apply place-value and rounding knowledge.", "Order 6,908,210, 6,890,201 and 6,980,120, then round each to the nearest 100,000.", "Order: 6,890,201; 6,908,210; 6,980,120. Rounded: 6,900,000; 6,900,000; 7,000,000.", "Find the interval from -18 to 27.", "45.", "Give the range of whole numbers that round to 3,600,000 to the nearest 100,000.", "3,550,000 to 3,649,999.", "Create a seven-digit number that rounds down to 5,000,000 to the nearest million and up to 5,400,000 to the nearest 100,000.", "Answers vary, for example 5,360,000.", "Miro applies one rounding rule to every requested place.", "Mark each rounding place separately and reconsider the deciding digit each time."),
            lesson("Retrieve multiplication and division", "To retrieve and apply formal multiplication and division methods.", "Calculate 4,308 x 36 and check using estimation.", "155,088; estimate about 4,300 x 40 = 172,000.", "Calculate 9,072 / 28.", "324.", "A coach holds 46 people. How many coaches are needed for 4,375 people?", "96 coaches.", "Find a four-digit number that divided by 32 gives quotient 125 remainder 9.", "4,009.", "Miro treats a remainder as the final answer without reading the context.", "Interpret the remainder as the context requires after the written division is complete."),
            lesson("Retrieve factors and order of operations", "To retrieve number properties and the order of operations.", "Find the HCF and LCM of 24 and 36.", "HCF 12; LCM 72.", "Calculate 100 - 6 x (8 + 3).", "34.", "Is 221 prime?", "No, 221 = 13 x 17.", "Insert brackets and operations between 8, 6, 4 and 2 to make 40.", "8 x 6 - 4 x 2 = 40. Other correct expressions are acceptable.", "Miro assumes brackets always make an expression larger.", "Brackets change the order. The result may increase, decrease or stay the same."),
            lesson("Apply autumn reasoning", "To solve and explain mixed multi-step problems.", "A school buys 32 packs of 145 books and gives 18 books to each of 240 pupils. How many books remain?", "320 books.", "A journey starts at -12 m, rises 37 m, then drops 18 m. Final position?", "7 m.", "A budget of £20,000 pays for 48 items at £375 each. How much remains?", "£2,000.", "Write a mixed problem using rounding, multiplication and subtraction, then solve it.", "Answers vary. The calculation and rounding decision must be justified.", "Miro completes correct calculations but answers a different question from the one asked.", "Return to the final question, label the answer and test whether it is reasonable in context."),
            lesson("Assess learning and plan next steps", "To demonstrate autumn learning and identify a precise next step.", "Complete: 7,305,019 rounded to 100,000; 2,407 x 38; 7,488 / 26.", "7,300,000; 91,466; 288.", "Find the HCF of 72 and 120, then calculate 18 + 6 x 7.", "HCF 24; result 60.", "Solve: 25 boxes hold 144 items each. 1,275 items are used. How many remain?", "2,325 items.", "Choose one autumn objective and create a diagnostic question that would reveal a common misconception.", "Answers vary. The question must target a specific objective and explain the likely error.", "Miro writes 'more practice' as a next step without naming the knowledge needed.", "A useful next step names the exact concept, example and support required."),
        ],
    },
]


def build_lessons():
    results = []
    for week in WEEKS:
        for day, item in enumerate(week["lessons"], 1):
            item = dict(item)
            item.update({
                "week": week["week"],
                "day": day,
                "unit": week["unit"],
                "slug": slugify(item["title"]),
                "prior": item["prior"] or week["prior"],
                "vocabulary": item["vocabulary"] or week["vocabulary"],
                "resources": item["resources"] or week["resources"],
                "modelSteps": item["modelSteps"] or week["steps"],
            })
            item["successCriteria"] = [
                "I can identify the method or representation the question needs.",
                "I can record each stage accurately and use precise mathematical vocabulary.",
                "I can check my result and explain why it is reasonable.",
            ]
            item["warmup"] = f"Retrieve this prerequisite: {item['prior']}"
            item["guided"] = f"We do: {item['guidedQuestion']} Discuss the method, then reveal {item['guidedAnswer']}"
            item["independent"] = "Use the lower, expected or higher section selected from today's evidence. Every pupil completes a check and an explanation."
            item["plenary"] = f"Exit check: {item['practiceQuestion']} Expected answer: {item['practiceAnswer']}"
            item["preteach"] = {
                "focus": f"Secure the vocabulary and prerequisite knowledge needed for {item['title'].lower()}.",
                "steps": [
                    f"Say and explain: {', '.join(item['vocabulary'][:4])}.",
                    "Use one worked example with smaller or more familiar numbers.",
                    "Rehearse the first step aloud before recording.",
                    "Finish with one question that matches the lesson opening.",
                ],
                "questions": [
                    {"q": f"Which prior skill will help with today's lesson? {item['prior']}", "a": "Pupil identifies a relevant fact, representation or method."},
                    {"q": item["guidedQuestion"], "a": item["guidedAnswer"]},
                    {"q": f"Explain the first step you would take for: {item['modelQuestion']}", "a": item["modelSteps"][0]},
                    {"q": f"Miro says: {item['misconception']} What should Miro check?", "a": item["correction"]},
                ],
            }
            item["lower"] = [
                {"q": f"Read the model: {item['modelQuestion']} Copy or complete the first step.", "a": item["modelAnswer"]},
                {"q": item["guidedQuestion"], "a": item["guidedAnswer"]},
                {"q": item["practiceQuestion"], "a": item["practiceAnswer"]},
                {"q": f"Miro says: {item['misconception']} Is this correct? Explain.", "a": item["correction"]},
            ]
            item["expected"] = [
                {"q": item["modelQuestion"], "a": item["modelAnswer"]},
                {"q": item["guidedQuestion"], "a": item["guidedAnswer"]},
                {"q": item["practiceQuestion"], "a": item["practiceAnswer"]},
                {"q": f"Solve this independently and show every stage: {item['modelQuestion']}", "a": item["modelAnswer"]},
                {"q": f"Use a second method or representation for: {item['guidedQuestion']}", "a": f"Expected result: {item['guidedAnswer']} Method or representation may vary."},
                {"q": f"Check this result using an inverse, estimate or known fact: {item['practiceQuestion']}", "a": f"Expected result: {item['practiceAnswer']} A valid check must be shown."},
                {"q": item["challengeQuestion"], "a": item["challengeAnswer"]},
                {"q": f"Identify and correct this misconception: {item['misconception']}", "a": item["correction"]},
                {"q": "Write a complete sentence explaining how you checked one answer.", "a": "Answer should name an inverse, estimate, boundary, known fact or equivalent representation."},
                {"q": f"Write and solve a similar question to: {item['practiceQuestion']}", "a": "Answers vary. The new question must use the same mathematical structure and include a correct solution."},
            ]
            item["higher"] = [
                {"q": item["challengeQuestion"], "a": item["challengeAnswer"]},
                {"q": f"Prove the answer to this question, rather than only calculating it: {item['modelQuestion']}", "a": f"Expected result: {item['modelAnswer']} Proof or justification must match the lesson structure."},
                {"q": f"Solve this in two different ways and compare them: {item['guidedQuestion']}", "a": f"Expected result: {item['guidedAnswer']} Two valid methods and a comparison are required."},
                {"q": f"Work backwards from the answer to reconstruct the question: {item['practiceAnswer']}", "a": f"One valid reconstruction is: {item['practiceQuestion']} Other equivalent questions are acceptable."},
                {"q": f"Explain why this reasoning fails: {item['misconception']}", "a": item["correction"]},
                {"q": f"Create a new example that tests the same idea as: {item['practiceQuestion']}", "a": "Answers vary. The example and solution must preserve the mathematical structure."},
                {"q": "Find a second method or representation. Compare its efficiency with your first method.", "a": "Answers vary. Comparison should refer to accuracy, number structure and clarity."},
                {"q": "Write one always, sometimes or never statement about today's learning and justify it.", "a": "Answers vary. A valid example and counterexample should support the classification."},
                {"q": "Create a believable incorrect solution. Identify the exact step where the reasoning breaks.", "a": "Answers vary. The error must be mathematically relevant and the correction must be precise."},
                {"q": "Change one value or condition in a question. Explain what changes in the solution and what stays the same.", "a": "Answers vary. The explanation must distinguish the mathematical structure from the changed value."},
            ]
            item["exitQuestions"] = [item["practiceQuestion"], f"What should Miro correct? {item['misconception']}", "Name the check you used today." ]
            item["exitAnswers"] = [item["practiceAnswer"], item["correction"], "A relevant inverse, estimate, boundary, known fact or equivalent representation."]
            results.append(item)
    return results


def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell(cell, text, *, bold=False, color=INK, size=8.2, align=WD_ALIGN_PARAGRAPH.LEFT):
    cell.text = ""
    paragraph = cell.paragraphs[0]
    paragraph.alignment = align
    paragraph.paragraph_format.space_after = Pt(0)
    run = paragraph.add_run(str(text))
    run.bold = bold
    run.font.name = "Arial"
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor.from_string(color)
    cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def set_cell_margins(cell, top=65, start=85, bottom=65, end=85):
    tc_pr = cell._tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for name, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{name}"))
        if node is None:
            node = OxmlElement(f"w:{name}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def format_table(table):
    for row in table.rows:
        tr_pr = row._tr.get_or_add_trPr()
        tr_pr.append(OxmlElement("w:cantSplit"))
        for cell in row.cells:
            set_cell_margins(cell)


def create_teacher_plan(item):
    folder = OUT / f"week-{item['week']}" / item["slug"]
    folder.mkdir(parents=True, exist_ok=True)
    doc = Document()
    section = doc.sections[0]
    section.orientation = WD_ORIENT.LANDSCAPE
    section.page_width = Inches(11)
    section.page_height = Inches(8.5)
    section.top_margin = Inches(0.36)
    section.bottom_margin = Inches(0.34)
    section.left_margin = Inches(0.42)
    section.right_margin = Inches(0.42)

    normal = doc.styles["Normal"]
    normal.font.name = "Arial"
    normal.font.size = Pt(8.2)
    title_style = doc.styles["Title"]
    title_style.font.name = "Arial"
    title_style.font.size = Pt(18)
    title_style.font.bold = True
    title_style.font.color.rgb = RGBColor(0, 0, 0)

    title = doc.add_paragraph(style="Title")
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.paragraph_format.space_after = Pt(1)
    title.add_run(item["title"])
    meta = doc.add_paragraph()
    meta.alignment = WD_ALIGN_PARAGRAPH.CENTER
    meta.paragraph_format.space_after = Pt(4)
    run = meta.add_run(f"Year 6 Maths  |  {TERM}  |  Week {item['week']}  |  Day {item['day']}  |  Editable teacher plan")
    run.bold = True
    run.font.name = "Arial"
    run.font.size = Pt(8.5)
    run.font.color.rgb = RGBColor.from_string(TEAL)

    info = doc.add_table(rows=2, cols=4)
    info.autofit = False
    labels = [
        ("Teacher and class", "[Type here]"),
        ("Date and time", "[Type here]"),
        ("Learning intention", item["objective"]),
        ("Resources", item["resources"]),
    ]
    for index, (label, value) in enumerate(labels):
        row = index // 2
        col = (index % 2) * 2
        shade(info.cell(row, col), NAVY)
        set_cell(info.cell(row, col), label, bold=True, color=WHITE, size=7.8)
        shade(info.cell(row, col + 1), WHITE if row == 0 else PALE)
        set_cell(info.cell(row, col + 1), value, size=7.7)
    format_table(info)

    seq_title = doc.add_paragraph()
    seq_title.paragraph_format.space_before = Pt(3)
    seq_title.paragraph_format.space_after = Pt(2)
    run = seq_title.add_run("Supply teacher sequence  I do  We do  You do")
    run.bold = True
    run.font.name = "Arial"
    run.font.size = Pt(10.5)
    run.font.color.rgb = RGBColor(0, 0, 0)

    sequence = doc.add_table(rows=1, cols=5)
    headers = ["Time", "Phase", "Teacher actions", "Pupil actions and assessment", "Slides"]
    for cell, header in zip(sequence.rows[0].cells, headers):
        shade(cell, NAVY)
        set_cell(cell, header, bold=True, color=WHITE, size=7.6, align=WD_ALIGN_PARAGRAPH.CENTER)
    rows = [
        ("0-6", "Ready and retrieve", f"Check equipment. Share LI. Use: {item['warmup']}", "Mini-whiteboard responses identify the pre-teach group.", "1-2"),
        ("6-20", "I do", f"Model: {item['modelQuestion']} Think aloud: {' '.join(item['modelSteps'])} Answer: {item['modelAnswer']}", "Pupils track each step and explain why it follows.", "3-5"),
        ("20-34", "We do", f"Solve together: {item['guidedQuestion']} Delay the reveal. Expected answer: {item['guidedAnswer']}", "All pupils commit to a step before discussion. Check vocabulary and method.", "6-8"),
        ("34-54", "You do", f"Set the selected worksheet section. Core question: {item['practiceQuestion']}", "Lower uses scaffold and adult prompts. Expected works independently. Higher proves and generalises.", "9-11"),
        ("54-60", "Review", f"Exit question: {item['practiceQuestion']} Address Miro's error: {item['correction']}", "Record initials and one precise next step from the work, not confidence alone.", "12"),
    ]
    for idx, row in enumerate(rows):
        cells = sequence.add_row().cells
        for cell, value in zip(cells, row):
            shade(cell, WHITE if idx % 2 == 0 else PALE)
            set_cell(cell, value, size=7.45)
    format_table(sequence)

    lower = f"Smaller step and scaffold: {item['guidedQuestion']} Use a worked first line, vocabulary prompt and adult check after each stage."
    expected = f"Independent core: {item['practiceQuestion']} Require a complete method and check."
    higher = f"Reasoning and depth: {item['challengeQuestion']} Require proof, comparison or generalisation."
    differentiation = doc.add_table(rows=2, cols=3)
    for cell, text in zip(differentiation.rows[0].cells, ["Lower support", "Expected", "Higher and early finisher"]):
        shade(cell, TEAL)
        set_cell(cell, text, bold=True, color=WHITE, size=7.8, align=WD_ALIGN_PARAGRAPH.CENTER)
    for cell, text in zip(differentiation.rows[1].cells, [lower, expected, higher]):
        shade(cell, WARM)
        set_cell(cell, text, size=7.4)
    format_table(differentiation)

    inclusion = doc.add_table(rows=2, cols=2)
    inclusion_labels = [
        ("Pre-teach and prior learning", item["preteach"]["focus"] + " " + item["prior"]),
        ("Vocabulary", ", ".join(item["vocabulary"])),
        ("SEND, EAL, ADHD, ODD and individual needs", "[Add initials, triggers, communication needs, reasonable adjustments, movement or low-arousal choices, adult prompts and adapted recording.]"),
        ("Assessment notes and next steps", "[Add who is secure, the misconception seen, evidence from independent work and the exact next teaching step.]"),
    ]
    for index, (label, value) in enumerate(inclusion_labels):
        row = index // 2
        col = index % 2
        shade(inclusion.cell(row, col), WHITE if row == 0 else PALE)
        set_cell(inclusion.cell(row, col), f"{label}\n{value}", size=7.35)
        inclusion.cell(row, col).paragraphs[0].runs[0].bold = False
    format_table(inclusion)

    footer = doc.add_paragraph()
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    footer.paragraph_format.space_before = Pt(2)
    footer.paragraph_format.space_after = Pt(0)
    run = footer.add_run(f"Misconception to watch: {item['misconception']}  |  Correction: {item['correction']}")
    run.font.name = "Arial"
    run.font.size = Pt(7.2)
    run.font.color.rgb = RGBColor.from_string(MUTED)

    path = folder / "editable-teacher-plan.docx"
    doc.save(path)
    return path


def draw_wrapped(c, text, x, y, width, font="BPArial", size=10, leading=14, max_lines=None):
    words = str(text).split()
    lines = []
    line = ""
    for word in words:
        candidate = f"{line} {word}".strip()
        if pdfmetrics.stringWidth(candidate, font, size) <= width:
            line = candidate
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    if max_lines:
        lines = lines[:max_lines]
    c.setFont(font, size)
    c.setFillColor(HexColor("#" + INK))
    for text_line in lines:
        c.drawString(x, y, text_line)
        y -= leading
    return y


def pdf_header(c, item, label, page_number):
    width, height = A4
    c.setFillColor(HexColor("#" + NAVY))
    c.rect(0, height - 34, width, 34, fill=1, stroke=0)
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("BPArialBold", 9)
    c.drawString(34, height - 22, "BRIGHTPATH PRIMARY LEARNING")
    c.drawRightString(width - 34, height - 22, f"YEAR 6 MATHS  |  {TERM.upper()}  |  WEEK {item['week']}  |  DAY {item['day']}")
    c.setFillColor(HexColor("#" + MUTED))
    c.setFont("BPArial", 7.5)
    c.drawString(34, 22, label)
    c.drawRightString(width - 34, 22, f"Page {page_number}")


def question_page(c, item, label, questions, page_number, instruction):
    width, height = A4
    pdf_header(c, item, label, page_number)
    c.setFillColor(HexColor("#" + INK))
    c.setFont("BPArialBold", 19)
    c.drawString(38, height - 72, item["title"])
    c.setFont("BPArial", 9)
    c.setFillColor(HexColor("#" + MUTED))
    c.drawString(38, height - 91, instruction)
    c.setStrokeColor(HexColor("#" + LINE))
    c.roundRect(38, height - 129, width - 76, 25, 5, fill=0, stroke=1)
    c.setFont("BPArial", 8.5)
    c.drawString(47, height - 121, "Name: ____________________________________________    Date: __________________")
    top = height - 155
    available = top - 46
    if len(questions) >= 8:
        rows = (len(questions) + 1) // 2
        gap = 12
        column_width = (width - 76 - gap) / 2
        box_height = available / rows
        for position, question in enumerate(questions):
            column = position // rows
            row = position % rows
            x = 38 + column * (column_width + gap)
            row_top = top - row * box_height
            bottom = row_top - box_height
            c.setFillColor(HexColor("#FFFFFF" if position % 2 == 0 else "#" + PALE))
            c.setStrokeColor(HexColor("#" + LINE))
            c.roundRect(x, bottom + 4, column_width, box_height - 8, 5, fill=1, stroke=1)
            c.setFillColor(HexColor("#" + TEAL))
            c.setFont("BPArialBold", 8.5)
            c.drawString(x + 9, row_top - 17, f"{position + 1}.")
            draw_wrapped(c, question["q"], x + 30, row_top - 17, column_width - 40, size=7.8, leading=10, max_lines=6)
    else:
        box_height = min(112, available / max(1, len(questions)))
        for idx, question in enumerate(questions, 1):
            bottom = top - box_height
            c.setFillColor(HexColor("#FFFFFF" if idx % 2 else "#" + PALE))
            c.setStrokeColor(HexColor("#" + LINE))
            c.roundRect(38, bottom + 4, width - 76, box_height - 8, 6, fill=1, stroke=1)
            c.setFillColor(HexColor("#" + TEAL))
            c.setFont("BPArialBold", 10)
            c.drawString(48, top - 18, f"{idx}.")
            draw_wrapped(c, question["q"], 72, top - 18, width - 126, size=9.2, leading=12, max_lines=3)
            top = bottom
    c.showPage()


def answer_page(c, item, label, questions, page_number):
    width, height = A4
    pdf_header(c, item, label, page_number)
    c.setFillColor(HexColor("#" + INK))
    c.setFont("BPArialBold", 19)
    c.drawString(38, height - 72, "Teacher answers and checking prompts")
    if len(questions) >= 8:
        rows = (len(questions) + 1) // 2
        gap = 16
        column_width = (width - 76 - gap) / 2
        row_height = (height - 145) / rows
        for position, question in enumerate(questions):
            column = position // rows
            row = position % rows
            x = 38 + column * (column_width + gap)
            y = height - 105 - row * row_height
            c.setFillColor(HexColor("#" + TEAL))
            c.setFont("BPArialBold", 8)
            c.drawString(x, y, f"{position + 1}.")
            next_y = draw_wrapped(c, question["q"], x + 20, y, column_width - 20, size=7.1, leading=8.5, max_lines=4)
            c.setFillColor(HexColor("#" + INK))
            c.setFont("BPArialBold", 7.1)
            c.drawString(x + 20, next_y - 1, "Answer")
            draw_wrapped(c, question["a"], x + 55, next_y - 1, column_width - 55, size=7.1, leading=8.5, max_lines=4)
    else:
        y = height - 108
        for idx, question in enumerate(questions, 1):
            c.setFont("BPArialBold", 9.2)
            c.setFillColor(HexColor("#" + TEAL))
            c.drawString(42, y, f"{idx}.")
            y = draw_wrapped(c, question["q"], 68, y, width - 116, size=8.5, leading=11, max_lines=2)
            c.setFillColor(HexColor("#" + INK))
            c.setFont("BPArialBold", 8.4)
            c.drawString(68, y - 2, "Answer")
            y = draw_wrapped(c, question["a"], 112, y - 2, width - 160, size=8.4, leading=11, max_lines=3) - 13
    c.showPage()


def create_preteach(item):
    folder = OUT / f"week-{item['week']}" / item["slug"]
    path = folder / "pre-teach.pdf"
    c = canvas.Canvas(str(path), pagesize=A4)
    questions = item["preteach"]["questions"]
    question_page(c, item, "Pre-teach", questions, 1, "Adult-led preparation before the main lesson. Use precise vocabulary and one step at a time.")
    answer_page(c, item, "Pre-teach answers", questions, 2)
    c.save()
    return path


def create_worksheet_pack(item):
    folder = OUT / f"week-{item['week']}" / item["slug"]
    path = folder / "differentiated-worksheets.pdf"
    c = canvas.Canvas(str(path), pagesize=A4)
    sections = [
        ("Lower support", item["lower"], "Use the scaffold, show each step and ask for an adult check when marked."),
        ("Expected", item["expected"], "Work independently. Show a complete method and check at least one answer."),
        ("Higher and early finisher", item["higher"], "Prove, compare or generalise. Write enough reasoning for another pupil to follow."),
    ]
    page = 1
    for label, questions, instruction in sections:
        question_page(c, item, label, questions, page, instruction)
        page += 1
        answer_page(c, item, f"{label} answers", questions, page)
        page += 1
    c.save()
    return path


def update_curriculum(lessons):
    plan = json.loads(CURRICULUM.read_text(encoding="utf-8"))
    by_week = {}
    for item in lessons:
        by_week.setdefault(item["week"], []).append(item["title"])
    for week in plan:
        if week["week"] in by_week:
            week["unit"] = next(w["unit"] for w in WEEKS if w["week"] == week["week"])
            week["days"] = by_week[week["week"]]
    CURRICULUM.write_text(json.dumps(plan, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main():
    lessons = build_lessons()
    OUT.mkdir(parents=True, exist_ok=True)
    data_path = OUT / f"year6-{TERM.lower()}-lessons.json"
    data_path.write_text(json.dumps(lessons, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    update_curriculum(lessons)
    plans = []
    pdfs = []
    for item in lessons:
        plans.append(create_teacher_plan(item))
        pdfs.append(create_preteach(item))
        pdfs.append(create_worksheet_pack(item))
    print(f"Created {len(lessons)} lesson records, {len(plans)} editable plans and {len(pdfs)} PDFs")
    print(data_path.relative_to(ROOT))


if __name__ == "__main__":
    main()
