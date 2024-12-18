import { CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  //authService hace sus historias y guarda el token en localstorage
  //authGuard checkea que haya un token en localstorage y si no
  // Router.navigateTo('/login)
  console.log('auth guard triggered');
  return true;
};
