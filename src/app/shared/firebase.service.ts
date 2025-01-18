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
  constructor(private db: AngularFireDatabase) {}

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
  getChatById(id: number) {
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

  // READ
  getUserById(id: string) {
    console.log('getUserById()');

    return this.db.object<User>(`users/${id}`).valueChanges();
  }

  getUserByEmail(email: string) {
    console.log('getUserByEmail()');
    this.user1$ = this.db
      .object(`users/${email}`)
      .valueChanges() as unknown as Observable<User>;
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
    const newChat: Chat = {
      idUsers: [userId],
      messages: [],
      id: '0',
    };
    const idChat = this.db.list('chats').push(newChat).key;
    let idUser;

    let user: User;
    this.user1$.subscribe((data) => {
      user = data;
      idUser = user.id as string;
      if (idChat) user.idChat = idChat;
      console.log('chat desgined');

      if (idUser) this.updateUser(idUser, user);
    });
  }

  joinOrCreateChate(){
    let lang:string[];
    this.user1$.subscribe(user =>{
      lang = user.lang

      this.chat$ = this.getAvailableChat(lang)
      console.log("Chat was setted");

      this.chat$.subscribe(
        (chat) => {
          chat.idUsers[1] = user.id;
          user.idChat = chat.id;
          this.updateChat(chat)
        }
      )
    })

  }

}
