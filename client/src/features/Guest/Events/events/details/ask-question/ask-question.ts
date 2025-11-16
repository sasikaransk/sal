import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, signal, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-ask-question',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ask-question.html',
  styles: [`
    .ask-modal{position:relative; max-width:480px; background:#111; color:#eee; padding:1rem 1.1rem; border-radius:14px; box-shadow:0 10px 30px rgba(0,0,0,.55); font-family:system-ui,Arial,sans-serif}
    .ask-modal .inner{display:flex; flex-direction:column; gap:.85rem}
    h3{margin:0; font-size:1.4rem; font-weight:700; background:linear-gradient(135deg,#E9B949,#D97706); -webkit-background-clip:text; background-clip:text; color:transparent}
    textarea{width:100%; min-height:130px; resize:vertical; border-radius:10px; background:#1b1b1b; border:1px solid #333; padding:.75rem; color:#eee}
    textarea:focus{outline:2px solid #444}
    .actions{display:flex; justify-content:flex-end; gap:.6rem}
    .btn-cancel,.btn-submit{border:none; padding:.55rem 1rem; border-radius:8px; font-weight:600; cursor:pointer}
    .btn-cancel{background:#333; color:#ddd}
    .btn-cancel:hover{background:#444}
    .btn-submit{background:linear-gradient(135deg,#E9B949,#D97706); color:#111}
    .btn-submit:disabled{opacity:.55; cursor:not-allowed}
    .btn-submit:not(:disabled):hover{filter:brightness(1.07)}
    .btn-close{position:absolute; top:6px; right:6px; width:34px; height:34px; border-radius:50%; border:none; background:#222; color:#eee; font-size:1.2rem; cursor:pointer; line-height:1}
    .btn-close:hover{background:#333}
    .sr-only{position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0}
  `]
})
export class AskQuestionComponent implements OnDestroy {
  @Output() cancel = new EventEmitter<void>();
  @Output() submitQuestion = new EventEmitter<{ text: string }>();

  text = signal<string>('');

  submit(){
    const value = this.text().trim();
    if(!value) return;
    this.submitQuestion.emit({ text: value });
  }

  ngOnDestroy(): void {
    // nothing yet; placeholder for cleanup if we add object URLs or timers later
  }
}