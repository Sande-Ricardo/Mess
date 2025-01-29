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

  chat$!:Observable<Chat> | null;
  user$!:Observable<User>;

  constructor(
    public firebaseSv:FirebaseService,
    private loginSv:LoginService
  ) {
  
    // this.firebaseSv.getChatById("-OGl3qzD6XUXt7GK4ze2");
    
    // this.loadChat();
    // this.loginSv.logoutUser();


    // if(!this.firebaseSv.user1$){
    //   this.firebaseSv.getUserByEmail(localStorage.getItem('email') as string);
    // };
    setTimeout(() => {
      this.loadAll();
    },2000)
  }

  menuOpen: boolean = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

// ----------------------------------  Mock  -----------------------------------
  mock = {
    user1: new User(
      '',
      '',
      'url',
      ['ES', 'EN'],
      "",
      true,
      ""
    ),
    user2: new User(
      '',
      '',
      'url',
      ['ES'],
      "",
      true,
      ""
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
    if(this.chat.messages){
      this.chat.messages.push(mess);
    } else {
      this.chat = new Chat(
        this.chat.idUsers,
        [mess],
        this.chat.id as string
      )
    }
    this.firebaseSv.updateChat(this.chat);
    this.currentMess = "";

  }

  loadChat(){
    if(this.firebaseSv.chat$){
      this.chat$ = this.firebaseSv.chat$;
      this.firebaseSv.chat$.subscribe(chat=>{
        this.chat = chat;
        // console.log("chat: ",chat);
      });
    } else {
      console.log("chat$ is null");
      
    }

    
  }
  loadUser(){
    this.user$ = this.firebaseSv.user1$;
    this.firebaseSv.user1$.subscribe(user=>{
      this.user1 = user;
      // console.log("user: ",user);
    })
  }

  loadAll(){
    let key1:boolean = false;
    let key2:boolean = false;
    let user2Id:string;

    this.loadUser()
    this.loadChat()

    setTimeout(() => {
      if(this.chat$) {
        key1 = true;
        this.chatStatus = "waiting"
      } else {
        this.chatStatus = "no"
      }
      if(this.user$) key2 = true;
      
      if(key1 && key2 && this.chat){
        if(this.chat.idUsers[0] == this.user1.id){
        // if(this.chat.idUsers[0] == this.user1.id && this.chat){
          user2Id = this.chat.idUsers[1];
        } else {
          user2Id = this.chat.idUsers[0];
        }
        this.firebaseSv.getUserById(user2Id).subscribe(user2=>{
          if(user2)this.user2 = user2
          this.user2Status = "true";
        })

        this.chatStatus="avaible";
      } else{
        console.log("1 o 2 keys no son verdaderas");
      }
    },2000)
  }

  logout(){
    this.loginSv.logoutUser();
    setTimeout(
      () => {
        location.reload()
      }, 1500
    )
  }

  joinOrCreateChat(){
    this.firebaseSv.joinOrCreateChat()
  }

  leaveChat(){
    // this.chat =
    this.firebaseSv.leaveChat();

    // this.chat$ = null;
    // this.user2 = null;
    // this.user2Status = "false"
  }

  chat:Chat = this.mock.chat;
  user1:User = this.mock.user1;
  user2:User | null = this.mock.user2;
  
  user2Status:string = "false";
  chatStatus:string = "no";
}
