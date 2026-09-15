import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild, signal } from '@angular/core';
import type { PDFDocumentProxy, PDFDocumentLoadingTask, RenderTask } from 'pdfjs-dist';
@Component({
 selector: 'bp-pdf-preview', standalone: true,
 template: `<div class="pdf"><p role="status">{{ status() }}</p><canvas #canvas aria-label="Document page"></canvas><nav><button type="button" (click)="show(page()-1)" [disabled]="page()<=1">Previous</button><span>Page {{page()}} of {{pages()}}</span><button type="button" (click)="show(page()+1)" [disabled]="page()>=pages()">Next</button></nav></div>`,
 styles: [`.pdf{border:1px solid #dbe4ee;border-radius:12px;padding:8px;background:white}canvas{display:block;width:100%;height:auto}nav{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:12px 0}button{padding:8px;border:1px solid #cbd5e1;border-radius:6px;background:white}p:empty{display:none}`]
})
export class PdfPreviewComponent implements AfterViewInit, OnChanges, OnDestroy {
 @Input({required:true}) url='';
 @ViewChild('canvas') canvas?:ElementRef<HTMLCanvasElement>;
 readonly page=signal(1); readonly pages=signal(0); readonly status=signal('Loading document…');
 private loadingTask?:PDFDocumentLoadingTask; private document?:PDFDocumentProxy; private task?:RenderTask; private revision=0;
 ngAfterViewInit(){void this.load();}
 ngOnChanges(){if(this.canvas)void this.load();}
 ngOnDestroy(){this.revision++;this.task?.cancel();void this.loadingTask?.destroy();}
 private async load(){
  const revision=++this.revision;this.task?.cancel();await this.loadingTask?.destroy();this.document=undefined;
  this.status.set('Loading document…');this.pages.set(0);this.page.set(1);
  try{const pdf=await import('pdfjs-dist');pdf.GlobalWorkerOptions.workerSrc='/pdfjs/pdf.worker.min.mjs';
   const loading=pdf.getDocument({url:this.url}); this.loadingTask=loading; const doc=await loading.promise;
   if(revision!==this.revision){await loading.destroy();return;}
   this.document=doc;this.pages.set(doc.numPages);await this.show(1);
  }catch{if(revision===this.revision)this.status.set('The preview could not load. You can still use the download button.');}
 }
 async show(number:number){
  if(!this.document||!this.canvas||number<1||number>this.pages())return;
  this.task?.cancel();const revision=this.revision;
  try{const page=await this.document.getPage(number);if(revision!==this.revision)return;
   const viewport=page.getViewport({scale:1.5}),canvas=this.canvas.nativeElement;
   canvas.width=viewport.width;canvas.height=viewport.height;this.page.set(number);
   this.task=page.render({canvas,viewport});await this.task.promise;this.status.set('');
  }catch(e){if((e as Error).name!=='RenderingCancelledException')this.status.set('Unable to render this page.');}
 }
}

