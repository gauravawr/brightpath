import json,hashlib,zipfile
from pathlib import Path
import pdfplumber
from PIL import Image
from build_primary_term_assessments import OUT,REFERENCE
report=[]
for folder in sorted(OUT.glob('year-*/*')):
    meta=json.loads((folder/'evaluation.json').read_text(encoding='utf-8'))
    assert len(meta['questions'])==meta['totalMarks']
    scores=[s for b in meta['bands'] for s in range(b['minimum'],b['maximum']+1)]
    assert scores==list(range(meta['totalMarks']+1))
    with zipfile.ZipFile(REFERENCE) as src,zipfile.ZipFile(folder/'editable-teacher-evaluation-record.docx') as dst:
        assert src.namelist()==dst.namelist()
        for name in src.namelist():
            if name!='word/document.xml':assert src.read(name)==dst.read(name),name
        assert b'Year 6' not in dst.read('word/document.xml')
    for filename,kind,count in [('term-assessment-and-mark-scheme.pdf','assessment',5),('teacher-record.pdf','teacher-record',2)]:
        file=folder/filename;out=folder/'preview'/kind;out.mkdir(parents=True,exist_ok=True)
        with pdfplumber.open(file) as doc:
            assert len(doc.pages)==count,(str(file),len(doc.pages))
            for i,p in enumerate(doc.pages):
                if kind=='assessment':assert abs(p.width-595.28)<1 and abs(p.height-841.89)<1
                for ch in p.chars:
                    assert 10<=ch['x0'] and ch['x1']<=p.width-10 and ch['top']>=5 and ch['bottom']<=p.height-5,(str(file),i,ch['text'],'outside page')
                p.to_image(resolution=120,antialias=True).save(out/f'page-{i+1}.png')
            if kind=='assessment':
                clean=lambda s:''.join(s.split())
                pupil=clean(''.join(p.crop((30,110,320 if meta['year']<4 else 350,810)).extract_text() or '' for p in doc.pages[:2]))
                answers=clean(''.join(p.crop((30,110,320 if meta['year']<4 else 350,810)).extract_text() or '' for p in doc.pages[2:4]))
                for q in meta['questions']:
                    assert clean(q['q']) in pupil,(file,'missing question',q['q'])
                    assert clean(q['a']) in answers,(file,'missing answer',q['a'])
        report.append({'file':str(file),'pages':count,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()})
        images=sorted(out.glob('page-*.png'));sheet=Image.new('RGB',(400*count,600),'white')
        for i,p in enumerate(images):
            im=Image.open(p);im.thumbnail((395,580));sheet.paste(im,(400*i,12))
        sheet.save(folder/(kind+'-contact.jpg'),quality=90)
    print('PASS',meta['year'],meta['term'],flush=True)
(OUT/'validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
