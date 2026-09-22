"""Publish checked assessment packs to the local lesson server."""
import json, hashlib, shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
qa=ROOT/'.qa/term-assessments'
checks=json.loads((qa/'validation.json').read_text())
assert len(checks)>=18
for entry in checks:
    assert hashlib.sha256(Path(entry['file']).read_bytes()).hexdigest()==entry['sha256'],entry['file']
files=[]
for folder in sorted(qa.glob('year-*/*')):
    meta=json.loads((folder/'evaluation.json').read_text(encoding='utf-8'))
    dest=ROOT/f"lessons/year-{meta['year']}-maths/evaluations/{meta['term'].lower()}"
    sources=[folder/n for n in ['evaluation.json','term-assessment-and-mark-scheme.pdf','editable-teacher-evaluation-record.docx']]+list((folder/'preview').rglob('*.png'))
    for source in sources:
        target=dest/source.relative_to(folder);target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copy2(source,target)
        files.append(dict(file=target.relative_to(ROOT).as_posix(),sha256=hashlib.sha256(target.read_bytes()).hexdigest()))
(ROOT/'scripts/releases/primary-term-assessments.json').write_text(json.dumps(dict(files=files),indent=2)+'\n')
print(f'Published {len(files)} assessment files locally.')
