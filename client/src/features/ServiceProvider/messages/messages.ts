import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type ThreadMessage = {
  from: 'client' | 'studio';
  text: string;
  time: string;
};

type Conversation = {
  name: string;
  event: string;
  status: 'online' | 'idle';
  unread: number;
  lastMessage: string;
  stage: string;
  thread: ThreadMessage[];
};

@Component({
  selector: 'app-service-provider-messages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './messages.html',
  styleUrl: './messages.css'
})
export class Messages {
  readonly conversations: Conversation[] = [
    {
      name: 'Anya & Vivaan',
      event: 'Reception runway',
      status: 'online',
      unread: 2,
      lastMessage: 'Can we add mirror aisle props?',
      stage: 'Awaiting advance',
      thread: [
        { from: 'client', text: 'Can we add mirror aisle props?', time: '09:12' },
        { from: 'studio', text: 'Absolutely! Sending inspo shortly.', time: '09:13' }
      ]
    },
    {
      name: 'Kavan & Mira',
      event: 'Immersive sangeet',
      status: 'idle',
      unread: 0,
      lastMessage: 'Deck looks perfect, thank you!',
      stage: 'Design review',
      thread: [
        { from: 'client', text: 'Deck looks perfect, thank you!', time: 'Yesterday' },
        { from: 'studio', text: 'Let’s jump on a walkthrough tomorrow.', time: 'Yesterday' }
      ]
    },
    {
      name: 'Noah & Hana',
      event: 'Destination curation',
      status: 'online',
      unread: 0,
      lastMessage: 'We are good for Pune venue.',
      stage: 'Venue lock',
      thread: [
        { from: 'client', text: 'We are good for Pune venue.', time: 'Tue' },
        { from: 'studio', text: 'Amazing—will share revised layouts.', time: 'Tue' }
      ]
    }
  ];

  activeConversation: Conversation = this.conversations[0];

  readonly quickReplies = [
    'Sharing the revised deck in 30 mins.',
    'Looping FestivaZ concierge for payout update.',
    'Let’s schedule a touch-point tomorrow 5 PM.'
  ];

  selectConversation(conversation: Conversation): void {
    this.activeConversation = conversation;
  }
}
