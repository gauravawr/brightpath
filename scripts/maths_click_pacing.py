"""Keep a teaching step on screen until the next teacher click.

With-previous groups stay together (e.g. all ten counters in an exchange).
After-previous reveals become separate clicks. A newly revealed moving object
completes its movement as one action. Column highlights and the
following exchange/calculation are deliberately separated.
"""
from lxml import etree as E

NS={'p':'http://schemas.openxmlformats.org/presentationml/2006/main','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}

def apply_pacing(root, events):
    shapes={}
    for s in root.findall('p:cSld/p:spTree/p:sp',NS):
        nv=s.find('p:nvSpPr/p:cNvPr',NS)
        if nv is not None: shapes[nv.get('name')]=s
    awaiting_column=False
    for index,event in enumerate(events):
        shape=shapes.get(event['name'])
        if event.get('trigger')==3 and event['type'] not in ['move','rotate']:event['trigger']=1
        if event['type'] in ['move','rotate'] and index and events[index-1]['name']==event['name'] and events[index-1]['type']=='appear':
            event['trigger']=3
        if awaiting_column and event['type']!='exit':
            event['trigger']=1;awaiting_column=False
        if shape is None:continue
        xf=shape.find('p:spPr/a:xfrm',NS)
        if xf is None:continue
        size=xf.find('a:ext',NS);pos=xf.find('a:off',NS)
        width=int(size.get('cx'))/11906.25;height=int(size.get('cy'))/11906.25
        y=int(pos.get('y'))/11906.25
        if event['type']=='appear' and abs(width-76)<1 and abs(height-166)<1:
            event['trigger']=1;awaiting_column=True
        # The worked column explanation gets its own discussion pause.
        if event['type']=='appear' and abs(y-544)<1 and abs(width-1080)<1:
            event['trigger']=1
    return events
