import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IndemnitesService } from '../indemnites.service';
import { AdherentService } from 'src/app/pages/Adherent/adherent.service';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { MessageService } from 'primeng/api';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';

@Component({
    selector: 'app-import-indemnite-excel',
    templateUrl: './import-indemnite-excel.component.html',
    styleUrls: ['./import-indemnite-excel.component.scss']
})
export class ImportIndemniteExcelComponent implements OnInit {
    importForm!: FormGroup;
    listNatDon: any[] = [];
    listPersonnel: any[] = [];
    listLieu: any[] = [];
    listCorps: any[] = [];
    importedData: any[] = [];
    invalidMatricules: any[] = [];
    libNatDon: string = '';
    max_mnt_don: number = 0;

    columnsNat: any[] = [
        { key: 'lib_nat_Don', label: 'Libellé' },
        { key: 'max_mnt_don', label: 'Plafond' }
    ];

    get validCount(): number {
        return this.importedData.filter(r => r.isValid).length;
    }

    constructor(
        private fb: FormBuilder,
        private indemniteServ: IndemnitesService,
        private adherentServ: AdherentService,
        private tokenStorage: TokenStorage,
        private messageService: MessageService
    ) { }

    ngOnInit(): void {
        this.initForm();
        this.loadDependencies();
    }

    initForm() {
        this.importForm = this.fb.group({
            nat_don: ['22', Validators.required],
            mnt_dem_don: [0, [Validators.required, Validators.min(0)]],
            mode_payement: ['V', Validators.required],
            dat_dem_don: [new Date(), Validators.required],
            dat_deblocage: [new Date(), Validators.required]
        });
    }

    loadDependencies() {
        const soc = this.tokenStorage.getUser().codSoc;

        // Fetch global personnel list
        this.indemniteServ.getPersInd(soc).subscribe({
            next: (data) => {
                this.listPersonnel = data;
            },
            error: (err) => console.error('Error loading personnel:', err)
        });

        this.indemniteServ.getLieu().subscribe({
            next: (data) => this.listLieu = data,
            error: (err) => console.error('Error loading lieux:', err)
        });

        this.indemniteServ.getCorps().subscribe({
            next: (data) => this.listCorps = data,
            error: (err) => console.error('Error loading corps:', err)
        });

        this.indemniteServ.getgetListNatDon().subscribe(data => {
            this.listNatDon = data;
            const defaultNat = data.find(n => String(n.nat_Don) === '22');
            if (defaultNat) {
                this.libNatDon = defaultNat.lib_nat_Don;
                this.max_mnt_don = defaultNat.max_mnt_don;
                this.importForm.patchValue({ mnt_dem_don: defaultNat.max_mnt_don });
            }
        });
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const workbook_sheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(workbook_sheet, { header: 1 }) as any[][];

                // Detect if first row is a header
                let dataToProcess = json;
                if (json.length > 0 && json[0][0]) {
                    const firstCell = String(json[0][0]).toLowerCase().trim();
                    if (firstCell === 'matricule' || firstCell === 'mat' || firstCell === 'mat_pers') {
                        dataToProcess = json.slice(1);
                    }
                }

                const processedData = dataToProcess
                    .map(row => {
                        const mat = String(row[0] || '').trim();
                        if (!mat) return null;
                        const person = this.listPersonnel.find(p => {
                            const pMat = String(p.mat_pers).trim();
                            const excelMat = mat.trim();
                            return pMat === excelMat || pMat.replace(/^0+/, '') === excelMat.replace(/^0+/, '');
                        });

                        const lieu = person ? this.listLieu.find(l => l.cod_lieu_geog === person.cod_lieu_geog) : null;
                        const corpsRel = person ? this.listCorps.find(c => c.cod_corps === person.corps) : null;

                        return {
                            mat_pers: person ? person.mat_pers : mat,
                            nom_pers: person ? `${person.nom_pers} ${person.pren_pers}` : 'Matricule inexistant',
                            corps: person?.corps || '',
                            lib_corps: corpsRel?.lib_corps || person?.corps || '',
                            cod_affect: person?.cod_affect || '',
                            cod_lieu_geog: person?.cod_lieu_geog || '',
                            lib_lieu: lieu?.lib_lieu || person?.cod_lieu_geog || '',
                            mnt_dem_don: this.max_mnt_don,
                            isValid: !!person
                        };
                    })
                    .filter(row => row !== null);

                this.importedData = processedData.filter(row => row && row.isValid);
                this.invalidMatricules = processedData.filter(row => row && !row.isValid);

                this.messageService.add({
                    severity: 'info',
                    summary: 'Fichier chargé',
                    detail: `${this.importedData.length} valides, ${this.invalidMatricules.length} inexistants.`
                });
            };
            reader.readAsArrayBuffer(file);
        }
    }

    saveAll() {
        if (this.importForm.invalid || this.importedData.length === 0) {
            Swal.fire('Attention', 'Veuillez remplir tous les champs et charger un fichier.', 'warning');
            return;
        }

        const formValues = this.importForm.value;
        const datSaisie = this.formatDateDMY(new Date());
        const user = this.tokenStorage.getUser();

        const payload = this.importedData
            .filter(row => row.isValid)
            .map(row => {
                const modPay = formValues.mode_payement;
                const etatDem = modPay === 'V' ? 'V' : 'D';

                return {
                    typ_don: 'I',
                    cod_soc: user.codSoc,
                    mat_pers: row.mat_pers,
                    num_fam: 0,
                    mnt_dem_don: formValues.mnt_dem_don,
                    mode_payement: modPay,
                    nat_don: '22',
                    cod_lieu_geog: row.cod_lieu_geog || '',
                    cod_affect: row.cod_affect || '',
                    mnt_acc_don: formValues.mnt_dem_don,
                    typ_benificiaire: 'A',
                    cod_fond: '01',
                    corps: row.corps || '',
                    etat_dem: etatDem,
                    dat_saisie: datSaisie,
                    dat_dem_don: this.formatDateDMY(formValues.dat_dem_don),
                    dat_deblocage: this.formatDateDMY(formValues.dat_deblocage)
                };
            });

        if (payload.length === 0) {
            Swal.fire('Attention', 'Aucun matricule valide à enregistrer.', 'warning');
            return;
        }

        Swal.fire({
            title: 'Confirmation',
            text: `Voulez-vous enregistrer ${payload.length} demandes ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Oui',
            cancelButtonText: 'Non'
        }).then(result => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Chargement...',
                    text: 'Veuillez patienter pendant l\'enregistrement des demandes.',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                this.indemniteServ.saveDelocage(payload).subscribe({
                    next: () => {
                        Swal.close();
                        Swal.fire('Succès', 'Les demandes ont été enregistrées.', 'success');
                        // We do NOT clear importedData here as requested: "the table rest showed after save"
                        this.importForm.reset({
                            nat_don: '22',
                            mode_payement: 'V',
                            dat_dem_don: new Date(),
                            dat_deblocage: new Date(),
                            mnt_dem_don: this.max_mnt_don
                        });
                    },
                    error: (err) => {
                        Swal.close();
                        console.error(err);
                        Swal.fire('Erreur', 'Une erreur est survenue lors de l\'enregistrement.', 'error');
                    }
                });
            }
        });
    }

    private getTotalAmount(): number {
        return this.importedData
            .filter(row => row.isValid)
            .reduce((sum, row) => sum + (row.mnt_dem_don || 0), 0);
    }

    private formatDateDMY(date: Date): string {
        if (!date) return '';
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [day, month, year].join('/');
    }
}
