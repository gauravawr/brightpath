"""Five illustrated Year 1 questions on one A4 pupil page, plus answer page."""
import json,re,hashlib,shutil,sys
from pathlib import Path
import pdfplumber
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from build_year1_picture_worksheets import ROOT,draw_model,legacy,clockface,text,para,line,box,answer_text,BLUE,GREEN,PURPLE,W,H
import build_year1_picture_worksheets as models
QA=ROOT/'.qa/year1-a4-worksheets';QA.mkdir(parents=True,exist_ok=True)

def picture(c,q,item,level,i,x,y,answers=False):
    original_text=models.text
    original_clock=models.clockface
    def readable_text(canvas,value,x,y,size=13,color=models.INK,bold=False,center=False):
        # Avoid shrinking instructional captions into unreadable micro-text.
        # The full question is already printed beside the picture.
        if len(str(value))>28:return
        original_text(canvas,value,x,y,max(size,18.5),color,bold,center)
    models.text=readable_text
    models.clockface=lambda canvas,x,y,r=48,hour=None,minute=0:original_clock(canvas,x,y,max(r,70),hour,minute)
    c.saveState();c.translate(x,y);c.scale(.46,.46)
    model=q.get('model')
    if model:draw_model(c,model,0,0,460,100,level,answer=answers)
    elif item['_week']<=2:legacy(c,q,item,level,i,0,0,460,100)
    elif 'One hour has sixty minutes' in q['q']:
        for cx,hour,minute in [(70,3,0),(230,3,30),(390,4,0)]:models.clockface(c,cx,50,70,hour,minute)
    else:
        model=next((v['model'] for v in item[level] if v.get('model')),None)
        assert model,(item['slug'],level,i)
        draw_model(c,model,0,0,460,100,level)
    c.restoreState();models.text=original_text;models.clockface=original_clock

only={int(w) for w in sys.argv[1:]}
rows=[r for r in json.loads((QA/'validation.json').read_text()) if int(r['source'].split('-')[1]) not in only] if only else []
for week in range(1,31):
    if only and week not in only:continue
    for item in json.loads((ROOT/f'lessons/year-1-maths/week-{week}/week{week}-lessons.json').read_text(encoding='utf-8')):
        item['_week']=week
        for level,accent in [('lower',BLUE),('expected',GREEN),('higher',PURPLE)]:
            qs=item[level];assert len(qs)==5
            file=QA/f"1-{week}-{item['day']}-{level}.pdf";c=canvas.Canvas(str(file),pagesize=A4,invariant=1)
            for answers in [False,True]:
                text(c,'BrightPath | Year 1 Maths',34,H-34,11,accent,True)
                para(c,item['title'],34,H-47,W-68,18,48)
                text(c,'Answers' if answers else {'lower':'Let’s practise','expected':'Your turn','higher':'Think and explain'}[level],34,H-113,12,accent,True)
                if not answers:text(c,'Name: ____________________',340,H-113,11)
                for i,q in enumerate(qs):
                    top=H-138-i*130;bottom=top-122
                    box(c,30,bottom,W-60,122,'#F8FBFF',accent)
                    text(c,i+1,40,top-19,12,accent,True)
                    question=re.sub(r'(?<!\w)[●★▲■O](?:[ ●★▲■O]*[●★▲■O])?(?!\w)','[pictures]',q['q']) if week<=2 else q['q']
                    content=answer_text(q['a']) if answers else question
                    para(c,content,60,top-10,260,12,89)
                    picture(c,q,item,level,i,335,bottom+35,answers)
                    if not answers:line(c,60,bottom+13,310,bottom+13)
                text(c,'Answer guide' if answers else 'Print this page for pupils. Answers are on page 2.',34,28,9,accent)
                c.showPage()
            c.save()
            with pdfplumber.open(file) as pdf:
                assert len(pdf.pages)==2
                for n,page in enumerate(pdf.pages):
                    assert abs(page.width-W)<1 and abs(page.height-H)<1
                    for span in page.chars:
                        assert span['x0']>=25 and span['x1']<=W-24 and span['top']>=15 and span['bottom']<=H-15,(file.name,n,span['text'])
                    if n==1:
                        clean=lambda s:''.join(s.split())
                        for i,q in enumerate(qs):assert clean(answer_text(q['a'])) in clean(page.crop((55,138+i*130,323,260+i*130)).extract_text()),(file.name,'missing answer',i)
                    page.to_image(resolution=90,antialias=True).save(QA/(file.stem+f'-page-{n+1}.png'))
            rows.append({'file':f'lessons/year-1-maths/week-{week}/{item["slug"]}/{level}-worksheet.pdf','source':file.name,'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'pages':2,'pupilPages':1,'questions':5})
    print(f'Built and checked week {week}',flush=True)
assert len(rows)==450
(QA/'validation.json').write_text(json.dumps(rows,indent=2))
print('PASS: 450 worksheets; 900 A4 pages rendered; five questions and all answers checked.')
