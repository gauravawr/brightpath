"""Verify all teaching highlights pause before calculation/exchange."""
import json,zipfile,hashlib
from pathlib import Path
from lxml import etree as E
from maths_click_pacing import NS
QA=Path(__file__).resolve().parents[1]/'.qa/year4-maths'
results=[]
for folder in sorted((QA/'build').iterdir()):
    m=json.loads((folder/'manifest.json').read_text(encoding='utf-8'));assert m['clickPacing']=='teacher-controlled-v1'
    boxes=0;clicks=0
    with zipfile.ZipFile(folder/'animated-candidate.pptx') as z:
        for slide in m['slides']:
            events=slide['events'];clicks+=sum(e.get('trigger',1)==1 for e in events)
            assert all(e['type'] in ['move','rotate'] for e in events if e.get('trigger')==3)
            xml=E.fromstring(z.read('ppt/slides/slide%d.xml'%slide['slide']))
            for s in xml.findall('p:cSld/p:spTree/p:sp',NS):
                xf=s.find('p:spPr/a:xfrm',NS)
                if xf is None:continue
                size=xf.find('a:ext',NS)
                if abs(int(size.get('cx'))/11906.25-76)>1 or abs(int(size.get('cy'))/11906.25-166)>1:continue
                name=s.find('p:nvSpPr/p:cNvPr',NS).get('name')
                idx=next(i for i,e in enumerate(events) if e['name']==name and e['type']=='appear')
                assert events[idx]['trigger']==1
                j=idx+1
                while j<len(events) and events[j]['trigger']!=1:
                    assert events[j]['type']=='exit' and events[j]['name']!=name,(m['id'],slide['slide'],events[j]);j+=1
                assert j<len(events);boxes+=1
    results.append({'id':m['id'],'sha256':hashlib.sha256((folder/'animated-candidate.pptx').read_bytes()).hexdigest(),'pausedColumnHighlights':boxes,'teacherClicks':clicks})
assert len(results)==150
(QA/'click-pacing-validation.json').write_text(json.dumps(results,indent=2))
print(f'PASS: {len(results)} decks, {sum(r["pausedColumnHighlights"] for r in results)} column highlights with a separate teacher click.')
