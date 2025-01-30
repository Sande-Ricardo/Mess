import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FirebaseService } from '../../shared/firebase.service';

@Component({
  selector: 'app-lang-select',
  imports: [CommonModule],
  templateUrl: './lang-select.component.html',
  styleUrl: './lang-select.component.css'
})
export class LangSelectComponent {
  constructor(private firebaseSv:FirebaseService){
    this.firebaseSv.user1$.subscribe(
      (user) => {
        this.selectedLanguages = user.lang
      }
    )
  }

  languages: string[] = ['Español', 'English', 'Français', 'Deutsch', 'Italiano', 'Português'];
  
  selectedLanguages: string[] = [];
  lang:string[] = []

  selectLanguage(language: string): void {
    if(this.selectedLanguages){
      if(this.selectedLanguages.includes(language)){
        this.selectedLanguages.splice(this.selectedLanguages.findIndex(
          (lang) => lang === language
        ),1)
      } else{
        this.selectedLanguages.push(language)
      }
    } else {
      this.selectedLanguages=[language];
    }
    // alert(`Idioma seleccionado: ${language}`);
  }

  defineLangs(){
    this.lang = this.selectedLanguages
    console.log(this.lang);
    this.firebaseSv.updateLangs(this.lang)
    
  }
  
  verLangs(){
    console.log("languages: ", this.languages);
    console.log("selectedLanguages: ", this.selectedLanguages);
    console.log("lang: ", this.lang);

  }
}
