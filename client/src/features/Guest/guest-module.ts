import { Component, NgModule } from '@angular/core';
import { RouterOutlet } from '@angular/router';



@Component({
  selector: 'app-guest-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`
})
export class GuestLayout {}
