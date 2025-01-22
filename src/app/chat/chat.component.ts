import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { LoginService } from '../login/login.service';
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
  user$!:Observable<User>;

  constructor(
    private firebaseSv:FirebaseService,
    private loginSv:LoginService
  ) {
  
    // this.firebaseSv.getChatById("-OGl3qzD6XUXt7GK4ze2");
    
    // this.loadChat();
    // this.loginSv.logoutUser();


    // if(!this.firebaseSv.user1$){
    //   this.firebaseSv.getUserByEmail(localStorage.getItem('email') as string);
    // };

  }


// ----------------------------------  Mock  -----------------------------------
  mock = {
    user1: new User(
      'John Doe',
      'john.doe@example.com',
      'url',
      ['ES', 'EN'],
      "1",
      true,
      "1"
    ),
    user2: new User(
      'Ben',
      'ben@example.com',
      'url',
      ['ES'],
      "1",
      true,
      "2"
    ),
    chat: new Chat(
      ["1", "2"],
      [
        new Message("1", 'Hi!', new Date()),
        new Message(
          "2",
          'HOlaHOlaHOlaHOlaHOla HOlaHOlaHOlaHOlaHOla HOlaHOlaHOlaHOlaHOla HOlaHOlaHOlaHOlaHOla HOlaHOlaHOlaHOlaHOla HOlaHOlaHOlaHOlaHOla HOlaHOlaHOlaHOlaHOla HOlaHOlaHOlaHOlaHOla HOlaHOlaHOlaHOlaHOla HOlaHOlaHOlaHOlaHOla  ',
          new Date()
        ),
        new Message("2", 'Cómo estás?', new Date()),
      ],
      "1"
    ),
  };

  currentMess:string = "";

  sendMess(){
    let mess: Message ={
      text: this.currentMess,
      sender: this.user1.id as string,
      // id:this.chat.messages.length,
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
