import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { map, Observable } from 'rxjs';
import { Chat } from '../model/Chat';
import { User } from '../model/User';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(private db: AngularFireDatabase) {}

  // ------------------------------  Observables --------------------------------
  chat$!: Observable<Chat>;

  // ---------------------------------  Chat  -----------------------------------
  // CREATE
  createChat(chat: Chat) {
    return this.db.list('chats').push(chat);
  }
  generateChat(userId:number, userLang:string[]){
    const newChat: Chat ={
      idUsers: [userId],
      messages:[],
      id:0
    };
    return this.db.list('chats').push(newChat);
  }

  // READ
  getChatById(id: number) {
    // return this.db.object(`chats/${id}`) as unknown as Chat;
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
  getUserById(id: number) {
    return this.db.object<User>(`users/${id}`).valueChanges();
  }

  getUserByEmail(email: string) {
    return this.db.object<User>(`users/${email}`).valueChanges();
  }

  // UPDATE
  updateUser(userId: number, updatedUser: Partial<User>) {
    return this.db.object(`users/${userId}`).update(updatedUser);
  }

  // DELETE
  deleteUser(userId: number) {
    return this.db.object(`users/${userId}`).remove();
  }

  getAvailableChats(userLanguages: string[]): Observable<Chat[]> {
    return this.db
      .list<Chat>('chats', (ref) => ref.orderByChild('idUsers').limitToFirst(1))
      .snapshotChanges()
      .pipe(
        map((changes) => {
          return changes.map((action) => ({
            key: action.key,
            ...action.payload.val(),
          })) as Chat[];
        }),
        map((chats) =>
          chats.filter((chat) => {
            // Verificar si el chat tiene un solo usuario y hay compatibilidad de idioma
            return (
              chat.idUsers.length === 1 &&
              chat.idUsers.some((userId) => {
                // Aquí deberías obtener el usuario por su ID y comparar los idiomas
                return this.getUserById(userId).pipe(
                  map((user) =>{
                    if(user){
                      user.lang.some((lang) => userLanguages.includes(lang))
                    }
                  }
                  )
                );
              })
            );
          })
        )
      );
  }
}
