from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase.pdfmetrics import stringWidth

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'output/pdf/year3-find-lines-in-shapes-activity.pdf'
OUT.parent.mkdir(parents=True, exist_ok=True)
W, H = A4
BLUE, GREEN, INK, PALE, GREY = map(HexColor, ['#1D4ED8','#11745A','#172B4D','#EFF6FF','#52647A'])

def text(c, value, x, y, size=12, colour=INK, font='Helvetica', centre=False):
    c.setFont(font, size); c.setFillColor(colour)
    if centre: x -= stringWidth(value, font, size)/2
    c.drawString(x, y, value)

def header(c, subtitle):
    c.setFillColor(PALE); c.roundRect(30, H-105, W-60, 68, 12, fill=1, stroke=0)
    text(c, 'BrightPath - Find lines in shapes', 48, H-68, 22, BLUE, 'Helvetica-Bold')
    text(c, subtitle, 48, H-91, 10.5, GREY)

def shape(c, kind, x, y, w=110, h=70):
    c.setLineWidth(2); c.setStrokeColor(INK); c.setFillColor(white)
    if kind == 'rectangle': c.rect(x,y,w,h,fill=1,stroke=1)
    elif kind == 'triangle':
        p=c.beginPath();p.moveTo(x,y);p.lineTo(x,y+h);p.lineTo(x+w,y);p.close();c.drawPath(p,fill=1,stroke=1)
    elif kind == 'trapezium':
        p=c.beginPath();p.moveTo(x,y);p.lineTo(x,y+h);p.lineTo(x+w-22,y+h);p.lineTo(x+w,y);p.close();c.drawPath(p,fill=1,stroke=1)
    elif kind == 'parallelogram':
        p=c.beginPath();p.moveTo(x,y);p.lineTo(x+22,y+h);p.lineTo(x+w,y+h);p.lineTo(x+w-22,y);p.close();c.drawPath(p,fill=1,stroke=1)
    else:
        p=c.beginPath();p.moveTo(x+w/2,y+h);p.lineTo(x+w,y+h/2);p.lineTo(x+w/2,y);p.lineTo(x,y+h/2);p.close();c.drawPath(p,fill=1,stroke=1)

def star_prompt(c, value, x, y, size=12):
    text(c, '*', x, y, size+3, BLUE, 'Helvetica-Bold')
    text(c, value, x+16, y, size, INK, 'Helvetica-Bold')

def card(c, x, y, w, h):
    c.setStrokeColor(HexColor('#BCD0EA')); c.setLineWidth(1); c.roundRect(x+8,y+8,w-16,h-16,8,stroke=1,fill=0)
    text(c,'Find lines in shapes',x+20,y+h-32,15,BLUE,'Helvetica-Bold')
    text(c,'Name: ____________________',x+20,y+h-49,8.5,GREY)
    kinds=['rectangle','triangle','trapezium','parallelogram','diamond']
    for i,k in enumerate(kinds):
        col=i%3; row=i//3; sx=x+25+col*82; sy=y+h-126-row*91
        shape(c,k,sx,sy,61,40)
    star_prompt(c,'Circle a pair of parallel lines in blue.',x+22,y+57,8.7)
    star_prompt(c,'Mark a right angle in green.',x+22,y+40,8.7)
    star_prompt(c,'Choose one shape and explain to a partner.',x+22,y+23,8.7)

c=canvas.Canvas(str(OUT),pagesize=A4)
c.setTitle('Find lines in shapes - display and pupil activity cards')
header(c,'Teacher display page - discuss first, then reveal ideas together')
text(c,'Look, point and explain',W/2,H-145,23,INK,'Helvetica-Bold',True)
items=[('rectangle',65,H-290),('triangle',245,H-290),('trapezium',425,H-290),('parallelogram',155,H-440),('diamond',335,H-440)]
for kind,x,y in items: shape(c,kind,x,y,110,70)
star_prompt(c,'Which lines are horizontal or vertical?',60,H-530,14)
star_prompt(c,'Which pairs stay the same distance apart?',60,H-565,14)
star_prompt(c,'Which lines meet at a right angle?',60,H-600,14)
star_prompt(c,'What stays the same if a shape turns?',60,H-635,14)
c.setFillColor(PALE);c.roundRect(55,80,W-110,88,10,fill=1,stroke=0)
text(c,'Teacher note',72,142,12,BLUE,'Helvetica-Bold')
text(c,'Use two colours for parallel pairs. Use the corner of a card to test perpendicular lines.',72,121,10.5,INK)
text(c,'No writing is required: pupils can point, trace and explain aloud.',72,102,10.5,GREEN,'Helvetica-Bold')
c.showPage()
header(c,'Pupil activity cards - print one A4 page and trim into four copies')
top=H-120; usable=top-30; card_w=(W-50)/2; card_h=usable/2
c.setStrokeColor(HexColor('#94A3B8'));c.setDash(4,4);c.line(W/2,30,W/2,top);c.line(25,30+card_h, W-25,30+card_h);c.setDash()
for row in range(2):
    for col in range(2): card(c,25+col*card_w,30+(1-row)*card_h,card_w,card_h)
c.save()
print(OUT)
