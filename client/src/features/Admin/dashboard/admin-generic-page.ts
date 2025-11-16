import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-generic-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex min-h-full flex-col bg-slate-50 p-6 md:p-10">
      <div class="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
        <h1 class="text-2xl font-semibold text-slate-900">{{ pageTitle }}</h1>
        <p class="mt-3 text-sm text-slate-500">{{ pageDescription }}</p>
      </div>
    </div>
  `,
})
export class AdminGenericPage {
  private readonly route = inject(ActivatedRoute);

  protected readonly pageTitle = (this.route.snapshot.data['title'] as string) ?? 'Coming soon';
  protected readonly pageDescription =
    (this.route.snapshot.data['description'] as string) ?? 'This section is under construction.';
}
