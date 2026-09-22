"""Apply native PowerPoint timing and prepare final-state previews without COM effect calls."""
import json,zipfile,copy,math,sys
from pathlib import Path
from lxml import etree as E
from maths_click_pacing import apply_pacing
ROOT=Path(__file__).resolve().parents[1];QA=ROOT/'.qa/year3-maths'
NS={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
def el(tag,**attrs):return E.Element('{'+NS[tag.split(':')[0]]+'}'+tag.split(':')[1],{k:str(v) for k,v in attrs.items()})
def child(parent,tag,**attrs):e=el(tag,**attrs);parent.append(e);return e
def condition(ct,delay):child(child(ct,'p:stCondLst'),'p:cond',delay=delay)
def timing(events,ids):
 root=el('p:timing');top=child(child(root,'p:tnLst'),'p:par');ct=child(top,'p:cTn',id=1,dur='indefinite',restart='never',nodeType='tmRoot');seq=child(child(ct,'p:childTnLst'),'p:seq',concurrent=1,nextAc='seek');main=child(seq,'p:cTn',id=2,dur='indefinite',nodeType='mainSeq');lst=child(main,'p:childTnLst');counter=3;positions={};group=None;batch=None;laststart=0;lastend=0
 for ev in events:
  typ=ev['type'];spid=ids[ev['name']];trigger=ev.get('trigger',1)
  if trigger==1 or group is None:
   par=child(lst,'p:par');click=child(par,'p:cTn',id=counter,fill='hold');counter+=1;condition(click,'indefinite');group=child(click,'p:childTnLst');laststart=lastend=0
  start=0 if trigger==1 else laststart if trigger==2 else lastend;duration=round(ev.get('duration',.001)*1000) if typ in ['move','rotate'] else 1
  if trigger!=2 or batch is None:
   wrapper=child(group,'p:par');wrapperct=child(wrapper,'p:cTn',id=counter,fill='hold');counter+=1;condition(wrapperct,start);batch=child(wrapperct,'p:childTnLst')
  par=child(batch,'p:par');ct=child(par,'p:cTn',id=counter,presetID=63 if typ=='move' else 8 if typ=='rotate' else 1,presetClass='path' if typ=='move' else 'emph' if typ=='rotate' else 'exit' if typ=='exit' else 'entr',presetSubtype=0,fill='hold',nodeType={1:'clickEffect',2:'withEffect',3:'afterEffect'}[trigger]);counter+=1;condition(ct,0);effects=child(ct,'p:childTnLst')
  if typ=='move':
   px,py=positions.get(ev['name'],(0,0));nx,ny=px+ev['dx'],py+ev['dy'];positions[ev['name']]=(nx,ny);effect=child(effects,'p:animMotion',origin='layout',path=f'M {px/1280:.8f} {py/720:.8f} L {nx/1280:.8f} {ny/720:.8f} E',pathEditMode='relative',ptsTypes='');attrs=['ppt_x','ppt_y']
  elif typ=='rotate':effect=child(effects,'p:animRot',by=round(ev['angle']*60000));attrs=['r']
  else:effect=child(effects,'p:set');attrs=['style.visibility']
  behavior=child(effect,'p:cBhvr');child(behavior,'p:cTn',id=counter,dur=duration,fill='hold');counter+=1;child(child(behavior,'p:tgtEl'),'p:spTgt',spid=spid)
  names=child(behavior,'p:attrNameLst')
  for name in attrs:child(names,'p:attrName').text=name
  if typ in ['appear','exit']:
   condition(behavior.find('p:cTn',NS),0)
   child(child(effect,'p:to'),'p:strVal',val='hidden' if typ=='exit' else 'visible')
  laststart=start;lastend=start+duration
 for tag,event in [('p:prevCondLst','onPrev'),('p:nextCondLst','onNext')]:child(child(child(seq,tag),'p:cond',evt=event,delay=0),'p:tgtEl').append(el('p:sldTgt'))

 return root

def main():
 lessons=json.loads((QA/'lessons.json').read_text(encoding='utf-8'));lookup={f"3-{l['week']}-{l['day']}":l for l in lessons}
 for folder in sorted((QA/'build').iterdir()):
  if len(sys.argv)>1 and folder.name not in sys.argv[1:]:continue
  m=json.loads((folder/'manifest.json').read_text(encoding='utf-8'));l=lookup[folder.name];m['expectedQuestions']=l['expected'];animated={};preview={}
  with zipfile.ZipFile(folder/'candidate.pptx') as src:
   for item in src.infolist():
    data=src.read(item.filename);a=data;s=data
    if item.filename.startswith('ppt/slides/slide') and item.filename.endswith('.xml'):
     no=int(item.filename.split('slide')[-1].split('.')[0]);root=E.fromstring(data);tree=root.find('p:cSld/p:spTree',NS);byname={};ids={}
     for shape in tree:
      nv=shape.find('.//p:cNvPr',NS)
      if nv is not None:byname[nv.get('name')]=shape;ids[nv.get('name')]=nv.get('id')
     if no==1:
      for txt in root.findall('.//a:t',NS):
       if (txt.text or '').startswith('To '):txt.text=l['objective']
     events=apply_pacing(root,m['slides'][no-1]['events'])
     if events:root.append(timing(events,ids))
     a=E.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
     for ev in events:
      shape=byname[ev['name']];xf=shape.find('p:spPr/a:xfrm',NS)
      if ev['type']=='move':
       off=xf.find('a:off',NS);off.set('x',str(int(off.get('x'))+round(ev['dx']*11906.25)));off.set('y',str(int(off.get('y'))+round(ev['dy']*11906.25)))
      elif ev['type']=='rotate':xf.set('rot',str((int(xf.get('rot','0'))+round(ev['angle']*60000))%21600000))
     visibility={e['name']:e['type']!='exit' for e in events if e['type'] in ['appear','exit']}
     for name,visible in visibility.items():
      if not visible:tree.remove(byname[name])
     for node in root.findall('p:timing',NS):root.remove(node)
     s=E.tostring(root,xml_declaration=True,encoding='UTF-8',standalone=True)
    animated[item.filename]=a;preview[item.filename]=s
   for name,files in [('animated-candidate.pptx',animated),('static-preview.pptx',preview)]:
    if name=='static-preview.pptx' and (folder/name).exists():
     with zipfile.ZipFile(folder/name) as prior:
      if all(prior.read(k)==v for k,v in files.items()):continue
    with zipfile.ZipFile(folder/name,'w',zipfile.ZIP_DEFLATED) as out:
     for item in src.infolist():out.writestr(item,files[item.filename])
  m['clickPacing']='teacher-controlled-v1'
  (folder/'manifest.json').write_text(json.dumps(m,indent=2),encoding='utf-8')
  print('TIMING',folder.name,flush=True)
if __name__=='__main__':main()
