import { Component } from '@angular/core';
import { AppHeaderComponent } from '../../../features/Common/home/app-header/app-header.component';
import { RouterOutlet } from '@angular/router';
import { ChatbotComponent } from '../../chatbot/chatbot.component';

@Component({
  selector: 'app-guest-layout',
  imports: [RouterOutlet,AppHeaderComponent, ChatbotComponent],
   standalone: true, // ✅ required in standalone apps
  templateUrl: './guest-layout.html',
  styleUrl: './guest-layout.css'
})
export class GuestLayout {

}
