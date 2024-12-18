import { NgModule } from '@angular/core';
import { LoginComponent } from './page/login.component';
import { LoginRoutingModule } from './login.routing';
import { SharedModule } from '../shared/shared.module';

@NgModule({
    declarations: [
        LoginComponent
    ],
    imports:[
        LoginRoutingModule,
        SharedModule
    ]
})

export class LoginModule {};