export class User{
    id!: number;
    username!:string;
    email!:string;
    password!:string;
    userImg!:string;
    lang!:string[];
    idChat!:number;
    status!:boolean;

    constructor(username:string, email:string, password:string, userImg?:string, lang?:string[], idChat?:number, status?:boolean, id?:number){
        this.username = username;
        this.email = email;
        this.password = password;

        if(id){this.id = id};
        if(lang){this.lang = lang};
        if(idChat){this.idChat = idChat};
        if(status){this.status = status};
        if(userImg){this.userImg = userImg};
        
    }
}
