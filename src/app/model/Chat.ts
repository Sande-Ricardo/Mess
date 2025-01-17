export class Chat{
    id!:number;
    idUsers!:number[];
    messages!:Message[];


    constructor(idUsers:number[], messages:Message[], id?:number){
        this.idUsers = idUsers;
        this.messages = messages;
        if(id){this.id=id};
    }
}

export class Message{
    id!:number;
    sender!:number;
    text!:string;
    timestamp!:Date;

    constructor(sender:number, text:string, timestamp:Date, id?:number){
        this.sender = sender;
        this.text = text;
        this.timestamp = timestamp;
        if(id){this.id=id};
    }
}