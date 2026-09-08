import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../core/services/language.service';

interface Question { q: string; a: string; }
interface WeekLesson {
  week?:number; day:number; slug:string; title:string; objective:string; vocabulary:string[]; successCriteria:string[]; prior:string; resources:string; misconception:string;
  warmup:string; teacherModel:string[]; guided:string; independent:string; plenary:string;
  preteach:{focus:string;steps:string[];questions:Question[]}; lower:Question[]; expected:Question[]; higher:Question[];
}

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
            <a class="download" [href]="asset('editable-teacher-plan.docx')" download><span>📝</span><b>Editable teacher plan</b><small>Word document</small></a>
            <a class="download" [href]="asset('interactive-teaching-slides.pptx')" download><span>📽️</span><b>Interactive PowerPoint</b><small>Teacher-led slides</small></a>
            <a class="download" [href]="asset('pre-teach.pdf')" download><span>🌱</span><b>Pre-teach</b><small>Vocabulary and early practice</small></a>
            <a class="download" [href]="asset('lower-worksheet.pdf')" download><span>●</span><b>Lower worksheet</b><small>Concrete and supported</small></a>
            <a class="download" [href]="asset('expected-worksheet.pdf')" download><span>●●</span><b>Expected worksheet</b><small>Independent core practice</small></a>
            <a class="download" [href]="asset('higher-worksheet.pdf')" download><span>●●●</span><b>Higher worksheet</b><small>Reasoning and challenge</small></a>
          </div>
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
    .back{display:block;width:max-content;margin-bottom:1rem;font-weight:700}.lesson-layout{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(320px,.95fr);gap:1.5rem}.resource-card,.editor,.preteach,.overview{padding:clamp(1.2rem,3vw,2rem)}.resource-card h2,.editor h2{margin:.35rem 0 1rem}.downloads{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.75rem}.download{display:grid;grid-template-columns:auto 1fr;column-gap:.7rem;align-items:center;border:1px solid var(--border);border-radius:12px;padding:.9rem;color:var(--text);background:var(--page-bg)}.download:hover{border-color:var(--brand-l);background:var(--brand-tint);color:var(--text)}.download span{grid-row:1/3;color:var(--brand-d)}.download b{font-size:.9rem}.download small{color:var(--text-muted)}.editor__head{display:flex;justify-content:space-between;align-items:start;gap:1rem}.editor .bp-btn{padding:.65rem 1rem;white-space:nowrap}.hint{font-size:.86rem;color:var(--text-muted)}label{display:block;font-weight:700;font-size:.82rem;margin-top:.85rem}label input,label textarea{font-weight:400;margin-top:.3rem}.field-grid{display:grid;grid-template-columns:1fr 1fr;gap:.75rem}.saved{margin:.8rem 0 0;color:var(--accent-emerald);font-weight:700}.sequence{grid-column:1/-1}.sequence h2{margin:.35rem 0 1rem}.sequence-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:.8rem}.sequence-grid article{padding:1rem;display:flex;flex-direction:column}.sequence-grid p,.sequence-grid ol{font-size:.86rem;color:var(--slate-600);padding-left:1rem;flex:1}.sequence-grid p{padding-left:0}.sequence-grid small{color:var(--brand-d);font-weight:700}.preteach{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:2rem;background:linear-gradient(135deg,var(--brand-tint),var(--white))}.preteach ul li{margin:.45rem 0}.overview{grid-column:1/-1;display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem}.overview ul{list-style:disc;padding-left:1rem}.overview p,.overview li{font-size:.9rem;color:var(--slate-600)}@media(max-width:950px){.lesson-layout{grid-template-columns:1fr}.sequence-grid{grid-template-columns:repeat(2,1fr)}.overview{grid-template-columns:1fr}.resource-card,.editor,.sequence,.preteach,.overview{grid-column:1}}@media(max-width:560px){.downloads,.field-grid,.sequence-grid,.preteach{grid-template-columns:1fr}.editor__head{display:block}.editor .bp-btn{margin-top:.5rem;width:100%;justify-content:center}.download{min-width:0}}
  `]
})
export class Year1Week1LessonComponent {
  private http=inject(HttpClient); private route=inject(ActivatedRoute); private lang=inject(LanguageService);
  readonly slug=this.route.snapshot.paramMap.get('slug') ?? ''; readonly week=Number(this.route.snapshot.data['week'] ?? 1); readonly lesson=signal<WeekLesson|null>(null); readonly saved=signal(false);
  draft={teacher:'',date:'',initials:'',send:'',adaptations:'',assessment:''};
  constructor(){ this.http.get<WeekLesson[]>(`/lessons/year-1-maths/week-${this.week}/week${this.week}-lessons.json`).subscribe(items=>{this.lesson.set(items.find(item=>item.slug===this.slug)??null);this.loadDraft();}); }
  asset(file:string):string{return `/lessons/year-1-maths/week-${this.week}/${this.slug}/${file}`;} l(path:string):string{return this.lang.localise(path);}
  private key():string{return `brightpath-plan-week-${this.week}-${this.slug}`;} private loadDraft():void{try{const value=localStorage.getItem(this.key());if(value)this.draft={...this.draft,...JSON.parse(value)};}catch{}}
  saveDraft():void{try{localStorage.setItem(this.key(),JSON.stringify(this.draft));this.saved.set(true);setTimeout(()=>this.saved.set(false),2500);}catch{}}
}
