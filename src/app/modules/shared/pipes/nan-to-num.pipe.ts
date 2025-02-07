import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'nanToNum',
})
export class NanToNumPipe implements PipeTransform {
  transform(value: any): string {
    console.log('pipe', value.toString())
    return value.toString().toUpperCase() === 'NAN' ? '0' : value;
  }
}