import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SaveService {

  private isSearchSubject = new BehaviorSubject<boolean>(false);
  isSearch$ = this.isSearchSubject.asObservable();

  

  private canSaveSubject = new BehaviorSubject<boolean>(false);
  canSave$ = this.canSaveSubject.asObservable();

  private isDisabledSource = new BehaviorSubject<boolean>(false);
  isDisabled$ = this.isDisabledSource.asObservable();

  

  private deleteSubject = new BehaviorSubject<boolean>(false);
  delete$ = this.deleteSubject.asObservable();

  private isDeletedDisableSource = new BehaviorSubject<boolean>(false);
  isDeletedDisable$ = this.isDeletedDisableSource.asObservable();

  constructor(private http: HttpClient) {}

  private addSubject = new BehaviorSubject<boolean>(false);
  add$ = this.addSubject.asObservable();

  
  private isDisabledSearch = new BehaviorSubject<boolean>(false);
  isDisabledSearch$ = this.isDisabledSearch.asObservable();
  /******************************************************************* */
  private saveCallback: (() => void) | null = null;
   // Register the save method
   registerSaveCallback(callback: () => void) {
    this.saveCallback = callback;
  }
  private deleteCallback: (() => void) | null = null;
  // Register the save method
  registerDeletCallback(callback: () => void) {
   this.deleteCallback = callback;
 }
  private printCallback: (() => void) | null = null;
  // Register the save method
  registerPrintCallback(callback: () => void) {
   this.printCallback = callback;
 }
  // Trigger the save method
  triggerSave() {
    if (this.saveCallback) {
      this.saveCallback();
    } else {
      console.warn('No save callback registered!');
    }
  }
  // Trigger the delete method

  triggerDelete() {
    if (this.deleteCallback) {
      this.deleteCallback();
    } else {
      console.warn('No delete callback registered!');
    }
  }

  triggerPrint(){
    if (this.printCallback) {
      this.printCallback();
    } else {
      console.warn('No print callback registered!');
    }

  }

  // Clear the callback (optional, for cleanup)
  clearSaveCallback() {
    this.saveCallback = null;
  }
  clearPrintCallback() {
    this.printCallback = null;
  }
  clearDeleteCallback() {
    this.deleteCallback = null;
  }
  /******************************************************** */
///////////////////////////////////   bloc Save ///////////////////////////

 // Method to set the canSave variable
 setCanSave(value: boolean): void {
  this.canSaveSubject.next(value); // Emit the new value
 
}

 // Method to change the boolean value
 setDisabled(value: boolean) {
  this.isDisabledSource.next(value);
}
///////////////////////////////////////////////////////////////////////////

/////////////////////////////// bloc delete //////////////////////////////

 // Method to set the canSave variable
 setCanDelete(value: boolean): void {
  this.deleteSubject.next(value); // Emit the new value
 
}

 // Method to change the boolean value
 setDisabledDelete(value: boolean) {
  this.isDeletedDisableSource.next(value);
}

 // Method to change the boolean value
 setIsSearch(value: boolean) {
  this.isSearchSubject.next(value);

}
 // Method to reset form
 setAdded(value: boolean) {
  this.addSubject.next(value);

}

setIsDisabledSearch(value: boolean) {
  this.isDisabledSearch.next(value);

}
}
