import { Component, inject, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ImagesService } from '../../services/images.service';

@Component({
  selector: 'app-image-review',
  templateUrl: './image-review.component.html',
  styleUrl: './image-review.component.scss'
})
export class ImageReviewComponent implements OnInit {
  imageSource:any
  sanitizer = inject(DomSanitizer)
  imagesService = inject(ImagesService)
  ngOnInit(): void {
    this.imagesService.getLastWithName("SatanicCultist").subscribe(res => {
      this.imageSource = this.sanitizer.bypassSecurityTrustResourceUrl(`data:image/png;base64, ${res.base64}`);
    })
    
  }
}
