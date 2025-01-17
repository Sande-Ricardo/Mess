import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';

import { environment } from '../../../environments/environment';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { FormsModule } from '@angular/forms';
import { ChatModule } from '../../chat/chat.module';




@NgModule({
  declarations: [
    
  ],
  imports: [
    CommonModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireDatabaseModule,
    ChatModule,
    FormsModule
  ],
  providers: [
    // FirebaseService,
    DatePipe
  ],
  exports: [
    AngularFireModule,
    AngularFireDatabaseModule
  ],
})
export class SharedModule { }
