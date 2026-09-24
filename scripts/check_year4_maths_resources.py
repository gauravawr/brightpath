import json,math
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor
import pdfplumber
from PIL import Image,ImageDraw
from build_year4_maths_resources import QA

def check(args):
    l,kind=args;id=f"4-{l['week']}-{l['day']}";file=QA/'resources'/id/(kind+'.pdf');out=QA/'renders'/id/kind;out.mkdir(parents=True,exist_ok=True)
    with pdfplumber.open(file) as pdf:
        assert len(pdf.pages)==2,(id,kind,'expected pupil page and separate answer page')
        for i,page in enumerate(pdf.pages):
            assert abs(page.width-595.28)<1 and abs(page.height-841.89)<1
            for ch in page.chars:
                assert ch['x0']>=20 and ch['x1']<=page.width-20,(id,kind,i,'horizontal overflow',ch['text'])
                assert ch['top']>=10 and ch['bottom']<=page.height-8,(id,kind,i,'vertical overflow')
            chars=[c for c in page.chars if c['text'].strip()]
            for j,a in enumerate(chars):
                for b in chars[j+1:]:
                    if abs(a['top']-b['top'])<2 and min(a['x1'],b['x1'])-max(a['x0'],b['x0'])>1:
                        raise AssertionError((id,kind,i,'overlapping text',a['text'],b['text'],a['top']))
            page.to_image(resolution=95,antialias=True).save(out/f'page-{i+1}.png')
        clean=lambda s:''.join(s.split())
        qs=l['preteach']['questions'] if kind=='pre-teach' else l[kind.replace('-worksheet','')]
        pupil=clean(pdf.pages[0].crop((30,110,328,815)).extract_text());answers=clean(pdf.pages[1].extract_text())
        for q in qs:
            assert clean(q['q']) in pupil,(id,kind,'missing question',q['q'])
            assert clean(q['a']) in answers,(id,kind,'wrong answer',q['a'])
    return {'id':id,'resource':kind,'pages':2,'pupilPages':1,'questionCount':len(qs)}

def main():
    lessons=json.loads((QA/'lessons.json').read_text(encoding='utf-8'))
    args=[(l,k) for l in lessons for k in ['lower-worksheet','expected-worksheet','higher-worksheet','pre-teach']]
    report=[]
    with ProcessPoolExecutor(max_workers=4) as pool:
        for i,result in enumerate(pool.map(check,args)):
            report.append(result)
            if (i+1)%40==0:print(f'CHECKED {i+1}/600 PDFs',flush=True)
    (QA/'pdf-validation.json').write_text(json.dumps(report,indent=2))
    for week in range(1,31):
        sheet=Image.new('RGB',(1500,3550),'white');d=ImageDraw.Draw(sheet)
        for day in range(1,6):
            for col,level in enumerate(['lower','expected','higher']):
                im=Image.open(QA/'renders'/f'4-{week}-{day}'/(level+'-worksheet')/'page-1.png');im.thumbnail((490,680));xx=col*500;yy=(day-1)*710;sheet.paste(im,(xx+5,yy+25));d.text((xx+5,yy+5),f'{week}.{day} {level}',fill='black')
        sheet.save(QA/f'worksheets-week-{week}.jpg',quality=85)
    print('PASS: 450 one-page pupil worksheets and 150 pre-teach resources, each with a separate answer page.')

if __name__=='__main__':main()
