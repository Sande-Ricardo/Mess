export class Chat{
    id!:string;
    idUsers!:string[];
    messages!:Message[];


    constructor(idUsers:string[], messages:Message[], id?:string){
        this.idUsers = idUsers;
        this.messages = messages;
        if(id){this.id=id};
    }
}

export class Message{
    id!:string;
    sender!:string;
    text!:string;
    timestamp!:Date;

    constructor(sender:string, text:string, timestamp:Date, id?:string){
        this.sender = sender;
        this.text = text;
        this.timestamp = timestamp;
        if(id){this.id=id};
    }
}