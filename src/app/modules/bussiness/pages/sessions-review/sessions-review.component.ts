import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, inject, ViewChild } from '@angular/core';
import { SessionDto } from '../../../shared/models/mgmt-interfaces';
import { SessionsMgmtService } from '../../services/sessions-mgmt.service';
import { QueryCondition, QueryFilter } from '../../../shared/models/common-interfaces';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { SessionChatsReviewComponent } from './components/session-chats-review/session-chats-review.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-sessions-review',
  templateUrl: './sessions-review.component.html',
  styleUrl: './sessions-review.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class SessionsReviewComponent {
  data:SessionDto[] = [];
  columnsToDisplay = ['username', 'tag', 'creationDate', 'actions'];
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement!: SessionDto | null;
  form!:FormGroup;
  totalRecords: number = 0;
  pageSize:number = 10;
  dialog = inject(MatDialog)
  private _fb = inject(FormBuilder);
  private _service: SessionsMgmtService = inject(SessionsMgmtService);
  private _filter!: QueryFilter;
  private _snackBar = inject(MatSnackBar);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  ngOnInit(): void {
    this.form = this._fb.group({
      username: new FormControl(undefined),
      tag: new FormControl(undefined)
    })
    this._initialLoad()
  }

  ngAfterViewInit() {
    this.paginator.pageSize = this.pageSize;
  }

  onSortChange(event:any){
    console.log(event)
  }

  onDetailsClick(element: SessionDto){
    console.log('-- on details click --', element)
    const dialogRef = this.dialog.open(SessionChatsReviewComponent, {
      data: element
    })

    dialogRef.afterClosed().subscribe(result => {
      console.log('-- session chats review after closed --', result)
      this._query()
    })
  }

  onSearch(){
    console.log('on search')
    let form = this.form.getRawValue();
    let conditions: QueryCondition[] = []
    Object.keys(form).forEach(key => {
      if(this.form.controls[key].value !== null && this.form.controls[key].value !== ''){
        conditions.push(this._formInputToQueryCondition(key))
      }
    })
    console.log(conditions)
    this._filter = {
      conditions: conditions,
      page: 0,
      page_size:10
    }
    this._query()
  }
  onDelete(element:SessionDto){
    console.log('-- on delete --')
    this._service.delete(element.id).subscribe(res => {
      if(res){
        this._snackBar.open("Chat document deleted!", undefined, { duration: 2500, panelClass: 'snack-success-uncen'})
        this._query()
      }
    })
  }
  onPaginationChange(event: PageEvent){
    console.log('-- onPagEvent--', event)
    this._filter.page = event.pageIndex;
    this._filter.page_size = event.pageSize;

    if(this.pageSize != this._filter.page_size){
      this.pageSize = this._filter.page_size;
      this._filter.page = 0;
    }
    this._query()
  }
  onReset(){
    this.form.get('username')?.reset()
    this.form.get('tag')?.reset()
    this.form.get('model')?.reset()  
    this.pageSize = 10
    
    this._initialLoad()
  }

  private _initialLoad(){
    this._filter = {
      conditions:[],
      page:0,
      page_size: 10
    }
    this._query()
  }
  private _query(){
    this._service.query(this._filter).subscribe(res => {
      console.log('-- on response --', res)
      this.data = res.data;
      this.totalRecords = res.total_records ?? 999999;
      this.paginator.pageSize = this._filter.page_size;
      this.paginator.pageIndex = this._filter.page;
    })
  }
  private _formInputToQueryCondition(field:string): QueryCondition{
    let condition:QueryCondition = {
      field:field,
      value: this.form.get(field)?.value
    }
    return condition;
  }
}
