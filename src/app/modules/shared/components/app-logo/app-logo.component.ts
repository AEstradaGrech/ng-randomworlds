import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  templateUrl: './app-logo.component.html',
  styleUrl: './app-logo.component.scss'
})
export class AppLogoComponent {
  @Input() logoImg: string = 'assets/images/RandomWorldsLogo.png';
  @Input() titleColor: string = 'red';
  @Input() subtitleColor: string = 'red';
}
