import { CommonModule, NgFor } from '@angular/common';
import { Component, HostListener, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type QA = { q: string; a: string };
type Message = { sender: 'user' | 'bot'; text: string };

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, NgFor, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
})

export class ChatbotComponent implements OnInit {
  readonly isOpen = signal(false);
  readonly messages = signal<Message[]>([{ sender: 'bot', text: 'Hi! How can I help you today?' }]);
  private faq = signal<QA[]>([]);
  draft = '';

  private http = new HttpClient(undefined as any);

  constructor(httpClient?: HttpClient) {
    // Angular DI will supply HttpClient; the parameter is optional to avoid TS complaining when analyzed in isolation
    if (httpClient) this.http = httpClient;
  }

  ngOnInit(): void {
    this.loadFaq();
  }

  toggle(): void {
    this.isOpen.update(v => !v);
  }

  close(): void {
    this.isOpen.set(false);
  }

  onSubmit(): void {
    const text = (this.draft || '').trim();
    if (!text) return;

    this.push({ sender: 'user', text });
    this.draft = '';
    // small talk fast paths
    const lc = text.toLowerCase();
    if (/^(hi|hello|hey)\b/.test(lc)) {
      this.reply('Hi there! How can I help with your event today?');
      return;
    }
    if (/^(thanks|thank you)\b/.test(lc)) {
      this.reply("You're welcome! Anything else I can help with?");
      return;
    }
    if (/^(bye|goodbye|see you)\b/.test(lc)) {
      this.reply('Goodbye! Have a great day.');
      return;
    }

    const answer = this.findAnswer(text);
    this.reply(answer);
  }

  private push(m: Message) {
    this.messages.update(list => [...list, m]);
    queueMicrotask(() => this.scrollToBottom());
  }

  private reply(text: string) {
    this.push({ sender: 'bot', text });
  }

  private scrollToBottom() {
    try {
      const body = document.querySelector('.chatbot-body');
      if (body) (body as HTMLElement).scrollTop = (body as HTMLElement).scrollHeight;
    } catch {}
  }

  private loadFaq(): void {
    // Served from public/Chatbot/faq.jsonl => /Chatbot/faq.jsonl
    this.http
      .get('/Chatbot/faq.jsonl', { responseType: 'text' })
      .subscribe({
        next: (txt) => {
          const items: QA[] = [];
          for (const line of (txt || '').split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed) continue;
            try {
              const obj = JSON.parse(trimmed);
              if (obj?.q && obj?.a) items.push({ q: String(obj.q), a: String(obj.a) });
            } catch {
              // ignore bad lines
            }
          }
          this.faq.set(items);
        },
        error: () => {
          // Keep working without FAQ if not found
        },
      });
  }

  private findAnswer(input: string): string {
    const items = this.faq();
    if (!items.length) {
      return "I'm still learning. Try asking about accounts, bookings, providers, payments, or cancellations.";
    }
    const normalized = this.normalize(input);
    let best: { score: number; qa: QA } | null = null;
    for (const qa of items) {
      const score = this.score(qa.q, normalized);
      if (!best || score > best.score) best = { score, qa };
    }
    if (best && (best.score >= 0.28 || this.includesStrong(best.qa.q, normalized))) {
      return best.qa.a;
    }
    // fallback: propose top 3 related questions
    const ranked = items
      .map((qa) => ({ qa, s: this.score(qa.q, normalized) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map(x => `• ${x.qa.q}`)
      .join('\n');
    return ranked
      ? `I couldn't find an exact answer. Here are related topics:\n${ranked}`
      : "Sorry, I don't have an answer for that yet.";
  }

  private normalize(s: string): string {
    return (s || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private includesStrong(q: string, inputNorm: string): boolean {
    const qn = this.normalize(q);
    return qn.includes(inputNorm) || inputNorm.includes(qn);
  }

  private score(question: string, inputNorm: string): number {
    const qn = this.normalize(question);
    if (!qn || !inputNorm) return 0;
    // token overlap + substring bonus
    const qs = new Set(qn.split(' '));
    const iset = new Set(inputNorm.split(' '));
    let inter = 0;
    for (const t of iset) if (qs.has(t)) inter++;
    const union = qs.size + iset.size - inter || 1;
    const jaccard = inter / union; // 0..1
    const substr = qn.includes(inputNorm) || inputNorm.includes(qn) ? 0.5 : 0;
    return jaccard + substr;
  }
  

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }
}
