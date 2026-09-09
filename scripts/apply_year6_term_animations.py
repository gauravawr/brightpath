import json
import sys
import zipfile
from pathlib import Path

from lxml import etree


ROOT = Path(__file__).resolve().parents[1]
NS = {
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
}


def marker_shape_ids(root):
    ids = []
    for shape in root.xpath(".//p:sp", namespaces=NS):
        text = "".join(shape.xpath(".//a:t/text()", namespaces=NS))
        if "[[CLICK]]" in text:
            values = shape.xpath("./p:nvSpPr/p:cNvPr/@id", namespaces=NS)
            if values:
                ids.append(values[0])
    return ids


def qn(prefix, name):
    return f"{{{NS[prefix]}}}{name}"


def build_timing(shape_ids):
    timing = etree.Element(qn("p", "timing"))
    tn_list = etree.SubElement(timing, qn("p", "tnLst"))
    root_par = etree.SubElement(tn_list, qn("p", "par"))
    root_ctn = etree.SubElement(root_par, qn("p", "cTn"), id="1", dur="indefinite", restart="never", nodeType="tmRoot")
    root_children = etree.SubElement(root_ctn, qn("p", "childTnLst"))
    sequence = etree.SubElement(root_children, qn("p", "seq"), concurrent="1", nextAc="seek")
    sequence_ctn = etree.SubElement(sequence, qn("p", "cTn"), id="2", dur="indefinite", nodeType="mainSeq")
    effects = etree.SubElement(sequence_ctn, qn("p", "childTnLst"))

    next_id = 3
    for shape_id in shape_ids:
        outer_par = etree.SubElement(effects, qn("p", "par"))
        outer_ctn = etree.SubElement(outer_par, qn("p", "cTn"), id=str(next_id), fill="hold")
        start = etree.SubElement(outer_ctn, qn("p", "stCondLst"))
        etree.SubElement(start, qn("p", "cond"), delay="indefinite")
        outer_children = etree.SubElement(outer_ctn, qn("p", "childTnLst"))
        middle_par = etree.SubElement(outer_children, qn("p", "par"))
        middle_ctn = etree.SubElement(middle_par, qn("p", "cTn"), id=str(next_id + 1), fill="hold")
        middle_start = etree.SubElement(middle_ctn, qn("p", "stCondLst"))
        etree.SubElement(middle_start, qn("p", "cond"), delay="0")
        middle_children = etree.SubElement(middle_ctn, qn("p", "childTnLst"))
        effect_par = etree.SubElement(middle_children, qn("p", "par"))
        effect_ctn = etree.SubElement(
            effect_par,
            qn("p", "cTn"),
            id=str(next_id + 2),
            presetID="1",
            presetClass="entr",
            presetSubtype="0",
            fill="hold",
            grpId="0",
            nodeType="clickEffect",
        )
        effect_start = etree.SubElement(effect_ctn, qn("p", "stCondLst"))
        etree.SubElement(effect_start, qn("p", "cond"), delay="0")
        effect_children = etree.SubElement(effect_ctn, qn("p", "childTnLst"))
        set_node = etree.SubElement(effect_children, qn("p", "set"))
        behaviour = etree.SubElement(set_node, qn("p", "cBhvr"))
        behaviour_ctn = etree.SubElement(behaviour, qn("p", "cTn"), id=str(next_id + 3), dur="1", fill="hold")
        behaviour_start = etree.SubElement(behaviour_ctn, qn("p", "stCondLst"))
        etree.SubElement(behaviour_start, qn("p", "cond"), delay="0")
        target = etree.SubElement(behaviour, qn("p", "tgtEl"))
        etree.SubElement(target, qn("p", "spTgt"), spid=shape_id)
        names = etree.SubElement(behaviour, qn("p", "attrNameLst"))
        etree.SubElement(names, qn("p", "attrName")).text = "style.visibility"
        destination = etree.SubElement(set_node, qn("p", "to"))
        etree.SubElement(destination, qn("p", "strVal"), val="visible")
        next_id += 4

    previous = etree.SubElement(sequence, qn("p", "prevCondLst"))
    previous_condition = etree.SubElement(previous, qn("p", "cond"), evt="onPrev", delay="0")
    previous_target = etree.SubElement(previous_condition, qn("p", "tgtEl"))
    etree.SubElement(previous_target, qn("p", "sldTgt"))
    following = etree.SubElement(sequence, qn("p", "nextCondLst"))
    following_condition = etree.SubElement(following, qn("p", "cond"), evt="onNext", delay="0")
    following_target = etree.SubElement(following_condition, qn("p", "tgtEl"))
    etree.SubElement(following_target, qn("p", "sldTgt"))

    builds = etree.SubElement(timing, qn("p", "bldLst"))
    for shape_id in shape_ids:
        etree.SubElement(builds, qn("p", "bldP"), spid=shape_id, grpId="0")
    return timing


def animate(candidate, output):
    with zipfile.ZipFile(candidate) as source_zip:
        replacements = {}
        for slide_number in range(1, 13):
            name = f"ppt/slides/slide{slide_number}.xml"
            candidate_root = etree.fromstring(source_zip.read(name))
            marker_ids = marker_shape_ids(candidate_root)
            existing = candidate_root.find("p:timing", NS)
            if existing is not None:
                candidate_root.remove(existing)
            if marker_ids:
                candidate_root.append(build_timing(marker_ids))
            for node in candidate_root.xpath(".//a:t", namespaces=NS):
                if node.text:
                    node.text = node.text.replace("[[CLICK]] ", "").replace("[[CLICK]]", "")
            replacements[name] = etree.tostring(candidate_root, xml_declaration=True, encoding="UTF-8", standalone=True)

        output.parent.mkdir(parents=True, exist_ok=True)
        with zipfile.ZipFile(output, "w") as out_zip:
            for info in source_zip.infolist():
                out_zip.writestr(info, replacements.get(info.filename, source_zip.read(info.filename)))


def main():
    term = (sys.argv[1] if len(sys.argv) > 1 else "spring").lower()
    if term not in {"autumn", "spring", "summer"}:
        raise RuntimeError("Choose autumn, spring or summer.")
    lessons_root = ROOT / "public" / "lessons" / "year-6-maths" / term
    lessons = json.loads((lessons_root / f"year6-{term}-lessons.json").read_text(encoding="utf-8"))
    stage_root = ROOT / ".qa" / f"year6-{term}-pptx"
    for index, item in enumerate(lessons, 1):
        stage_dir = stage_root / f"week-{item['week']}" / f"{item['day']}-{item['slug']}"
        candidate = stage_dir / "candidate.pptx"
        output = stage_dir / "animated-candidate.pptx"
        animate(candidate, output)
        print(f"{index}/{len(lessons)} {output.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
