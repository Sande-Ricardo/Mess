import { Chat, Message } from "./model/Chat";
import { User } from "./model/User";

export class Mock{
    user1Mock:User = new User(
        "John Doe",
        "john.doe@example.com",
        "1234",
        "url",
        ["ES","EN"],
        1,
        true,
        1
    )
    
    user2Mock:User = new User(
        "Ben",
        "ben@example.com",
        "1234",
        "url",
        ["ES"],
        1,
        true,
        2
    )
    
    chat1:Chat= new Chat(
        [1,2],
        [
            new Message(
                1,
                "Hi!",
                new Date(),
                1
            ),
            new Message(
                2,
                "Hola",
                new Date(),
                2
            ),
            new Message(
                2,
                "Cómo estás?",
                new Date(),
                3
            )
        ],
        1
    )

    getUser1(){
        return this.user1Mock;
    }
    getUser2(){
        return this.user2Mock;
    }
    getChat1(){
        return this.chat1;
    }
}