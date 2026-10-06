from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white
from reportlab.pdfbase.pdfmetrics import stringWidth

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'output/pdf'; PUBLIC=ROOT/'public/resources/maths/year-5'
OUT.mkdir(parents=True,exist_ok=True);PUBLIC.mkdir(parents=True,exist_ok=True)
W,H=A4
BLUE=HexColor('#1D4ED8');GREEN=HexColor('#11745A');AMBER=HexColor('#B45309');INK=HexColor('#172B4D');PALE=HexColor('#EFF6FF');LINE=HexColor('#BCD0EA');GREY=HexColor('#52647A')

def text(c,s,x,y,size=12,colour=INK,bold=False,centre=False):
    font='Helvetica-Bold' if bold else 'Helvetica';c.setFont(font,size);c.setFillColor(colour)
    if centre:x-=stringWidth(s,font,size)/2
    c.drawString(x,y,s)

def header(c,title,subtitle):
    c.setFillColor(PALE);c.roundRect(30,H-112,W-60,76,12,fill=1,stroke=0)
    text(c,'TOP TIP',48,H-65,10,BLUE,True);text(c,title,48,H-91,23,INK,True);text(c,subtitle,48,H-108,9.5,GREY)

def fact_box(c,x,y,w,h,left,right,colour):
    c.setFillColor(white);c.setStrokeColor(colour);c.setLineWidth(2);c.roundRect(x,y,w,h,10,fill=1,stroke=1)
    text(c,left,x+w*.28,y+h*.45,20,colour,True,True);text(c,'=',x+w*.5,y+h*.45,18,GREY,True,True);text(c,right,x+w*.72,y+h*.45,20,colour,True,True)

def draw_metric_display(path):
    c=canvas.Canvas(str(path),pagesize=A4);c.setTitle('Year 5 metric conversion top tip')
    header(c,'Metric conversion chart','Display during conversion lessons or print the small book cards')
    facts=[('1 km','1000 m'),('1 m','100 cm'),('1 cm','10 mm'),('1 kg','1000 g'),('1 L','1000 ml')]
    for i,(a,b) in enumerate(facts):
        col=i%2;row=i//2;x=55+col*250;y=H-260-row*102;fact_box(c,x,y,220,73,a,b,[BLUE,GREEN,AMBER][row])
    c.setFillColor(PALE);c.roundRect(55,H-600,W-110,122,12,fill=1,stroke=0)
    text(c,'Larger unit to smaller unit',W/2,H-510,16,BLUE,True,True);text(c,'multiply',W/2,H-536,23,GREEN,True,True)
    text(c,'Smaller unit to larger unit',W/2,H-566,16,BLUE,True,True);text(c,'divide',W/2,H-592,23,AMBER,True,True)
    text(c,'Example: 3.5 m = 350 cm',W/2,H-658,21,INK,True,True)
    text(c,'3.5 x 100 = 350',W/2,H-687,14,GREEN,True,True)
    text(c,'Always write the unit beside the answer.',W/2,H-735,13,BLUE,True,True)
    c.save()

def draw_fdp_display(path):
    c=canvas.Canvas(str(path),pagesize=A4);c.setTitle('Year 5 fraction decimal percentage top tip')
    header(c,'Fraction, decimal and percentage equivalents','Display during FDP lessons or print the small book cards')
    rows=[('1/2','0.5','50%'),('1/4','0.25','25%'),('3/4','0.75','75%'),('1/5','0.2','20%'),('1/10','0.1','10%'),('1 whole','1.0','100%')]
    text(c,'Fraction',145,H-165,14,BLUE,True,True);text(c,'Decimal',W/2,H-165,14,GREEN,True,True);text(c,'Percentage',W-145,H-165,14,AMBER,True,True)
    for i,(f,d,p) in enumerate(rows):
        y=H-220-i*70;c.setFillColor(PALE if i%2==0 else white);c.roundRect(65,y-17,W-130,50,8,fill=1,stroke=0)
        text(c,f,145,y,19,BLUE,True,True);text(c,d,W/2,y,19,GREEN,True,True);text(c,p,W-145,y,19,AMBER,True,True)
    c.setFillColor(PALE);c.roundRect(65,105,W-130,88,10,fill=1,stroke=0)
    text(c,'Fraction to percentage',W/2,164,14,BLUE,True,True);text(c,'make the denominator 100, or divide then x 100',W/2,139,12,INK,False,True)
    text(c,'Example: 3/5 = 60/100 = 60%',W/2,116,15,GREEN,True,True)
    c.save()

def card(c,x,y,w,h,title,rows,note):
    c.setStrokeColor(LINE);c.setFillColor(white);c.setLineWidth(1);c.roundRect(x+6,y+6,w-12,h-12,7,fill=1,stroke=1)
    text(c,'* '+title,x+16,y+h-27,10.5,BLUE,True)
    start=y+h-52
    for i,row in enumerate(rows):
        yy=start-i*17
        if len(row)==2:
            text(c,row[0],x+20,yy,8.5,INK,True);text(c,'=',x+w*.48,yy,8,GREY,True);text(c,row[1],x+w*.57,yy,8.5,GREEN,True)
        else:
            text(c,row[0],x+20,yy,8.5,BLUE,True);text(c,'=',x+w*.36,yy,8,GREY,True);text(c,row[1],x+w*.43,yy,8.5,GREEN,True);text(c,'=',x+w*.66,yy,8,GREY,True);text(c,row[2],x+w*.73,yy,8.5,AMBER,True)
    text(c,'* '+note,x+16,y+19,8,INK,True)

def draw_cards(path,title,rows,note):
    c=canvas.Canvas(str(path),pagesize=A4);c.setTitle(title+' book cards')
    text(c,'Year 5 top tips - print one A4 page and trim into six book cards',W/2,H-20,9.5,GREY,False,True)
    margin=22;top=H-34;cw=(W-2*margin)/2;ch=(top-margin)/3
    c.setStrokeColor(HexColor('#94A3B8'));c.setDash(3,4);c.line(W/2,margin,W/2,top)
    for r in (1,2):c.line(margin,margin+r*ch,W-margin,margin+r*ch)
    c.setDash()
    for r in range(3):
        for col in range(2):card(c,margin+col*cw,margin+(2-r)*ch,cw,ch,title,rows,note)
    c.save()

metric_display=OUT/'year-5-metric-conversion-display.pdf';metric_cards=OUT/'year-5-metric-conversion-book-cards.pdf'
fdp_display=OUT/'year-5-fdp-equivalence-display.pdf';fdp_cards=OUT/'year-5-fdp-equivalence-book-cards.pdf'
draw_metric_display(metric_display)
draw_cards(metric_cards,'METRIC CONVERSIONS',[('1 km','1000 m'),('1 m','100 cm'),('1 cm','10 mm'),('1 kg','1000 g'),('1 L','1000 ml')],'Larger to smaller: multiply. Smaller to larger: divide.')
draw_fdp_display(fdp_display)
draw_cards(fdp_cards,'FDP EQUIVALENTS',[('1/2','0.5','50%'),('1/4','0.25','25%'),('3/4','0.75','75%'),('1/5','0.2','20%'),('1/10','0.1','10%')],'Equivalent values have the same size.')
for source in (metric_display,metric_cards,fdp_display,fdp_cards):(PUBLIC/source.name).write_bytes(source.read_bytes())
print('\n'.join(map(str,(metric_display,metric_cards,fdp_display,fdp_cards))))
