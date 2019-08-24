import {Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

class MessageData {
  messageStyle: string;
  buttonBG: string;
  title: string;
  content: string;
}

@Component({
  selector: 'message',
  templateUrl: './message.component.html',
})
export class MessageComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: MessageData) {

  }
}
