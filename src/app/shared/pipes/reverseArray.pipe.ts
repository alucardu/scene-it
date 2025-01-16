import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'reverseArray'
})
export class ReverseArrayPipe implements PipeTransform {

  transform(value: any[] | undefined): any[] | undefined {
    if (!Array.isArray(value)) {
      return undefined;
    }
    return value.slice().reverse();
  }

}
