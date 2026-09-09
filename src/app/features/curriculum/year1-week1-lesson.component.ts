import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { LanguageService } from '../../core/services/language.service';

interface Question { q: string; a: string; }
interface WeekLesson {
  week?:number; day:number; slug:string; title:string; objective:string; vocabulary:string[]; successCriteria:string[]; prior:string; resources:string; misconception:string;
  warmup:string; teacherModel:string[]; guided:string; independent:string; plenary:string;
  preteach:{focus:string;steps:string[];questions:Question[]}; lower:Question[]; expected:Question[]; higher:Question[];
}
interface ResourcePreview { title:string; kind:'slides'|'pdf'; download:string; preview?:string; slideCount?:number; description:string; }

@Component({
  selector:'bp-year1-week1-lesson', standalone:true, imports:[RouterLink, FormsModule], changeDetection:ChangeDetectionStrategy.OnPush,
  template:`
    @if (lesson(); as item) {
      <header class="bp-page-hero"><div class="bp-container">
        <a class="back" [routerLink]="l('/lessons/year-1-maths-map')">← Autumn curriculum map</a>
        <span class="bp-chip">Year 1 Maths · Autumn · Week {{ week }} · Day {{ item.day }}</span>
        <h1>{{ item.title }}</h1><p>{{ item.objective }}</p>
      </div></header>
      <main class="bp-section"><div class="bp-container lesson-layout">
        <nav class="resource-card bp-card" aria-label="Lesson downloads">
          <span class="bp-label">Complete lesson pack</span><h2>Open and adapt every resource</h2>
          <div class="downloads">
            <button class="download" type="button" (click)="openPreview('plan')"><span>📝</span><b>Editable teacher plan</b><small>Preview first · one-page Word plan</small></button>
            <button class="download" type="button" (click)="openPreview('slides')"><span>📽️</span><b>Teaching PowerPoint</b><small>Preview all slides first</small></button>
            <button class="download" type="button" (click)="openPreview('preteach')"><span>🌱</span><b>Pre-teach</b><small>Preview before printing</small></button>
            <button class="download" type="button" (click)="openPreview('lower')"><span>●</span><b>Lower worksheet</b><small>Preview before printing</small></button>
            <button class="download" type="button" (click)="openPreview('expected')"><span>●●</span><b>Expected worksheet</b><small>Preview before printing</small></button>
            <button class="download" type="button" (click)="openPreview('higher')"><span>●●●</span><b>Higher worksheet</b><small>Preview before printing</small></button>
          </div>
          @if (preview(); as resource) {
            <section class="preview" aria-live="polite">
              <div class="preview__head"><div><span class="bp-label">Preview before download</span><h3>{{ resource.title }}</h3><p>{{ resource.description }}</p></div><button class="preview__close" type="button" (click)="closePreview()" aria-label="Close preview">×</button></div>
              @if (resource.kind === 'slides') {
                <div class="slide-preview"><img [src]="slidePreviewSrc()" [alt]="resource.title + ', slide ' + previewSlide()" /></div>
                <div class="slide-controls"><button type="button" (click)="changeSlide(-1)" [disabled]="previewSlide() === 1">← Previous</button><b>Slide {{ previewSlide() }} of {{ resource.slideCount }}</b><button type="button" (click)="changeSlide(1)" [disabled]="previewSlide() === resource.slideCount">Next →</button></div>
              } @else if (previewUrl()) {
                <iframe class="document-preview" [src]="previewUrl()" [title]="resource.title + ' preview'"></iframe>
              }
              <div class="preview__actions"><span>Happy with the preview?</span><a class="bp-btn" [href]="asset(resource.download)" download>Download {{ resource.title }}</a></div>
            </section>
          }
        </nav>

        <section class="editor bp-card">
          <div class="editor__head"><div><span class="bp-label">Editable in your browser</span><h2>Teacher planning notes</h2></div><button class="bp-btn" type="button" (click)="saveDraft()">Save on this device</button></div>
          <p class="hint">Adapt these fields for your class. The downloadable Word plan contains the full lesson sequence and answer key.</p>
          <div class="field-grid"><label>Teacher / class<input [(ngModel)]="draft.teacher" /></label><label>Date<input type="date" [(ngModel)]="draft.date" /></label></div>
          <label>Pupil initials / focus group<textarea rows="2" [(ngModel)]="draft.initials"></textarea></label>
          <label>SEND, EAL and individual needs<textarea rows="3" [(ngModel)]="draft.send"></textarea></label>
          <label>Adaptations, reasonable adjustments and adult support<textarea rows="4" [(ngModel)]="draft.adaptations"></textarea></label>
          <label>Assessment notes and next steps<textarea rows="4" [(ngModel)]="draft.assessment"></textarea></label>
          @if (saved()) { <p class="saved" role="status">✓ Saved on this device</p> }
        </section>

        <section class="sequence"><span class="bp-label">60-minute teaching sequence</span><h2>Lesson at a glance</h2>
          <div class="sequence-grid">
            <article class="bp-card"><b>1 · Revisit</b><p>{{ item.warmup }}</p><small>5 minutes</small></article>
            <article class="bp-card"><b>2 · Model</b><ol>@for(step of item.teacherModel; track step){<li>{{ step }}</li>}</ol><small>15 minutes</small></article>
            <article class="bp-card"><b>3 · Guided practice</b><p>{{ item.guided }}</p><small>15 minutes</small></article>
            <article class="bp-card"><b>4 · Independent practice</b><p>{{ item.independent }}</p><small>20 minutes</small></article>
            <article class="bp-card"><b>5 · Review</b><p>{{ item.plenary }}</p><small>5 minutes</small></article>
          </div>
        </section>

        <aside class="preteach bp-card"><div><span class="bp-label">Before the lesson</span><h2>Pre-teach focus</h2><p>{{ item.preteach.focus }}</p></div><ul>@for(step of item.preteach.steps;track step){<li>✓ {{ step }}</li>}</ul></aside>
        <aside class="overview bp-card"><div><b>Success criteria</b><ul>@for(point of item.successCriteria;track point){<li>{{ point }}</li>}</ul></div><div><b>Key vocabulary</b><p>{{ item.vocabulary.join(' · ') }}</p></div><div><b>Watch for</b><p>{{ item.misconception }}</p></div></aside>
      </div></main>
    } @else { <div class="bp-loading"><span class="bp-spinner"></span>Loading lesson…</div> }
  `,
  styles:[`
    .back{display:block;width:max-content;margin-bottom:1rem;font-weight:700}.lesson-layout{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(320px,.95fr);gap:1.5rem}.resource-card,.editor,.preteach,.overview{padding:clamp(1.2rem,3vw,2rem)}.resource-card h2,.editor h2{margin:.35rem 0 1rem}.downloads{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem}.download{appearance:none;width:100%;font:inherit;text-align:left;display:grid;grid-template-columns:auto 1fr;column-gap:.7rem;align-items:center;border:1px solid var(--border);border-radius:12px;padding:.9rem;color:var(--text);background:var(--page-bg);cursor:pointer}.download:hover,.download:focus-visible{border-color:var(--brand-l);background:var(--brand-tint);color:var(--text);outline:2px solid transparent}.download span{grid-row:1/3;color:var(--brand-d)}.download b{font-size:.9rem}.download small{color:var(--text-muted)}.preview{margin-top:1rem;border:1px solid var(--border);border-radius:16px;padding:1rem;background:var(--white)}.preview__head{display:flex;align-items:flex-start;justify-content:space-between;gap:1rem}.preview__head h3{margin:.25rem 0}.preview__head p{margin:.25rem 0 .8rem;color:var(--text-muted);font-size:.86rem}.preview__close{border:0;background:var(--page-bg);border-radius:50%;width:2rem;height:2rem;font-size:1.25rem;cursor:pointer}.slide-preview{background:var(--page-bg);border:1px solid var(--border);border-radius:12px;overflow:hidden}.slide-preview img{display:block;width:100%;height:auto}.slide-controls{display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin-top:.75rem}.slide-controls button{border:1px solid var(--border);background:var(--white);border-radius:9px;padding:.55rem .75rem;cursor:pointer}.slide-controls button:disabled{opacity:.45;cursor:not-allowed}.document-preview{width:100%;height:560px;border:1px solid var(--border);border-radius:12px;background:var(--page-bg)}.preview__actions{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-top:.85rem}.preview__actions span{font-size:.86rem;color:var(--text-muted)}.editor__head{display:flex;justify-content:space-between;align-items:start;gap:1rem}.editor .bp-btn{padding:.65rem 1rem;white-space:nowrap}.hint{font-size:.86rem;color:var(--text-muted)}label{display:block;font-weight:700;font-size:.82rem;margin-top:.85rem}label input,label textarea{font-weight:400;margin-top:.3rem}.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}.saved{margin:.8rem 0 0;color:var(--accent-emerald);font-weight:700}.sequence{grid-column:1/-1}.sequence h2{margin:.35rem 0 1rem}.sequence-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.8rem}.sequence-grid article{padding:1rem;display:flex;flex-direction:column}.sequence-grid p,.sequence-grid ol{font-size:.86rem;color:var(--slate-600);padding-left:1rem;flex:1}.sequence-grid p{padding-left:0}.sequence-grid small{color:var(--brand-d);font-weight:700}.preteach{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:2rem;background:linear-gradient(135deg,var(--brand-tint),var(--white))}.preteach ul li{margin:.45rem 0}.overview{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}.overview ul{list-style:disc;padding-left:1rem}.overview p,.overview li{font-size:.9rem;color:var(--slate-600)}@media(max-width:950px){.lesson-layout{grid-template-columns:1fr}.sequence-grid{grid-template-columns:repeat(2,1fr)}.overview{grid-template-columns:1fr}.resource-card,.editor,.sequence,.preteach,.overview{grid-column:1}.document-preview{height:480px}}@media(max-width:560px){.downloads,.field-grid,.sequence-grid,.preteach{grid-template-columns:1fr}.editor__head{display:block}.editor .bp-btn{margin-top:.5rem;width:100%;justify-content:center}.download{min-width:0}.preview__actions,.slide-controls{align-items:stretch;flex-direction:column}.preview__actions .bp-btn,.slide-controls button{width:100%;justify-content:center}.document-preview{height:420px}}
  `]
})
export class Year1Week1LessonComponent {
  private http=inject(HttpClient); private route=inject(ActivatedRoute); private lang=inject(LanguageService); private sanitizer=inject(DomSanitizer);
  readonly slug=this.route.snapshot.paramMap.get('slug') ?? ''; readonly week=Number(this.route.snapshot.data['week'] ?? 1); readonly lesson=signal<WeekLesson|null>(null); readonly saved=signal(false); readonly preview=signal<ResourcePreview|null>(null); readonly previewUrl=signal<SafeResourceUrl|null>(null); readonly previewSlide=signal(1);
  draft={teacher:'',date:'',initials:'',send:'',adaptations:'',assessment:''};
  constructor(){ this.http.get<WeekLesson[]>(`/lessons/year-1-maths/week-${this.week}/week${this.week}-lessons.json`).subscribe(items=>{this.lesson.set(items.find(item=>item.slug===this.slug)??null);this.loadDraft();}); }
  asset(file:string):string{return `/lessons/year-1-maths/week-${this.week}/${this.slug}/${file}`;} l(path:string):string{return this.lang.localise(path);}
  private key():string{return `brightpath-plan-week-${this.week}-${this.slug}`;} private loadDraft():void{try{const value=localStorage.getItem(this.key());if(value)this.draft={...this.draft,...JSON.parse(value)};}catch{}}
  saveDraft():void{try{localStorage.setItem(this.key(),JSON.stringify(this.draft));this.saved.set(true);setTimeout(()=>this.saved.set(false),2500);}catch{}}
  openPreview(kind:'plan'|'slides'|'preteach'|'lower'|'expected'|'higher'):void{
    const newPack=this.week===1&&this.slug==='sort-objects-into-groups';
    const resources:Record<typeof kind,ResourcePreview>={
      plan:{title:'Editable teacher plan',kind:'pdf',download:newPack?'editable-teacher-plan-one-page.docx':'editable-teacher-plan.docx',preview:newPack?'teacher-plan-preview.pdf':'teacher-plan-preview.pdf',description:'One-page, supply-teacher-ready lesson plan. Download the Word version only when you are ready to edit it.'},
      slides:{title:'Teaching PowerPoint',kind:'slides',download:newPack?'teaching-powerpoint-v5.pptx':'interactive-teaching-slides.pptx',preview:'preview/powerpoint',slideCount:newPack?15:8,description:'Clear teaching, worked modelling and pupil checkpoints, with key ideas revealed one step at a time. Use Previous and Next to inspect every slide.'},
      preteach:{title:'Pre-teach resource',kind:'pdf',download:'pre-teach.pdf',preview:'pre-teach.pdf',description:'Adult guide and pupil quick check for the lower/CUSP group.'},
      lower:{title:'Lower support worksheet',kind:'pdf',download:'lower-worksheet.pdf',preview:'lower-worksheet.pdf',description:'Concrete, visual practice with reduced language and supported recording.'},
      expected:{title:'Expected worksheet',kind:'pdf',download:'expected-worksheet.pdf',preview:'expected-worksheet.pdf',description:'Independent core practice at the expected lesson outcome.'},
      higher:{title:'Higher challenge worksheet',kind:'pdf',download:'higher-worksheet.pdf',preview:'higher-worksheet.pdf',description:'Reasoning, two-rule sorting and early-finisher extension.'},
    };
    const resource=resources[kind]; this.preview.set(resource); this.previewSlide.set(1);
    this.previewUrl.set(resource.kind==='pdf'&&resource.preview?this.sanitizer.bypassSecurityTrustResourceUrl(this.asset(resource.preview)):null);
    setTimeout(()=>document.querySelector('.preview')?.scrollIntoView({behavior:'smooth',block:'nearest'}));
  }
  closePreview():void{this.preview.set(null);this.previewUrl.set(null);this.previewSlide.set(1);}
  changeSlide(delta:number):void{const total=this.preview()?.slideCount??1;this.previewSlide.set(Math.min(total,Math.max(1,this.previewSlide()+delta)));}
  slidePreviewSrc():string{const folder=this.preview()?.preview??'preview/powerpoint';return this.asset(`${folder}/slide-${this.previewSlide()}.png`);}
}
