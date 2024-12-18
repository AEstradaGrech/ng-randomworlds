import { AfterViewInit, Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SysMsgMgmtService } from '../../services/sysmsgs-mgmt.service';
import { QueryCondition, QueryFilter } from '../../../shared/models/common-interfaces';
import { SystemMessageDto } from '../../../shared/models/mgmt-interfaces';
import { MatDialog } from '@angular/material/dialog';
import { SysMsgDetailComponent } from './components/sys-msg-detail/sys-msg-detail.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginator, PageEvent } from '@angular/material/paginator';


@Component({
  selector: 'app-system-messages',
  templateUrl: './system-messages.component.html',
  styleUrl: './system-messages.component.scss'
})
export class SystemMessagesComponent implements OnInit, AfterViewInit {
  public form!:FormGroup
  public dataSource = new MatTableDataSource<SystemMessageDto>([]);
  public  displayedColumns: string[] = ['description', 'tag', 'message', 'actions'];
  public dialog = inject(MatDialog)
  public totalRecords: number = 0
  public pageSize:number = 10;
  private _fb = inject(FormBuilder)
  private _service = inject(SysMsgMgmtService)
  private _snackBar = inject(MatSnackBar);
  private _filter!:QueryFilter;
  currentData:SystemMessageDto[] = []
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.form = this._fb.group({
      description: new FormControl(undefined),
      tag: new FormControl(undefined)
    })
    this._initialLoad()
  }

  ngAfterViewInit() {
    this.paginator.pageSize = this.pageSize;
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  onSortChange(event:any){
    console.log(event)
  }

  onDetailsClick(element: SystemMessageDto){
    console.log('-- on details click --', element)
    const dialogRef = this.dialog.open(SysMsgDetailComponent, {
      data: { isEdit:true, msg:element}
    })

    dialogRef.afterClosed().subscribe((result:SystemMessageDto) => {
      console.log('-- sys msg edit after closed --', result)
      this._query()
    })
  }

  onAdd(){
    console.log('-- on add click --')
    const dialogRef = this.dialog.open(SysMsgDetailComponent, {
      data: { isEdit:false, msg:null}
    })

    dialogRef.afterClosed().subscribe((result:SystemMessageDto) => {
      console.log('-- sys msg edit after closed --', result)
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
  onDelete(element:SystemMessageDto){
    console.log('-- on delete --')
    this._service.delete(element.id).subscribe(res => {
      if(res){
        this._snackBar.open("System Message deleted!", undefined, { duration: 2500, panelClass: 'snack-success-uncen'})
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
    this.form.get('description')?.reset()
    this.form.get('tag')?.reset() 
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
