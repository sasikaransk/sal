import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ChatbotComponent } from '../../chatbot/chatbot.component';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ChatbotComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class ThirdPartyLayout {

  isSidebarOpen = signal(false);

  toggleSidebar(): void {
    this.isSidebarOpen.update(open => !open);
  }
}

