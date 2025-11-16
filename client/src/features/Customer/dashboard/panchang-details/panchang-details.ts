import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-panchang-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panchang-details.html',
  styleUrls: ['./panchang-details.css']
})
export class PanchangDetailsComponent {
  private _panchangData: any = null;
  parsed: { brahma: string; rahu: string; yama: string; gulika: string } = { brahma: '-', rahu: '-', yama: '-', gulika: '-' };

  @Input()
  set panchangData(v: any) {
    // Normalize stringified JSON payloads (some API responses or cache may store strings)
    if (typeof v === 'string') {
      try {
        this._panchangData = JSON.parse(v);
      } catch (e) {
        // If parsing fails, keep the raw string so formatRange can still try to extract times
        this._panchangData = v;
      }
    } else {
      this._panchangData = v;
    }
    this.parseFields();
  }
  get panchangData() { return this._panchangData; }

  // Helper to resolve value from several possible response shapes
  getField(key: string): any {
    if (!this.panchangData) return null;
    // direct
    if (this.panchangData[key] !== undefined) return this.panchangData[key];
    // common nested places
    if (this.panchangData.data && this.panchangData.data[key] !== undefined) return this.panchangData.data[key];
    if (this.panchangData.result && this.panchangData.result[key] !== undefined) return this.panchangData.result[key];
    if (this.panchangData.response && this.panchangData.response[key] !== undefined) return this.panchangData.response[key];
    // fallback: search first-level properties for matching keys (case-insensitive)
    const lower = key.toLowerCase();
    for (const k of Object.keys(this.panchangData)) {
      if (k.toLowerCase() === lower) return this.panchangData[k];
    }
    return null;
  }

  // Format a time-range object or string into a human friendly short range like "04:27 - 05:15"
  formatRange(value: any): string {
    if (!value) return '-';

    // If it's already a string, try detect timestamps inside
    if (typeof value === 'string') {
      try {
        // If string looks like JSON, parse it
        let maybe = value.trim();
        if ((maybe.startsWith('{') && maybe.endsWith('}')) || (maybe.startsWith('[') && maybe.endsWith(']'))) {
          const parsed = JSON.parse(maybe);
          return this.formatRange(parsed);
        }
        // handle double-encoded JSON strings containing escaped quotes
        const open = maybe.indexOf('{');
        const close = maybe.lastIndexOf('}');
        if (open !== -1 && close !== -1 && close > open) {
          const inner = maybe.substring(open, close + 1);
          try {
            const parsed = JSON.parse(inner);
            return this.formatRange(parsed);
          } catch (e) {
            // fallthrough to other heuristics
          }
        }
      } catch (e) {
        // fallthrough
      }
      // fallback: return short part after space if timestamp-like
      const parts = value.split(' ');
      return parts.length > 1 ? parts.slice(1).join(' ') : value;
    }

    // If it's an object with starts_at / ends_at (or start/end)
    const start = value.starts_at ?? value.start ?? value.startsAt ?? null;
    const end = value.ends_at ?? value.end ?? value.endsAt ?? null;
    if (start || end) {
      const s = this.extractTime(start);
      const e = this.extractTime(end);
      if (s && e) return `${s} - ${e}`;
      return `${s || '-'} ${e ? '- ' + e : ''}`.trim();
    }

    // If it's an array, join and format elements
    if (Array.isArray(value)) return value.map(v => this.formatRange(v)).join(', ');

    // As fallback, stringify simple fields
    try { return String(value); } catch { return '-'; }
  }

  private extractTime(ts: any): string | null {
    if (!ts) return null;
    // If it's a Date object
    if (ts instanceof Date) {
      return ts.toTimeString().slice(0,5);
    }
    // If it's a numeric timestamp
    if (typeof ts === 'number') {
      const d = new Date(ts);
      return d.toTimeString().slice(0,5);
    }
    // If it's a string like '2025-11-14 04:27:20' or '2025-11-14T04:27:20'
    if (typeof ts === 'string') {
      // Extract time portion
      const m = ts.match(/(\d{2}:\d{2}:?\d{0,2}(?:\.\d+)?)$/);
      if (m) {
        // m[1] may be HH:MM:SS(.ms) -> reduce to HH:MM
        const hhmm = m[1].split(':').slice(0,2).join(':');
        return hhmm;
      }
      // If contains a space-separated time after date
      const parts = ts.split(' ');
      if (parts.length > 1) {
        const t = parts[1].split('.')[0];
        const hhmm = t.split(':').slice(0,2).join(':');
        return hhmm;
      }
      return ts;
    }
    return null;
  }

  private parseFields() {
    // Populate parsed.* from the incoming panchangData using existing helpers
    if (!this._panchangData) {
      this.parsed = { brahma: '-', rahu: '-', yama: '-', gulika: '-' };
      return;
    }
    try {
      this.parsed.brahma = this.formatRange(this.getField('brahma_muhurat_data') || this.getField('brahma_muhurta') || this.getField('brahma_muhurta_data'));
      this.parsed.rahu = this.formatRange(this.getField('rahu_kaalam_data') || this.getField('rahukalam') || this.getField('rahukalam_data'));
      this.parsed.yama = this.formatRange(this.getField('yama_gandam_data') || this.getField('yamagandam') || this.getField('yama_kandam'));
      this.parsed.gulika = this.formatRange(this.getField('gulika_kalam_data') || this.getField('gulikalam') || this.getField('guligai'));
    } catch (e) {
      this.parsed = { brahma: '-', rahu: '-', yama: '-', gulika: '-' };
    }
  }
}
