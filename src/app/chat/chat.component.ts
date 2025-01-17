import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Chat, Message } from '../model/Chat';
import { User } from '../model/User';
import { FirebaseService } from '../shared/firebase.service';

@Component({
  selector: 'app-chat',
  standalone:false,
  // imports: [],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {

  chat$!:Observable<Chat>;
  user!:Observable<User>;

  constructor(private firebaseSv:FirebaseService) {
  
    this.firebaseSv.getChatById(1);
    
    this.loadChat();
  }


// ----------------------------------  Mock  -----------------------------------
  mock = {
    user1: new User(
      'John Doe',
      'john.doe@example.com',
      '1234',
      'url',
      ['ES', 'EN'],
      1,
      true,
      1
    ),
    user2: new User(
      'Ben',
      'ben@example.com',
      '1234',
      'url',
      ['ES'],
      1,
      true,
      2
    ),
    chat: new Chat(
      [1, 2],
      [
        new Message(1, 'Hi!', new Date(), 1),
        new Message(
          2,
          'HOlaHOlaHOlaHOlaHOla HOlaHOlaHOlaHOlaHOla HOlaHOlaHOlaHOlaHOla HOlaHOlaHOlaHOlaHOla HOlaHOlaHOlaHOlaHOla HOlaHOlaHOlaHOlaHOla HOlaHOlaHOlaHOlaHOla HOlaHOlaHOlaHOlaHOla HOlaHOlaHOlaHOlaHOla HOlaHOlaHOlaHOlaHOla  ',
          new Date(),
          2
        ),
        new Message(2, 'Cómo estás?', new Date(), 3),
      ],
      1
    ),
  };

  currentMess:string = "";

  sendMess(){
    let mess: Message ={
      text: this.currentMess,
      sender: this.user1.id,
      id:this.chat.messages.length,
      timestamp: new Date()
    }
    this.chat.messages.push(mess);
    this.firebaseSv.updateChat(this.chat);
  }

  loadChat(){
    this.chat$ = this.firebaseSv.chat$;
    this.chat$.subscribe(data=>{
      this.chat = data;
      console.log(data);
      
    })
  }



  chat:Chat = this.mock.chat;
  user1:User = this.mock.user1;
  user2:User = this.mock.user2;
}
