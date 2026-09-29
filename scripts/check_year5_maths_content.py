"""Validate Year 5 structure, statutory coverage, arithmetic and answer models."""
import json
from pathlib import Path

QA=Path('.qa/year5-maths')
lessons=json.loads((QA/'lessons.json').read_text(encoding='utf-8'))
curriculum=json.loads((QA/'curriculum.json').read_text(encoding='utf-8'))
assert len(lessons)==150 and len(curriculum)==30
assert {(l['week'],l['day']) for l in lessons}=={(w,d) for w in range(1,31) for d in range(1,6)}
assert all(len(c['days'])==5 for c in curriculum)
assert all(l['title']==curriculum[l['week']-1]['days'][l['day']-1] for l in lessons)

required={
 'placeMillion','powersTen','negative5','roman1000','roundLarge5','addLarge5','subLarge5','addSubMulti5',
 'multiply4x2','shortDivision5','primeComposite5','squareCube5','improperToMixed5','mixedToImproper5',
 'fractionAddRelated5','fractionSubRelated5','fractionMultiply5','thousandths5','decimalRound5','percentOf5',
 'imperial5','timeConvert5','perimeterComposite5','areaRectangle5','volumeCuboid5','angleFacts5',
 'solidFrom2D5','rectangleProperties5','regularIrregular5','translate5','reflect5','lineGraphRead5',
 'lineGraphComplete5','tableRead5','timetableRead5'
}
modes={l['mode'] for l in lessons}
assert required<=modes,sorted(required-modes)
assert {l['term'] for l in lessons if l['week'] in [1,11,21]}=={'Autumn','Spring','Summer'}

checks=0
for l in lessons:
 assert l['curriculumSource'].startswith('https://www.gov.uk/')
 assert len(l['examples'])==5 and all(len(l[k])==5 for k in ['lower','expected','higher'])
 assert len(l['preteach']['questions'])==3
 for q in l['examples']+l['lower']+l['expected']+l['higher']+l['preteach']['questions']:
  checks+=1;m=q['model'];t=m['type'];combined=q['q']+q['a']
  assert 'undefined' not in combined and 'NaN' not in combined
  if t=='calculation':assert abs(m['total']-(m['a']+m['b'] if m['op']=='+' else m['a']-m['b']))<1e-9
  elif t=='multiply':assert m['total']==m['a']*m['b']
  elif t=='division':assert m['a']==m['b']*m['total']+m.get('remainder',0)
  elif t=='twoStep':assert m['total']==m['a']+m['b']-m['c']
  elif t=='convert':assert abs(m['total']-(m['a']*m['factor']+m['b']))<1e-9
  elif t=='rectangle':assert m['total']==2*(m['a']+m['b'])
  elif t=='fractionOf':assert abs(m['value']-m['total']*m['num']/m['den'])<1e-9
  elif t=='fractionCalc':assert m['value']==(m['num']+m['other'] if m['op']=='+' else m['num']-m['other'])
  elif t=='money':assert m['total']==m['a']+m['b']
  elif t=='coordinate':assert 0<=m['x']<=10 and 0<=m['y']<=10 and m['x']+m['dx']<=10 and m['y']+m['dy']<=10
print(f'PASS: {checks} Year 5 questions/models; 150 lessons; all statutory coverage anchors present.')
