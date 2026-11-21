import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-logo',
  templateUrl: './app-logo.component.html',
  styleUrl: './app-logo.component.scss'
})
export class AppLogoComponent implements OnInit {
  @Input() logoImg: string | undefined = undefined;
  @Input() logoImgRadius: string | undefined = undefined;
  @Input() logoImgMargin: string | undefined = undefined;
  @Input() titlesAlign: string | undefined = undefined;
  @Input() titlesJustify: string | undefined = undefined;
  @Input() titleColor: string | undefined = undefined;
  @Input() subtitleColor: string | undefined = undefined;
  @Input() titleMargin: string | undefined = undefined;
  @Input() subtitleMargin: string | undefined = undefined;

  ngOnInit(): void {
    if(!this.logoImg)
      this.logoImg = 'assets/images/RandomWorldsLogo.png';
    if(!this.logoImgRadius)
      this.logoImgRadius = '0px';
    if(!this.logoImgMargin)
      this.logoImgMargin = '0px 10px';

    if(!this.titlesAlign)
      this.titlesAlign = 'center';
    if(!this.titlesJustify)
      this.titlesJustify = 'start';

    if(!this.titleColor)
      this.titleColor = 'red';    
    if(!this.titleMargin)
      this.titleMargin = '5px 0px';

    if(!this.subtitleColor)
      this.subtitleColor = 'red';
    if(!this.subtitleMargin)
      this.subtitleMargin = '0px';
  }
}
