import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path:'*',
        pathMatch:"full",
        redirectTo:"home"
    },
      // Lazy loading (loadChildren)
    {
        path:'login',
        loadChildren: () =>
            import('./login/login.module').then((m)=> m.LoginModule)
    },
    {
        path:'chat',
        loadChildren: () =>
            import('./chat/chat.module').then((m)=> m.ChatModule)
    }
];
