import { CommonModule } from '@angular/common';
import { Component, Input, signal, inject, computed } from '@angular/core';
import { FaqService, FaqItem } from '../../../../../../core/services/faq.service';
import { AskQuestionComponent } from '../ask-question/ask-question';
import { AccountService } from '../../../../../../core/services/account.service';

@Component({
  selector: 'app-faq-section',
  standalone: true,
  imports: [CommonModule, AskQuestionComponent],
  templateUrl: './faq-section.html',
  styles: [`
    :host{display:block}
    .block-head{display:flex; align-items:center; justify-content:space-between; margin-bottom:.8rem}
    .block-head h2{margin:0}
    .block-head .count{background:rgba(255,255,255,.92); border:1px solid rgba(200,139,53,.2); padding:.2rem .55rem; border-radius:.6rem; font-weight:700; color:#4b5563}
    .faq-toolbar{display:flex; justify-content:space-between; align-items:center; margin-bottom:.65rem}
    .faq-toolbar .btn-link{background:none; border:none; color:#6b7280; text-decoration:underline; cursor:pointer; padding:.25rem .45rem}
    .faq-toolbar .btn-link:hover{color:#374151}
    .btn-ask{display:inline-flex; align-items:center; gap:.45rem; background:linear-gradient(135deg,#c88b35,#d8a24a); color:#fff; border:none; padding:.55rem .95rem; border-radius:.8rem; font-weight:600; cursor:pointer; box-shadow:0 8px 20px rgba(200,139,53,.3)}
    .btn-ask:hover{filter:brightness(1.07)}
    .btn-ask .icon{display:block}
    .faq-list{display:grid; gap:.6rem; margin:0}
    .faq-item{background:linear-gradient(145deg, rgba(255,255,255,.98), rgba(250,244,236,.94)); border:1px solid rgba(200,139,53,.16); border-radius:14px; padding:.2rem .4rem; box-shadow:inset 0 1px 0 rgba(255,255,255,.75),0 10px 26px rgba(200,139,53,.12)}
    .q-btn{width:100%; display:flex; align-items:center; justify-content:space-between; gap:.8rem; border:none; background:transparent; cursor:pointer; padding:.8rem 1rem; border-radius:12px}
    .q-btn:hover{background:rgba(200,139,53,.08)}
    .q-text{font-weight:700; font-size:1rem; color:#2f2f2f; text-align:left}
    .chev{transition:transform .2s ease}
    .chev.open{transform:rotate(180deg)}
    .answer{margin:0; color:#4b5563; line-height:1.5; max-height:0; overflow:hidden; transition:max-height .25s ease, padding .25s ease; padding:0 1rem}
    .answer.open{max-height:400px; padding:.1rem 1rem .9rem}
    .answer.pending{font-style:italic; color:#795f2b}
    .empty{padding:.8rem; font-style:italic; color:#6b7280}
    .loading{margin-top:.5rem; font-size:.85rem; color:#6b7280}
    .actions.align-end{display:flex; justify-content:flex-end; margin-top:.4rem}
    .btn-primary{display:inline-flex; align-items:center; justify-content:center; height:40px; padding:0 1rem; border-radius:.9rem; text-decoration:none; font-weight:700; color:#111; background:linear-gradient(135deg,#c88b35,#d8a24a); border: none; box-shadow:0 14px 30px rgba(200,139,53,.28)}
    .toast{position:fixed; right:18px; bottom:18px; background:#111; color:#eee; padding:.7rem 1rem; border-radius:10px; box-shadow:0 8px 22px rgba(0,0,0,.35); border:1px solid #333}
    .toast.error{background:#3b0d0d; border-color:#5c1a1a}
    @media (max-width:680px){
      .q-btn{padding:.75rem .75rem}
    }
  `]
})
export class FaqSectionComponent {
  @Input() eventId = '';

  private faqService = inject(FaqService) as FaqService;
  private accountService = inject(AccountService) as AccountService;

  faqs = signal<FaqItem[]>([]);
  loading = signal<boolean>(false);
  loaded = signal<boolean>(false);
  showAsk = signal<boolean>(false);
  isLoggedIn = signal<boolean>(false);
  pageSize = 6;
  showCount = signal<number>(this.pageSize);
  visibleFaqs = computed(() => this.faqs().slice(0, this.showCount()));
  expanded = signal<Set<number>>(new Set());
  toastMessage = signal<string>('');
  toastType = signal<'success'|'error'|''>('');
  expandedAny = computed(() => this.expanded().size > 0);

  ngOnInit(){
    this.isLoggedIn.set(!!this.accountService.currentUser());
    if(this.eventId){
      this.fetchFaqs();
    }
  }

  ngOnChanges(){
    if(this.eventId && !this.loaded()){
      this.fetchFaqs();
    }
  }

  private fetchFaqs(){
    this.loading.set(true);
    this.faqService.getEventFaqs(this.eventId).subscribe({
      next: (data: FaqItem[]) => { this.faqs.set(data); this.loading.set(false); this.loaded.set(true); },
      error: (err: unknown) => { console.error('Failed to load FAQs', err); this.loading.set(false); this.loaded.set(true); }
    });
  }

  openAskModal(){
    if(!this.isLoggedIn()){
      window.location.href = '/login';
      return;
    }
    this.showAsk.set(true);
  }
  closeAskModal(){
    this.showAsk.set(false);
  }
  handleSubmit(ev: { text: string }){
    const q = ev.text.trim();
    if(!q || !this.eventId) return;
    this.faqService.postQuestion(this.eventId, { question: q }).subscribe({
      next: () => {
        this.closeAskModal();
        this.faqs.update(list => [{ question: q }, ...list]);
        this.showToast('Question submitted successfully');
      },
      error: (err: unknown) => { console.error('Post question failed', err); this.showToast('Failed to submit question', 'error'); }
    });
  }

  trackFaq(_i: number, item: FaqItem){ return item.question; }

  toggle(i: number){
    const s = new Set(this.expanded());
    if(s.has(i)) s.delete(i); else s.add(i);
    this.expanded.set(s);
  }
  isExpanded(i: number){ return this.expanded().has(i); }
  expandAll(){
    const s = new Set<number>();
    this.visibleFaqs().forEach((_f, i) => s.add(i));
    this.expanded.set(s);
  }
  collapseAll(){ this.expanded.set(new Set()); }
  showMore(){ this.showCount.set(Math.min(this.faqs().length, this.showCount() + this.pageSize)); }
  showLess(){ this.showCount.set(this.pageSize); this.expanded.set(new Set()); }
  private showToast(msg: string, type: 'success'|'error'='' as any){
    this.toastMessage.set(msg);
    this.toastType.set(type || 'success');
    setTimeout(() => { this.toastMessage.set(''); this.toastType.set(''); }, 3000);
  }
}