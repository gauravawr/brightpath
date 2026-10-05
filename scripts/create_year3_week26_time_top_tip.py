from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase.pdfmetrics import stringWidth

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/pdf'
PUBLIC=ROOT/'public/resources/maths/year-3'
OUT.mkdir(parents=True,exist_ok=True); PUBLIC.mkdir(parents=True,exist_ok=True)
DISPLAY=OUT/'week-26-time-conversion-display.pdf'
CARDS=OUT/'week-26-time-conversion-book-cards.pdf'
W,H=A4
BLUE=HexColor('#1D4ED8'); GREEN=HexColor('#11745A'); AMBER=HexColor('#B45309'); INK=HexColor('#172B4D'); PALE=HexColor('#EFF6FF'); LINE=HexColor('#BCD0EA'); GREY=HexColor('#52647A')

def text(c,s,x,y,size=12,colour=INK,bold=False,centre=False):
    font='Helvetica-Bold' if bold else 'Helvetica';c.setFont(font,size);c.setFillColor(colour)
    if centre:x-=stringWidth(s,font,size)/2
    c.drawString(x,y,s)

def box(c,x,y,w,h,label,value,colour):
    c.setFillColor(white);c.setStrokeColor(colour);c.setLineWidth(2);c.roundRect(x,y,w,h,10,fill=1,stroke=1)
    text(c,value,x+w/2,y+h*.52,24,colour,True,True);text(c,label,x+w/2,y+15,10,GREY,True,True)

def header(c,title,subtitle):
    c.setFillColor(PALE);c.roundRect(30,H-112,W-60,76,12,fill=1,stroke=0)
    text(c,'TOP TIP',48,H-65,10,BLUE,True);text(c,title,48,H-91,23,INK,True);text(c,subtitle,48,H-108,9.5,GREY)

def draw_display(path):
    c=canvas.Canvas(str(path),pagesize=A4);c.setTitle('Year 3 time conversion top tip')
    header(c,'Time conversions','Display before duration lessons or print as a classroom reference')
    text(c,'Remember these facts',W/2,H-160,20,BLUE,True,True)
    facts=[('seconds in 1 minute','60',BLUE),('minutes in 1 hour','60',GREEN),('hours in 1 day','24',AMBER),('days in 1 week','7',BLUE)]
    for i,(lab,val,col) in enumerate(facts):
        x=55+(i%2)*250;y=H-285-(i//2)*115;box(c,x,y,220,86,lab,val,col)
    text(c,'Finding a duration',W/2,H-430,20,BLUE,True,True)
    text(c,'14:35',70,H-505,22,INK,True);text(c,'15:00',265,H-505,22,INK,True);text(c,'15:20',460,H-505,22,INK,True)
    c.setStrokeColor(BLUE);c.setLineWidth(4);c.line(135,H-498,240,H-498);c.line(330,H-498,435,H-498)
    text(c,'+25 minutes',188,H-480,11,BLUE,True,True);text(c,'+20 minutes',383,H-480,11,GREEN,True,True)
    c.setFillColor(PALE);c.roundRect(75,H-620,W-150,75,10,fill=1,stroke=0)
    text(c,'25 minutes + 20 minutes = 45 minutes',W/2,H-580,18,GREEN,True,True)
    text(c,'Jump to the next hour first. Then jump to the finishing time.',W/2,H-606,11,INK,False,True)
    text(c,'BrightPath - Year 3 - Measure and time problems',40,35,9,GREY)
    c.save()

def small_card(c,x,y,w,h):
    c.setStrokeColor(LINE);c.setFillColor(white);c.setLineWidth(1);c.roundRect(x+6,y+6,w-12,h-12,7,fill=1,stroke=1)
    text(c,'* TIME TOP TIP',x+16,y+h-27,11,BLUE,True)
    facts=[('1 min','60 sec'),('1 hour','60 min'),('1 day','24 hours'),('1 week','7 days')]
    for i,(a,b) in enumerate(facts):
        yy=y+h-52-i*17;text(c,a,x+18,yy,9,INK,True);text(c,'=',x+72,yy,9,GREY,True);text(c,b,x+90,yy,9,GREEN,True)
    c.setStrokeColor(BLUE);c.setLineWidth(2);line_y=y+53;c.line(x+20,line_y,x+w-20,line_y)
    text(c,'start',x+18,line_y-15,7.5,GREY);text(c,'next hour',x+w/2,line_y-15,7.5,GREY,False,True);text(c,'finish',x+w-43,line_y-15,7.5,GREY)
    text(c,'* Add the jumps to find the duration.',x+17,y+21,8.2,INK,True)

def draw_cards(path):
    c=canvas.Canvas(str(path),pagesize=A4);c.setTitle('Year 3 time conversion book cards')
    text(c,'Year 3 time top tips - print one A4 page and trim into six book cards',W/2,H-21,9.5,GREY,False,True)
    margin=22;top=H-34;cw=(W-2*margin)/2;ch=(top-margin)/3
    c.setStrokeColor(HexColor('#94A3B8'));c.setDash(3,4)
    c.line(W/2,margin,W/2,top)
    for r in (1,2):c.line(margin,margin+r*ch,W-margin,margin+r*ch)
    c.setDash()
    for row in range(3):
        for col in range(2):small_card(c,margin+col*cw,margin+(2-row)*ch,cw,ch)
    c.save()

draw_display(DISPLAY);draw_cards(CARDS)
for source in (DISPLAY,CARDS):
    (PUBLIC/source.name).write_bytes(source.read_bytes())
print(DISPLAY);print(CARDS)
