import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TreeMenuItem } from './tree-menu-item.model';
import { Router } from '@angular/router';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-tree-menu',
  templateUrl: './tree-menu.component.html',
  styleUrl: './tree-menu.component.scss',
  animations:[
    trigger('fade',[
      transition('void => *',[
        style({opacity: 0, height:0}),
        animate(200, style({opacity: 1, height: '48px'}))
      ]),
      transition('* => void', [
        style({opacity: 1, height: '48px'}),
        animate(200, style({opacity:0, height: 0 }))
      ])
    ]),
    trigger('rotateArrow',[
      state('close', style({transform: 'rotate( 0 )'})),
      state('open', style({transform: 'rotate( 90deg )'})),
      transition('close => open', [animate(200)]),
      transition('open => close', [animate(200)])
    ])
  ]
})
export class TreeMenuComponent implements OnInit {

  @Input() items!: Array<TreeMenuItem>;
  @Output() onSelect: EventEmitter<TreeMenuItem> = new EventEmitter<TreeMenuItem>()
  public selectedItem!: TreeMenuItem

  constructor(public router: Router) {}

  ngOnInit(): void {
    // if(this.items)
    //   this.selectedItem = this.items[0];
  }

  setMenuEnabled(name: string){
    let item:TreeMenuItem = this.items.filter(x => x.name === name)[0]
    if(item)
      this.openItem(item);
  }
  openItem(item: TreeMenuItem){
    if(item.expandable)
      item.isOpen = !item.isOpen;
    this.selectedItem = item;
    this.updateChildren(item);
    console.log(item);
    if(item.link && item.link !== '')
      this.router.navigateByUrl(item.link)
    this.onSelect.next(item)
  }

  updateChildren(selected: TreeMenuItem) {
    const idx = this.items.indexOf(selected);
    for(let i = idx +1; i < this.items.length; i++)
    {
      if(selected.level === this.items[i].level) return;
      if(selected.isOpen && selected.level == this.items[i].level -1)
        this.items[i].isVisible = true;
      if(!selected.isOpen && selected.level < this.items[i].level){
        this.items[i].isOpen = false;
        this.items[i].isVisible = false;
      }
    }
  }
}
