import { Component, inject, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ImagesService } from '../../services/images.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit{
  imageSource:any
  sanitizer = inject(DomSanitizer)
  imagesService = inject(ImagesService)
  ngOnInit(): void {
    this.imagesService.getLastWithName("DarkTemplar").subscribe(res => {
      this.imageSource = this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, ${res.base64}`);
    })
    
  }
}
