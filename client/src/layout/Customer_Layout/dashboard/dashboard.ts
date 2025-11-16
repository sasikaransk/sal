import { Component, computed, inject } from '@angular/core';
import { AppHeaderComponent } from "../../../features/Common/home/app-header/app-header.component";
import { RouterOutlet } from "@angular/router";
import { AccountService } from '../../../core/services/account.service';
import { ChatbotComponent } from '../../chatbot/chatbot.component';

@Component({
  selector: 'app-dashboard',
  imports: [AppHeaderComponent, RouterOutlet, ChatbotComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard {
  private accountService = inject(AccountService);

  // Computed readonly helper consistent with other components
  isLoggedIn = computed(() => !!this.accountService.currentUser());

}
