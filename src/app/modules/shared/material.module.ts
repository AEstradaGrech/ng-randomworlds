import { NgModule } from '@angular/core'
import { MatTable } from '@angular/material/table'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatPaginatorModule } from '@angular/material/paginator'
import { MatFormField, MatFormFieldModule, MatLabel } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDivider } from '@angular/material/divider'
import {MatExpansionModule} from '@angular/material/expansion'
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatDialogModule} from '@angular/material/dialog';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort'
import {MatChipsModule} from '@angular/material/chips';
import {MatCardModule} from '@angular/material/card';
import {MatMenuModule} from '@angular/material/menu';
import {MatRadioModule} from '@angular/material/radio';
import {MatSidenavModule} from '@angular/material/sidenav';

@NgModule({
declarations:[],
imports:[
    MatListModule,
    MatIconModule, 
    MatTable,
    MatLabel,
    MatFormField,
    MatPaginatorModule ,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDivider ,
    MatSlideToggleModule,
    MatMenuModule
],
exports:[
    MatListModule,
    MatIconModule,
    MatTable,
    MatLabel,
    MatFormField,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDivider,
    MatExpansionModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatChipsModule,
    MatCardModule,
    MatMenuModule,
    MatRadioModule,
    MatSidenavModule
],
providers:[]
})

export class MaterialModule{};