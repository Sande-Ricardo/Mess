import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../model/User';
import { FirebaseService } from '../shared/firebase.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {

  user$:Observable<firebase.default.User | null>;

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFireDatabase,
    private firebaseSv: FirebaseService,
    private router: Router
  ) {
    this.user$ = this.auth.user;

    this.auth.user.subscribe((user) => {
      if (user) {
        this.router.navigateByUrl('/chat');
      }
    })
    
    // Si existe accessToken en LS, recordar la sesión.
    // try {
    //   const storedToken = localStorage.getItem('accessToken');
    //   console.log(storedToken);
      
    //   if(storedToken){
    //     this.auth.signInWithCustomToken(storedToken)
    //       .then(() => {
    //         console.log("User signed in with stored token");
    //         router.navigateByUrl('/chat');
    //       })
    //       .catch((error) => {
    //         console.error(error);
    //         localStorage.removeItem('accessToken');
    //       })
    //   }
    // } catch (error) {
    //   console.error(error);
    // }
    
  }

  // Crear un usuario (Registro)
  createUser(username: string, email: string, password: string) {
    let user: User = new User(
      username,
      email,
      'none',
      [],
      'none',
      true,
      'none'
    );
    // 1. Crear usuario en Firebase Authentication
    return this.auth
      .createUserWithEmailAndPassword(user.email, password)
      .then((authData) => {
        // 2. Guardar los datos del usuario en la base de datos (opcional)
        user.id = authData.user?.uid as string; // Asignar el ID generado por Firebase
        localStorage.setItem('email', email);
        // return this.db.object(`users/${user.id}`).set(user);
        return this.firebaseSv.registerUser(user);
      });
  }

  // Leer un usuario por su ID
  getUserById(userId: string): Observable<User> {
    return this.db
      .object<User>(`users/${userId}`)
      .valueChanges() as Observable<User>;
  }

  // Actualizar los datos de un usuario
  updateUser(user: User) {
    // const userUpdates = {};
    // // Solo actualizar las propiedades que han cambiado
    // Object.entries(user).forEach(([key, value]) => {
    //   if (value !== undefined && key !== 'id') {
    //     userUpdates[key] = value;
    //   }
    // });
    // return this.db.object(`users/${user.id}`).update(userUpdates);
  }

  // Login de usuario existente
  loginUser(email: string, password: string) {
    let userPromise = this.auth.signInWithEmailAndPassword(email, password);
    userPromise
      .then((userCredential) => {
        // userCredential.user?.getIdToken().then((token) => {
        //   localStorage.setItem('accessToken', token);
        //   console.log('Access token was setted');
        // });
        console.log(userCredential);
        this.firebaseSv.getUserByEmail(email);
        localStorage.setItem('email', email);
        // redirección
        this.router.navigateByUrl('/chat');
      })
      .catch((err) => console.warn(err));
    // return userPromise;
  }

  // Logout del usuario actual
  logoutUser() {
    localStorage.removeItem('email')
    return this.auth.signOut();
  }

  // Obtener el estado de autenticación del usuario actual
  getCurrentUser() {
    return this.auth.user;
  }

  getUserUid() {
    return this.auth.user.subscribe((user) => {
      console.log(user?.uid);
      return user?.uid;
    });
  }
}
