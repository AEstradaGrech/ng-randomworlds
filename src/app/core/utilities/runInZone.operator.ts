import { NgZone } from '@angular/core';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';

export function runInZone<T>(zone: NgZone): MonoTypeOperatorFunction<T> {
  return source => new Observable<T>(subscriber =>
    source.subscribe({
      next: value => zone.run(() => subscriber.next(value)),
      error: err => zone.run(() => subscriber.error(err)),
      complete: () => zone.run(() => subscriber.complete()),
    }),
  );
}