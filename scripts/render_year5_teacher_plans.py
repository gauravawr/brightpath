"""Create faithful three-page PDF previews for the editable Year 5 Word plans."""
import json,hashlib
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from build_year1_picture_worksheets import text,para,line,BLUE,GREEN

ROOT=Path(__file__).resolve().parents[1];QA=ROOT/'.qa/year5-maths';W,H=A4

def header(c,l,label,page):
 text(c,'BrightPath | Year 5 Maths',32,H-28,10,GREEN,True)
 para(c,l['title'],32,H-40,W-64,18,48)
 text(c,label,32,H-96,10,GREEN,True);line(c,30,28,W-30,28);text(c,f"Week {l['week']} • Day {l['day']} • Page {page}",32,15,8)

def block(c,title,body,y,height=64):
 c.setFillColor(HexColor('#F4F8FC'));c.roundRect(32,y-height,W-64,height,7,fill=1,stroke=0)
 text(c,title,44,y-18,10,GREEN,True);para(c,body,44,y-24,W-88,9.5,height-28)
 return y-height-10

def preview(l,folder):
 out=folder/'preview';out.mkdir(parents=True,exist_ok=True);file=out/'teacher-plan.pdf'
 c=canvas.Canvas(str(file),pagesize=A4,invariant=1);c.setTitle(l['title']+' teacher plan preview');c.setAuthor('BrightPath')
 header(c,l,'Lesson overview',1);y=H-120
 y=block(c,'Learning objective',l['objective'],y,70)
 y=block(c,'Success criteria',' • '.join(l['successCriteria']),y,84)
 y=block(c,'Vocabulary',', '.join(l['vocabulary']),y,60)
 y=block(c,'Retrieval starter',l['warmup'],y,88)
 y=block(c,'Likely misconception',l['misconception']+' Check: '+l['check'],y,90)
 y=block(c,'Resources',l['resources'],y,72)
 c.showPage()

 header(c,l,'Teaching sequence (60 minutes)',2);y=H-122
 stages=[('Retrieval and pre-teach','Use the retrieval starter, then rehearse the three pre-teach questions with concrete or pictorial support.'),('I do',l['examples'][0]['q']+' Answer: '+l['examples'][0]['a']),('We do',l['examples'][1]['q']+' Answer: '+l['examples'][1]['a']),('You do',l['examples'][2]['q']+' Answer: '+l['examples'][2]['a']),('Second model',l['examples'][3]['q']+' Answer: '+l['examples'][3]['a']),('Independent check',l['examples'][4]['q']+' Answer: '+l['examples'][4]['a'])]
 for title_,body in stages:y=block(c,title_,body,y,82)
 text(c,'Pre-teach quick-check answers',32,y-4,11,GREEN,True);y-=24
 for i,q in enumerate(l['preteach']['questions'],1):
  para(c,f"{i}. {q['q']}  Answer: {q['a']}",45,y,W-77,9,42);y-=48
 c.showPage()

 header(c,l,'Pre-teach and worksheet answer guide',3);y=H-120
 for level,label in [('lower','Supported practice'),('expected','Expected standard'),('higher','Greater depth')]:
  text(c,label,32,y,11,GREEN,True);y-=17
  for i,q in enumerate(l[level],1):
   para(c,f"{i}. {q['a']}",45,y,W-77,8.5,27);y-=30
  y-=8
 text(c,'Assessment note',32,y,10,GREEN,True);para(c,'Record the method used, any prompt given and the next small teaching step. Recheck with a fresh example.',32,y-10,W-64,9,50)
 c.showPage();c.save();return file

def main():
 lessons=json.loads((QA/'lessons.json').read_text(encoding='utf-8'));report=[]
 for l in lessons:
  id=f"5-{l['week']}-{l['day']}";file=preview(l,QA/'resources'/id);report.append(dict(id=id,pages=3,sha256=hashlib.sha256(file.read_bytes()).hexdigest()))
  print('RENDERED',id,'3 pages',flush=True)
 (QA/'teacher-plan-render-report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
if __name__=='__main__':main()
