import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringToHtml'
})
export class StringToHtmlPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string {
    return value?.replace(/(\\\\n)|(\\n)/g, '<br>');
  }

}
