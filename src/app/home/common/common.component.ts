import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LangSelectComponent } from '../../components/lang-select/lang-select.component';

@Component({
  selector: 'app-common',
  imports: [LangSelectComponent],
  templateUrl: './common.component.html',
  styleUrl: './common.component.css'
})
export class CommonComponent {
  constructor(private router:Router){
    router.navigateByUrl('/login')
  }


  langSelectOpen: boolean = false;

  toggleSelectMenu() {
    this.langSelectOpen = !this.langSelectOpen;
  }
}
