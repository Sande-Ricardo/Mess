import { Routes } from '@angular/router';
import { CommonComponent } from './home/common/common.component';
import { AuthGuardService } from './shared/auth-guard.service';

export const routes: Routes = [
    // Lazy loading (loadChildren)
    {
        path:'*',
        pathMatch:"full",
        redirectTo:"login"
    },
    {
        path: '',
        component: CommonComponent
        // canActivate: [AuthGuardService]
    },
    {
        path:'login',
        loadChildren: () =>
            import('./login/login.module').then((m)=> m.LoginModule)
    },
    {
        path:'chat',
        loadChildren: () =>
            import('./chat/chat.module').then((m)=> m.ChatModule),
        canActivate: [AuthGuardService]
    }
];
