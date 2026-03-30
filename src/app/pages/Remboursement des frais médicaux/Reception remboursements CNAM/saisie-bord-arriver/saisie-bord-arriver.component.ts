import { ChangeDetectorRef, Component, OnInit, OnDestroy } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { finalize, map, forkJoin, catchError, of, Observable, switchMap } from "rxjs";
import Swal from "sweetalert2";

import { ReceptionRemboursementService } from "../reception-remboursement.service";
import { BulletinSoinService } from "../../Bulletin de soins/bulletin-soin.service";
import { EnvoiServiceService } from "../../Envoi/envoi-service.service";
import { TokenStorage } from "src/app/account/token-storage.service";
import { SaveService } from "src/app/shared/Service/save.service";

@Component({
    selector: "app-saisie-bord-arriver",
    templateUrl: "./saisie-bord-arriver.component.html",
    styleUrls: ["./saisie-bord-arriver.component.scss"],
})
export class SaisieBordArriverComponent implements OnInit, OnDestroy {
    // State
    isLoading = false;
    isSaving = false;
    selectedBultIndex: number | null = null;
    currentMode: 'envoi' | 'arriver' = 'envoi';
    isReadOnly = false;

    // Forms
    bordForm!: FormGroup;
    bulletinForm!: FormGroup; // Main form containing the array of bulletins

    // Detail Forms (for the currently selected bulletin)
    visiteForm!: FormGroup;
    acteForm!: FormGroup;
    pharForm!: FormGroup;
    appForm!: FormGroup;

    // LOVs and Lists
    listBordEnvoi: any[] = [];
    colBordEnvoi = [{ key: 'cod_bord', label: 'Code' }, { key: 'dat_bord', label: 'Date' }];

    listActes: any[] = [];
    listVisites: any[] = [];
    listMeds: any[] = [];
    listAppareils: any[] = [];

    // Metadata/Helpers
    bulletinDetailsCache: { [key: number]: any } = {};

    constructor(
        private fb: FormBuilder,
        private serv: ReceptionRemboursementService,
        private servRemb: BulletinSoinService,
        private envoiServ: EnvoiServiceService,
        private token: TokenStorage,
        private saveService: SaveService,
        private cd: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.initForms();
        this.loadBordEnvoiList();
        this.registerSaveCallback();
    }

    ngOnDestroy(): void {
        this.saveService.clearSaveCallback();
    }

    private initForms(): void {
        this.bordForm = this.fb.group({
            cod_bord: [''],
            dat_bord: [''],
            dat_deb: [''],
            dat_fin: [''],
            nbr_bult: [""],
            tot_honor: [0],
            typ_bord: ['C'],
            cod_soc: [this.token.getUser().codSoc],
            tot_net: [0],
            valid_bord: [''],
            reg_bord: [''],
            tot_remb: [0],
            valid: ['N'],
            clot_bord: [''],
            tot: [0],
            num_retr: [''],
            cod_bord_cnam: [''],
            seq_bord: [''],
            lib_assur: [''],
            cod_assur: ['']
        });

        this.bulletinForm = this.fb.group({
            lignes: this.fb.array([])
        });

        this.visiteForm = this.fb.group({ lines: this.fb.array([]) });
        this.acteForm = this.fb.group({ lines: this.fb.array([]) });
        this.pharForm = this.fb.group({ lines: this.fb.array([]) });
        this.appForm = this.fb.group({ lines: this.fb.array([]) });
    }

    get bulletins(): FormArray { return this.bulletinForm.get('lignes') as FormArray; }
    get visites(): FormArray { return this.visiteForm.get('lines') as FormArray; }
    get actes(): FormArray { return this.acteForm.get('lines') as FormArray; }
    get phars(): FormArray { return this.pharForm.get('lines') as FormArray; }
    get apps(): FormArray { return this.appForm.get('lines') as FormArray; }

    // --- Step 1: Load Bordereaux ---
    loadBordEnvoiList(): void {
        this.isLoading = true;
        this.serv.getAllBordEnvoi(this.token.getUser().codSoc).pipe(
            finalize(() => this.isLoading = false)
        ).subscribe(data => this.listBordEnvoi = data);
    }

    // --- Step 2: Load Bulletins on Selection ---
    onSelectBord(event: any): void {
        if (!event) return;
        this.isLoading = true;
        this.resetState();

        this.bordForm.patchValue({
            cod_bord: event.cod_bord,
            dat_bord: this.formatDate(event.dat_bord),
            dat_deb: this.formatDate(event.dat_deb),
            dat_fin: this.formatDate(event.dat_fin),
            cod_assur: event.cod_assur,
            tot_remb: event.tot_remb || 0,
            tot_net: event.tot_net || 0,
            tot_honor: event.tot_honor || 0,
            nbr_bult: event.nbr_bult || 0,
            valid: event.valid || event.valid_bord || 'N',
            num_retr: event.num_retr,
            cod_bord_cnam: event.cod_bord_cnam,
            seq_bord: event.seq_bord
        });

        this.isReadOnly = (event.valid === 'V' || event.valid_bord === 'V');

        this.envoiServ.findBultEnvoiByCodBord(this.token.getUser().codSoc, event.cod_bord, event.cod_assur).pipe(
            finalize(() => this.isLoading = false)
        ).subscribe(data => {
            this.populateBulletins(data);
            if (data.length > 0) this.selectBulletin(0);
        });
    }

    private populateBulletins(data: any[]): void {
        this.bulletins.clear();
        data.forEach(item => {
            this.bulletins.push(this.fb.group({
                cod_soc: [item.cod_soc || this.token.getUser().codSoc],
                mat_pers: [item.mat_pers],
                num_fam: [item.num_fam],
                dat_soin: [this.formatDate(item.dat_soin)],
                cod_bord: [item.cod_bord],
                cod_assur: [item.cod_assur],
                num_soin: [item.num_soin],
                ord_bult: [item.ord_bult],
                tot_honor: [item.tot_honor || 0],
                tot_net: [item.tot_net || 0],
                tot_remb: [item.tot_remb || 0],
                reg_remb: [item.reg_remb],
                cod_malad: [item.cod_malad],
                num_pec: [item.num_pec],
                cod_fil: [item.cod_fil],
                num_assur: [item.num_assur || item.num_retr],
                dat_prev_accouch: [this.formatDate(item.dat_prev_accouch)],
                nat_bult: [item.nat_bult || 'C'],
                mat_pers_conj: [item.mat_pers_conj],
                num_ass_conj: [item.num_ass_conj],
                dat_saisie: [this.formatDate(item.dat_saisie)],
                obs: [item.obs],
                obs_a: [item.obs_a],
                envoi: [item.envoi],
                reclam: [item.reclam],
                typ_bult: [item.typ_bult],
                ann_plaf_imp: [item.ann_plaf_imp],
                tot_remb_med: [item.tot_remb_med || 0],
                num_soin_cnam: [item.num_soin_cnam],
                decis_med: [item.decis_med],
                reg_adh: [item.reg_adh],
                mod_pay: [item.mod_pay],
                dat_vir: [this.formatDate(item.dat_vir)],
                nom_prenom: [item.nom_prenom || item.nom]
            }));
        });
    }


    // --- Step 3: Load Bulletin Details ---
    selectBulletin(index: number): void {
        if (this.selectedBultIndex === index) return;

        // Save current state to cache before switching
        if (this.selectedBultIndex !== null) this.saveToCache(this.selectedBultIndex);

        this.selectedBultIndex = index;
        const bult = this.bulletins.at(index).value;

        this.isLoading = true;
        this.clearDetailForms();

        // Parallel load reference lists + data
        const oracleDate = this.convertToOracleDate(bult.dat_soin);

        forkJoin({
            refs: this.loadReferences(bult),
            details: this.loadBackendDetails(bult, oracleDate)
        }).pipe(
            finalize(() => {
                this.isLoading = false;
                this.cd.detectChanges();
            })
        ).subscribe(({ refs, details }) => {
            this.listActes = refs.actes;
            this.listVisites = refs.visites;
            this.listMeds = refs.meds;
            this.listAppareils = refs.apps;

            this.populateDetailForms(details);
        });
    }

    private loadReferences(bult: any): Observable<any> {
        return forkJoin({
            actes: this.servRemb.getActesManuel(bult.cod_fil, bult.cod_assur),
            visites: this.servRemb.getVisitManuel(bult.cod_fil, bult.cod_assur),
            meds: this.servRemb.getMeds(bult.cod_fil, bult.cod_assur),
            apps: this.servRemb.getAppareil(bult.cod_fil, bult.cod_assur)
        });
    }

    private loadBackendDetails(bult: any, date: string): Observable<any> {
        // In Envoi mode (initialization), we might want to load from BultSoin tables
        // In Arriver mode, we load from Lig*Arriver tables.
        // Standard rule: Initialize from BultSoin details.
        return forkJoin({
            actes: this.servRemb.getLigBultAct(this.token.getUser().codSoc, bult.mat_pers, bult.num_fam, date),
            visites: this.servRemb.getLigBultVisit(this.token.getUser().codSoc, bult.mat_pers, bult.num_fam, date),
            meds: this.servRemb.getLigBultMed(this.token.getUser().codSoc, bult.mat_pers, bult.num_fam, date),
            apps: this.servRemb.getLigBultApp(this.token.getUser().codSoc, bult.mat_pers, bult.num_fam, date)
        });
    }

    private populateDetailForms(res: any): void {
        res.actes.forEach((d: any) => this.actes.push(this.fb.group({ ...d, mnt_honor: [0], mnt_remb: [0] })));
        res.visites.forEach((d: any) => this.visites.push(this.fb.group({ ...d, mnt_honor: [0], mnt_remb: [0] })));
        res.meds.forEach((d: any) => this.phars.push(this.fb.group({ ...d, mnt_honor: [0], mnt_remb: [0] })));
        res.apps.forEach((d: any) => this.apps.push(this.fb.group({ ...d, mnt_honor: [0], mnt_remb: [0] })));
        this.updateCurrentBultTotals();
    }

    // --- Calculations ---
    updateCurrentBultTotals(): void {
        const sum = (array: FormArray) => array.controls.reduce((acc, ctrl) => acc + (parseFloat(ctrl.get('mnt_remb')?.value) || 0), 0);
        const total = sum(this.actes) + sum(this.visites) + sum(this.phars) + sum(this.apps);

        if (this.selectedBultIndex !== null) {
            this.bulletins.at(this.selectedBultIndex).patchValue({ tot_net: total, tot_remb: total });
            this.updateGlobalTotals();
        }
    }

    updateGlobalTotals(): void {
        const total = this.bulletins.controls.reduce((acc, ctrl) => acc + (parseFloat(ctrl.get('tot_net')?.value) || 0), 0);
        this.bordForm.patchValue({
            tot_remb: total,
            tot_net: total
        });
    }

    // --- Save Logic ---
    registerSaveCallback(): void {
        this.saveService.registerSaveCallback(() => this.validateAndSave());
    }

    validateAndSave(): void {
        if (this.isReadOnly) {
            Swal.fire('Info', 'Bordereau déjà validé.', 'info');
            return;
        }

        if (this.selectedBultIndex !== null) this.saveToCache(this.selectedBultIndex);

        this.isSaving = true;
        Swal.fire({ title: 'Enregistrement...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        // 1. Save Bordereau
        const bordData = { ...this.bordForm.value, cod_soc: this.token.getUser().codSoc };
        this.serv.saveBordArriver(bordData).pipe(
            switchMap(() => {
                // 2. Save all Bulletins and their details
                const bultSaves = this.bulletins.controls.map((ctrl, i) => {
                    const bult = ctrl.value;

                    // Get details: either from cache, or from current forms if this is the active row, or empty arrays
                    let details: any;
                    if (this.selectedBultIndex === i) {
                        details = this.getCurrentDetailPayload();
                    } else if (this.bulletinDetailsCache[i]) {
                        details = this.bulletinDetailsCache[i];
                    } else {
                        // Row never visited - use empty details for initialization mode
                        details = { visites: [], actes: [], meds: [], apps: [] };
                    }

                    return this.servRemb.addBultArriver(bult).pipe(
                        switchMap(() => this.servRemb.addAllLigBultArriver(
                            details.visites, details.actes, details.meds, details.apps
                        ))
                    );
                });
                return forkJoin(bultSaves);
            })
        ).subscribe({
            next: () => {
                this.isSaving = false;
                Swal.fire('Succès', 'Bordereau enregistré en mode Arrivé.', 'success');
            },
            error: (err) => {
                this.isSaving = false;
                console.error(err);
                Swal.fire('Erreur', 'Échec de l\'enregistrement.', 'error');
            }
        });
    }

    // --- Helpers ---
    private saveToCache(index: number): void {
        this.bulletinDetailsCache[index] = this.getCurrentDetailPayload();
    }

    private getCurrentDetailPayload(): any {
        return {
            visites: this.visites.value,
            actes: this.actes.value,
            meds: this.phars.value,
            apps: this.apps.value
        };
    }

    private clearDetailForms(): void {
        this.visites.clear(); this.actes.clear(); this.phars.clear(); this.apps.clear();
    }

    private resetState(): void {
        this.selectedBultIndex = null;
        this.bulletinDetailsCache = {};
        this.bulletins.clear();
        this.clearDetailForms();
    }

    private formatDate(date: any): string {
        if (!date) return '';
        if (Array.isArray(date) && date.length === 3) return `${String(date[2]).padStart(2, '0')}/${String(date[1]).padStart(2, '0')}/${date[0]}`;
        if (typeof date === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) return date;
        const d = new Date(date);
        return isNaN(d.getTime()) ? '' : `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }

    private convertToOracleDate(date: string): string {
        if (!date) return '';
        return date.replace(/\//g, '-'); // Simple dd-MM-yyyy or as required by service
    }
}
