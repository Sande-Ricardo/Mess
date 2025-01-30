import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { filter, map, Observable, switchMap } from 'rxjs';
import { Chat } from '../model/Chat';
import { User } from '../model/User';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(private db: AngularFireDatabase) {
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

    this.user1$ = this.getUserByEmail(
      localStorage.getItem('email') as string
    ).pipe(filter((user): user is User => user !== undefined));
    setTimeout(
      () => 
        {this.user1$.subscribe((user) => {
          console.log(user);
          
          if (user.idChat) {
            this.userId = user.id as string;
            this.getChatById(user.idChat);
          }
        });},1000
    )
  }

  // ------------------------------  Observables --------------------------------
  chat$!: Observable<Chat>;
  user1$!: Observable<User>;
  userId!:string;
  user2$!: Observable<User>;

  returnChat() {
    this.chat$.subscribe((chat) => {
      console.log('1234');
      console.log(chat);
    });
  }
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
    console.log('updateChat()');
    return this.db.object('chats/' + chat.id).update(chat);
  }

  // DELETE
  deleteMessage(chatId: number, messageId: number) {
    console.log('deleteMessage()');
    return this.db.object(`chats/${chatId}/messages/${messageId}`).remove();
  }

  // ----------------------------------  User  ---------------------------------
  // CREATE
  createUser(user: User) {
    console.log('createUser()');
    return this.db.list('users').push(user);
  }
  async registerUser(user: User) {
    console.log('registerUser()');
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
      .list(`users`, (ref) =>
        ref.orderByChild('email').equalTo(email).limitToFirst(1)
      )
      .valueChanges()
      .pipe(
        map((users) => (users.length > 0 ? users[0] : undefined))
      ) as Observable<User | undefined>;
  }

  // UPDATE
  updateUser(user: User) {
    console.log('updateUser()');
    return this.db.object(`users/${user.id}`).update(user);
  }
  updateLangs(langs:string[]){
    console.log(this.userId);
    if(this.userId){
      this.db.object(`users/${this.userId}`).update({lang:langs})
    }
  }

  // DELETE
  deleteUser(userId: number) {
    console.log('deleteUser()');
    return this.db.object(`users/${userId}`).remove();
  }

  // ------------------------------  JoinToChat  -------------------------------

  // probar todo estos

  getAvaibleChat(langs: string[]): Observable<Chat | undefined>{
    console.log('getAvaibleChat()');
    return this.db
      .list<User>('users')
      .valueChanges()
      .pipe(
        // Paso 1: Filtrar usuarios que compartan al menos un lenguaje con el parámetro
        map((users) =>
          users.filter((user) => user.lang.some((lang) => langs.includes(lang)))
        ),
        // Paso 2: Buscar un chat que cumpla las condiciones
        switchMap((filteredUsers) => {
          if (filteredUsers.length === 0) {
            return []; // Si no hay usuarios que cumplan la condición, devolver un array vacío
          }

          const userIds = filteredUsers.map((user) => user.id);
          return this.db
            .list<Chat>('chats')
            .valueChanges()
            .pipe(
              map((chats) =>
                chats.find(
                  (chat) =>
                    chat.idUsers.length === 1 &&
                    userIds.includes(chat.idUsers[0]) // Verifica si el usuario está en el chat
                )
              )
            );
        })
      );
  }
  

  generateChat(userId: string) {
    console.log('generateChat()');
    // ¡¡revisar porque un frragmento o todo se utera dos veces!!
    const newChat: Chat = {
      idUsers: [userId],
      messages: [],
      id: 'none',
    };
    console.log('userId: ', userId);
    const idChat = this.db.list('chats').push(newChat).key;
    let idUser;
    let user: User;
    this.user1$.subscribe((data) => {
      user = data;
      idUser = data.id as string;
      if (idChat) {
        user.idChat = idChat;
        this.db.object(`chats/${idChat}`).update({id:idChat})
        console.log('id in Chat assigned');
      };
      // if (idUser) this.updateUser(user);


      // esto puede no funcionar porque la creación del chat no es inmediata
      this.getChatById(idChat as string);
    });
  }


  joinOrCreateChat(){
    let currentUser:User
    let currentChat:Chat

    this.user1$.subscribe(
      (user) => {currentUser = user}
    )

    if(this.chat$){
      this.chat$.subscribe(
        (chat) => {
          currentChat = chat;
          console.log("chat ... : ", chat);
        }
      )
    }
    setTimeout(
      () => {
        if(currentUser){
          console.log("currentUser: ... ",currentUser);
          
          this.chat$ = this.getAvaibleChat(currentUser.lang).pipe(
            filter((chat): chat is Chat => chat !== undefined)
          );

          this.chat$.subscribe(
            (chat) => {currentChat = chat}
          )
        }
      },1000
    )
    setTimeout(
      () => {
        if(!currentChat){
          console.log("there's no chat");
          this.generateChat(currentUser.id!)
          this.chat$.subscribe(
            (chat) => {
              currentChat = chat;
              console.log("chat ... : ", chat);
            }
          )
        } else {
          console.log("there's chat");
        }
        setTimeout(
          () => {
            console.log(currentChat);
            if(currentChat.idUsers.length<=1 && !currentChat.idUsers.includes(currentUser.id!)){currentChat.idUsers.push(currentUser.id!)}
            this.db.object(`users/${currentUser.id}`).update({idChat:currentChat.id})
            this.db.object(`chats/${currentChat.id}`).update(currentChat)
          },2000
        )
      },3000
    )

  }

  // ------------------------------  LeaveChat - -------------------------------

  // esto no modifica los "idChat" de los usuarios
  leaveChat() {
    let id1: string;
    let id2: string;
    let idChat: string;

    let newId = {
      idChat: 'none',
    };

    this.user1$.subscribe((user) => {
      if (user.idChat) {
        this.getChatById(user.idChat);
      }
    });
    setTimeout(
      () => {
        this.chat$.subscribe(
          (chat) => {
            id1 = chat.idUsers[0]
            id2 = chat.idUsers[1]
            idChat = chat.id
          }
        )
        setTimeout(() => {
          this.db.object(`users/${id1}`).update(newId)
          this.db.object(`users/${id2}`).update(newId)
          this.db.object(`chats/${idChat}`).remove()
          console.log('Deleted chat.');
        }, 1000);
      },2000
    )

  }

  // SECCIÓN DE DESCARTE

    // joinOrCreateChat() {
  //   console.log('joinOrCreateChat()');
  //   let currentUser:User;
  //   let currentChat:Chat;
    
    
  //   // let lang: string[];
  //   // let userId: string;
    
  //   this.user1$.subscribe((user) => {
  //     console.log(user);
  //     currentUser = user;
    
  //     this.chat$ = this.getAvaibleChat(user.lang).pipe(
  //       filter((chat): chat is Chat => chat !== undefined)
  //     );

  //     this.chat$.subscribe((chat) => {
  //       console.log("chat$ suscription: ",chat);
  //       currentChat = chat;
  //     });
  //   });


  //   setTimeout(() => {
  //     try {
  //       if (!currentChat){
  //         console.log("there's no chat");
  //         this.generateChat(currentUser.id!);
  //       } else {
  //         console.log("there's chat");
  //       }
  //       setTimeout(
  //         () => {
  //           console.log("currentChat: ", currentChat);
  //           currentChat.idUsers.push(currentUser.id as string)
  //           currentUser.idChat = currentChat.id
  //           this.db.object(`chats/${currentChat.id}`).update({idUsers:currentChat.idUsers})
            
  //           // this.updateUser(currentUser)
  //           // this.updateChat(currentChat)
  //         },2000
  //       )
  //     } catch (error) {
  //       console.warn(error);
  //     }
  //   }, 2000);
  // }

  // leaveChat(chatId: string, userId: string) {

  //   return this.db.object(`chats/${chatId}`).update({
  //     idUsers: firebase.database.ServerValue.remove() // Elimina la lista de usuarios
  //   })
  //   .then(() => {
  //     // Notificar al otro usuario (implementa tu lógica de notificaciones aquí)
  //     // this.notifyOtherUser(chatId, userId);
  //   });
  // }
  // getAvaibleChat(userLanguages:string[]){
  //   return this.db
  //   .list<Chat>('chats', (ref) => ref.orderByChild('idUsers').limitToFirst(1))
  //   .snapshotChanges()
  //   .pipe(
  //     map(
  //       (changes) =>
  //         changes.map((action) => ({
  //           key: action.key,
  //           ...action.payload.val(),
  //         })) as Chat[]
  //     ),
  //     switchMap((chats) => {
  //       return from(chats).pipe(
  //         concatMap((chat) => {
  //           // console.log(chat);

  //           return this.getUserById(chat.idUsers[0]).pipe(
  //             map((user) => ({ ...chat, user })),
  //             filter((chatWithUser) =>
  //               (
  //                 chatWithUser.user as User).lang.some((lang) =>
  //                 {userLanguages.includes(lang);

  //                 }
  //               )
  //             )
  //           );
  //         }),
  //         first()
  //       );
  //     })
  //   );
  // }

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
}

// // copia de seguridad
// import { Injectable } from '@angular/core';
// import { AngularFireDatabase } from '@angular/fire/compat/database';
// import {
//   filter,
//   map,
//   Observable,
//   switchMap
// } from 'rxjs';
// import { Chat } from '../model/Chat';
// import { User } from '../model/User';

// @Injectable({
//   providedIn: 'root',
// })
// export class FirebaseService {
//   constructor(
//     private db: AngularFireDatabase
//   ) {

//     // if(!this.user1$){
//     //   this.user1$ = this.getUserByEmail(localStorage.getItem('email') as string).pipe(
//     //     filter((user): user is User => user !== undefined)
//     //   );
//     //   let userId:string;
//     //   this.user1$.subscribe((user) => {userId = user.id as string});
//     //   setTimeout(() => {
//     //     console.log(userId);
//     //     this.generateChat(userId);
//     //   }, 3000);
//     //   setTimeout(() => {
//     //     this.chat$.subscribe((chat) => {console.log(chat)});

//     //   }, 5000);
//     // };

//     this.user1$ = this.getUserByEmail(localStorage.getItem('email') as string).pipe(
//       filter((user): user is User => user !== undefined)
//     );
//     this.user1$.subscribe((user) => {
//       if(user.idChat){
//         this.getChatById(user.idChat);
//       }
//     })

//     // this.joinOrCreateChat();

//   }

//   // ------------------------------  Observables --------------------------------
//   chat$!: Observable<Chat>;
//   user1$!: Observable<User>;
//   user2$!: Observable<User>;

//   returnChat(){
//     this.chat$.subscribe({
//       next: (chat) => {
//         console.log("1234");
//         console.log(chat);
//       },
//       error: (error) => {console.warn(error)},
//       complete: () => {console.log('returnChat() chat$ subscrption has been completed.')}
//   });

//   }
//   // ---------------------------------  Chat  -----------------------------------
//   // CREATE
//   createChat(chat: Chat) {
//     return this.db.list('chats').push(chat);
//   }

//   // READ
//   getChatById(id: string) {
//     // return this.db.object(`chats/${id}`) as unknown as Chat;
//     console.log('getChatById()');
//     this.chat$ = this.db
//       .object(`chats/${id}`)
//       .valueChanges() as unknown as Observable<Chat>;
//   }

//   // UPDATE
//   updateChat(chat: Chat) {
//     console.log("updateChat()");
//     return this.db.object('chats/' + chat.id).update(chat);
//   }

//   // DELETE
//   deleteMessage(chatId: number, messageId: number) {
//     console.log("deleteMessage()");
//     return this.db.object(`chats/${chatId}/messages/${messageId}`).remove();
//   }

//   // ----------------------------------  User  ---------------------------------
//   // CREATE
//   createUser(user: User) {
//     console.log('createUser()');
//     return this.db.list('users').push(user);
//   }
//   async registerUser(user: User) {
//     console.log('registerUser()');
//     await this.db.object(`users/${user.id}`).set(user);
//   }

//   // READ
//   getUserById(id: string) {
//     console.log('getUserById()');
//     return this.db.object<User>(`users/${id}`).valueChanges();
//   }

//   getUserByEmail(email: string): Observable<User | undefined> {
//     console.log('getUserByEmail()');
//     return this.db
//       .list(`users`, (ref) => ref.orderByChild('email').equalTo(email).limitToFirst(1))
//       .valueChanges()
//       .pipe(
//         map((users) => (users.length > 0 ? users[0] : undefined))
//       ) as Observable<User | undefined>;
//   }

//   // UPDATE
//   updateUser(userId: string, user: User) {
//     console.log('updateUser()');
//     return this.db.object(`users/${userId}`).update(user);
//   }

//   // DELETE
//   deleteUser(userId: number) {
//     console.log('deleteUser()');
//     return this.db.object(`users/${userId}`).remove();
//   }

//   // ------------------------------  JoinToChat  -------------------------------

//   // probar todo estos

//   getAvaibleChat(langs: string[]): Observable<Chat | undefined> {
//     console.log('getAvaibleChat()');
//       return this.db
//       .list<User>('users')
//       .valueChanges()
//       .pipe(
//         // Paso 1: Filtrar usuarios que compartan al menos un lenguaje con el parámetro
//         map((users) =>
//           users.filter((user) =>
//             user.lang.some((lang) => langs.includes(lang))
//           )
//         ),
//         // Paso 2: Buscar un chat que cumpla las condiciones
//         switchMap((filteredUsers) => {
//           if (filteredUsers.length === 0) {
//             return []; // Si no hay usuarios que cumplan la condición, devolver un array vacío
//           }

//           const userIds = filteredUsers.map((user) => user.id);
//           return this.db.list<Chat>('chats').valueChanges().pipe(
//             map((chats) =>
//               chats.find(
//                 (chat) =>
//                   chat.idUsers.length === 1 &&
//                   userIds.includes(chat.idUsers[0]) // Verifica si el usuario está en el chat
//               )
//             )
//           );
//         })
//       );
//   }

//   generateChat(userId: string) {
//     console.log('generateChat()');
//     // ¡¡revisar porque un frragmento o todo se utera dos veces!!
//     const newChat: Chat = {
//       idUsers: [userId],
//       messages: [],
//       id: 'none'
//     };
//     console.log("userId: ",userId);
//     const idChat = this.db.list('chats').push(newChat).key;
//     let idUser;
//     let user: User;
//     this.user1$.subscribe((data) => {
//       user = data;
//       idUser = user.id as string;
//       if (idChat) user.idChat = idChat;
//       console.log('chat designed');
//       if (idUser) this.updateUser(idUser, user);
//       // esto puede no funcionar porque la creación del chat no es inmediata
//       this.getChatById(idChat as string);
//     });
//   }

//   joinOrCreateChat(){
//     console.log("joinOrCreateChat()");
//     let lang:string[];
//     this.user1$.subscribe({
//       // creo que le problema está en esta estructura next-error-complete
//       next: user =>{
//         console.log(user);

//         lang = user.lang

//         // this.chat$ = this.getAvailableChat(lang)

//         this.chat$ = this.getAvaibleChat(lang).pipe(
//           filter((chat): chat is Chat => chat !== undefined)
//         );

//         setTimeout(
//           () => {
//             try {
//               this.generateChat(user.id as string)
//             } catch (error) {
//               console.error(error);
//             }
//           }, 1500
//         )

//         this.chat$.subscribe({
//           next: (chat) => {
//             console.log("init Chat: ", chat);
//             // necesito actualizar usuario
//             chat.idUsers[1] = user.id as string;
//             user.idChat = chat.id;

//             console.log("chat: ", chat);
//             console.log("user: ", user);

//             this.updateUser(user.id as string, user);
//             this.updateChat(chat);
//           },
//           error: (error) => console.error('Error:', error),
//           complete: () => {console.log('joinOrCreateChat() chat$ subscrption has been completed.')}
//         })
//       },
//       error: (error) => console.error('Error:', error),
//       complete: () => {console.log('joinOrCreateChat() user$ subscrption has been completed')}
//     })

//   }

//   // ------------------------------  LeaveChat - -------------------------------

//   // esto no modifica los "idChat" de los usuarios
//   leaveChat(){
//     let id1:string;
//     let id2:string;
//     let idChat:string;

//     let newId = {
//       idChat : "none"
//     }
//     this.chat$.subscribe({
//       next : (chat) => {
//         console.log(chat);

//         // idChat = chat.id;
//         // console.log(idChat);
//         // console.log(newId);

//         id1 = chat.idUsers[0];
//         id2 = chat.idUsers[1]
//       },
//       error : (err) => console.error(err),
//       complete : () => {console.log("LeaveChat() - chat$ complete");
//       }
//     })

//     setTimeout(
//       () => {
//         // this.db.object(`users/${id1}`).update(newId)
//         // this.db.object(`users/${id2}`).update(newId)
//         // this.db.object(`chats/${idChat}`).remove()
//         console.log("Deleted chat.");

//       }, 2000
//     )

//   }

//   // SECCIÓN DE DESCARTE
//   // leaveChat(chatId: string, userId: string) {

//   //   return this.db.object(`chats/${chatId}`).update({
//   //     idUsers: firebase.database.ServerValue.remove() // Elimina la lista de usuarios
//   //   })
//   //   .then(() => {
//   //     // Notificar al otro usuario (implementa tu lógica de notificaciones aquí)
//   //     // this.notifyOtherUser(chatId, userId);
//   //   });
//   // }
//   // getAvaibleChat(userLanguages:string[]){
//   //   return this.db
//   //   .list<Chat>('chats', (ref) => ref.orderByChild('idUsers').limitToFirst(1))
//   //   .snapshotChanges()
//   //   .pipe(
//   //     map(
//   //       (changes) =>
//   //         changes.map((action) => ({
//   //           key: action.key,
//   //           ...action.payload.val(),
//   //         })) as Chat[]
//   //     ),
//   //     switchMap((chats) => {
//   //       return from(chats).pipe(
//   //         concatMap((chat) => {
//   //           // console.log(chat);

//   //           return this.getUserById(chat.idUsers[0]).pipe(
//   //             map((user) => ({ ...chat, user })),
//   //             filter((chatWithUser) =>
//   //               (
//   //                 chatWithUser.user as User).lang.some((lang) =>
//   //                 {userLanguages.includes(lang);

//   //                 }
//   //               )
//   //             )
//   //           );
//   //         }),
//   //         first()
//   //       );
//   //     })
//   //   );
//   // }

//   // getAvailableChat(userLanguages: string[]): Observable<Chat> {
//   //   let chat:Observable<Chat>
//   //   this.db
//   //     .list<Chat>('chats', ref => ref.orderByChild('idUsers').limitToFirst(1))
//   //     .valueChanges()
//   //     .subscribe(chats =>{
//   //       for(let i = 0; chats.length>i; i++){
//   //         let option = this.getUserById(chats[i].idUsers[0])
//   //         let lang:string[];
//   //         option.subscribe(user => {
//   //           if(user) lang = user.lang
//   //         })
//   //         let coincidences:string[] = userLanguages.filter(item => lang.includes(item));
//   //         if(coincidences.length > 0) {
//   //           chat = chats[i];
//   //           i = chats.length
//   //         }
//   //       }
//   //     })

//   //     // .pipe(
//   //     //   map(chats => {
//   //     //     for(let i = 0; chats.length>i; i++){
//   //     //       let option = this.getUserById(chats[i].idUsers[0])
//   //     //       let lang:string[];
//   //     //       option.subscribe(user => {
//   //     //         if(user) lang = user.lang
//   //     //       })
//   //     //       let coincidences:string[] = userLanguages.filter(item => lang.includes(item));
//   //     //       if(coincidences.length > 0) {
//   //     //         // chat = chats[i];
//   //     //         i = chats.length
//   //     //       }
//   //     //     }
//   //     //   })
//   //     // )
//   //   return chat;
//   // }

// }
