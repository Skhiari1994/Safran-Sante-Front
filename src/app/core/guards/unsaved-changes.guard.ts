import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export interface HasUnsavedChanges {
    checkUnsavedChanges(): Promise<boolean> | Observable<boolean> | boolean;
}

@Injectable({
    providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<HasUnsavedChanges> {
    canDeactivate(component: HasUnsavedChanges): Promise<boolean> | Observable<boolean> | boolean {
        return component.checkUnsavedChanges ? component.checkUnsavedChanges() : true;
    }
}
