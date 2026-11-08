import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'ng-randomworlds';

  ngOnInit(): void {
    console.log('-- on app init --');
    // interval(3000).subscribe(interv =>{
    //   console.log('-- INTERVAL --', interv);
    // })
  }

}
