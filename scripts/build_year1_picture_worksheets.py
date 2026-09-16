"""Build picture-led Year 1 PDFs from the same questions used by the lesson.

Work privately first; --publish copies only validated worksheets and thumbnails.
No lesson metadata, PowerPoints or teacher plans are rewritten.
"""
import argparse, json, math, re, shutil, hashlib
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / '.qa/year1-picture-worksheets'
BLUE, GREEN, PURPLE, ORANGE = '#2563EB', '#168060', '#8651B5', '#C17A16'
INK, LINE = '#20324A', '#CBD5E1'
COLORS = [BLUE, GREEN, PURPLE, ORANGE]
pdfmetrics.registerFont(TTFont('BP', 'C:/Windows/Fonts/arial.ttf'))
pdfmetrics.registerFont(TTFont('BPB', 'C:/Windows/Fonts/arialbd.ttf'))
W,H=A4
AUDIT=[]

def answer_text(s):
    names={'★':'stars','●':'counters','▲':'triangles','■':'squares'}
    return re.sub(r'([★●▲■])(?: *\1)*',lambda m:str(sum(ch in names for ch in m[0]))+' '+names[m[1]],s)

def text(c,s,x,y,size=13,color=INK,bold=False,center=False):
    c.setFillColor(HexColor(color));c.setFont('BPB' if bold else 'BP',size)
    (c.drawCentredString if center else c.drawString)(x,y,str(s))

def para(c,s,x,top,w,size=16,maxh=90,color=INK):
    p=Paragraph(escape(str(s)).replace('\n','<br/>'),ParagraphStyle('p',fontName='BP',fontSize=size,leading=size*1.27,textColor=HexColor(color)))
    _,h=p.wrap(w,1000)
    if h>maxh: raise ValueError(f'Text exceeds its box ({h}/{maxh}): {s}')
    p.drawOn(c,x,top-h)
    return h

def box(c,x,y,w,h,color='#FFFFFF',stroke=LINE):
    c.setFillColor(HexColor(color));c.setStrokeColor(HexColor(stroke));c.setLineWidth(.8)
    c.roundRect(x,y,w,h,6,fill=1,stroke=1)

def line(c,x,y,x2,y2,color=LINE,width=1):
    c.setStrokeColor(HexColor(color));c.setLineWidth(width);c.line(x,y,x2,y2)

def shape(c,name,x,y,s=23,color=BLUE):
    c.setFillColor(HexColor(color));c.setStrokeColor(HexColor(INK));c.setLineWidth(.65)
    if name=='circle': c.circle(x+s/2,y+s/2,s/2,fill=1,stroke=1)
    elif name in ('triangle','star'):
        p=c.beginPath()
        pts=[(x+s/2,y+s),(x+s,y),(x,y)] if name=='triangle' else [(x+s/2+math.cos(math.pi/2+i*math.pi/5)*s*(.5 if i%2==0 else .22),y+s/2+math.sin(math.pi/2+i*math.pi/5)*s*(.5 if i%2==0 else .22)) for i in range(10)]
        p.moveTo(*pts[0])
        for pt in pts[1:]:p.lineTo(*pt)
        p.close();c.drawPath(p,fill=1,stroke=1)
    elif name=='bird':
        c.ellipse(x,y+2,x+s*.8,y+s*.8,fill=1,stroke=1);c.circle(x+s*.73,y+s*.73,s*.22,fill=1,stroke=1)
        c.setFillColor(HexColor(ORANGE));p=c.beginPath();p.moveTo(x+s*.92,y+s*.8);p.lineTo(x+s*1.13,y+s*.7);p.lineTo(x+s*.92,y+s*.62);p.close();c.drawPath(p,fill=1,stroke=0)
        c.setFillColor(HexColor(INK));c.circle(x+s*.78,y+s*.78,1,fill=1,stroke=0)
        line(c,x+s*.32,y+2,x+s*.32,y-3,INK);line(c,x+s*.55,y+2,x+s*.55,y-3,INK)
    else:c.rect(x,y,s*(1.5 if name=='rectangle' else 1),s,fill=1,stroke=1)

def objects(c,n,x,y,w=205,h=65,color=BLUE,icon='circle',cross=0):
    assert 0<=n<=100,n
    cols=min(10,max(1,n),max(1,int(w/15)));rows=max(1,math.ceil(n/cols));s=min(22,(w-10)/cols-3,(h-6)/rows-5)
    assert s>=4,(n,w,h)
    for i in range(n):
        xx=x+(i%cols)*(s+5);yy=y+h-s-(i//cols)*(s+6)
        shape(c,icon,xx,yy,s,color)
        if cross and i>=n-cross:line(c,xx-2,yy-2,xx+s+2,yy+s+2,'#B42318',2)

def frame(c,n,x,y,slots=10,fill=False,cell=24):
    for i in range(slots):
        xx=x+i%5*cell;yy=y-i//5*cell
        c.setStrokeColor(HexColor(LINE));c.setFillColor(white);c.rect(xx,yy,cell,cell,fill=1,stroke=1)
        if fill and i<n:shape(c,'circle',xx+4,yy+4,cell-8,BLUE)

def numberline(c,x,y,w,lo=0,hi=10,step=1,start=None,jumps=0):
    assert hi>lo and (hi-lo)/step<=22
    line(c,x,y,x+w,y,INK)
    for n in range(lo,hi+1,step):
        xx=x+(n-lo)/(hi-lo)*w;line(c,xx,y-4,xx,y+5,INK)
        text(c,n,xx,y-19,10,center=True)
    if start is not None:
        xx=x+(start-lo)/(hi-lo)*w
        shape(c,'circle',xx-4,y+5,8,BLUE)
        if jumps:
            for i in range(abs(jumps)):
                a=start+i*(1 if jumps>0 else -1);b=a+(1 if jumps>0 else -1)
                xa=x+(a-lo)/(hi-lo)*w;xb=x+(b-lo)/(hi-lo)*w
                c.setStrokeColor(HexColor(GREEN));c.setLineWidth(1.5)
                p=c.beginPath();p.moveTo(xa,y+6);p.curveTo(xa,y+32,xb,y+32,xb,y+6);c.drawPath(p)
                line(c,xb,y+6,xb-3*(1 if jumps>0 else -1),y+12,GREEN,1.5)

def tens(c,n,x,y,w=210):
    t,o=divmod(n,10);unit=min(6,(w-70)/max(t,1)/1.6)
    for i in range(t):
        for j in range(10):
            c.setFillColor(HexColor(BLUE));c.setStrokeColor(white);c.rect(x+i*(unit+3),y+j*6,unit,6,fill=1,stroke=1)
    objects(c,o,x+max(t,1)*(unit+3)+10,y,65,60,GREEN)

def solid(c,name,x,y,s=50):
    if name=='sphere':
        shape(c,'circle',x,y,s,'#93C5FD');c.setStrokeColor(HexColor(BLUE));c.ellipse(x+3,y+s*.35,x+s-3,y+s*.65,fill=0)
    elif name=='cylinder':
        c.setFillColor(HexColor('#BFDBFE'));c.setStrokeColor(HexColor(BLUE));c.rect(x,y+9,s,s-9,fill=1);c.ellipse(x,y,x+s,y+18,fill=1);c.ellipse(x,y+s-9,x+s,y+s+9,fill=1)
    elif name in ('cone','square-based pyramid'):
        if name=='cone':
            shape(c,'triangle',x,y,s,'#93C5FD');c.ellipse(x,y-5,x+s,y+10,fill=0)
        else:
            apex=(x+s*.48,y+s);left=(x,y+12);front=(x+s*.58,y);right=(x+s,y+15)
            for pts,col in [([apex,left,front],'#BFDBFE'),([apex,front,right],'#93C5FD')]:
                p=c.beginPath();p.moveTo(*pts[0]);p.lineTo(*pts[1]);p.lineTo(*pts[2]);p.close();c.setFillColor(HexColor(col));c.setStrokeColor(HexColor(BLUE));c.drawPath(p,fill=1,stroke=1)
    else:
        width=s*(1.4 if name=='cuboid' else 1);d=12
        c.setFillColor(HexColor('#BFDBFE'));c.setStrokeColor(HexColor(BLUE));c.rect(x,y,width,s,fill=1,stroke=1)
        for a,b in [((x,y+s),(x+d,y+s+d)),((x+width,y+s),(x+width+d,y+s+d)),((x+width,y),(x+width+d,y+d)),((x+d,y+s+d),(x+width+d,y+s+d)),((x+width+d,y+d),(x+width+d,y+s+d))]:line(c,*a,*b,BLUE)

def clockface(c,x,y,r=48,hour=None,minute=0):
    c.setFillColor(white);c.setStrokeColor(HexColor(BLUE));c.circle(x,y,r,fill=1)
    for n in range(1,13):
        a=math.radians(90-n*30);text(c,n,x+math.cos(a)*(r-12),y+math.sin(a)*(r-12)-4,10,center=True)
    if hour is not None:
        for angle,length,color in [(90-hour*30-minute*.5,r*.5,BLUE),(90-minute*6,r*.72,GREEN)]:
            a=math.radians(angle);line(c,x,y,x+math.cos(a)*length,y+math.sin(a)*length,color,2.5)
    shape(c,'circle',x-2,y-2,4,INK)

def coin(c,v,x,y,s=32):
    shape(c,'circle',x,y,s,'#DDA16C' if v<5 else '#D9BD69' if v>=100 else '#DCE3EC')
    text(c,'£'+str(v//100) if v>=100 else str(v)+'p',x+s/2,y+s*.36,11,bold=True,center=True)

def scene(c,event,x,y):
    if event=='wake up':
        box(c,x,y,70,20,'#DBEAFE');shape(c,'circle',x+3,y+14,16,ORANGE)
        line(c,x,y-8,x,y+30,BLUE,3);line(c,x+70,y-8,x+70,y+22,BLUE,3)
    elif event=='go to school':
        shape(c,'triangle',x+8,y+10,52,'#DB8B77');box(c,x+8,y-8,52,35,'#DBEAFE');box(c,x+29,y-8,12,23,'#FFFFFF')
    elif event=='play outside':
        line(c,x+18,y-8,x+18,y+27,ORANGE,5);shape(c,'circle',x+2,y+16,32,GREEN);shape(c,'circle',x+50,y-5,15,ORANGE)
    else:
        c.setFillColor(white);c.setStrokeColor(HexColor(BLUE));c.ellipse(x+9,y-6,x+61,y+30,fill=1)
        shape(c,'circle',x+22,y+1,15,ORANGE);shape(c,'circle',x+38,y+4,11,GREEN)
        line(c,x+2,y-8,x+2,y+30,INK,2);line(c,x+68,y-8,x+68,y+30,INK,2)

def draw_model(c,m,x,y,w,h,level,answer=False):
    """Draw givens on pupil sheets; solution actions only on answer sheets."""
    k=m['kind'];mode=m.get('mode','');a=m.get('a',0);b=m.get('b',0)
    if k in ('add','subtract','word','error','family','missing','compareCalc'):
        sub=m.get('op') in ('−','-');icon='bird' if mode=='story' or k=='word' else 'circle'
        if k=='missing':
            whole=m['a'] if sub else m['total'];part=m['total'] if sub else m['a']
            text(c,'whole: '+str(whole),x+w/2,y+h-10,13,bold=True,center=True)
            box(c,x+30,y+25,w-60,45,'#EFF6FF',BLUE);split=(w-60)*part/whole
            line(c,x+30+split,y+25,x+30+split,y+70,BLUE)
            text(c,part,x+30+split/2,y+42,18,center=True);text(c,m['b'] if answer else '?',x+30+split+(w-60-split)/2,y+42,18,center=True)
        elif mode in ('on','back','bridge') and k!='compareCalc':
            numberline(c,x+15,y+32,w-30,0,m['max'],1,a,(-b if sub else b) if answer else 0)
            objects(c,a,x+15,y+60,w*.42,36,BLUE,'bird')
            text(c,'−' if sub else '+',x+w*.5,y+74,19,bold=True,center=True)
            objects(c,b,x+w*.57,y+60,w*.4,36,GREEN,'bird')
            text(c,('Start at '+str(a)+'. '+('Jump back ' if sub else 'Jump on ')+str(b)+'.') if level=='lower' else 'Draw the jumps.',x+15,y+h+11,12,color=BLUE)
        elif k=='compareCalc':
            for i,(n,z) in enumerate([(a,b),(m['c'],m['d'])]):
                xx=x+i*w/2;text(c,f"{n} {m['op']} {z}",xx+w/4,y+h-5,16,bold=True,center=True)
                objects(c,n,xx+12,y,w/2-24,h-22,BLUE,icon,z if answer and sub else 0)
                if not sub:objects(c,z,xx+12,y-20,w/2-24,27,GREEN,icon)
        else:
            if sub:
                objects(c,a,x+15,y+25,w-30,h-28,BLUE,icon,b if answer else 0)
                text(c,('Cross out '+str(b)+'. Count what is left.') if not answer else 'Crossed pictures were taken away.',x+15,y+4,12,color=BLUE)
            else:
                objects(c,a,x+12,y+20,w*.43,h-25,BLUE,icon);text(c,'+',x+w*.5,y+h-30,22,bold=True,center=True)
                objects(c,b,x+w*.57,y+20,w*.4,h-25,GREEN,icon)
                if level=='lower':text(c,'Count each picture once.',x+12,y+3,12,color=BLUE)
    elif k in ('count','match'):
        objects(c,m['n'],x+15,y+15,w*.52,h-15)
        if k=='match':
            opts=sorted(set([max(0,m['n']-1),m['n'],m['n']+1]))
            for i,n in enumerate(opts):box(c,x+w*.58+i*48,y+35,38,38,'#EFF6FF');text(c,n,x+w*.58+i*48+19,y+47,18,center=True)
        elif m.get('frame'):frame(c,m['n'],x+w*.62,y+50,10,answer)
    elif k=='compare':
        for i,n in enumerate([a,b]):
            xx=x+i*w/2;text(c,str(n),xx+10,y+h-5,14,bold=True)
            if n>20:tens(c,n,xx+10,y+15,w/2-20)
            else:objects(c,n,xx+10,y+8,w/2-20,h-25,COLORS[i])
    elif k=='tens':tens(c,m['n'],x+20,y+20,w*.65);text(c,'tens ___   ones ___',x+w*.53,y+40,14,color=BLUE)
    elif k in ('one','line'):
        n=m['n'];hi=m.get('max',10);lo=0;step=m.get('step',1)
        if k=='one' and hi>20:lo=max(0,n-3);hi=n+3;step=1
        numberline(c,x+15,y+35,w-30,lo,hi,step,n if k=='one' else None)
        if k=='line':text(c,'Mark the number on the line.',x+15,y+h-10,12,color=BLUE)
    elif k in ('order','sequence'):
        vals=m['values'];gap=8;cw=min(65,(w-20-gap*(len(vals)-1))/len(vals))
        for i,n in enumerate(vals):
            box(c,x+10+i*(cw+gap),y+40,cw,42,'#EFF6FF');text(c,'?' if k=='sequence' and i==m.get('missing') and not answer else n,x+10+i*(cw+gap)+cw/2,y+53,18,center=True)
        if k=='order':text(c,'Smallest  →  Greatest',x+10,y+12,12,color=BLUE)
    elif k=='bonds':
        text(c,'whole: '+str(m['total']),x+w/2,y+h-8,15,bold=True,center=True)
        if mode=='all':objects(c,m['total'],x+10,y+28,w*.45,h-40);box(c,x+w*.54,y+20,w*.19,55,'#EFF6FF');box(c,x+w*.76,y+20,w*.19,55,'#F0FDF4')
        else:
            objects(c,m['total'],x+10,y+20,w*.45,h-35);box(c,x+w*.53,y+20,w*.2,55,'#EFF6FF');text(c,m['part'],x+w*.63,y+38,19,center=True);box(c,x+w*.76,y+20,w*.2,55,'#F0FDF4');text(c,m['total']-m['part'] if answer else '?',x+w*.86,y+38,19,center=True)
    elif k=='shape':
        names=m.get('names') or (['cube','sphere','cylinder','cone','cuboid','square-based pyramid'] if m.get('solid') else ['circle','triangle','square','rectangle'])
        s=min(43,w/(len(names)*1.6));gap=w/len(names)
        for i,n in enumerate(names):
            if m.get('solid'):solid(c,n,x+10+i*gap,y+32,s)
            else:shape(c,n,x+10+i*gap,y+32,s,COLORS[i%4])
            text(c,chr(65+i),x+10+i*gap+s/2,y+8,12,center=True)
    elif k=='pattern':
        vals=m['unit']*2;gap=w/(len(vals)+2)
        for i,n in enumerate(vals):shape(c,n,x+5+i*gap,y+40,min(28,gap-8),COLORS[m['unit'].index(n)%4])
        for i in range(2):box(c,x+(len(vals)+i)*gap,y+32,gap-6,42)
    elif k in ('groups','fraction'):
        if k=='fraction' and mode in ('shape','equal'):
            parts=m['parts'];width=(w-90)/parts;xx=x+45
            for i in range(parts):
                sz=width*(.5 if i==0 else 1.5 if i==parts-1 else 1) if mode=='equal' and not m.get('equal') else width
                c.setFillColor(HexColor('#DCC8F0') if (mode=='equal' or answer) and i==0 else white);c.setStrokeColor(HexColor(PURPLE));c.rect(xx,y+22,sz,65,fill=1,stroke=1);xx+=sz
        elif k=='groups' and mode in ('array','equal','repeated'):
            for g in range(m['groups']):
                for j in range(m['size']):shape(c,'circle',x+30+j*36,y+12+g*25,17,COLORS[g%4])
        else:
            groups=m.get('parts',m.get('groups',2));total=m['total']
            objects(c,total,x+5,y+65,w-10,43)
            for g in range(groups):
                xx=x+8+g*(w-16)/groups;box(c,xx,y+2,(w-30)/groups,50,'#FFFFFF',COLORS[g%4])
                if answer or mode=='whole':objects(c,total//groups,xx+5,y+5,(w-45)/groups,43,COLORS[g%4])
    elif k=='measure':
        if mode in ('length','units','cm','height','lengthProblem'):
            if mode=='height':
                for i,n in enumerate([a,b]):
                    for j in range(n):box(c,x+60+i*180,y+5+j*13,35,13,'#DBEAFE' if i==0 else '#D1FAE5')
                line(c,x+20,y+5,x+w-20,y+5,INK)
            else:
                unit=min(24,(w-70)/max(a+b,10));xx=x+22
                for j in range(a):box(c,xx+j*unit,y+60,unit,20,'#DBEAFE',BLUE)
                if mode in ('length','lengthProblem'):
                    if mode=='length':
                        for j in range(b):box(c,xx+j*unit,y+15,unit,20,'#D1FAE5',GREEN)
                    else:box(c,xx,y+10,w*.65,26,'#FFFFFF');text(c,'Draw the longer ribbon.',xx+8,y+17,11,color=GREEN)
                else:
                    numberline(c,xx,y+45,unit*max(a,8),0,max(a,8),1);text(c,'cm (diagram)' if mode=='cm' else 'equal cube units',x+w*.65,y+4,11)
        elif mode in ('mass','massUnits'):
            for i,n in enumerate([a,b] if mode=='mass' else [a]):
                xx=x+i*w/2+8;ww=w/2-20
                line(c,xx+5,y+53,xx+ww-5,y+53,INK,2);shape(c,'triangle',xx+ww/2-10,y+20,20,ORANGE)
                box(c,xx+10,y+55,32,32,'#DBEAFE',BLUE);text(c,chr(65+i),xx+26,y+66,12,center=True)
                for j in range(n):shape(c,'square',xx+ww*.5+(j%5)*16,y+55+(j//5)*16,14,GREEN)
                text(c,'balanced',xx+ww/2,y+3,11,center=True)
        elif mode=='full':
            xx=x+w/2-30;c.setFillColor(HexColor('#7DD3FC'));c.rect(xx,y+5,60,85*m['fill'],fill=1,stroke=0)
            line(c,xx,y+95,xx,y+5,BLUE,2);line(c,xx,y+5,xx+60,y+5,BLUE,2);line(c,xx+60,y+5,xx+60,y+95,BLUE,2)
        else:
            for i,n in enumerate([a,b]):
                xx=x+i*w/2+10;hh=n*12
                box(c,xx,y+5,37,hh,'#BAE6FD',BLUE)
                for j in range(n):line(c,xx,y+5+j*12,xx+37,y+5+j*12,BLUE)
                text(c,chr(65+i),xx+18,y+hh+10,12,bold=True,center=True)
                text(c,str(n)+' equal cups',xx+50,y+35,11)
    elif k=='position':
        if mode in ('route','direction'):
            s=20;xx=x+25
            for i in range(5):
                for j in range(5):c.setStrokeColor(HexColor(LINE));c.rect(xx+i*s,y+j*s,s,s,fill=0)
            shape(c,'circle',xx+5,y+5,10,BLUE);text(c,'START',xx+115,y+5,11,color=BLUE)
        elif mode=='ordinal':
            for i in range(1,6):
                xx=x+20+(i-1)*75;shape(c,'circle',xx,y+60,18,COLORS[(i-1)%4]);box(c,xx-4,y+26,26,32,'#DBEAFE');text(c,i,xx+9,y+35,12,center=True);line(c,xx,y+26,xx-6,y+12,INK);line(c,xx+18,y+26,xx+24,y+12,INK)
        elif mode=='turn':
            line(c,x+70,y+15,x+70,y+90,BLUE,3);line(c,x+70,y+90,x+61,y+77,BLUE,3);line(c,x+70,y+90,x+79,y+77,BLUE,3);text(c,'start',x+70,y-2,11,center=True);box(c,x+150,y+5,100,90);text(c,'Draw the finish.',x+265,y+45,12)
        else:box(c,x+w/2-45,y+15,90,65,'#EFF6FF',BLUE);text(c,'Draw your counter.',x+10,y+h-5,12,color=BLUE)
    elif k=='money':
        if mode=='notes':box(c,x+70,y+20,220,65,'#DFD1EB');text(c,'£'+str(m['value']),x+180,y+43,27,bold=True,center=True)
        elif mode in ('coins','compare'):
            for i,v in enumerate(m.get('coins',[m.get('value',1)])):coin(c,v,x+30+i*120,y+32,48)
        elif mode=='equivalent':
            for i,v in enumerate([1,2,5,10,20]):coin(c,v,x+15+i*65,y+45)
            text(c,'Use these coin values. You may repeat a coin.',x+10,y+6,11)
        else:
            line(c,x+35,y+60,x+100,y+60,ORANGE,9);text(c,str(m['price'])+'p',x+60,y+32,14,center=True);coin(c,10,x+200,y+30,48)
        text(c,'Value models',x+w-95,y+3,9,color=INK)
    elif k=='time':
        if mode in ('hour','half'):clockface(c,x+90,y+52,48,m['hour'] if answer else None,m['minute'])
        elif mode=='duration':
            for i,n in enumerate([a,b]):box(c,x+15,y+58-i*40,n*18,20,'#DBEAFE' if i==0 else '#D1FAE5');text(c,str(n)+' min',x+30+n*18,y+64-i*40,11)
        elif mode=='calendar':
            for i,v in enumerate([m['values'][0],'?',m['values'][-1]]):box(c,x+10+i*145,y+30,135,55,'#EFF6FF');text(c,v,x+77+i*145,y+50,12,center=True)
        else:
            # Scene cards deliberately retain the question's shuffled order.
            for i,v in enumerate([m['values'][2],m['values'][0],m['values'][1]]):
                xx=x+10+i*145;box(c,xx,y+10,135,95,'#FFF7ED');scene(c,v,xx+32,y+54);text(c,v,xx+67,y+21,11,center=True)
    else:raise ValueError('Unknown model '+k)

WORDS=dict(zip(['zero','one','two','three','four','five','six','seven','eight','nine','ten'],range(11)))
def nums(s):return [WORDS.get(v,int(v) if v.isdigit() else 0) for v in re.findall(r'\b(?:\d+|zero|one|two|three|four|five|six|seven|eight|nine|ten)\b',s.lower())]

def legacy(c,q,item,level,i,x,y,w,h):
    """Literal illustrations for the first ten lessons, whose data predates models."""
    s=q['q'];low=s.lower();ns=nums(s);week=item['_week'];day=item['day']
    if week==1 and day==1:
        palette={'red':'#DC4747','blue':BLUE,'yellow':'#FACC15'}
        matches=re.findall(r'(red|blue|yellow|big|small) (circle|square|triangle|star|button)',low)
        if not matches:
            matches=[('red','triangle'),('blue','circle'),('red','square'),('blue','star')] if level=='expected' else [('red','circle'),('blue','square'),('red','square'),('blue','circle')]
        if level=='lower' and i==4:matches=[('big','star'),('small','star'),('big','circle'),('small','circle')]
        if level=='lower' and i==2:
            for j,n in enumerate(['circle','circle','circle','square']):shape(c,n,x+12+j*60,y+60,27,BLUE)
            text(c,'group',x+55,y+30,12,center=True);text(c,'choose',x+180,y+30,12,center=True);return
        for j,(col,n) in enumerate(matches):shape(c,'circle' if n=='button' else n,x+12+j*60,y+65,15 if col=='small' else 27,palette.get(col,BLUE))
        groups=4 if level=='expected' and i==1 else 2
        for group in range(groups):box(c,x+12+group*(w-12)/groups,y+2,(w-24)/groups-10,43)
        if 'blue group' in low:text(c,'BLUE',x+w*.73,y+16,12,BLUE,center=True)
        if 'yellow square' in low:
            c.setStrokeColor(HexColor(BLUE));c.ellipse(x+8,y+54,x+76,y+104,fill=0)
        return
    # Draw the actual symbol groups, replacing typographic placeholders with pictures.
    symbol_groups=re.findall(r'(?<!\w)[●★▲■O](?:[ ●★▲■O]*[●★▲■O])?(?!\w)',s)
    if symbol_groups:
        for j,g in enumerate(symbol_groups):
            icons=[{'●':'circle','★':'star','▲':'triangle','■':'square','O':'circle'}[t] for t in g if t!=' ']
            xx=x+j*w/len(symbol_groups)
            for z,n in enumerate(icons):shape(c,n,xx+8+(z%5)*30,y+55-(z//5)*30,20,COLORS[j%4])
        return
    if week==2 and day>=3:
        numberline(c,x+15,y+35,w-30,0,10)
        if 'ten frame' in low:frame(c,ns[0] if ns else 0,x+170,y+72,10,True,15)
        return
    if 'reversed numeral' in low:
        for j,n in enumerate([6,7,8,9,10]):
            xx=x+30+j*65
            box(c,xx-8,y+25,50,53,'#EFF6FF')
            if n==7:c.saveState();c.translate(xx+22,y+40);c.scale(-1,1);text(c,7,0,0,28);c.restoreState()
            else:text(c,n,xx,y+40,28)
        return
    if 'trace and copy' in low:
        for j in range(5):text(c,ns[0],x+20+j*70,y+45,38,'#B9C7D7' if j<3 else INK)
        return
    if 'two rows' in low:
        for j in range(6):shape(c,'circle',x+20+j%3*35,y+25+j//3*35,23,BLUE)
        return
    if 'ben says' in low:
        objects(c,6,x+10,y+35,230,65);text(c,'1, 2, 3, 5, 6, 7',x+10,y+10,16);return
    if 'sam labels eight' in low:
        objects(c,8,x+10,y+15,240,80);text(c,9,x+320,y+40,28);return
    if 'child draws four stars' in low:
        objects(c,4,x+10,y+15,220,80,BLUE,'star');text(c,5,x+310,y+40,28);return
    if 'card showing numeral 3 and five dots' in low:
        objects(c,5,x+10,y+15,220,80);text(c,3,x+310,y+40,28);return
    if 'mixed dot patterns' in low:
        for j,n in enumerate([3,0,5,1,4,2]):objects(c,n,x+10+j*75,y+40,68,55)
        text(c,'0     1     2     3     4     5',x+70,y+6,18);return
    if 'three large' in low:
        objects(c,3,x+10,y+20,190,70,BLUE);objects(c,4,x+250,y+40,100,25,GREEN);return
    if 'empty' in low or 'frame' in low:
        frame(c,8 if 'two empty spaces' in low else 0,x+20,y+65,10 if week==2 else 5,'two empty spaces' in low)
        if 'two dots and four cubes' in low:objects(c,2,x+190,y+20,70,65);objects(c,4,x+290,y+20,120,65,GREEN,'square')
        return
    if 'seven stars or eight stars' in low:
        objects(c,7,x+5,y+5,w*.45,85,BLUE,'star');objects(c,8,x+w*.52,y+5,w*.45,85,GREEN,'star');return
    if 'eight counters show 9' in low:objects(c,8,x+15,y+15,250,70);text(c,9,x+320,y+35,28);return
    if any(t in low for t in ['draw','create','invent','show','advice','explain','why','clue','write a','every']):
        # A model workspace is intentional: do not pre-draw the child's answer.
        if 'equal' in low or 'two' in low or 'different' in low:
            box(c,x+12,y+12,w*.43,75);box(c,x+w*.53,y+12,w*.43,75)
        else:frame(c,0,x+20,y+62,10 if week==2 else 5)
        text(c,'Draw or use counters to show your thinking.',x+12,y-4,11,color=BLUE)
        return
    if 'card shows numeral 2' in low:objects(c,3,x+20,y+15,180,70);text(c,2,x+280,y+40,30);return
    if 'seven dots labelled 8' in low:objects(c,7,x+15,y+10,230,80);text(c,8,x+320,y+35,28);return
    if 'mia counts four' in low:objects(c,4,x+10,y+20,180,65);text(c,'1, 2, 3, 4, 5',x+230,y+40,18);return
    if 'seven stars or eight stars' in low:
        objects(c,7,x+5,y+5,w*.45,85,BLUE,'star');objects(c,8,x+w*.52,y+5,w*.45,85,GREEN,'star');return
    if 'nine objects' in low:objects(c,9,x+15,y+5,w-30,85);return
    if 'and 2 more' in low:objects(c,7,x+15,y+15,230,70);objects(c,2,x+300,y+15,90,70,GREEN);return
    if 'eight counters show 9' in low:objects(c,8,x+15,y+15,250,70);text(c,9,x+320,y+35,28);return
    if ns:
        values=ns[:3]
        for j,n in enumerate(values):
            xx=x+j*w/len(values)
            named=re.findall(r'\b(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten) (stars|circles|cubes)',low)
            icon={'stars':'star','circles':'circle','cubes':'square'}.get(named[j] if j<len(named) else '', 'circle')
            objects(c,n,xx+8,y+20,w/len(values)-16,70,COLORS[j%4],icon)
        return
    frame(c,0,x+20,y+62,10 if week==2 else 5);text(c,'Use this frame to show your thinking.',x+12,y-3,11,color=BLUE)

def header(c,item,level,page,answers=False):
    accent={'lower':BLUE,'expected':GREEN,'higher':PURPLE}[level]
    box(c,32,H-105,W-64,73,'#F5F9FF',accent)
    text(c,'BrightPath  •  Year 1 Maths',46,H-49,11,accent,True)
    para(c,item['title'],46,H-60,W-92,19,45)
    text(c,('Answers • ' if answers else '')+{'lower':'Let’s practise','expected':'Your turn','higher':'Think and explain'}[level],38,H-128,15,accent,True)
    if not answers:text(c,'Name: __________________________',38,H-152,12)
    line(c,35,40,W-35,40)
    text(c,'BrightPath • '+('Answer guide' if answers else 'Look. Count. Draw. Explain.'),38,25,10,INK)
    text(c,str(page),W-40,25,10,INK,center=True)

def build(item,level,out):
    qs=item[level];assert len(qs)==5
    c=canvas.Canvas(str(out),pagesize=A4,pageCompression=1,invariant=1)
    c.setTitle(item['title']+' - '+level+' picture worksheet');c.setAuthor('BrightPath')
    for p in range(3):
        header(c,item,level,p+1)
        for j,q in enumerate(qs[p*2:p*2+2]):
            i=p*2+j;top=H-178-j*290;bottom=top-267
            box(c,34,bottom,W-68,267)
            text(c,str(i+1),49,top-26,17,COLORS[i%4],True)
            # Symbols are redrawn below as native vector pictures.
            question=re.sub(r'(?<!\w)[●★▲■O](?:[ ●★▲■O]*[●★▲■O])?(?!\w)', '[pictures below]',q['q']) if item['_week']<=2 else q['q']
            para(c,question,75,top-11,W-124,15,80)
            m=q.get('model')
            if m:draw_model(c,m,49,bottom+62,W-98,100,level)
            elif item['_week']<=2:legacy(c,q,item,level,i,49,bottom+62,W-98,100)
            elif 'One hour has sixty minutes' in q['q']:
                for cx,hour,minute,label in [(130,3,0,'Start'),(295,3,30,'30 minutes later'),(460,4,0,'60 minutes later')]:
                    clockface(c,cx,bottom+115,40,hour,minute);text(c,label,cx,bottom+64,10,center=True)
            else:
                # General reasoning questions receive a topic-specific example to test.
                m=next((v['model'] for v in item[level] if v.get('model')),None)
                if not m:raise ValueError('No model for reasoning')
                draw_model(c,m,49,bottom+62,W-98,90,level)
            line(c,52,bottom+35,W-55,bottom+35)
            if level=='higher':text(c,'I know because',52,bottom+43,11,color=PURPLE);line(c,52,bottom+14,W-55,bottom+14)
            else:text(c,'My answer:',52,bottom+43,11,color=BLUE)
        c.showPage()
    header(c,item,level,4,True)
    for i,q in enumerate(qs):
        top=H-161-i*119;box(c,34,top-106,W-68,106,'#F8FBF9')
        text(c,str(i+1),48,top-24,16,GREEN,True)
        para(c,answer_text(q['a']),76,top-12,W-129,13,87)
    c.showPage();c.save()
    reader=PdfReader(str(out));assert len(reader.pages)==4
    for p in reader.pages:
        assert len(p.extract_text())>75
    return {'file':str(out.relative_to(QA)),'pages':4,'questions':len(qs),'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'week':item['_week'],'day':item['day'],'level':level,'slug':item['slug']}

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--week',type=int);ap.add_argument('--publish',action='store_true');args=ap.parse_args()
    QA.mkdir(parents=True,exist_ok=True)
    if args.publish:
        data=json.loads((QA/'audit.json').read_text())
        assert len(data)==450 and (QA/'render-audit.json').exists(),'Build and render all worksheets first'
        changed=[]
        for row in data:
            src=QA/row['file'];assert hashlib.sha256(src.read_bytes()).hexdigest()==row['sha256']
            dest=ROOT/f"lessons/year-1-maths/week-{row['week']}/{row['slug']}";dest.mkdir(parents=True,exist_ok=True)
            filename=row['level']+'-worksheet.pdf'
            backup=QA/'originals'/src.name;backup.parent.mkdir(exist_ok=True)
            if (dest/filename).exists() and not backup.exists():shutil.copy2(dest/filename,backup)
            shutil.copy2(src,dest/filename)
            preview=dest/'preview';preview.mkdir(exist_ok=True)
            shutil.copy2(QA/'renders'/src.stem/'page-1.png',preview/(row['level']+'-worksheet.png'))
            changed.append(str((dest/filename).relative_to(ROOT)))
        (QA/'published-paths.json').write_text(json.dumps(changed,indent=2));print('Published 450 picture worksheets locally.');return
    for w in range(1,31):
        if args.week and args.week!=w:continue
        items=json.loads((ROOT/f'lessons/year-1-maths/week-{w}/week{w}-lessons.json').read_text(encoding='utf-8'))
        for item in items:
            item['_week']=w
            for level in ('lower','expected','higher'):
                out=QA/f"1-{w}-{item['day']}-{level}.pdf"
                AUDIT.append(build(item,level,out))
        print(f'Built week {w}: 15 illustrated worksheets',flush=True)
    (QA/('audit.json' if not args.week else f'audit-week-{args.week}.json')).write_text(json.dumps(AUDIT,indent=2))
    if args.week and (QA/'audit.json').exists():
        previous=json.loads((QA/'audit.json').read_text())
        merged=[row for row in previous if row['week']!=args.week]+AUDIT
        (QA/'audit.json').write_text(json.dumps(sorted(merged,key=lambda r:(r['week'],r['day'],r['level'])),indent=2))

if __name__=='__main__':main()
