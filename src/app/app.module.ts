import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { LayoutComponent } from './core/layout/app-layout/layout.component';
import { AuthLayoutComponent } from './core/layout/auth-layout/auth-layout.component';
import { ShellModule } from './modules/shared/shell.module';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { credentialsInterceptor } from './core/interceptors/credentials.interceptor';

@NgModule({
  declarations: [
    AppComponent, LayoutComponent, AuthLayoutComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ShellModule
  ],
  providers: [
    provideClientHydration(),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([credentialsInterceptor]),
      withFetch()
    )
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
