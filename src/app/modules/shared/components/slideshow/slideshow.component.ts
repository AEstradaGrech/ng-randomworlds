import { Component, input, Input, signal } from '@angular/core';

@Component({
  selector: 'app-slideshow',
  templateUrl: './slideshow.component.html',
  styleUrl: './slideshow.component.scss'
})
export class SlideshowComponent {
  images = input.required<string[]>();
  withProgress = input(true);
  interval = input(6000);
  
  protected index = signal(0);

  protected next(): void {
    this.index.update(i => (i + 1) % this.images().length);
  }
}
