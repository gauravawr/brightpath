import json
from pathlib import Path
import build_primary_term_assessments as a
from build_year3_maths_resources import model
root=Path('.qa/year3-maths')
lessons=json.loads((root/'lessons.json').read_text(encoding='utf-8-sig'))
choices=[[(1,1),(1,4),(2,5),(3,3),(4,4),(5,4),(6,4),(7,3),(8,3),(9,4)],[(11,4),(12,1),(12,4),(13,1),(13,4),(14,4),(15,2),(16,2),(17,1),(18,1)],[(21,1),(21,5),(22,4),(23,2),(24,2),(25,1),(25,5),(26,1),(27,3),(28,1)]]
old=a.illustration
def ill(c,q,x,y,w,h,solved):
 if q['year']==3:model(c,q['model'],x,y,w,h,solved)
 else:old(c,q,x,y,w,h,solved)
a.illustration=ill
for term,pairs in zip(a.TERMS,choices):
 qs=[]
 for j,(week,day) in enumerate(pairs):
  l=next(l for l in lessons if l['week']==week and l['day']==day);q=dict(l['expected'][j%5]);q.update(year=3,topic=l['title']);qs.append(q)
 folder=a.OUT/'year-3'/term.lower();folder.mkdir(parents=True,exist_ok=True)
 a.assessment(3,term,qs,folder);a.record(3,term,10,folder)
 (folder/'evaluation.json').write_text(json.dumps(dict(year=3,term=term,totalMarks=10,assessmentPages=5,recordPages=2,pupilPages=2,questionsPerPage=5,bands=a.bands(10),questions=qs),indent=2),encoding='utf-8')
 print('BUILT Year 3',term)
