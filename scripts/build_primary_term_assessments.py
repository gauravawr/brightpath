"""Term assessment packs aligned with BrightPath's existing term maps."""
import json,hashlib,zipfile,math
from pathlib import Path
from lxml import etree as E
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
from build_year1_picture_worksheets import text,para,box,line,draw_model,coin,shape,BLUE,GREEN,PURPLE
from build_year2_maths_resources import model as year2_model,arrow
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'.qa/term-assessments';W,H=A4
TERMS=['Autumn','Spring','Summer']
REFERENCE=ROOT/'lessons/year-6-maths/evaluations/autumn/editable-teacher-evaluation-record.docx'

SELECTION={
1:[[(3,1),(3,5),(4,3),(4,4),(5,1),(5,5),(6,2),(7,3),(8,3),(9,3)],
   [(11,2),(12,3),(13,3),(14,1),(15,2),(16,2),(17,4),(18,3),(19,1),(19,4)],
   [(21,2),(22,2),(23,4),(24,3),(25,3),(26,3),(27,2),(28,4),(29,4),(29,5)]],
2:[[(1,1),(2,3),(3,4),(4,3),(5,1),(6,3),(7,2),(8,3),(9,3),(10,4)],
   [(11,4),(12,3),(13,3),(14,2),(15,1),(16,4),(17,1),(17,3),(18,4),(19,1)],
   [(21,1),(21,2),(21,3),(22,2),(22,4),(23,3),(24,5),(25,3),(26,3),(27,3)]]}

YEAR4=[
[
('What is the value of the digit 6 in 4,632?','600.','Place value',['Thousands','Hundreds','Tens','Ones'],['4','6','3','2']),
('Order 3,012, 3,120 and 3,021 from smallest.','3,012; 3,021; 3,120.','Compare numbers',[],['3012','3120','3021']),
('The temperature is −3°C. It rises by 5°C. What is it now?','2°C.','Negative numbers',[],['−3°C','+5°C','?']),
('Write XLIV as a number.','44.','Roman numerals',[],['XL','IV']),
('Round 3,647 to the nearest 100.','3,600.','Rounding',[],['3600','3647','3700']),
('Calculate 2,768 + 1,457.','4,225.','Addition',[],['2768','+1457']),
('Calculate 5,002 − 2,786.','2,216.','Subtraction',[],['5002','−2786']),
('Complete: 8 × 7 = ___.','56.','Multiplication facts',[],['8','×','7']),
('Write all the factor pairs of 24.','1 × 24, 2 × 12, 3 × 8, 4 × 6.','Factors',[],['__ × __ = 24']),
('Calculate 136 × 4.','544.','Multiplication',[],['136','×4']),
('Calculate 168 ÷ 6.','28.','Division',[],['168','÷','6']),
('Check this claim with an inverse calculation: 84 ÷ 7 = 12.','12 × 7 = 84 (or 7 × 12 = 84).','Inverse operations',[],['84 ÷ 7 = 12'])],
[
('Complete: 3 km 250 m = ___ m.','3,250 m.','Length units',[],['3 km','250 m']),
('A rectangle is 8 cm long and 5 cm wide. Find its perimeter.','26 cm.','Perimeter',[],['8 cm × 5 cm']),
('A rectangle has 4 rows of 6 unit squares. What is its area?','24 square units.','Area',[],['4 rows','6 in each row']),
('Complete: 3/4 = ___/12.','9.','Equivalent fractions',[],['3/4','= __/12']),
('Calculate 3/8 + 4/8.','7/8.','Add fractions',[],['3/8','+','4/8']),
('Calculate 7/10 − 2/10.','5/10 or 1/2.','Subtract fractions',[],['7/10','−','2/10']),
('Write 37/100 as a decimal.','0.37.','Hundredths',['Ones','Tenths','Hundredths'],['0','3','7']),
('Order 0.6, 0.06 and 0.66 from smallest.','0.06; 0.6; 0.66.','Compare decimals',[],['0.6','0.06','0.66']),
('Round 3.7 to the nearest whole number.','4.','Round decimals',[],['3','3.7','4']),
('Calculate 46 ÷ 10.','4.6.','Divide by ten',[],['46','÷','10']),
('Calculate 327 ÷ 100.','3.27.','Divide by one hundred',[],['327','÷','100']),
('Find 3/4 of 28.','21.','Fraction of a quantity',[],['28 ÷ 4','then × 3'])],
[
('A book costs £3.75. Find the change from £5.','£1.25.','Money',[],['£5','−','£3.75']),
('Write 3:45 pm using the 24-hour clock.','15:45.','24-hour time',[],['3:45 pm','?']),
('A film starts at 14:35 and ends at 15:20. How long is it?','45 minutes.','Elapsed time',[],['14:35','15:20']),
('Name an angle smaller than a right angle.','An acute angle.','Angles',[],['less than 90°']),
('A triangle has three equal sides. What is its name?','Equilateral triangle.','Triangles',[],['3 equal sides']),
('How many lines of symmetry does a square have?','4.','Symmetry',[],['square']),
('Start at (2, 3). Move 4 right and 1 up. Give the new coordinates.','(6, 4).','Translation',[],['(2, 3)','4 right, 1 up']),
('A point is 5 across and 2 up from the origin. Write its coordinates.','(5, 2).','Coordinates',[],['5 across','2 up']),
('Votes: apples 12, pears 8, plums 15. How many votes altogether?','35.','Interpret data',[],['Apples 12','Pears 8','Plums 15']),
('Calculate 2,406 + 1,879.','4,285.','Arithmetic',[],['2406','+1879']),
('Four boxes each hold 24 pencils. 17 pencils are used. How many remain?','79 pencils.','Two-step problems',[],['4 × 24','then −17']),
('Two rectangles have sides 6 cm × 4 cm and 8 cm × 2 cm. Do they have the same perimeter? Explain.','Yes: both have perimeter 20 cm.','Measure reasoning',[],['6 × 4 cm','8 × 2 cm'])]
]

def bands(total):
    cuts=[(0,3),(4,5),(6,7),(8,10)] if total==10 else [(0,4),(5,7),(8,9),(10,12)]
    names=['Lower','Cuspy','Expected','Higher']
    guides=['Revisit prerequisites with concrete objects and short daily practice.','Target the specific gaps, model them visually and check again in two weeks.','Consolidate errors with mixed retrieval and explanation.','Extend through unfamiliar problems and explaining why a method works.']
    return [dict(name=n,minimum=a,maximum=b,guidance=g) for n,(a,b),g in zip(names,cuts,guides)]

def questions(year,term_index):
    if year==4:return [dict(q=q,a=a,topic=topic,labels=labels,values=values,year=4) for q,a,topic,labels,values in YEAR4[term_index]]
    result=[]
    for i,(week,day) in enumerate(SELECTION[year][term_index]):
        lessons=json.loads((ROOT/f'lessons/year-{year}-maths/week-{week}/week{week}-lessons.json').read_text(encoding='utf-8'))
        lesson=lessons[day-1];item=dict(lesson['expected'][(i+2)%5]);assert 'model' in item,(year,week,day)
        item.update(year=year,topic=lesson['title'],source=f'week-{week}/{lesson["slug"]}')
        item['q']=item['q'].replace('1 squares','1 square').replace('1 fly away','1 flies away')
        item['a']=item['a'].replace('1 tens','1 ten');result.append(item)
    return result

def illustration(c,q,x,y,w,h,solved):
    if q['year']==1:
        m=q['model']
        if m['kind']=='position' and m['mode']=='turn':
            arrow(c,x+45,y+42,50,0);text(c,'start',x+45,y+5,9,center=True);box(c,x+125,y+10,70,65)
            if solved:arrow(c,x+160,y+42,45,round(m['turn']*4)%4,GREEN)
        elif m['kind']=='money':
            values=m['coins'] if solved else [1,2,5,10,20]
            for i,v in enumerate(values):coin(c,v,x+i*42,y+30,30)
            text(c,'Coin values in pence',x,y+9,9,BLUE)
        else:draw_model(c,q['model'],x,y-8,w,95,'expected',answer=solved)
    elif q['year']==2:
        m=q['model']
        if m['kind']=='fraction' and m.get('mode')=='equivalent':
            for row,d in enumerate([2,4]):
                for j in range(d):
                    box(c,x+7+j*(w-14)/d,y+13+row*32,(w-14)/d,26,PURPLE if solved and j<d//2 else '#FFFFFF',PURPLE)
        else:year2_model(c,m,x,y,w,h,solved)
    else:
        topic=q['topic']
        if topic=='Area':
            for row in range(4):
                for col in range(6):box(c,x+25+col*20,y+5+row*15,20,15,'#DCEBFF',BLUE)
            return
        if topic in ['Perimeter','Symmetry']:
            box(c,x+40,y+10,100 if topic=='Perimeter' else 60,60,'#E8F2FF',BLUE)
            if topic=='Perimeter':text(c,'8 cm',x+90,y+76,10,center=True);text(c,'5 cm',x+147,y+34,10)
            return
        if topic=='Triangles':shape(c,'triangle',x+60,y+3,60,BLUE);return
        values=q['values'];labels=q['labels'];n=len(values)
        if labels:
            for i,(label,v) in enumerate(zip(labels,values)):
                xx=x+i*w/n;box(c,xx,y+20,w/n-2,35,'#E8F2FF',BLUE);text(c,label,xx+(w/n-2)/2,y+61,7,BLUE,center=True);text(c,v,xx+(w/n-2)/2,y+31,16,BLUE,True,True)
        else:
            for i,v in enumerate(values):text(c,v,x+w/2,y+h-18-i*21,12,[BLUE,GREEN,PURPLE][i%3],True,True)

def header(c,year,term,label,page):
    text(c,f'BrightPath  |  Year {year} Maths',32,H-28,10,GREEN,True)
    text(c,f'{term} term assessment',32,H-55,20,BLUE,True)
    text(c,label,32,H-78,10,GREEN)
    line(c,30,30,W-30,30);text(c,f'Year {year} • {term}   |   {page}',32,17,8)

def assessment(year,term,qs,folder):
    per=len(qs)//2;stride=132 if per==5 else 110
    c=canvas.Canvas(str(folder/'term-assessment-and-mark-scheme.pdf'),pagesize=A4,invariant=1)
    c.setTitle(f'Year {year} Maths {term} term assessment');c.setAuthor('BrightPath')
    for answers in [False,True]:
        for page in range(2):
            header(c,year,term,'Illustrated mark scheme' if answers else 'Name: __________________   Date: __________   Score: ____ / '+str(len(qs)),page+1+(2 if answers else 0))
            if not answers:text(c,'1 mark per question. Show your thinking; your teacher may read the questions.',32,H-99,9)
            for j,q in enumerate(qs[page*per:(page+1)*per]):
                top=H-122-j*stride;bottom=top-stride+9;num=page*per+j+1
                box(c,30,bottom,W-60,stride-15,'#F5FAFF' if j%2==0 else '#FFFFFF')
                text(c,str(num),38,top-19,13,GREEN,True)
                para(c,q['a'] if answers else q['q'],60,top-6,252 if year<4 else 282,12 if year<4 else 11,79 if year<4 else 65)
                illustration(c,q,328 if year<4 else 355,bottom+23,225 if year<4 else 197,75 if year<4 else 65,answers)
                if not answers:line(c,60,bottom+12,305 if year<4 else 337,bottom+12)
                else:text(c,'1 mark • '+q['topic'][:43],60,bottom+10,8,GREEN)
            c.showPage()
    header(c,year,term,'Teacher guidance and next steps',5)
    para(c,'Use this short check alongside classwork, discussion and practical tasks. These bands are suggested starting groups, not national standards or a complete judgement of attainment.',32,H-115,W-64,12,70)
    para(c,'Award 1 mark for the correct answer or a mathematically equivalent response. Where a question asks for several items or an explanation, all requested parts are needed. Accept spoken responses and practical demonstrations when appropriate; record any support given.',32,H-205,W-64,11,92)
    y=H-320
    for b in bands(len(qs)):
        text(c,f'{b["name"]}: {b["minimum"]}–{b["maximum"]} / {len(qs)}',35,y,13,BLUE,True)
        para(c,b['guidance'],35,y-12,W-70,11,44);y-=80
    para(c,'Before teaching: record access arrangements without teaching the answers. After marking: identify the precise question and misconception, choose one small teaching target, name the adult and frequency, and set a review date. Use a fresh example when checking progress.',35,165,W-70,11,95)
    c.showPage();c.save()

def record(year,term,total,folder):
    ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    with zipfile.ZipFile(REFERENCE) as src,zipfile.ZipFile(folder/'editable-teacher-evaluation-record.docx','w',zipfile.ZIP_DEFLATED) as dst:
        for item in src.infolist():
            data=src.read(item.filename)
            if item.filename=='word/document.xml':
                tree=E.fromstring(data)
                old=['0-15','16-23','24-31','32-40'];new=[f'{b["minimum"]}-{b["maximum"]}' for b in bands(total)]
                for el in tree.findall('.//w:t',ns):
                    s=(el.text or '').replace('Year 6',f'Year {year}').replace('Autumn',term)
                    for a,b in zip(old,new):s=s.replace(a,b)
                    el.text=s.replace('/ 40',f'/ {total}').replace('/40',f'/{total}')
                for table in tree.findall('.//w:tbl',ns):
                    props=table.find('w:tblPr',ns)
                    for oldborder in props.findall('w:tblBorders',ns):props.remove(oldborder)
                    for cellborder in table.findall('.//w:tcBorders',ns):cellborder.getparent().remove(cellborder)
                    borders=E.SubElement(props,'{'+ns['w']+'}tblBorders')
                    for side in ['top','left','bottom','right','insideH','insideV']:
                        el=E.SubElement(borders,'{'+ns['w']+'}'+side)
                        for k,v in [('val','single'),('sz','4'),('color','A8BCD0')]:el.set('{'+ns['w']+'}'+k,v)
                    for row in table.findall('w:tr',ns)[1:]:
                        props=row.find('w:trPr',ns)
                        if props is None:props=E.SubElement(row,'{'+ns['w']+'}trPr')
                        for oldheight in props.findall('w:trHeight',ns):props.remove(oldheight)
                        height=E.SubElement(props,'{'+ns['w']+'}trHeight')
                        height.set('{'+ns['w']+'}val','390');height.set('{'+ns['w']+'}hRule','atLeast')
                data=E.tostring(tree,encoding='UTF-8',xml_declaration=True,standalone=True)
            dst.writestr(item,data)

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/'artifact.md').write_text(f'# Evaluation record template contract\nReference: {REFERENCE}\nSHA256: {hashlib.sha256(REFERENCE.read_bytes()).hexdigest()}\nRetain both landscape pages, 30 pupil rows, Arial styles, table geometry, colours, headings, and all package parts except word/document.xml. Edit year, term, total and score ranges; intentionally add visible grid borders and minimum row heights for usable pupil notes. Reference previews: original preview/teacher-record/page-1.png and page-2.png. The packaged renderer failed because LibreOffice is unavailable; use installed Microsoft Word for PDF export, then inspect rendered PNGs.\n',encoding='utf-8')
    for year in [1,2,4]:
        for t,term in enumerate(TERMS):
            folder=OUT/f'year-{year}'/term.lower();folder.mkdir(parents=True,exist_ok=True);qs=questions(year,t)
            assessment(year,term,qs,folder);record(year,term,len(qs),folder)
            metadata=dict(year=year,term=term,totalMarks=len(qs),assessmentPages=5,recordPages=2,pupilPages=2,questionsPerPage=len(qs)//2,bands=bands(len(qs)),questions=qs)
            (folder/'evaluation.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2),encoding='utf-8')
            print('BUILT',year,term,flush=True)
if __name__=='__main__':main()
