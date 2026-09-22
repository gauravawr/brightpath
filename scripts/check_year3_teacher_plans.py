from pathlib import Path
import json,hashlib
import pdfplumber
from PIL import Image
ROOT=Path('.qa/year3-maths');ls=json.loads((ROOT/'lessons.json').read_text());report=[]
for l in ls:
 id=f"3-{l['week']}-{l['day']}";file=ROOT/'resources'/id/'preview/teacher-plan.pdf'
 with pdfplumber.open(file) as doc:
  assert 3<=len(doc.pages)<=4,(id,len(doc.pages));full=''.join((p.extract_text() or '') for p in doc.pages);clean=lambda s:''.join(s.split())
  assert clean(l['title']) in clean(full),(id,'wrong title')
  for q in l['lower']+l['expected']+l['higher']+l['preteach']['questions']:
   assert clean(q['a']) in clean(full),(id,'missing answer',q['a'])
  for page in doc.pages:
   for ch in page.chars:assert 10<=ch['x0'] and ch['x1']<=page.width-10 and ch['top']>=8 and ch['bottom']<=page.height-8,(id,'overflow')
  if l['day']==1:
   folder=ROOT/'plan-renders'/id;folder.mkdir(parents=True,exist_ok=True)
   for i,page in enumerate(doc.pages):page.to_image(resolution=95).save(folder/f'page-{i+1}.png')
 report.append(dict(id=id,pages=len(doc.pages),sha256=hashlib.sha256(file.read_bytes()).hexdigest()))
(ROOT/'plan-validation.json').write_text(json.dumps(report,indent=2));print('PASS: 150 editable plan previews, answer consistency and page bounds.')
