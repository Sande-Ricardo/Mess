export class User{
    id?: string;
    username!:string;
    email!:string;
    userImg!:string;
    lang!:string[];
    idChat?:string;
    status?:boolean;

    // para sacar
    // password!:string;

    constructor(username:string, email:string, userImg?:string, lang?:string[], idChat?:string, status?:boolean, id?:string){
        this.username = username;
        this.email = email;
        // this.password = password;

        if(id){this.id = id};
        if(lang){this.lang = lang};
        if(idChat){this.idChat = idChat};
        if(status){this.status = status};
        if(userImg){this.userImg = userImg};
        
    }
}
