import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { Personnel, AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import Swal from 'sweetalert2';
import { EditionCreditService } from '../edition-credit.service';

@Component({
    selector: 'app-edition-retenues-mensuelles',
    templateUrl: './edition-retenues-mensuelles.component.html',
    styleUrl: './edition-retenues-mensuelles.component.scss'
})
export class EditionRetenuesMensuellesComponent {
    personnelList: Personnel[] = [];
    formRetenue: FormGroup;
    columnsSearch: any[] = [];
    currentMonth: any;
    listTypePers: any[] = [];
    mois: any;
    typePers: any;
    save!: boolean;
    isSearch: boolean = true;
    isDisabled!: boolean;
    listRetenueMens: any[] = [];
    columnsRetenueMens: any[] = [];
    listDetRetenue: any[] = [];
    columnsDetRetenue: any[] = [];
    selectedMatPers: string = '';
    selectedAbrv: string = '';
    moisList: string[] = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    constructor(
        private personnelService: AdherentService,
        private token: TokenStorage,
        private fb: FormBuilder,
        private saveService: SaveService,
        private serv: EditionCreditService
    ) {
        this.formRetenue = this.fb.group({
            cod_soc: [this.token.getUser().codSoc],
            dat_retenue: [''],
            typ_pers: [''],
            format: ['PDF']
        });
    }

    ngOnInit() {
        const currentDate = new Date();
        const currentMonth = this.moisList[currentDate.getMonth()];
        this.mois = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const currentYear = currentDate.getFullYear();

        this.formRetenue.patchValue({
            dat_retenue: `${this.mois}/${currentYear}`
        });

        this.getTypePers();
        this.setupColumns();

        this.saveService.isSearch$.subscribe((canSearch) => {
            this.isSearch = canSearch;
        });

        // Auto-search when date or type changes
        this.formRetenue.valueChanges.subscribe(() => {
            const dat = this.formRetenue.get('dat_retenue')?.value;
            const type = this.formRetenue.get('typ_pers')?.value;

            if (dat && type) {
                this.editionGlobal();
            }
        });
    }

    getTypePers() {
        // Using actual typ_aff codes from database: A = Adherent/Titulaire, S = Special/Contractuel
        this.listTypePers = [
            { cod_typ: 'A', lib_typ: 'Adherent Titulaire mutuelle' },
            { cod_typ: 'C', lib_typ: 'Cas speciaux (CONTRACTUEL)' }
        ];
    }

    setupColumns() {
        this.columnsRetenueMens = [
            { key: "mat_pers", label: "Matricule" },
            { key: "nom", label: "Nom et Prénom" },
            { key: "abrv_fixe", label: "Rubrique" },
            { key: "mnt_retenue", label: "Mnt Retenue" },
            { key: "valid", label: "Valide" }
        ];

        this.columnsDetRetenue = [
            { key: "cod_pret", label: "Code" },
            { key: "l_pret", label: "Lig" },
            { key: "cod_grp_pret", label: "Grp" },
            { key: "typ_pret", label: "Type" },
            { key: "lib_pret", label: "Libellé" },
            { key: "mnt_period", label: "Mnt Period" },
            { key: "mnt_int", label: "Mnt Int" }
        ];
    }

    editionGlobal() {
        const dat = this.formRetenue.get('dat_retenue')?.value;
        const type = this.formRetenue.get('typ_pers')?.value;

        if (!dat || !type) {
            return;
        }

        // Only load data - print will be triggered by button click
        this.serv.getRetMensByType(this.token.getUser().codSoc, dat, type).subscribe(
            (data: any) => {
                this.listRetenueMens = data;
                this.listDetRetenue = [];
            },
            (error: any) => {
                console.error("Error fetching data:", error);
            }
        );
    }

    printEditionGlobal() {
        const dat = this.formRetenue.get('dat_retenue')?.value;
        const type = this.formRetenue.get('typ_pers')?.value;
        const format = this.formRetenue.get('format')?.value;

        if (!dat || !type) {
            return;
        }

        // Print report based on personnel type
        const codRap = type === 'C' ? '137' : '140'; // 140 for A, 137 for C

        if (format === 'PDF') {
            this.printReport(codRap, dat);
        } else {
            this.printReportExcel(codRap, dat);
        }
    }

    editionMvtDuMois() {
        const dat = this.formRetenue.get('dat_retenue')?.value;
        const format = this.formRetenue.get('format')?.value;

        if (!dat) {
            return;
        }
        // retenue_mensuelle_glob - COD_RAP 136
        if (format === 'PDF') {
            this.printReportGlob('136', dat);
        } else {
            this.printReportGlobExcel('136', dat);
        }
    }

    editionNonPreparer() {
        const dat = this.formRetenue.get('dat_retenue')?.value;
        const format = this.formRetenue.get('format')?.value;

        if (!dat) {
            return;
        }
        // non_retenue_mensuelle - COD_RAP 134
        if (format === 'PDF') {
            this.printReportNonRetenue('134', dat);
        } else {
            this.printReportNonRetenueExcel('134', dat);
        }
    }

    printReport(codRap: string, dat: string) {
        // Show loading popup
        Swal.fire({
            title: 'Impression en cours...',
            text: 'Veuillez patienter',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        this.serv.printRetenueMensuelle(codRap, this.token.getUser().codSoc, dat).subscribe(
            (blob: Blob) => {
                Swal.close();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `retenue_mensuelle_${dat}.pdf`;
                link.click();
                window.URL.revokeObjectURL(url);
            },
            (error: any) => {
                Swal.close();
                console.error('Error printing report:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Erreur lors de l\'impression du rapport'
                });
            }
        );
    }

    printReportExcel(codRap: string, dat: string) {
        Swal.fire({
            title: 'Chargement en cours...',
            html: 'Veuillez patienter pendant la génération du fichier Excel.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        this.serv.printRetenueMensuelleExcel(codRap, this.token.getUser().codSoc, dat).subscribe(
            (data: any) => {
                let file = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const fileURL = URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = fileURL;
                const date = new Date();
                const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
                a.download = `retenue_mensuelle_${formattedDate}.xlsx`;
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

    printReportGlob(codRap: string, dat: string) {
        // Show loading popup
        Swal.fire({
            title: 'Impression en cours...',
            text: 'Veuillez patienter',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        this.serv.printRetenueMensuelleGlob(codRap, this.token.getUser().codSoc, dat).subscribe(
            (blob: Blob) => {
                Swal.close();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `retenue_mensuelle_glob_${dat}.pdf`;
                link.click();
                window.URL.revokeObjectURL(url);
            },
            (error: any) => {
                Swal.close();
                console.error('Error printing report:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Erreur lors de l\'impression du rapport'
                });
            }
        );
    }

    printReportGlobExcel(codRap: string, dat: string) {
        Swal.fire({
            title: 'Chargement en cours...',
            html: 'Veuillez patienter pendant la génération du fichier Excel.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        this.serv.printRetenueMensuelleGlobExcel(codRap, this.token.getUser().codSoc, dat).subscribe(
            (data: any) => {
                let file = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const fileURL = URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = fileURL;
                const date = new Date();
                const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
                a.download = `retenue_mensuelle_glob_${formattedDate}.xlsx`;
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

    printReportNonRetenue(codRap: string, dat: string) {
        // Show loading popup
        Swal.fire({
            title: 'Impression en cours...',
            text: 'Veuillez patienter',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        this.serv.printNonRetenueMensuelle(codRap, dat).subscribe(
            (blob: Blob) => {
                Swal.close();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `non_retenue_mensuelle_${dat}.pdf`;
                link.click();
                window.URL.revokeObjectURL(url);
            },
            (error: any) => {
                Swal.close();
                console.error('Error printing report:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Erreur lors de l\'impression du rapport'
                });
            }
        );
    }

    printReportNonRetenueExcel(codRap: string, dat: string) {
        Swal.fire({
            title: 'Chargement en cours...',
            html: 'Veuillez patienter pendant la génération du fichier Excel.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        this.serv.printNonRetenueMensuelleExcel(codRap, dat).subscribe(
            (data: any) => {
                let file = new Blob([data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const fileURL = URL.createObjectURL(file);
                const a = document.createElement('a');
                a.href = fileURL;
                const date = new Date();
                const formattedDate = `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`;
                a.download = `non_retenue_mensuelle_${formattedDate}.xlsx`;
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

    onRowSelect(row: any) {
        this.selectedMatPers = row.mat_pers;
        this.selectedAbrv = row.abrv_fixe;
        let dat = this.formRetenue.get('dat_retenue')?.value;


        if (dat && dat.length === 6) {
            dat = `01/${dat.substring(0, 2)}/${dat.substring(2)}`;
        } else if (dat && dat.length === 7 && dat.indexOf('/') !== -1) {
            dat = `01/${dat}`;
        }
        this.serv.getDetRetMens(
            this.token.getUser().codSoc,
            this.selectedMatPers,
            dat,
            this.selectedAbrv
        ).subscribe(
            (data: any) => {
                this.listDetRetenue = data;
            },
            (error) => {
                console.error("Error fetching details:", error);
            }
        );
    }

    search(item: any) {
        // Handle search LOV selection if needed
        console.log("Selected item:", item);
    }
}
