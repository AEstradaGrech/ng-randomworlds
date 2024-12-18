import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutComponent } from './core/layout/app-layout/layout.component';
import { HomeComponent } from './modules/bussiness/pages/home/home.component';
import { AuthLayoutComponent } from './core/layout/auth-layout/auth-layout.component';
import { ChatComponent } from './modules/bussiness/pages/chat/chat.component';

const routes: Routes = [
   {
    path: '',
    redirectTo: '/auth',
    pathMatch: 'full'
   },
   {
    path:'auth',
    component:AuthLayoutComponent,
    loadChildren: () => import('./modules/login/login.module').then((module) => module.LoginModule)
  },
  {
      path:'',
      component: LayoutComponent,
      children: [
          {
              path: 'randomworlds',
              loadChildren: () => import('./modules/bussiness/bussiness.module').then((module) => module.BussinessModule) // luego en cada modulo configuro las rutas a comps
          }
      ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
