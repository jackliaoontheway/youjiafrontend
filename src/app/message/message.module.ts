import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MessageComponent } from 'app/message/message.component';
import { MessageService } from 'app/message/message.service';

@NgModule({
    declarations: [
        MessageComponent
    ],
    imports     : [
        MatDialogModule,
        MatButtonModule
    ],
    exports     : [
        MessageComponent
    ],
    providers: [
        MessageService,
    ],
    entryComponents: [
        MessageComponent
    ]
})
export class MessageModule{
}
