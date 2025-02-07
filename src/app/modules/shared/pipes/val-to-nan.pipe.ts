import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
  name: 'valToNaN',
})
export class ValueToNanCasePipe implements PipeTransform {
  transform(value: any): string {
    let parsed = parseInt(value);
    console.log('pipe to Nan', parsed);
    return parsed.toString() === 'NaN' ? 'NaN' : value;
  }
}