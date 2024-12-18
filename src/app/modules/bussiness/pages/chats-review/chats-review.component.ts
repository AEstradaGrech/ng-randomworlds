import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { QueryCondition, QueryFilter } from '../../../shared/models/common-interfaces';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChatDocDto } from '../../../shared/models/prompting-interfaces';
import { ChatPromptsMgmtService } from '../../services/chat-prompts-mgmt.service';
import { ChatDetailDialogComponent } from './components/chat-detail-dialog/chat-detail-dialog.component';

@Component({
  selector: 'app-chats-review',
  templateUrl: './chats-review.component.html',
  styleUrl: './chats-review.component.scss'
})
export class ChatsReviewComponent implements OnInit, AfterViewInit {
  public form!:FormGroup
  public  displayedColumns: string[] = ['username', 'tag', 'model', 'maxTokens', 'temperature', 'actions'];
  public dialog = inject(MatDialog)
  public totalRecords: number = 0
  public pageSize:number = 10;
  private _fb = inject(FormBuilder)
  private _service = inject(ChatPromptsMgmtService)
  private _snackBar = inject(MatSnackBar);
  private _filter!:QueryFilter;
  currentData:ChatDocDto[] = []
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.form = this._fb.group({
      username: new FormControl(undefined),
      tag: new FormControl(undefined),
      model: new FormControl(undefined),
      maxTokens: new FormControl(undefined),
      temperature: new FormControl(undefined),
    })
    this._initialLoad()
  }

  ngAfterViewInit() {
    this.paginator.pageSize = this.pageSize;
  }

  onSortChange(event:any){
    console.log(event)
  }

  onDetailsClick(element: ChatDocDto){
    console.log('-- on details click --', element)
    const dialogRef = this.dialog.open(ChatDetailDialogComponent, {
      data: element
    })

    dialogRef.afterClosed().subscribe(result => {
      console.log('-- chat msg edit after closed --', result)
      if(result.success)
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
  onDelete(element:ChatDocDto){
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
      this.currentData = res.data;
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

