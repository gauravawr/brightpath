"""Check the final compact pupil and answer pages for overlapping text."""
import json,hashlib
from concurrent.futures import ProcessPoolExecutor
from pathlib import Path
import pdfplumber
QA=Path(__file__).resolve().parents[1]/'.qa/year1-a4-worksheets'

def check(row):
    file=QA/row['source'];assert hashlib.sha256(file.read_bytes()).hexdigest()==row['sha256']
    with pdfplumber.open(file) as pdf:
        for i,page in enumerate(pdf.pages):
            chars=sorted((c for c in page.chars if c['text'].strip()),key=lambda c:c['top'])
            for n,a in enumerate(chars):
                for b in chars[n+1:]:
                    if b['top']-a['top']>2.5:break
                    if min(a['x1'],b['x1'])-max(a['x0'],b['x0'])>1:
                        raise AssertionError((file.name,i+1,'text overlap',a['text'],b['text'],round(a['top'],1)))
    return {'file':row['file'],'sha256':row['sha256'],'textOverlapCheck':'pass'}

if __name__=='__main__':
    rows=json.loads((QA/'validation.json').read_text());assert len(rows)==450
    with ProcessPoolExecutor(max_workers=3) as pool:checks=list(pool.map(check,rows))
    (QA/'layout-validation.json').write_text(json.dumps(checks,indent=2))
    print('PASS: no overlapping text in 900 worksheet pages.')
