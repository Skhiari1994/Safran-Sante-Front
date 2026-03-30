import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { TokenStorageService } from 'src/app/core/services/token-storage.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { AdherentService } from '../adherent.service';

@Component({
    selector: 'app-recap-remb-adherent',
    templateUrl: './recap-remb-adherent.component.html',
    styleUrl: './recap-remb-adherent.component.scss'
})
export class RecapRembAdherentComponent {
    personnelListDeb: any[] = [];
    personnelListFin: any[] = [];
    formAdherent: FormGroup;
    columnsSearch: any[] = [];
    isSearch: boolean = true;
    @ViewChild('requiredInput') requiredInputRef!: ElementRef;

    constructor(
        private adherentService: AdherentService,
        private token: TokenStorageService,
        private fb: FormBuilder,
        private saveService: SaveService,
    ) {
        this.formAdherent = this.fb.group({
            mat_pers_deb: [''],
            nom_deb: [''],
            mat_pers_fin: [''],
            nom_fin: [''],
            annee: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.saveService.registerPrintCallback(() => this.printReport());
        this.getPersonnelDeb();
        this.getPersonnelFin();
    }

    ngOnDestroy() {
        this.saveService.clearSaveCallback();
        this.saveService.setCanSave(false);
    }

    getPersonnelDeb() {
        this.adherentService.getPersBultCnamDeb(this.token.getUser().codSoc).subscribe(data => {
            this.personnelListDeb = data;
            this.columnsSearch = [
                { key: "mat_pers", label: "Matricule" },
                { key: "mat_int", label: "Mat. Administratif" },
                { key: "dat_nais", label: "Date naissance" },
                { key: "nom", label: "Nom & Prénom" },
                { key: "num_retr", label: "N° CNRPS" },
            ];
        });
    }

    getPersonnelFin() {
        this.adherentService.getPersBultCnamDeb(this.token.getUser().codSoc).subscribe(data => {
            this.personnelListFin = data;
            this.columnsSearch = [
                { key: "mat_pers", label: "Matricule" },
                { key: "mat_int", label: "Mat. Administratif" },
                { key: "dat_nais", label: "Date naissance" },
                { key: "nom", label: "Nom & Prénom" },
                { key: "num_retr", label: "N° CNRPS" },
            ];
        });
    }

    onSelectedVMat(item: any) {
        this.formAdherent.patchValue({
            mat_pers_deb: item.mat_pers,
            nom_deb: item.nom
        });
    }

    onSelectedVMatFin(item: any) {
        this.formAdherent.patchValue({
            mat_pers_fin: item.mat_pers,
            nom_fin: item.nom
        });
    }

    onBlur() {
        const control = this.formAdherent.get('annee');
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

    printReport() {
        Swal.fire({
            title: 'Chargement en cours...',
            html: 'Veuillez patienter pendant la génération du rapport.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        if (this.formAdherent.invalid) {
            Swal.fire({
                icon: 'error',
                title: 'Champ requis',
                text: 'Veuillez remplir l\'année.'
            }).then(() => {
                this.requiredInputRef.nativeElement.focus();
            });
            return;
        }

        console.log(this.formAdherent.value);

        const matDeb = this.formAdherent.get('mat_pers_deb')?.value || '';
        const matFin = this.formAdherent.get('mat_pers_fin')?.value || '';

        this.adherentService.printRecapRembPers(
            this.token.getUser().codSoc,
            matDeb,
            matFin,
            this.formAdherent.get('annee')?.value
        ).subscribe(
            (data: any) => {
                let file = new Blob([data], { type: 'application/pdf' });
                const fileURL = URL.createObjectURL(file);

                const a = document.createElement('a');
                a.href = fileURL;

                const date = new Date();
                const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
                a.download = `Recap_Remb_Adherent_${formattedDate}.pdf`;

                a.click();

                URL.revokeObjectURL(fileURL);

                Swal.close();
            },
            (error: any) => {
                console.log(error);

                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Échec de la génération du rapport.'
                });
            }
        );
    }
}
