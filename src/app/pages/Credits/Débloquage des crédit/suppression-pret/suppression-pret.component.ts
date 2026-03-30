import { Component, ElementRef, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { DebCreditService } from '../deb-credit.service';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SaveService } from 'src/app/shared/Service/save.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PaginationService } from 'src/app/core/services/pagination.service';

@Component({
    selector: 'app-suppression-pret',
    templateUrl: './suppression-pret.component.html',
    styleUrl: './suppression-pret.component.scss'
})
export class SuppressionPretComponent {
    formPretPers!: FormGroup
    formattedAmount: string = '0,000';
    listPersonnel: any[] = []
    listOrgPret: any[] = []
    listDetailPret: any[] = []
    listComm: any[] = []
    columnsMat: any[] = []
    columnsOrgPret: any[] = []
    columnsDetailPret: any[] = []
    columnsComm: any[] = []
    lisPrets: any[] = []

    matricule?: string;
    commission?: string;
    orgPret?: string;
    grpPret?: string;

    cnrps: string = "";
    nomPers: string = "";
    codLieuGeog: string = "";
    LibLieuGeog: string = "";
    datEmb: string = "";
    DatRetr: string = "";
    codTypDep: string = "";
    libDeprt: string = "";
    datNais: string = "";
    codAffect: string = "";
    breadCrumbItems!: Array<{}>;
    libAffect: string = "";
    codSit: string = "";
    nbrEnf: string = "";
    libOrg: string = "";
    libPret: string = "";
    libRefComm: string = "";
    mntPrev: number = 0;
    tauxInt: number = 0;
    persCarte: string = "";

    isSearch: boolean = true;
    isLoading = false;
    columnsPret: any[] = []
    currentIndex: number = 0;
    p: number = 1;

    constructor(private serv: DebCreditService, private token: TokenStorage, private fb: FormBuilder, private saveService: SaveService, public service: PaginationService) {
        this.formPretPers = this.initForm();
    }

    initForm() {
        return this.fb.group({
            cod_soc: [this.token.getUser().codSoc],
            mat_pers: ['', Validators.required],
            cod_pret: [''],
            num_dem_pret: [''],
            prt_dat_dem: [''],
            prt_mnt_dem: [''],
            cod_grp_pret: [''],
            typ_pret: [''],
            cod_etat_pret: [{ value: '', disabled: true }],
            typ_etat: [''],
            org_pret: [''],
            mod_remb: [''],
            prt_dat_acc: [''],
            prt_dat_deb: [''],
            prt_dat_fin: [''],
            prt_ech: [''],
            prt_taux: [''],
            prt_mnt_glb: [''],
            prt_mnt_prm: [''],
            delai_grace: [''],
            prt_int_grace: [''],
            prt_mnt_rem: [''],
            rem_men: [''],
            dern_rem_men: [''],
            prt_rendu: [''],
            prt_rendu_int: [''],
            nbr_retenue: [''],
            dat_deblocage: [''],
            mnt_report: [''],
            cod_pret_ant: [''],
            objet_pret: [''],
            dat_saisie: [''],
            num_comm: [''],
        });
    }

    ngOnInit() {
        this.getMatInt();
        this.getOrgPret();
        this.getDetailPret();
        this.getComm();
        this.fetchPretEnCoursData();

        this.columnsPret = [
            { key: "mat_pers", label: "Matricule" },
            { key: "nomPers", label: "Nom & Prénom" },
            { key: "cod_pret", label: "Code prêt" },
        ];

        this.breadCrumbItems = [
            { label: 'Crédits' },
            { label: 'Suppression des crédits', active: true }
        ];

        this.saveService.isSearch$.subscribe((canSearch) => {
            this.isSearch = true;
        });

        this.saveService.registerDeletCallback(() => this.deleteCredit());
    }

    ngOnDestroy() {
        this.saveService.clearSaveCallback();
        this.saveService.clearDeleteCallback();
    }


    fetchPretEnCoursData(): void {
        this.serv.getPretDelet(this.token.getUser().codSoc).subscribe(
            (data: any[]) => {

                // Always reset the list to avoid duplicates on reload
                this.lisPrets = [];

                // Filter only non-débloqués prets
                data.forEach((pret) => {
                    if (pret.dat_deblocage === null || pret.dat_deblocage === '') {
                        this.lisPrets.push(pret);
                    }
                });

                console.log('this.lisPrets:', this.lisPrets);

                this.columnsPret = [
                    { key: 'mat_pers', label: 'Matricule' },
                    { key: 'nomPers', label: 'Nom & Prénom' },
                    { key: 'cod_pret', label: 'Code prêt' },
                    { key: 'cod_etat_pret', label: 'Code etat prêt' },

                    { key: 'mod_remb', label: 'Mode de remboursement' },

                ];
            },
            (error) => {
                console.error('Error fetching data:', error);
            }
        );
    }

    search(item: any) {
        this.patchFormData(item);
    }

    patchFormData(item: any) {
        this.formPretPers.patchValue({
            ...item,
            prt_mnt_dem: Number(item.prt_mnt_dem).toFixed(3),
            prt_taux: Number(item.prt_taux).toFixed(3),
            prt_mnt_glb: Number(item.prt_mnt_glb).toFixed(3),
            prt_mnt_prm: Number(item.prt_mnt_prm).toFixed(3),
            prt_mnt_rem: Number(item.prt_mnt_rem).toFixed(3),
            rem_men: Number(item.rem_men).toFixed(3),
            prt_rendu: Number(item.prt_rendu).toFixed(3),
        });

        this.matricule = item.mat_pers;
        this.commission = item.num_comm;
        this.orgPret = item.org_pret;
        this.grpPret = item.cod_grp_pret;

        this.fetchPersonnelInfo(item.mat_pers);
        this.fetchAdditionalInfo(item);
    }

    fetchPersonnelInfo(matPers: string) {
        this.serv.getPersonnelCreditByMat(this.token.getUser().codSoc, matPers).subscribe((data: any) => {
            if (data) {
                this.cnrps = data.numRetr;
                this.nomPers = data.nom;
                this.codLieuGeog = data.codLieuGeog;
                this.LibLieuGeog = data.libLieu;
                this.datEmb = data.datEmb;
                this.DatRetr = data.datRetraite;
                this.codTypDep = data.codTypDepart;
                this.libDeprt = data.libTypDepart;
                this.datNais = data.dateNaissance;
                this.codAffect = data.codAffect;
                this.libAffect = data.libAffect;
                this.codSit = data.codSit;
                this.nbrEnf = data.nbrEnf;
                this.persCarte = data.persCarte;
            }
        });
    }

    fetchAdditionalInfo(item: any) {
        this.serv.getOrgPret().subscribe((data) => {
            const org = data.find((o) => o.org_pret === item.org_pret);
            this.libOrg = org?.lib_organisme || '';
        });

        this.serv.getDetailPret(this.token.getUser().codSoc).subscribe((data) => {
            const pret = data.find((p) => p.codGrpPret === item.cod_grp_pret && p.typPret === item.typ_pret);
            this.libPret = pret?.libPret || '';
        });

        this.serv.getValidCommission(this.token.getUser().codSoc).subscribe((data) => {
            const comm = data.find((c) => c.num_comm === item.num_comm);
            this.libRefComm = comm?.ref_comm || '';
        });
    }

    deleteCredit() {
        const codSoc = this.token.getUser()?.codSoc;
        const matPers = this.formPretPers.get('mat_pers')?.value;
        const codPret = this.formPretPers.get('cod_pret')?.value;

        if (!codSoc || !matPers || !codPret) {
            Swal.fire('Attention', 'Veuillez sélectionner un crédit à supprimer', 'warning');
            return;
        }

        if (this.formPretPers.get('dat_deblocage')?.value) {
            Swal.fire('Interdit', 'Crédit déjà débloqué, suppression impossible', 'error');
            return;
        }

        Swal.fire({
            title: 'Êtes-vous sûr ?',
            text: "Cette action est irréversible !",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, supprimer !'
        }).then((result) => {
            if (result.isConfirmed) {
                this.serv.deletPrt(codSoc, matPers, parseInt(codPret, 10)).subscribe((data: any) => {
                    if (data.message === 'O') {
                        Swal.fire('Supprimé !', 'Le crédit a été supprimé.', 'success');
                        this.formPretPers.reset();
                        this.clearInfos();
                        this.fetchPretEnCoursData();
                    } else {
                        Swal.fire('Erreur', data.message || 'Erreur lors de la suppression', 'error');
                    }
                });
            }
        });
    }

    clearInfos() {
        this.matricule = "";
        this.nomPers = "";
        this.cnrps = "";
        this.libOrg = "";
        this.libPret = "";
    }

    navigate(direction: number): void {
        this.currentIndex += direction;
        if (this.currentIndex >= 0 && this.currentIndex < this.lisPrets.length) {
            this.patchFormData(this.lisPrets[this.currentIndex]);
        }
    }

    goToFirst() { this.currentIndex = 0; this.patchFormData(this.lisPrets[0]); }
    goToLast() { this.currentIndex = this.lisPrets.length - 1; this.patchFormData(this.lisPrets[this.currentIndex]); }

    getMatInt() { this.serv.getPersonnelCredit(this.token.getUser().codSoc).subscribe(data => { this.listPersonnel = data; this.columnsMat = [{ key: "numRetr", label: "Id CNRPS" }, { key: "matPers", label: "Matricule" }, { key: "nom", label: "Nom & Prénom" }]; }); }
    getOrgPret() { this.serv.getOrgPret().subscribe(data => { this.listOrgPret = data; this.columnsOrgPret = [{ key: "org_pret", label: "Code" }, { key: "lib_organisme", label: "Libelle" }]; }); }
    getDetailPret() { this.serv.getDetailPret(this.token.getUser().codSoc).subscribe(data => { this.listDetailPret = data; this.columnsDetailPret = [{ key: "codGrpPret", label: "Groupe prêt" }, { key: "typPret", label: "Type prêt" }, { key: "libPret", label: "Libelle" }]; }); }
    getComm() { this.serv.getValidCommission(this.token.getUser().codSoc).subscribe(data => { this.listComm = data; this.columnsComm = [{ key: "num_comm", label: "Num comm" }, { key: "ref_comm", label: "Ref comm" }]; }); }
}
