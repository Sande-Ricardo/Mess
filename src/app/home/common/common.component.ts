import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-common',
  imports: [FormsModule],
  templateUrl: './common.component.html',
  styleUrl: './common.component.css'
})
export class CommonComponent {
  menuOpen: boolean = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
