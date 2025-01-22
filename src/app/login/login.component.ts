import { Component } from '@angular/core';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login',
  // imports: [],
  standalone:false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  constructor( private loginSv:LoginService){

  }

  loginBool:boolean= true;

  email:string = "";
  username:string = "";
  password:string = "";


  login(){
    this.loginSv.loginUser(this.email, this.password)
  }

  register(){
    this.loginSv.createUser(this.username, this.email, this.password)
    .then(usr=>console.log(usr))
    .catch(err=>console.warn(err));
  }


  changeLoginBool(newBool:boolean){
    this.loginBool = newBool;
  }

}
