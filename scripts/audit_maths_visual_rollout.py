import json,re,zipfile,xml.etree.ElementTree as E
from pathlib import Path
root=Path(__file__).resolve().parents[2]/'.qa'/'maths-rollout'
ns={'a':'http://schemas.openxmlformats.org/drawingml/2006/main','p':'http://schemas.openxmlformats.org/presentationml/2006/main'}
errors=[];decks=slides=effects=paths=0
for folder in (root/'build').iterdir():
 if not (folder/'manifest.json').exists():continue
 m=json.loads((folder/'manifest.json').read_text(encoding='utf-8'));decks+=1
 with zipfile.ZipFile(folder/'animated-candidate.pptx') as z:
  names=[n for n in z.namelist() if re.fullmatch(r'ppt/slides/slide\d+.xml',n)]
  if len(names)!=m['count']:errors.append([m['id'],'count'])
  for entry in m['slides']:
   n=entry['slide'];slides+=1;r=E.fromstring(z.read(f'ppt/slides/slide{n}.xml'))
   texts=[t.text or '' for t in r.findall('.//a:t',ns)];text=' '.join(texts)
   if re.search(r'\b(week\s+\d+|autumn|spring term|summer term|whiteboard)\b',text,re.I):errors.append([m['id'],n,'schedule or writing-medium label'])
   if n==m['activitySlide'] or n==m['activitySlide']+1:
    key='q' if n==m['activitySlide'] else 'a'
    for q in m['expectedQuestions']:
     if q[key] not in text:errors.append([m['id'],n,'missing expected '+key,q[key]])
   motions=r.findall('.//p:animMotion',ns);paths+=len(motions);effects+=len(entry['events'])
   if len(motions)!=sum(e['type']=='move' for e in entry['events']):errors.append([m['id'],n,'motion count'])
   shapes={s.find('p:nvSpPr/p:cNvPr',ns).get('name'):s for s in r.findall('.//p:sp',ns)}
   cumulative={}
   for e in entry['events']:
    if e['name'] not in shapes:errors.append([m['id'],n,'missing shape']);continue
    if e['type']=='move':
     dx,dy=cumulative.get(e['name'],(0,0));cumulative[e['name']]=(dx+e['dx'],dy+e['dy'])
   for name,(dx,dy) in cumulative.items():
    sp=shapes[name];off=sp.find('p:spPr/a:xfrm/a:off',ns);ext=sp.find('p:spPr/a:xfrm/a:ext',ns)
    if off is None:continue
    x=int(off.get('x'))+dx*11906.25;y=int(off.get('y'))+dy*11906.25
    if x< -10000 or y< -10000 or x+int(ext.get('cx'))>15250000 or y+int(ext.get('cy'))>8582500:errors.append([m['id'],n,'motion outside slide',name,x,y])
report={'decks':decks,'slides':slides,'animationEffects':effects,'motionPaths':paths,'errors':errors}
(root/'audit.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
raise SystemExit(bool(errors))
