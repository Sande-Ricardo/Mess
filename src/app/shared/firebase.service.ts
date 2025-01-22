import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import {
  concatMap,
  filter,
  first,
  from,
  map,
  Observable,
  switchMap
} from 'rxjs';
import { Chat } from '../model/Chat';
import { User } from '../model/User';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(
    private db: AngularFireDatabase
  ) {
  
    // if(!this.user1$){
    //   this.user1$ = this.getUserByEmail(localStorage.getItem('email') as string).pipe(
    //     filter((user): user is User => user !== undefined)
    //   );
    //   let userId:string;
    //   this.user1$.subscribe((user) => {userId = user.id as string});
    //   setTimeout(() => {
    //     console.log(userId);
    //     this.generateChat(userId);
    //   }, 3000);
    //   setTimeout(() => {
    //     this.chat$.subscribe((chat) => {console.log(chat)});
        
    //   }, 5000);
    // };
    

    
    
    
  }

  // ------------------------------  Observables --------------------------------
  chat$!: Observable<Chat>;
  user1$!: Observable<User>;
  user2$!: Observable<User>;

  // ---------------------------------  Chat  -----------------------------------
  // CREATE
  createChat(chat: Chat) {
    return this.db.list('chats').push(chat);
  }

  // READ
  getChatById(id: string) {
    // return this.db.object(`chats/${id}`) as unknown as Chat;
    console.log('getChatById()');
    this.chat$ = this.db
      .object(`chats/${id}`)
      .valueChanges() as unknown as Observable<Chat>;
  }

  // UPDATE
  updateChat(chat: Chat) {
    console.log(chat);
    return this.db.object('chats/' + chat.id).update(chat);
  }

  // DELETE
  deleteMessage(chatId: number, messageId: number) {
    return this.db.object(`chats/${chatId}/messages/${messageId}`).remove();
  }

  // ----------------------------------  User  ---------------------------------
  // CREATE
  createUser(user: User) {
    return this.db.list('users').push(user);
  }
  async registerUser(user: User) {
    await this.db.object(`users/${user.id}`).set(user);
  }

  // READ
  getUserById(id: string) {
    console.log('getUserById()');

    return this.db.object<User>(`users/${id}`).valueChanges();
  }

  getUserByEmail(email: string): Observable<User | undefined> {
    console.log('getUserByEmail()');
    return this.db
      .list(`users`, (ref) => ref.orderByChild('email').equalTo(email).limitToFirst(1))
      .valueChanges()
      .pipe(
        map((users) => (users.length > 0 ? users[0] : undefined))
      ) as Observable<User | undefined>;
  }

  // UPDATE
  updateUser(userId: string, user: User) {
    return this.db.object(`users/${userId}`).update(user);
  }

  // DELETE
  deleteUser(userId: number) {
    return this.db.object(`users/${userId}`).remove();
  }

  // ------------------------------  JoinToChat  -------------------------------

  // getAvailableChat(userLanguages: string[]): Observable<Chat> {
  //   let chat:Observable<Chat>
  //   this.db
  //     .list<Chat>('chats', ref => ref.orderByChild('idUsers').limitToFirst(1))
  //     .valueChanges()
  //     .subscribe(chats =>{
  //       for(let i = 0; chats.length>i; i++){
  //         let option = this.getUserById(chats[i].idUsers[0])
  //         let lang:string[];
  //         option.subscribe(user => {
  //           if(user) lang = user.lang
  //         })
  //         let coincidences:string[] = userLanguages.filter(item => lang.includes(item));
  //         if(coincidences.length > 0) {
  //           chat = chats[i];
  //           i = chats.length
  //         }
  //       }
  //     })

  //     // .pipe(
  //     //   map(chats => {
  //     //     for(let i = 0; chats.length>i; i++){
  //     //       let option = this.getUserById(chats[i].idUsers[0])
  //     //       let lang:string[];
  //     //       option.subscribe(user => {
  //     //         if(user) lang = user.lang
  //     //       })
  //     //       let coincidences:string[] = userLanguages.filter(item => lang.includes(item));
  //     //       if(coincidences.length > 0) {
  //     //         // chat = chats[i];
  //     //         i = chats.length
  //     //       }
  //     //     }
  //     //   })
  //     // )
  //   return chat;
  // }

  // probar todo estos

  getAvailableChat(userLanguages: string[]): Observable<Chat> {
    return this.db
      .list<Chat>('chats', (ref) => ref.orderByChild('idUsers').limitToFirst(1))
      .snapshotChanges()
      .pipe(
        map(
          (changes) =>
            changes.map((action) => ({
              key: action.key,
              ...action.payload.val(),
            })) as Chat[]
        ),
        switchMap((chats) => {
          return from(chats).pipe(
            concatMap((chat) => {
              return this.getUserById(chat.idUsers[0]).pipe(
                map((user) => ({ ...chat, user })),
                filter((chatWithUser) =>
                  (chatWithUser.user as User).lang.some((lang) =>
                    userLanguages.includes(lang)
                  )
                )
              );
            }),
            first()
          );
        })
      );
  }

  generateChat(userId: string) {
    // ¡¡revisar porque un frragmento o todo se utera dos veces!! 
    const newChat: Chat = {
      idUsers: [userId],
      messages: [],
      id: 'none',
    };
    console.log("userId: ",userId);
    
    const idChat = this.db.list('chats').push(newChat).key;
    let idUser;

    let user: User;
    this.user1$.subscribe((data) => {
      user = data;
      idUser = user.id as string;
      if (idChat) user.idChat = idChat;
      console.log('chat designed');

      if (idUser) this.updateUser(idUser, user);

      // esto puede no funcionar porque la creación del chat no es inmediata
      this.getChatById(idChat as string);
    });
  }

  joinOrCreateChat(){
    let lang:string[];
    this.user1$.subscribe(user =>{
      lang = user.lang

      this.chat$ = this.getAvailableChat(lang)
      console.log("Chat was setted");

      this.chat$.subscribe(
        (chat) => {
          chat.idUsers[1] = user.id as string;
          user.idChat = chat.id;
          this.updateChat(chat)
        }
      )
    })

  }

}
