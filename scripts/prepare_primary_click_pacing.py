"""Apply the approved teacher-click pacing to the current Year 1/2 downloads.

Preserves all slide content, relationships, notes, assets and native shapes.
Only native timing is replaced; originals are retained in the QA workspace.
"""
import json,zipfile,hashlib,re
from pathlib import Path
from lxml import etree as E
from maths_click_pacing import apply_pacing,NS
from prepare_year3_animations import timing
ROOT=Path(__file__).resolve().parents[1];QA=ROOT/'.qa/primary-click-pacing'
checks=[]
for year,source in [(1,'year1-all-pictures'),(2,'year2-maths')]:
    for mp in sorted((ROOT/'.qa'/source/'build').glob('*/manifest.json')):
        m=json.loads(mp.read_text(encoding='utf-8-sig'));folder=QA/'build'/mp.parent.name;folder.mkdir(parents=True,exist_ok=True)
        dest=f"lessons/year-{year}-maths/week-{m['week']}/{m['slug']}/interactive-teaching-slides.pptx"
        original=folder/'candidate.pptx'
        if not original.exists():original.write_bytes((ROOT/dest).read_bytes())
        changed=0
        with zipfile.ZipFile(original) as src,zipfile.ZipFile(folder/'animated-candidate.pptx','w',zipfile.ZIP_DEFLATED) as out:
            for info in src.infolist():
                data=src.read(info.filename)
                if info.filename.startswith('ppt/slides/slide') and info.filename.endswith('.xml'):
                    no=int(info.filename.split('slide')[-1].split('.')[0]);xml=E.fromstring(data)
                    # Some earlier answer-slide repairs changed the object list.
                    # Use the current download's native effects as source of truth.
                    names={n.get('id'):n.get('name') for n in xml.findall('.//p:cNvPr',NS)}
                    events=[];positions={}
                    for ct in xml.findall('.//p:cTn[@presetClass]',NS):
                        target=ct.find('.//p:spTgt',NS);name=names[target.get('spid')]
                        event={'name':name,'trigger':{'clickEffect':1,'withEffect':2,'afterEffect':3}[ct.get('nodeType')]}
                        motion=ct.find('.//p:animMotion',NS);rotation=ct.find('.//p:animRot',NS)
                        if motion is not None:
                            values=re.findall(r'[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?',motion.get('path'))
                            assert len(values)==4,motion.get('path')
                            sx,sy,ex,ey=map(float,values);event.update(type='move',dx=(ex-sx)*1280,dy=(ey-sy)*720,duration=.8)
                        elif rotation is not None:event.update(type='rotate',angle=int(rotation.get('by'))/60000,duration=1)
                        else:
                            assert ct.get('presetClass') in ['entr','exit'],ct.get('presetClass')
                            event['type']='exit' if ct.get('presetClass')=='exit' else 'appear'
                        events.append(event)
                    m['slides'][no-1]['events']=events;before=json.dumps(events)
                    apply_pacing(xml,events);changed+=before!=json.dumps(events)
                    ids={n.get('name'):n.get('id') for n in xml.findall('.//p:cNvPr',NS)}
                    for node in xml.findall('p:timing',NS):xml.remove(node)
                    if events:
                        # Timing precedes extLst in the slide schema.
                        ext=xml.find('p:extLst',NS);index=list(xml).index(ext) if ext is not None else len(xml)
                        xml.insert(index,timing(events,ids))
                    updated=E.tostring(xml,xml_declaration=True,encoding='UTF-8',standalone=True)
                    # Verify that the slide content is unchanged after stripping timing.
                    old=E.fromstring(data);new=E.fromstring(updated)
                    for tree in [old,new]:
                        for node in tree.findall('p:timing',NS):tree.remove(node)
                    assert E.tostring(old,method='c14n')==E.tostring(new,method='c14n'),dest
                    data=updated
                out.writestr(info,data)
        m['clickPacing']='teacher-controlled-v1';m['publishedPath']=dest;m['finalizationRevision']='click-v1'
        (folder/'manifest.json').write_text(json.dumps(m,indent=2),encoding='utf-8')
        checks.append({'id':m['id'],'file':dest,'slides':m['count'],'changedTeachingSlides':changed,'originalSha256':hashlib.sha256(original.read_bytes()).hexdigest(),'sha256':hashlib.sha256((folder/'animated-candidate.pptx').read_bytes()).hexdigest(),'slideContentUnchanged':True})
assert len(checks)==300
(QA/'content-preservation.json').write_text(json.dumps(checks,indent=2))
print(f'Prepared {len(checks)} PowerPoints; {sum(c["changedTeachingSlides"] for c in checks)} slides have additional teaching pauses.')
