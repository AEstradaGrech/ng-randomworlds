import { HttpInterceptorFn } from "@angular/common/http";
import { environment } from "src/environments/environment";

export const credentialsInterceptor: HttpInterceptorFn = (req, next) =>
  req.url.startsWith(environment.baseUrl)
    ? next(req.clone({ withCredentials: true })) 
    : next(req);