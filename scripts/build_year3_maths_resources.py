"""Year 3 printable resources. Five illustrated questions per A4 pupil page."""
import json,math,re,zipfile,sys
from pathlib import Path
from docx import Document
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
import build_year2_maths_resources as base
from build_year1_picture_worksheets import text,para,line,shape,solid,BLUE,GREEN,PURPLE,INK
ROOT=Path(__file__).resolve().parents[1];QA=ROOT/'.qa/year3-maths';W,H=A4
COLORS=[BLUE,GREEN,PURPLE]
def rect(c,x,y,w,h,fill='#FFFFFF',stroke='#A8BCD0'):
 c.setFillColor(HexColor(fill));c.setStrokeColor(HexColor(stroke));c.setLineWidth(.65);c.rect(x,y,w,h,fill=1,stroke=1)
def strip(c,num,den,x,y,w=200,h=24):
 for j in range(den):rect(c,x+j*w/den,y,w/den,h,PURPLE if j<num else '#FFFFFF',PURPLE)
def clock(c,x,y,h,m,roman=False):
 r=39;c.setFillColor(HexColor('#FFFFFF'));c.setStrokeColor(HexColor(BLUE));c.circle(x,y,r,fill=1)
 romans=['I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII']
 for n in range(1,61):
  a=math.radians(90-n*6);line(c,x+math.cos(a)*(r-3),y+math.sin(a)*(r-3),x+math.cos(a)*(r-5),y+math.sin(a)*(r-5),BLUE,.4)
 for n in range(1,13):
  a=math.radians(90-n*30);text(c,romans[n-1] if roman else n,x+math.cos(a)*(r-12),y+math.sin(a)*(r-12)-3,7,center=True)
 for angle,length,col in [(90-h*30-m*.5,18,BLUE),(90-m*6,28,GREEN)]:
  a=math.radians(angle);line(c,x,y,x+math.cos(a)*length,y+math.sin(a)*length,col,1.7)
def model(c,m,x,y,w,h,solved=False,level='expected'):
 t=m['type'];yy=y+20
 if t=='place':
  digits=list(str(m['n']).zfill(3))
  for j,(d,label) in enumerate(zip(digits,['hundreds','tens','ones'])):
   xx=x+j*w/3;text(c,label,xx+w/6,y+75,8,BLUE,center=True);rect(c,xx,y+28,w/3-2,40,'#EEF5FF');text(c,d,xx+w/6,y+40,19,COLORS[j],True,True)
 elif t=='moreLess':
  for j,v in enumerate(m['values']):text(c,v if solved or j==1 else '?',x+(j+.5)*w/3,y+38,15,COLORS[j],True,True)
  text(c,'−'+str(m['delta']),x+w/6,y+65,9,BLUE,center=True);text(c,'+'+str(m['delta']),x+w*5/6,y+65,9,BLUE,center=True)
 elif t in ['numbers','sequence','fractionSequence']:
  vals=m['values'];gap=w/len(vals)
  for j,v in enumerate(vals):text(c,'?' if j==m.get('missing') and not solved else str(v)+('/'+str(m['den']) if t=='fractionSequence' else ''),x+j*gap+gap/2,y+39,11,BLUE,True,True)
 elif t in ['numberline','fractionLine']:
  start=m.get('start',0);end=m.get('end',m.get('max',1));step=m.get('step',1/m.get('den',1));count=round((end-start)/step);line(c,x+10,y+40,x+w-10,y+40,BLUE)
  for j in range(count+1):
   xx=x+10+j*(w-20)/count;line(c,xx,y+36,xx,y+44,BLUE)
   if j in [0,count] or count<=10:text(c,round(start+j*step,3) if t=='numberline' else str(j)+'/'+str(m['den']),xx,y+22,7,center=True)
  val=m.get('value',m.get('num',0)/m.get('den',1));xx=x+10+(val-start)/(end-start)*(w-20);shape(c,'circle',xx-3,y+45,6,GREEN)
  if m.get('unit'):text(c,m['unit'],x+w-10,y+64,8,center=True)
  if solved:text(c,str(val) if t=='numberline' else str(m['num'])+'/'+str(m['den']),xx,y+59,9,GREEN,True,True)
 elif t in ['calculation','multiply','division','measureCalc','money','estimate','compensate','twoStep']:
  if m.get('read'):
   text(c,str(m['a'])+'p',x+w/2,y+40,22,BLUE,True,True);return
  a=m['a'];b=m['b'];op=m.get('op','×' if t=='multiply' else '÷' if t=='division' else '+')
  if op=='change':a=m['pay'];b=m['a']+m['b'];op='−'
  text(c,a,x+w/2,y+65,16,BLUE,True,True);text(c,op+' '+str(b),x+w/2,y+43,16,GREEN,True,True);line(c,x+40,y+36,x+w-40,y+36,BLUE)
  if solved:text(c,str(m['total'])+(' r '+str(m['remainder']) if m.get('remainder') else ''),x+w/2,y+16,15,GREEN,True,True)
  elif t=='division':text(c,'equal groups of '+str(b),x+w/2,y+15,9,BLUE,center=True)
  if t=='twoStep':text(c,'then − '+str(m['c']),x+w/2,y+1,9,PURPLE,center=True)
 elif t in ['groups','double']:
  groups=m['groups'];size=m['size'];gap=min(13,w/max(groups,size));cols=size
  for j in range(groups*size):shape(c,'circle',x+15+j%cols*gap,y+5+j//cols*min(7,75/groups),4.5,COLORS[j//cols%3])
  if t=='double':text(c,'double the groups',x+95,y+32,9,GREEN)
 elif t in ['fraction','equivalent','fractionCalc']:
  num=m['num'];den=m['den'];strip(c,num if solved or t!='fraction' else 0,den,x+8,y+42,w-16,24)
  if t=='equivalent':strip(c,num*m['factor'] if solved else 0,den*m['factor'],x+8,y+8,w-16,24)
  elif t=='fractionCalc':strip(c,m['value'] if solved else m['other'],den,x+8,y+8,w-16,24);text(c,m['op'],x+w/2,y+34,9,BLUE,center=True)
 elif t=='fractionOf':
  d=m['den'];part=m['total']/d
  for j in range(d):
   rect(c,x+j*w/d,y+24,w/d,32,'#E4D5F5' if solved and j<m['num'] else '#FFFFFF',PURPLE)
   if solved:text(c,int(part),x+(j+.5)*w/d,y+36,10,GREEN,True,True)
  text(c,('one part = '+str(int(part))) if m.get('reverse') and not solved else 'whole = '+str(m['total']),x+w/2,y+68,10,BLUE,center=True)
 elif t=='fractionCompare':
  for j,(n,d) in enumerate(zip(m['nums'],m['dens'])):strip(c,n,d,x+40,y+5+j*25,w-50,18);text(c,f'{n}/{d}',x+15,y+10+j*25,9,BLUE,center=True)
 elif t=='rectangle':
  rect(c,x+45,y+15,100,50,'#EEF5FF',BLUE);text(c,str(m['a'])+' cm',x+95,y+73,10,BLUE,center=True);text(c,('?' if m.get('missing') and not solved else str(m['b']))+' cm',x+172,y+36,10,BLUE,center=True)
 elif t=='convert':
  text(c,str(m['a'])+' '+m['big'],x+w/2,y+64,14,BLUE,True,True);text(c,'1 '+m['big']+' = '+str(m['factor'])+' '+m['unit'],x+w/2,y+42,9,GREEN,center=True)
  text(c,('and '+str(m['b'])+' '+m['unit']) if m['b'] else '× '+str(m['factor']),x+w/2,y+20,10,PURPLE,center=True)
 elif t=='clock':clock(c,x+w/2,y+43,m['hour'],m['minute'],m.get('roman'))
 elif t=='timeCompare':text(c,str(m['a'])+' min',x+50,y+48,13,BLUE,center=True);text(c,str(m['b'])+' sec',x+150,y+24,13,GREEN,center=True)
 elif t=='calendar':
  text(c,m['label'],x+w/2,y+70,10,BLUE,center=True)
  for row in range(4):
   for col in range(7):rect(c,x+35+col*20,y+row*13,20,13,'#EEF5FF')
 elif t=='angle':
  angle=math.radians(m['angle']);cx=x+80;cy=y+15;line(c,cx,cy,cx+75,cy,BLUE,2);line(c,cx,cy,cx+75*math.cos(angle),cy+75*math.sin(angle),GREEN,2)
  if m['angle']==90:line(c,cx+12,cy,cx+12,cy+12,BLUE);line(c,cx+12,cy+12,cx,cy+12,BLUE)
 elif t=='turn':
  from build_year2_maths_resources import arrow
  arrow(c,x+65,y+40,55,0);text(c,'start',x+65,y+4,9,center=True)
  if solved:arrow(c,x+160,y+40,55,m['turn']%4,GREEN)
  else:rect(c,x+125,y+12,65,55)
 elif t=='solid':
  c.saveState()
  if m.get('rotated'):c.translate(x+100,y+42);c.rotate(25);base.flat if False else None;xx=-30;yy=-28
  else:xx=x+70;yy=y+12
  if m['name']=='triangular prism':
   pts=[(xx,yy),(xx+55,yy),(xx+27,yy+50)];p=c.beginPath();p.moveTo(*pts[0]);[p.lineTo(*v) for v in pts[1:]];p.close();c.setFillColor(HexColor('#DBEAFE'));c.setStrokeColor(HexColor(BLUE));c.drawPath(p,fill=1,stroke=1)
   for px,py in pts:line(c,px,py,px+25,py+17,BLUE)
   line(c,xx+25,yy+17,xx+52,yy+67,BLUE);line(c,xx+52,yy+67,xx+80,yy+17,BLUE)
  else:solid(c,m['name'],xx,yy,48)
  c.restoreState()
 elif t in ['grid','ruler']:
  for j in range(11):line(c,x+10+j*18,y+5,x+10+j*18,y+77,'#D5E1EE',.5)
  for j in range(5):line(c,x+10,y+5+j*18,x+190,y+5+j*18,'#D5E1EE',.5)
  if solved and t=='grid':rect(c,x+46,y+23,72 if m['name']=='rectangle' else 36,36,'#EEF5FF',BLUE)
 elif t=='lines':
  style=m['style']
  if style=='crossLines':
   line(c,x+30,y+20,x+180,y+20,BLUE,2);line(c,x+30,y+60,x+180,y+60,BLUE,2);line(c,x+100,y+5,x+100,y+78,GREEN,2)
  elif style=='rectangle':rect(c,x+45,y+14,110,54,'#FFFFFF',BLUE)
  elif style=='perpendicular':line(c,x+30,y+40,x+180,y+40,BLUE,2);line(c,x+100,y+5,x+100,y+78,GREEN,2)
  elif style=='vertical':line(c,x+70,y+5,x+70,y+75,BLUE,2);line(c,x+140,y+5,x+140,y+75,GREEN,2)
  else:line(c,x+35,y+25,x+180,y+25,BLUE,2);line(c,x+35,y+60,x+180,y+60,GREEN,2)
 elif t=='data':
  vals=m['values'];key=m['key'];maxv=key*10
  for j,v in enumerate(vals):
   text(c,m['labels'][j],x,y+15+j*22,8,BLUE)
   if m['mode']=='table':text(c,v,x+120,y+15+j*22,11,GREEN)
   elif m['mode']=='pictogram':
    for k in range(v//key):shape(c,'circle',x+43+k*15,y+14+j*22,7,COLORS[j])
   else:
    rect(c,x+45,y+12+j*22,(w-52)*v/maxv if not(m['mode']=='drawBar' and j==2 and not solved) else 0,12,COLORS[j])
  if m['mode']=='pictogram':text(c,'Each circle = '+str(key),x+50,y-5,8)
  elif m['mode']!='table':
   for k in range(0,11,2):text(c,k*key,x+45+(w-52)*k/10,y-5,7,center=True)
 else:raise ValueError(t)
def header(c,l,label):
 text(c,'BrightPath | Year 3 Maths',32,H-29,10,GREEN,True);para(c,l['title'],32,H-40,W-64,18,47);text(c,label,32,H-101,11,GREEN,True);line(c,30,28,W-30,28);text(c,'BrightPath',32,15,8)
def worksheet(l,level,folder):
 c=canvas.Canvas(str(folder/(level+'-worksheet.pdf')),pagesize=A4,invariant=1);c.setTitle(l['title']+' '+level+' worksheet')
 for solved in [False,True]:
  header(c,l,'Answers — print separately' if solved else {'lower':'Supported practice','expected':'Your turn','higher':'Think and explain'}[level])
  if not solved:text(c,'Name: ___________________',330,H-101,10)
  for i,q in enumerate(l[level]):
   top=H-124-i*136;bottom=top-124;text(c,i+1,32,top-14,12,GREEN,True);para(c,q['a'] if solved else q['q'],52,top,268,11.5,95);model(c,q['model'],337,bottom+23,218,82,solved,level);line(c,32,bottom,W-32,bottom)
   if not solved:line(c,52,bottom+15,310,bottom+15)
  c.showPage()
 c.save()
def plan(l,folder):
 base.plan(l,folder);file=folder/'editable-teacher-plan.docx';doc=Document(file)
 for p in doc.paragraphs:
  if p.text in ['Teaching sequence (60 minutes)','Pre-teach and worksheet answer guide']:p.paragraph_format.page_break_before=True
  for r in p.runs:r.text=r.text.replace('Year 2 Maths','Year 3 Maths')
 doc.save(file)
def main():
 QA.mkdir(parents=True,exist_ok=True);base.header=header;base.model=model
 for l in json.loads((QA/'lessons.json').read_text(encoding='utf-8-sig')):
  if len(sys.argv)>1 and f"3:{l['week']}.{l['day']}" not in sys.argv[1:]:continue
  folder=QA/'resources'/f"3-{l['week']}-{l['day']}";folder.mkdir(parents=True,exist_ok=True)
  for level in ['lower','expected','higher']:worksheet(l,level,folder)
  base.preteach(l,folder);plan(l,folder)
  print('BUILT',folder.name,flush=True)
if __name__=='__main__':main()
