import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-drag-and-drop',
  templateUrl: './drag-and-drop.component.html',
  styleUrl: './drag-and-drop.component.scss'
})
export class DragAndDropComponent {
  @Input() boxOneTitle: string = '';
  @Input() boxTwoTitle: string = '';
  @Input() boxOneItems: string[] = [];
  @Input() boxTwoItems: string[] = [];
  @Input() textColor: string = 'black';
  @Input() itemBgColor: string = 'white';
  @Input() dropValidationFn!: () => boolean;
  @Output() onDropValidationFail: EventEmitter<string> = new EventEmitter<string>();
  
  drop(event: CdkDragDrop<string[]>, validateDrop: boolean ) {
    console.log('-- on drop --')
      if (event.previousContainer === event.container) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      } else {
        if(validateDrop && this.dropValidationFn && !this.dropValidationFn()) {
          this.onDropValidationFail.emit('Drop validation fail');
          return;
        };
        transferArrayItem(
          event.previousContainer.data,
          event.container.data,
          event.previousIndex,
          event.currentIndex,
        );
      }
    }
}
