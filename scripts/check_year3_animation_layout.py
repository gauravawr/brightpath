"""Review static overlap diagnostics against native click-by-click animation states.

Exit/replacement text can share a box; moving numbers can share their starting
position. No substantial overlap may remain when an automatic sequence stops
and waits for the teacher's next click. Native rendering/text-fit is checked
separately. Receipts are retained unchanged, including their diagnostics.
"""
import hashlib, json, zipfile
from pathlib import Path
from lxml import etree as E

QA = Path(__file__).resolve().parents[1] / '.qa/year3-maths'
NS = {'p':'http://schemas.openxmlformats.org/presentationml/2006/main',
      'a':'http://schemas.openxmlformats.org/drawingml/2006/main'}

def overlaps(a,b):
    x,y,w,h=a; X,Y,W,H=b
    area=max(0,min(x+w,X+W)-max(x,X))*max(0,min(y+h,Y+H)-max(y,Y))
    return area/min(w*h,W*H)>=.42 and area/max(w*h,W*H)>=.16

checks=[]
for folder in sorted((QA/'build').iterdir()):
    m=json.loads((folder/'manifest.json').read_text(encoding='utf-8'))
    receipt=json.loads((QA/('validation-'+m['finalizationRevision'])/(folder.name+'.json')).read_text())
    warnings=receipt['presentationLayout']['warnings']
    assert all(w['kind']=='substantial_text_frame_overlap' for w in warnings),folder.name
    reviewed=[]
    with zipfile.ZipFile(folder/'animated-candidate.pptx') as z:
        for entry in m['slides']:
            page=entry['slide']; pending=[w for w in warnings if w['slide']==page]
            if not pending: continue
            xml=E.fromstring(z.read(f'ppt/slides/slide{page}.xml'))
            names={}; boxes={}
            for s in xml.findall('p:cSld/p:spTree/p:sp',NS):
                nv=s.find('p:nvSpPr/p:cNvPr',NS);xf=s.find('p:spPr/a:xfrm',NS)
                if xf is None:continue
                pos=xf.find('a:off',NS);sz=xf.find('a:ext',NS)
                names[nv.get('id')]=nv.get('name')
                boxes[nv.get('name')]=[int(pos.get('x')),int(pos.get('y')),int(sz.get('cx')),int(sz.get('cy'))]
            visible={n:True for n in boxes}
            for ev in entry['events']:
                if ev['type']=='appear':visible[ev['name']]=False
            states=0
            def verify():
                global states
                states+=1
                for w in pending:
                    a,b=names[w['left_object_id']],names[w['right_object_id']]
                    assert not(visible[a] and visible[b] and overlaps(boxes[a],boxes[b])),(folder.name,page,states,a,b)
            verify()
            events=entry['events']
            for i,ev in enumerate(events):
                name=ev['name'];typ=ev['type']
                if typ=='appear':visible[name]=True
                elif typ=='exit':visible[name]=False
                elif typ=='move':
                    boxes[name][0]+=ev['dx']*11906.25
                    boxes[name][1]+=ev['dy']*11906.25
                if i==len(events)-1 or events[i+1].get('trigger',1)==1:verify()
            reviewed.extend({**w,'resolution':'Clear at every teacher-click boundary; overlap occurs only in replacement or motion states.','clickStatesChecked':states} for w in pending)
    checks.append({'id':m['id'],'sha256':hashlib.sha256((folder/'animated-candidate.pptx').read_bytes()).hexdigest(),'reviewedWarnings':reviewed})
(QA/'animation-layout-validation.json').write_text(json.dumps(checks,indent=2))
print(f'PASS: {len(checks)} decks; {sum(len(c["reviewedWarnings"]) for c in checks)} animation overlaps reviewed.')
