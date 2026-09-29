"""Render two-page previews for the editable Year 5 term evaluation records."""
import json
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4,landscape
from reportlab.lib.colors import HexColor

ROOT=Path(__file__).resolve().parents[1];BASE=ROOT/'.qa/term-assessments/year-5';W,H=landscape(A4)

def draw(folder):
 meta=json.loads((folder/'evaluation.json').read_text(encoding='utf-8'));c=canvas.Canvas(str(folder/'teacher-record.pdf'),pagesize=(W,H),invariant=1)
 for page in range(2):
  c.setFillColor(HexColor('#11745A'));c.setFont('Helvetica-Bold',11);c.drawString(28,H-28,'BrightPath | Year 5 Maths')
  c.setFillColor(HexColor('#1D4ED8'));c.setFont('Helvetica-Bold',18);c.drawString(28,H-56,f"{meta['term']} term pupil evaluation and intervention record")
  c.setFillColor(HexColor('#172B4D'));c.setFont('Helvetica',8);c.drawString(28,H-76,'Class: ____________________   Teacher: ____________________   Assessment date: __________   Review date: __________')
  cols=[(28,28,'Pupil'),(56,145,'Name'),(201,48,'Score'),(249,72,'Band'),(321,165,'Evidence / gap'),(486,205,'Intervention and frequency'),(691,102,'Review')]
  y=H-103
  c.setFillColor(HexColor('#172B4D'));c.rect(28,y,765,24,fill=1,stroke=0);c.setFillColor(HexColor('#FFFFFF'));c.setFont('Helvetica-Bold',7)
  for x,w,label in cols:c.drawString(x+4,y+8,label)
  for row in range(15):
   yy=y-(row+1)*29;c.setFillColor(HexColor('#F7FAFC' if row%2==0 else '#FFFFFF'));c.rect(28,yy,765,29,fill=1,stroke=0);c.setStrokeColor(HexColor('#A8BCD0'))
   for x,w,label in cols:c.rect(x,yy,w,29,fill=0,stroke=1)
   c.setFillColor(HexColor('#172B4D'));c.setFont('Helvetica-Bold',7);c.drawCentredString(42,yy+11,str(page*15+row+1))
  c.setFillColor(HexColor('#52647A'));c.setFont('Helvetica',7);c.drawString(28,18,f"Page {page+1} of 2 • Suggested score bands are shown in the assessment pack; use professional judgement and wider evidence.")
  c.showPage()
 c.save()

for folder in sorted(BASE.iterdir()):
 if folder.is_dir():draw(folder);print('RENDERED',folder.name)
