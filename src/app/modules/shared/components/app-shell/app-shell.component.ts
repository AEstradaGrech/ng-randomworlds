import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-shell',
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent {
  visualization = input<string>('vertical');

  viewType = computed(() => { return this.visualization() === 'horizontal' ? 'nowrap' : 'wrap'});
  scrollY = computed(() => { return this.visualization() === 'horizontal' ? 'hidden' : 'auto'});
  scrollX = computed(() => { return this.visualization() === 'horizontal' ? 'auto' : 'hidden'});
  scrollW = computed(() => { return this.visualization() === 'horizontal' ? 'thin' : 'none'});
}
