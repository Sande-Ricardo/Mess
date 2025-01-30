import { Component } from '@angular/core';
import { LangSelectComponent } from '../../components/lang-select/lang-select.component';

@Component({
  selector: 'app-common',
  imports: [LangSelectComponent],
  templateUrl: './common.component.html',
  styleUrl: './common.component.css'
})
export class CommonComponent {
  langSelectOpen: boolean = false;

  toggleSelectMenu() {
    this.langSelectOpen = !this.langSelectOpen;
  }
}
