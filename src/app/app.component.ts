import { Component } from '@angular/core';

const fsPromise = require('fs').promises;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  public titre: string;

  constructor() {
    this.titre = 'Atelier Tests (KENORE Ahmed) : Matthieu NOEL, Cyril FURNON, Thomas Christophe.';
  }

  public msg() {
    console.log('Click');
  }

  private async GetTextFromFile(path: string): Promise<string> {

    console.log(await fsPromise.readFile(path).toString().split('\r\n'));

    return '';
  }

  private GenerateInsert(data: string): string {
    return '';
  }

  private CheckInsert(data: string): boolean {
    return true;
  }

  private CreateDBIfNotExists() {
    // If .db exist
    // Create .dbl
    // CREATE TABLE IF NOT EXISTS
  }

}
