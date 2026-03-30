import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { AdherentService } from '../adherent.service';

@Component({
    selector: 'app-recap-gen-reg-ann',
    templateUrl: './recap-gen-reg-ann.component.html',
    styleUrl: './recap-gen-reg-ann.component.scss'
})
export class RecapGenRegAnnComponent {
    formRecap: FormGroup;
    @ViewChild('requiredInput') requiredInputRef!: ElementRef;

    constructor(
        private adherentService: AdherentService,
        private token: TokenStorageService,
        private fb: FormBuilder,
        private saveService: SaveService,
    ) {
        this.formRecap = this.fb.group({
            annee: ['', Validators.required],
            format: ['PDF', Validators.required]
        });
    }

    ngOnInit() {
        this.saveService.registerPrintCallback(() => this.printReport());
    }

    ngOnDestroy() {
        this.saveService.clearSaveCallback();
        this.saveService.setCanSave(false);
    }

    onBlur() {
        const control = this.formRecap.get('annee');
        if (control && control.errors?.['required']) {
            Swal.fire({
                icon: 'warning',
                title: 'Champ obligatoire',
                text: 'Ce champ ne peut pas être vide.',
                allowOutsideClick: false
            }).then(() => {
                this.requiredInputRef.nativeElement.focus();
            });
        }
    }

    handlePrint() {
        const format = this.formRecap.get('format')?.value;
        if (format === 'PDF') {
            this.printReport();
        } else {
            this.printExcel();
        }
    }

    printReport() {
        if (this.formRecap.invalid) {
            Swal.fire({
                icon: 'error',
                title: 'Champ requis',
                text: 'Veuillez remplir tous les champs obligatoires (Année).'
            }).then(() => {
                this.requiredInputRef.nativeElement.focus();
            });
            return;
        }

        Swal.fire({
            title: 'Chargement en cours...',
            html: 'Veuillez patienter pendant la génération du rapport PDF.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        this.adherentService.printRecapGenRegAnn(
            this.token.getUser().codSoc,
            this.formRecap.get('annee')?.value
        ).subscribe(
            (data: any) => {
                let file = new Blob([data], { type: 'application/pdf' });
                const fileURL = URL.createObjectURL(file);

                const a = document.createElement('a');
                a.href = fileURL;

                const date = new Date();
                const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
                a.download = `Recap_General_Reglements_${formattedDate}.pdf`;

                a.click();

                URL.revokeObjectURL(fileURL);

                Swal.close();
            },
            (error: any) => {
                console.log(error);
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Échec de la génération du rapport PDF.'
                });
            }
        );
    }

    printExcel() {
        if (this.formRecap.invalid) {
            Swal.fire({
                icon: 'error',
                title: 'Champ requis',
                text: 'Veuillez remplir tous les champs obligatoires (Année).'
            }).then(() => {
                this.requiredInputRef.nativeElement.focus();
            });
            return;
        }

        Swal.fire({
            title: 'Chargement en cours...',
            html: 'Veuillez patienter pendant la génération du fichier Excel.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        this.adherentService.printRecapGenRegAnnexcel(
            this.token.getUser().codSoc,
            this.formRecap.get('annee')?.value
        ).subscribe(
            (data: any) => {
                let file = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const fileURL = URL.createObjectURL(file);

                const a = document.createElement('a');
                a.href = fileURL;

                const date = new Date();
                const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
                a.download = `Recap_General_Reglements_${formattedDate}.xlsx`;

                a.click();

                URL.revokeObjectURL(fileURL);

                Swal.close();
            },
            (error: any) => {
                console.log(error);
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Échec de la génération du fichier Excel.'
                });
            }
        );
    }
}
