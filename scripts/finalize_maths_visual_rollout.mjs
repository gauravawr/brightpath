import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const root=path.resolve(process.argv[2]??'../.qa/maths-rollout');
const revision=process.argv[3]??'v1';
const skill='C:/Users/garim/.codex/plugins/cache/openai-primary-runtime/presentations/26.909.12148/skills/presentations';
process.env.RUNTIME_NODE_MODULES='C:/Users/garim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules';
const {finalizePresentation}=await import(pathToFileURL(path.join(skill,'container_tools/artifact_tool_utils.mjs')).href);
await fs.mkdir(path.join(root,'final-'+revision),{recursive:true});
await fs.mkdir(path.join(root,'validation-'+revision),{recursive:true});
let count=0;
for(const dir of await fs.readdir(path.join(root,'build'))){
 const source=path.join(root,'build',dir);let m;try{m=JSON.parse(await fs.readFile(path.join(source,'manifest.json'),'utf8'));}catch{continue;}
 const receipt=path.join(root,'validation-'+revision,dir+'.json');
 try{await fs.access(receipt);console.log('EXISTS '+m.id);continue;}catch{}
 await finalizePresentation({workspaceDir:root,candidatePath:path.join(source,'animated-candidate.pptx'),finalPath:path.join(root,'final-'+revision,dir+'.pptx'),pythonExecutable:'C:/Users/garim/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',integrityValidatorPath:path.join(skill,'container_tools/inspect_presentation_package_integrity.py'),layoutValidatorPath:path.join(skill,'container_tools/inspect_presentation_layout_geometry.py'),layoutArgs:['--expected-slide-size-emu','15240000,8572500','--validate-bullet-geometry','--validate-heading-fit'],explicitTotalSlideCount:m.count,requiredNativeTableOwnerSlides:[],requiredNativeChartOwnerSlides:[],fontPolicy:{basis:'design',families:['Arial']},verifyArtifactToolImport:true,receiptPath:receipt});
 console.log('FINALIZED '+(++count)+' '+m.id);
}
