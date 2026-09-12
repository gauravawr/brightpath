export const EXPLICIT_WORKED_STEPS = {
  "1-1": ["6,407,215", "6,000,000 + 400,000 + 7,000 + 200 + 10 + 5", "6 million, 407 thousand, 215", "Six million, four hundred and seven thousand, two hundred and fifteen"],
  "1-2": ["8,364,219", "3 is in the hundred-thousands column", "3 × 100,000", "300,000"],
  "1-3": ["5,906,120     5,960,102", "Millions: 5 = 5", "Hundred-thousands: 9 = 9", "Ten-thousands: 0 < 6", "5,906,120 < 5,960,102"],
  "1-4": ["-4 to 0 = 4 steps", "0 to 7 = 7 steps", "4 + 7 = 11", "The difference is 11"],
  "1-5": ["3,804,215 - 398,760", "3,804,215 - 400,000 = 3,404,215", "398,760 is 1,240 less than 400,000", "3,404,215 + 1,240 = 3,405,455"],

  "2-1": ["468,753 to nearest 10: ones digit 3", "468,753 → 468,750", "Nearest 100: tens digit 5, so round up → 468,800", "Nearest 1,000: hundreds digit 7, so round up → 469,000"],
  "2-2": ["Nearest 10,000: 8,219 ≥ 5,000 → 6,750,000", "Nearest 100,000: 48,219 < 50,000 → 6,700,000", "Nearest 1,000,000: 748,219 ≥ 500,000", "6,748,219 → 7,000,000"],
  "2-3": ["384,650 to nearest 10,000: 4,650 < 5,000", "384,650 → 380,000", "384,650 to nearest 1,000: 650 ≥ 500", "384,650 → 385,000"],
  "2-4": ["398,742 → 400,000", "203,118 → 200,000", "400,000 + 200,000", "Estimated total = 600,000"],
  "2-5": ["Numbers rounding to 86,000 lie from 85,500 to 86,499", "Lower boundary = 86,000 - 500", "86,000 - 500 = 85,500", "Smallest whole number = 85,500"],

  "3-1": ["3,482 × 6", "6 × 2 = 12: write 2, carry 1", "6 × 8 + 1 = 49: write 9, carry 4", "6 × 4 + 4 = 28: write 8, carry 2", "6 × 3 + 2 = 20 → 20,892"],
  "3-2": ["47 × 36", "47 × 6 = 282", "47 × 30 = 1,410", "282 + 1,410", "1,692"],
  "3-3": ["2,304 × 27", "2,304 × 7 = 16,128", "2,304 × 20 = 46,080", "16,128 + 46,080", "62,208"],
  "3-4": ["1,248 seats × 24 sections", "1,248 × 4 = 4,992", "1,248 × 20 = 24,960", "4,992 + 24,960", "29,952 seats"],
  "3-5": ["326 × 45", "326 × 5 = 1,630", "326 × 40 = 13,040", "1,630 + 13,040 = 14,670", "Miro used 4 instead of 40"],

  "4-1": ["24 times table: 24, 48, 72, 96, 120, 144, 168, 192, 216", "73 ÷ 24: choose 72 = 24 × 3; write 3", "73 - 72 = 1; bring down 9 → 19; write 0", "Bring down 2 → 192; choose 192 = 24 × 8; write 8", "Quotient = 308", "Check: 308 × 24 = 7,392"],
  "4-2": ["12 times table: 12, 24, 36, 48, 60, 72, 84, 96, 108", "37 ÷ 12: choose 36 = 12 × 3; write 3", "37 - 36 = 1; bring down 4 → 14; choose 12; write 1", "14 - 12 = 2; bring down 4 → 24; choose 24; write 2", "Quotient = 312", "Check: 312 × 12 = 3,744"],
  "4-3": ["24 times table: 24, 48, 72, 96, 120, 144, 168, 192, 216", "87 ÷ 24: choose 72 = 24 × 3; write 3", "87 - 72 = 15; bring down 3 → 153; choose 144; write 6", "153 - 144 = 9; bring down 6 → 96; choose 96; write 4", "Quotient = 364", "Check: 364 × 24 = 8,736"],
  "4-4": ["32 times table: 32, 64, 96, 128, 160, 192, 224, 256, 288", "67 ÷ 32: choose 64 = 32 × 2; write 2", "67 - 64 = 3; bring down 4 → 34; choose 32; write 1", "34 - 32 = 2; bring down 5 → 25; write 0 remainder 25", "Quotient = 210 remainder 25", "25 pupils still need seats, so 211 coaches"],
  "4-5": ["36 times table: 36, 72, 108, 144, 180, 216, 252, 288, 324", "93 ÷ 36: choose 72 = 36 × 2; write 2", "93 - 72 = 21; bring down 6 → 216; choose 216; write 6", "216 - 216 = 0; bring down 0; write 0", "Quotient = 260", "260 tins per crate"],

  "5-1": ["1 × 72 = 72", "2 × 36 = 72", "3 × 24 = 72     4 × 18 = 72", "6 × 12 = 72     8 × 9 = 72", "Stop after 8 × 9 because the factors would repeat"],
  "5-2": ["Factors of 84: 1, 2, 3, 4, 6, 7, 12, 14, 21, 28, 42, 84", "Factors of 126: 1, 2, 3, 6, 7, 9, 14, 18, 21, 42, 63, 126", "Common factors: 1, 2, 3, 6, 7, 14, 21, 42", "Highest common factor = 42"],
  "5-3": ["Multiples of 18: 18, 36, 54, 72, ...", "Multiples of 24: 24, 48, 72, ...", "First common multiple = 72", "LCM(18, 24) = 72"],
  "5-4": ["97: test primes up to √97; none divide exactly → prime", "144 = 12 × 12 → square", "125 = 5 × 5 × 5 → cube", "97 prime     144 square     125 cube"],
  "5-5": ["6 = 2 × 3     8 = 2³     9 = 3²", "Use the greatest power of each prime", "2³ × 3² = 8 × 9", "Smallest common multiple = 72"],

  "6-1": ["48 - 6 × 5", "Multiplication comes before subtraction", "6 × 5 = 30", "Then calculate 48 - 30"],
  "6-2": ["18 + 6 × 7", "6 × 7 = 42", "18 + 42", "60"],
  "6-3": ["240 ÷ (8 + 4)", "Brackets first: 8 + 4 = 12", "240 ÷ 12", "20"],
  "6-4": ["6 × (n + 5) = 72", "n + 5 = 72 ÷ 6", "n + 5 = 12", "n = 12 - 5", "n = 7"],
  "6-5": ["7 × (20 + 3)", "7 × 23 = 161", "7 × 20 + 7 × 3 = 140 + 21", "140 + 21 = 161", "Both expressions equal 161"],

  "7-1": ["499,999 + 235,678", "Think 500,000 + 235,678", "500,000 + 235,678 = 735,678", "Compensate: 735,678 - 1", "735,677"],
  "7-2": ["25 × 3,600", "25 × 36 × 100", "25 × 36 = 900", "900 × 100", "90,000"],
  "7-3": ["6,782 × 49", "6,782 → 6,800", "49 → 50", "6,800 × 50", "Estimate = 340,000"],
  "7-4": ["Claim: 7,056 ÷ 24 = 294", "Check with the inverse: 294 × 24", "294 × 20 = 5,880     294 × 4 = 1,176", "5,880 + 1,176 = 7,056", "The quotient 294 is correct"],
  "7-5": ["3,998 + 2,507", "Compensate 3,998 to 4,000", "4,000 + 2,507 = 6,507", "Subtract the extra 2", "6,507 - 2 = 6,505"],

  "8-1": ["48 boxes × 125 books", "48 × 125 = 6,000 books received", "6,000 - 3,760", "Books remaining = 2,240"],
  "8-2": ["Tickets sold: 48,675 + 39,890", "48,675 + 39,890 = 88,565", "125,000 - 88,565", "Seats remaining = 36,435"],
  "8-3": ["36 pallets × 24 boxes", "36 × 24 = 864 boxes", "864 ÷ 18", "48 boxes per shop"],
  "8-4": ["18 cases × £76", "18 × £76 = £1,368", "£2,500 - £1,368", "£1,132 remains"],
  "8-5": ["48 × 125 - 3,760", "48 × 125 represents all books received", "48 × 125 = 6,000", "6,000 - 3,760", "2,240 books remain"],

  "9-1": ["638,475 + 274,806 = 913,281", "902,140 - 386,759 = 515,381", "Check addition: 913,281 - 274,806 = 638,475", "Check subtraction: 515,381 + 386,759 = 902,140"],
  "9-2": ["34.750 + 8.906", "Align decimal points", "34.750 + 8.906", "43.656"],
  "9-3": ["3/4 + 5/8", "3/4 = 6/8", "6/8 + 5/8 = 11/8", "11/8 = 1 3/8"],
  "9-4": ["3,250 ÷ 25 + 4.8 × 6", "3,250 ÷ 25 = 130", "4.8 × 6 = 28.8", "130 + 28.8", "158.8"],
  "9-5": ["4,725 ÷ 35 = 135", "Divisor becomes 10 times larger: 35 → 350", "Quotient becomes 10 times smaller: 135 → 13.5", "4,725 ÷ 350 = 13.5"],

  "10-1": ["Compare digits from the greatest place", "6,890,201 < 6,908,210 < 6,980,120", "Round each to the nearest 100,000", "6,900,000     6,900,000     7,000,000"],
  "10-2": ["4,308 × 36", "4,308 × 6 = 25,848", "4,308 × 30 = 129,240", "25,848 + 129,240 = 155,088", "Estimate: 4,300 × 40 = 172,000"],
  "10-3": ["24 = 2³ × 3     36 = 2² × 3²", "HCF uses shared lowest powers: 2² × 3 = 12", "LCM uses highest powers: 2³ × 3²", "LCM = 72"],
  "10-4": ["Books bought: 32 × 145 = 4,640", "Books given: 18 × 240 = 4,320", "4,640 - 4,320", "320 books remain"],
  "10-5": ["7,305,019 → nearest 100,000 = 7,300,000", "2,407 × 38 = 91,466", "7,488 ÷ 26 = 288", "Check each answer with estimation or an inverse"],

  "11-1": ["5/6 = ?/24", "6 × 4 = 24", "Multiply numerator by the same 4", "5 × 4 = 20", "5/6 = 20/24"],
  "11-2": ["42/56", "HCF(42, 56) = 14", "42 ÷ 14 = 3     56 ÷ 14 = 4", "42/56 = 3/4"],
  "11-3": ["7/12 and 5/8", "Common denominator = 24", "7/12 = 14/24     5/8 = 15/24", "15/24 > 14/24", "5/8 is greater"],
  "11-4": ["2/3, 3/4, 5/6", "Common denominator = 12", "2/3 = 8/12     3/4 = 9/12     5/6 = 10/12", "8/12 < 9/12 < 10/12", "2/3, 3/4, 5/6"],
  "11-5": ["3/5 and 2/3", "Use denominator 120", "3/5 = 72/120     2/3 = 80/120", "75/120 lies between 72/120 and 80/120", "75/120 = 5/8"],

  "12-1": ["3/4 + 5/6", "Common denominator = 12", "3/4 = 9/12     5/6 = 10/12", "9/12 + 10/12 = 19/12", "19/12 = 1 7/12"],
  "12-2": ["7/8 - 5/12", "Common denominator = 24", "7/8 = 21/24     5/12 = 10/24", "21/24 - 10/24", "11/24"],
  "12-3": ["2 1/3 + 1 5/6", "1/3 = 2/6", "2 2/6 + 1 5/6 = 3 7/6", "3 7/6 = 4 1/6"],
  "12-4": ["5 1/4 - 2 2/3", "Common denominator = 12", "5 3/12 - 2 8/12", "Exchange: 4 15/12 - 2 8/12", "2 7/12"],
  "12-5": ["3 1/2 - 1 3/4 + 2/3", "3 6/12 - 1 9/12 + 8/12", "Exchange: 2 18/12 - 1 9/12 = 1 9/12", "1 9/12 + 8/12 = 1 17/12", "2 5/12 litres"],

  "13-1": ["4/7 of 21", "21 ÷ 7 = 3", "3 × 4", "12"],
  "13-2": ["1/4 × 3/5", "Numerators: 1 × 3 = 3", "Denominators: 4 × 5 = 20", "1/4 × 3/5 = 3/20"],
  "13-3": ["2/3 × 9/10", "Cancel 2 with 10: 2/10 = 1/5", "Cancel 9 with 3: 9/3 = 3/1", "1/1 × 3/5", "3/5"],
  "13-4": ["2 1/2 × 3/4", "2 1/2 = 5/2", "5/2 × 3/4 = 15/8", "15/8 = 1 7/8"],
  "13-5": ["2/3 of 3/5 m", "2/3 × 3/5", "Cancel the common factor 3", "2/5 m"],

  "14-1": ["1/3 ÷ 4", "Dividing by 4 means multiply by 1/4", "1/3 × 1/4", "1/12"],
  "14-2": ["3/4 ÷ 2", "Dividing by 2 means multiply by 1/2", "3/4 × 1/2", "3/8"],
  "14-3": ["5/6 ÷ 3", "Dividing by 3 means multiply by 1/3", "5/6 × 1/3", "5/18"],
  "14-4": ["2 1/4 ÷ 3", "2 1/4 = 9/4", "9/4 × 1/3 = 9/12", "9/12 = 3/4"],
  "14-5": ["7/8 litre ÷ 3 cups", "7/8 × 1/3", "7 × 1 / 8 × 3", "7/24 litre in each cup"],

  "15-1": ["34.750 + 8.906", "Thousandths: 0 + 6 = 6", "Hundredths and tenths: 5 + 0 = 5; 7 + 9 = 16", "Ones and tens with exchange", "43.656"],
  "15-2": ["50.000 - 17.485", "50.000 = 49.000 + 1.000", "1.000 - 0.485 = 0.515", "49 - 17 = 32", "32 + 0.515 = 32.515"],
  "15-3": ["6.408 × 7", "7 × 8 thousandths = 56 thousandths", "7 × 408 = 2,856 thousandths", "7 × 6 = 42", "44.856"],
  "15-4": ["28.56 ÷ 8", "28 ÷ 8 = 3 remainder 4", "45 tenths ÷ 8 = 5 tenths remainder 5 tenths", "56 hundredths ÷ 8 = 7 hundredths", "3.57"],
  "15-5": ["3 × 2.375 km", "2.375 × 3 = 7.125 km", "7.125 + 1.850", "8.975 km"],

  "16-1": ["7/20", "Make the denominator 100: 20 × 5 = 100", "7 × 5 = 35", "7/20 = 35/100", "35/100 = 0.35"],
  "16-2": ["0.625", "0.625 × 100", "62.5", "0.625 = 62.5%"],
  "16-3": ["35%", "35% = 35/100", "Divide numerator and denominator by 5", "35/100 = 7/20"],
  "16-4": ["3/5, 0.58, 62%", "3/5 = 0.60", "62% = 0.62", "0.58 < 0.60 < 0.62", "0.58, 3/5, 62%"],
  "16-5": ["9/25", "Make hundredths: 25 × 4 = 100", "9 × 4 = 36 → 36/100", "36/100 = 0.36 = 36%"],

  "17-1": ["25% of 360", "25% = 1/4", "360 ÷ 4", "90"],
  "17-2": ["35% of 480", "10% = 48", "30% = 144     5% = 24", "144 + 24", "168"],
  "17-3": ["17% of 650", "10% = 65     5% = 32.5", "2% = 13", "65 + 32.5 + 13", "110.5"],
  "17-4": ["15% of £240", "10% = £24     5% = £12", "Discount = £24 + £12 = £36", "£240 - £36", "Sale price = £204"],
  "17-5": ["84 is 35% of a number", "5% = 84 ÷ 7 = 12", "100% = 12 × 20", "Whole number = 240"],

  "18-1": ["Red : blue = 8 : 12", "Common factor = 4", "8 ÷ 4 : 12 ÷ 4", "2 : 3"],
  "18-2": ["5 : 2", "Keep the quantities in the stated order", "For every 5 of the first quantity", "there are 2 of the second"],
  "18-3": ["7 : 4 = 28 : ?", "7 × 4 = 28", "Scale the second part by the same 4", "4 × 4 = 16", "7 : 4 = 28 : 16"],
  "18-4": ["36 : 48", "HCF(36, 48) = 12", "36 ÷ 12 : 48 ÷ 12", "3 : 4"],
  "18-5": ["Red : white = 3 : 5", "3 parts = 18 ml", "1 part = 18 ÷ 3 = 6 ml", "5 parts = 5 × 6", "30 ml white"],

  "19-1": ["7 cm × scale factor 3.5", "7 × 3.5", "7 × 3 + 7 × 0.5", "21 + 3.5", "24.5 cm"],
  "19-2": ["6 people → 450 g", "1 person → 450 ÷ 6 = 75 g", "14 people → 75 × 14", "1,050 g"],
  "19-3": ["Ratio 4 : 7; smaller part 20", "4 parts = 20", "1 part = 20 ÷ 4 = 5", "7 parts = 7 × 5", "35"],
  "19-4": ["Share £420 in ratio 3 : 4", "Total parts = 3 + 4 = 7", "One part = £420 ÷ 7 = £60", "3 parts = £180     4 parts = £240"],
  "19-5": ["1 cm represents 8 km", "6.5 cm represents 6.5 × 8 km", "6 × 8 = 48     0.5 × 8 = 4", "48 + 4 = 52 km"],

  "20-1": ["5/6 + 7/12", "5/6 = 10/12", "10/12 + 7/12 = 17/12", "17/12 = 1 5/12"],
  "20-2": ["37.5% of 640", "25% = 160", "12.5% = 80", "160 + 80", "240"],
  "20-3": ["45 : 60", "Divide both parts by 15 → 3 : 4", "To make first part 12, multiply by 4", "3 : 4 = 12 : 16"],
  "20-4": ["3/4 kg for 6 people", "For 1 person: 3/4 ÷ 6 = 1/8 kg", "For 14 people: 14 × 1/8 = 14/8", "14/8 = 1 3/4 kg"],
  "20-5": ["0.72, 7/10, 73%", "7/10 = 0.70", "73% = 0.73", "0.70 < 0.72 < 0.73", "7/10, 0.72, 73%"],

  "21-1": ["7, 12, 17, 22", "12 - 7 = 5     17 - 12 = 5     22 - 17 = 5", "22 + 5 = 27", "27 + 5 = 32", "Rule: add 5 each time"],
  "21-2": ["84, __, 62, __, 40", "84 to 62 is -22 over two equal steps", "-22 ÷ 2 = -11 each step", "84, 73, 62, 51, 40", "Missing terms: 73 and 51"],
  "21-3": ["n tickets at £6 each → 6n", "Add one £4 booking fee", "Cost = ticket cost + booking fee", "C = 6n + 4"],
  "21-4": ["A = 3b + 2c", "Substitute b = 7 and c = 5", "A = 3 × 7 + 2 × 5", "A = 21 + 10", "A = 31"],
  "21-5": ["Rule: 4n - 1", "n=1: 4×1-1=3     n=2: 4×2-1=7", "n=3: 11     n=4: 15", "n=5: 19", "First five terms: 3, 7, 11, 15, 19"],

  "22-1": ["x + 38 = 91", "Subtract 38 from both sides", "x = 91 - 38", "x = 53"],
  "22-2": ["5x - 7 = 48", "Add 7 to both sides: 5x = 55", "Divide both sides by 5", "x = 11"],
  "22-3": ["6(x + 4) = 72", "Divide both sides by 6: x + 4 = 12", "Subtract 4 from both sides", "x = 8"],
  "22-4": ["3x + 14 = 65", "Subtract 14: 3x = 51", "Divide by 3", "x = 17"],
  "22-5": ["4x + 12 = 40 → 4x = 28 → x = 7", "2x + 6 = 20 → 2x = 14 → x = 7", "Both equations give x = 7", "Yes, they have the same solution"],

  "23-1": ["4.375 km", "1 km = 1,000 m", "4.375 × 1,000", "4,375 m"],
  "23-2": ["2.65 kg × 1,000 = 2,650 g", "3,750 ml ÷ 1,000", "3,750 ml = 3.75 litres", "2,650 g and 3.75 litres"],
  "23-3": ["845 mm", "1 m = 1,000 mm", "845 ÷ 1,000", "0.845 m"],
  "23-4": ["5 miles ≈ 8 km", "30 miles is 6 groups of 5 miles", "6 × 8 km", "About 48 km"],
  "23-5": ["12.5 m = 1,250 cm", "1,250 ÷ 40", "40 × 31 = 1,240; remainder 10", "31 complete pieces, 10 cm left"],

  "24-1": ["Rectangle 14 cm by 9 cm", "Area = 14 × 9 = 126 cm²", "Perimeter = 2 × (14 + 9)", "Perimeter = 2 × 23 = 46 cm"],
  "24-2": ["Parallelogram base = 12 cm, perpendicular height = 7 cm", "Area = base × perpendicular height", "Area = 12 × 7", "84 cm²"],
  "24-3": ["Triangle base = 15 cm, perpendicular height = 8 cm", "Area = base × height ÷ 2", "15 × 8 ÷ 2", "120 ÷ 2 = 60 cm²"],
  "24-4": ["Area = 54 cm², base = 12 cm", "54 = 12 × height ÷ 2", "54 × 2 = 12 × height", "108 ÷ 12 = 9 cm"],
  "24-5": ["Rectangle area = 10 × 6 = 60 cm²", "Triangle area = 10 × 4 ÷ 2", "Triangle area = 20 cm²", "Total area = 60 + 20 = 80 cm²"],

  "25-1": ["5 layers of 24 cubes", "Volume = cubes per layer × number of layers", "24 × 5", "120 cubic units"],
  "25-2": ["Cuboid 12 cm × 7 cm × 5 cm", "Base layer = 12 × 7 = 84 cm²", "84 × 5", "420 cm³"],
  "25-3": ["360 = 12 × 5 × height", "12 × 5 = 60", "height = 360 ÷ 60", "height = 6 cm"],
  "25-4": ["Cuboid A: 8 × 6 × 5 = 240 cm³", "Cuboid B: 10 × 6 × 4 = 240 cm³", "240 cm³ = 240 cm³", "Both cuboids have equal volume"],
  "25-5": ["Large box volume = 40 × 25 × 30 = 30,000 cm³", "One cube volume = 5 × 5 × 5 = 125 cm³", "30,000 ÷ 125", "240 cubes"],

  "26-1": ["Angles around a point total 360°", "Known angles: 85° + 140° = 225°", "x = 360° - 225°", "x = 135°"],
  "26-2": ["One angle = 68°", "Vertically opposite angles are equal", "Opposite angle = 68°", "Answer: 68°"],
  "26-3": ["Angles in a triangle total 180°", "47° + 68° = 115°", "Third angle = 180° - 115°", "65°"],
  "26-4": ["Radius = 4.5 cm", "Diameter = 2 × radius", "2 × 4.5 cm", "Diameter = 9 cm"],
  "26-5": ["Angles in a quadrilateral total 360°", "92° + 88° + 105° = 285°", "Fourth angle = 360° - 285°", "75°"],

  "27-1": ["A = (-4, 3)", "x is negative: move 4 left", "y is positive: move 3 up", "A lies in Quadrant II"],
  "27-2": ["P: (2, -5) → (-3, 1)", "x change: -3 - 2 = -5 → 5 left", "y change: 1 - (-5) = 6 → 6 up", "Translation: 5 left and 6 up"],
  "27-3": ["Start (4, -2)", "3 left: x = 4 - 3 = 1", "5 up: y = -2 + 5 = 3", "New point = (1, 3)"],
  "27-4": ["Start (-6, 2)", "Reflection in y-axis changes the sign of x", "(-6, 2) → (6, 2)", "Image point = (6, 2)"],
  "27-5": ["End point (7, -4)", "Reverse 9 right: 7 - 9 = -2", "Reverse 3 down: -4 + 3 = -1", "Start point = (-2, -1)"],

  "28-1": ["Graph rises from 18 to 46", "Increase = final value - starting value", "46 - 18", "Increase = 28"],
  "28-2": ["Quarter of 240 pupils", "1/4 × 240", "240 ÷ 4", "60 pupils"],
  "28-3": ["15 out of 60 pupils choose art", "15/60 = 1/4", "Sector angle = 1/4 × 360°", "90°"],
  "28-4": ["12 + 15 + 18 + 11 + 19", "Total = 75", "There are 5 values", "Mean = 75 ÷ 5 = 15"],
  "28-5": ["Dataset A mean = 24", "Dataset B mean = 207 ÷ 9 = 23", "24 > 23", "Dataset A has the greater mean"],

  "29-1": ["15% of 240 = 36", "After increase: 240 + 36 = 276", "20% of 276 = 55.2", "After decrease: 276 - 55.2", "Final quantity = 220.8"],
  "29-2": ["3/5 of the number = 84", "1/5 = 84 ÷ 3 = 28", "Whole = 28 × 5 = 140", "35% of 140 = 49"],
  "29-3": ["Cuboid volume = 12 × 8 × 5 = 480 cm³", "Filled volume = 1/3 × 480 = 160 cm³", "Empty volume = 480 - 160", "320 cm³ remains empty"],
  "29-4": ["126° represents 42 pupils", "1 pupil represents 126° ÷ 42 = 3°", "Whole circle = 360°", "360° ÷ 3° = 120 pupils"],
  "29-5": ["Choose a target of 30", "Use 3/4 of 40 = 30", "Use 25% of 120 = 30", "Check both calculations give 30"],

  "30-1": ["2 1/4 ÷ 3", "2 1/4 = 9/4", "9/4 × 1/3 = 9/12", "9/12 = 3/4", "3/4 = 0.75"],
  "30-2": ["5x + 8 = 73 → 5x = 65 → x = 13", "3.45 km × 1,000", "3.45 km = 3,450 m", "Answers: x = 13 and 3,450 m"],
  "30-3": ["Triangle area = 18 × 11 ÷ 2 = 99 cm²", "18 + 22 + 25 + 15 = 80", "Mean = 80 ÷ 4", "Answers: 99 cm² and 20"],
  "30-4": ["12.5% of £640 = 1/8 of £640", "£640 ÷ 8 = £80", "£640 - £80", "Sale price = £560"],
  "30-5": ["756 = 12 × 7 × height", "12 × 7 = 84", "height = 756 ÷ 84", "height = 9 cm"],
};

export function explicitWorkedSteps(item) {
  const key = `${item.week}-${item.day}`;
  const steps = EXPLICIT_WORKED_STEPS[key];
  if (!steps) throw new Error(`Missing explicit worked animation steps for ${key} ${item.title}`);
  return steps;
}
