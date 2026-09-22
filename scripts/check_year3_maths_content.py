"""Independent arithmetic and package checks before local publication."""
import json,re,zipfile
from pathlib import Path
from lxml import etree as E
ROOT=Path(__file__).resolve().parents[1];QA=ROOT/'.qa/year3-maths';ls=json.loads((QA/'lessons.json').read_text())
assert len(ls)==150 and len({(l['week'],l['day']) for l in ls})==150
checks=0
for l in ls:
 assert len(l['examples'])==5
 for level in ['lower','expected','higher']:
  assert len(l[level])==5
  for q in l[level]+l['preteach']['questions']:
   m=q['model'];t=m['type'];checks+=1
   assert 'undefined' not in q['q']+q['a'] and 'NaN' not in q['q']+q['a']
   if t in ['calculation','measureCalc']:assert m['total']==(m['a']+m['b'] if m['op']=='+' else m['a']-m['b'])
   if t=='multiply':assert m['total']==m['a']*m['b'] and 10<=m['a']<100 and 1<=m['b']<=9
   if t=='division':assert m['a']==m['b']*m['total']+m['remainder'] and 0<=m['remainder']<m['b']
   if t=='fractionOf':assert m['value']==m['total']*m['num']/m['den']
   if t=='fractionCalc':assert m['value']==(m['num']+m['other'] if m['op']=='+' else m['num']-m['other']) and 0<=m['value']<=m['den']
   if t=='rectangle':assert m['total']==2*(m['a']+m['b'])
   if t=='convert':assert m['total']==m['a']*m['factor']+m['b']
   if q['mode']=='addBoth' and level!='lower' and q in l[level]:assert m['a']%10+m['b']%10>=10 and m['a']//10%10+m['b']//10%10+1>=10
 for suffix in ['lower','expected','higher']:assert l[suffix]!=[]
 ns={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
 folder=QA/'build'/f"3-{l['week']}-{l['day']}";manifest=json.loads((folder/'manifest.json').read_text());assert manifest['expectedQuestions']==l['expected']
 with zipfile.ZipFile(folder/'animated-candidate.pptx') as z:
  for page in manifest['slides']:
   xml=E.fromstring(z.read(f"ppt/slides/slide{page['slide']}.xml"));effects=xml.findall('.//p:cTn[@presetClass]',ns);assert len(effects)==len(page['events'])
  text=' '.join(E.fromstring(z.read(f'ppt/slides/slide{n}.xml')).xpath('//a:t/text()',namespaces=ns)[0] for n in range(1,15))
  assert 'You do' in text and 'We do' in text and 'I do' in text
print(f'PASS {checks} question checks; 150 lesson manifests and native animation packages.')
