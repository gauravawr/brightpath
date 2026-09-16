"""Render every worksheet page and check text, structure and source alignment."""
import json, hashlib
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
import pdfplumber
from PIL import Image,ImageDraw
from build_year1_picture_worksheets import QA,ROOT,answer_text

def check(row):
    file=QA/row['file'];out=QA/'renders'/file.stem;out.mkdir(parents=True,exist_ok=True)
    assert hashlib.sha256(file.read_bytes()).hexdigest()==row['sha256']
    with pdfplumber.open(file) as pdf:
        assert len(pdf.pages)==4
        for i,page in enumerate(pdf.pages):
            for char in page.chars:
                assert char['x0']>=25 and char['x1']<=page.width-25,(file.name,i,char['text'],'horizontal overflow')
                assert char['top']>=20 and char['bottom']<=page.height-15,(file.name,i,'vertical overflow')
            # Separate text runs must not land on top of one another.
            chars=[ch for ch in page.chars if ch['text'].strip()]
            for a_index,a in enumerate(chars):
                for b in chars[a_index+1:]:
                    if abs(a['top']-b['top'])<3 and min(a['x1'],b['x1'])-max(a['x0'],b['x0'])>.8:
                        raise AssertionError((file.name,i,'overlapping text',a['text'],b['text'],a['top']))
            assert len(page.rects)+len(page.curves)+len(page.lines)>=5,(file.name,i,'missing drawing content')
            page.to_image(resolution=85,antialias=True).save(out/f'page-{i+1}.png')
        answers=pdf.pages[3].extract_text()
        source=json.loads((ROOT/f"lessons/year-1-maths/week-{row['week']}/week{row['week']}-lessons.json").read_text(encoding='utf-8'))
        item=next(x for x in source if x['day']==row['day'])
        clean=lambda s:''.join(s.split())
        for q in item[row['level']]:assert clean(answer_text(q['a'])) in clean(answers),(file.name,'answer mismatch',q['a'])
    return {'file':row['file'],'pages':4,'rendered':True}

def main():
    data=json.loads((QA/'audit.json').read_text());assert len(data)==450
    with ProcessPoolExecutor(max_workers=4) as pool:
        rows=[]
        for i,result in enumerate(pool.map(check,data)):
            rows.append(result)
            if (i+1)%30==0:print(f'Checked and rendered {i+1}/450 worksheets',flush=True)
    (QA/'render-audit.json').write_text(json.dumps(rows,indent=2))
    # Every lesson appears on a contact sheet, all three levels side by side.
    for week in range(1,31):
        sheet=Image.new('RGB',(1500,5*730),'white');d=ImageDraw.Draw(sheet)
        for day in range(1,6):
            for col,level in enumerate(['lower','expected','higher']):
                im=Image.open(QA/'renders'/f'1-{week}-{day}-{level}'/'page-1.png').convert('RGB');im.thumbnail((490,700))
                xx=col*500;yy=(day-1)*730;d.text((xx+8,yy+5),f'Week {week} / day {day} / {level}',fill='black');sheet.paste(im,(xx+5,yy+25))
        sheet.save(QA/f'contact-week-{week}.jpg',quality=85)
    print('PASS: 450 PDFs; 1,800 rendered pages; source answers match.')

if __name__=='__main__':main()
