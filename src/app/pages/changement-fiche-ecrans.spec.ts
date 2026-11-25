import { DatePipe } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController, TestRequest } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PaginationService as PaginationNgx } from 'ngx-pagination';
import { config as rxjsConfig } from 'rxjs';
import { MessageService } from 'primeng/api';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { MajCertifFamComponent } from './Adherent/maj-certif-fam/maj-certif-fam.component';
import { CarteCnamAlertService } from './Adherent/carte-cnam-alert.service';
import { ParamRefEtablisComponent } from './Réferentiels/Parameterages assurances/param-ref-etablis/param-ref-etablis.component';
import { ParamPersPhysiqueComponent } from './Réferentiels/Parameterages assurances/param-pers-physique/param-pers-physique.component';
import { ParamEtablissConventionneesComponent } from './Réferentiels/Parameterages assurances/param-etabliss-conventionnees/param-etabliss-conventionnees.component';
import { ParamPersonneConventionneesComponent } from './Réferentiels/Parameterages assurances/param-personne-conventionnees/param-personne-conventionnees.component';
import { ParamRefFilliereComponent } from './Réferentiels/Parameterages assurances/param-ref-filliere/param-ref-filliere.component';
import { ConsultationBordCnamComponent } from './Remboursement des frais médicaux/Envoi/consultation-bord-cnam/consultation-bord-cnam.component';
import { PreparationBordCnamSuppComponent } from './Remboursement des frais médicaux/Envoi/preparation-bord-cnam-supp/preparation-bord-cnam-supp.component';
import { PreparationBordMutComponent } from './Remboursement des frais médicaux/Envoi/preparation-bord-mut/preparation-bord-mut.component';
import { PreparationBordCnamComponent } from './Remboursement des frais médicaux/Envoi/preparation-bord-cnam/preparation-bord-cnam.component';
import { ConsPlafondComponent } from './Remboursement des frais médicaux/Adherent/cons-plafond/cons-plafond.component';
import { MajPlafondComponent } from './Remboursement des frais médicaux/Adherent/maj-plafond/maj-plafond.component';
import { MajAffiliationComponent } from './Remboursement des frais médicaux/Adherent/maj-affiliation/maj-affiliation.component';
import { MajDossMldComponent } from './Remboursement des frais médicaux/Adherent/maj-doss-mld/maj-doss-mld.component';
import { MajPecComponent } from './Remboursement des frais médicaux/Adherent/maj-pec/maj-pec.component';
import { ConsBuletinMutuelleComponent } from './Remboursement des frais médicaux/Bulletin de soins/cons-buletin-mutuelle/cons-buletin-mutuelle.component';
import { BuletinMutuelleComponent } from './Remboursement des frais médicaux/Bulletin de soins/buletin-mutuelle/buletin-mutuelle.component';
import { BuletinCNAMComponent } from './Remboursement des frais médicaux/Bulletin de soins/buletin-cnam/buletin-cnam.component';
import { ConsBultCnamComponent } from './Remboursement des frais médicaux/Bulletin de soins/cons-bult-cnam/cons-bult-cnam.component';

/**
 * Écrans utilisés avec les boutons ◀ ▶ : en passant à la fiche suivante, rien de la fiche précédente ne doit rester,
 * même quand la nouvelle fiche n'a pas de valeur ou que le serveur ne répond pas.
 * Chaque écran réel est monté avec un gabarit vide et des réponses serveur simulées.
 */
// Plusieurs écrans n'ont pas de gestion d'erreur sur leurs appels : une réponse 500 simulée serait relancée par RxJS comme
// erreur globale et ferait échouer le test sans rapport avec ce qu'on vérifie. On l'ignore pendant ces tests.
beforeAll(() => { rxjsConfig.onUnhandledError = () => { }; });
afterAll(() => { rxjsConfig.onUnhandledError = null; });

async function creer<T>(composant: Type<T>): Promise<{ ecran: any; http: HttpTestingController }> {
  await TestBed.configureTestingModule({
    declarations: [composant],
    imports: [ReactiveFormsModule, FormsModule, HttpClientTestingModule, RouterTestingModule, NgbModule],
    providers: [
      DatePipe,
      MessageService,
      PaginationNgx,
      {
        provide: TokenStorage,
        // toute autre méthode (société, nom…) renvoie une valeur neutre : seul getUser() compte ici
        useValue: new Proxy({}, {
          get: (_c, nom) => (nom === 'getUser' ? () => ({ codSoc: '01', roles: [{ id: 5, name: 'ADMIN' }] }) : () => ''),
        }),
      },
      { provide: CarteCnamAlertService, useValue: { verifierExpirationMatricule: () => { } } },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  })
    .overrideComponent(composant, { set: { template: '', templateUrl: undefined, styleUrl: undefined, styleUrls: [], styles: [] } })
    .compileComponents();
  const fixture = TestBed.createComponent(composant);
  fixture.detectChanges();                                   // ngOnInit
  const http = TestBed.inject(HttpTestingController);
  http.match(() => true);                                    // requêtes de démarrage : sans importance ici
  return { ecran: fixture.componentInstance, http };
}

const demandes = (http: HttpTestingController, motif: string): TestRequest[] =>
  http.match(r => r.url.includes(motif));

describe('Changement de fiche : établissements conventionnés (libellés activité, gouvernorat, poste)', () => {
  const ecrans: Array<[string, Type<any>]> = [
    ['Établissements conventionnés', ParamRefEtablisComponent],
    ['Personnes physiques conventionnées', ParamPersPhysiqueComponent],
    ['Référentiel des établissements conventionnés', ParamEtablissConventionneesComponent],
    ['Prise en charge des personnes physiques', ParamPersonneConventionneesComponent],
  ];
  for (const [nom, composant] of ecrans) {
    describe(nom, () => {
      it('une fiche sans activité, gouvernorat ni poste ne garde pas les libellés de la précédente', async () => {
        const { ecran, http } = await creer(composant);
        ecran.libActiv = 'Activité A';
        ecran.libGouv = 'Gouvernorat A';
        ecran.libPoste = 'Poste A';

        ecran.search({ prf_typ: '1', prf_cod: '2', cod_activ: null, cod_gouv: null, cod_post: null });

        expect(ecran.libActiv).toBe('');
        expect(ecran.libGouv).toBe('');
        expect(ecran.libPoste).toBe('');
        expect(http.match(() => true).length).toBe(0);         // aucune requête avec un code « null »
      });

      it('affiche les libellés de la fiche, et les efface si le serveur répond par une erreur', async () => {
        const { ecran, http } = await creer(composant);
        ecran.search({ prf_typ: '1', prf_cod: '2', cod_activ: 'A1', cod_gouv: 'G1', cod_post: 'P1' });
        http.match(() => true).forEach(r => r.flush({ lib_activite: 'Pharmacie', lib_gouv: 'Tunis', lib_post: 'Centre' }));
        expect(ecran.libActiv).toBe('Pharmacie');
        expect(ecran.libGouv).toBe('Tunis');
        expect(ecran.libPoste).toBe('Centre');

        ecran.search({ prf_typ: '1', prf_cod: '3', cod_activ: 'A2', cod_gouv: 'G2', cod_post: 'P2' });
        http.match(() => true).forEach(r => r.flush('erreur', { status: 500, statusText: 'erreur' }));
        expect(ecran.libActiv).toBe('');
        expect(ecran.libGouv).toBe('');
        expect(ecran.libPoste).toBe('');
      });

      it('une réponse vide du serveur donne un libellé vide, jamais une erreur', async () => {
        const { ecran, http } = await creer(composant);
        ecran.search({ prf_typ: '1', prf_cod: '2', cod_activ: 'A1', cod_gouv: 'G1', cod_post: 'P1' });
        http.match(() => true).forEach(r => r.flush(null));
        expect(ecran.libActiv).toBe('');
        expect(ecran.libGouv).toBe('');
        expect(ecran.libPoste).toBe('');
      });
    });
  }
});

describe('Changement de fiche : bordereaux', () => {
  const ecrans: Array<[string, Type<any>]> = [
    ['Consultation des bordereaux CNAM', ConsultationBordCnamComponent],
    ['Préparation bordereau CNAM sur support', PreparationBordCnamSuppComponent],
    ['Préparation bordereau mutuelle', PreparationBordMutComponent],
    ['Préparation/consultation bordereau CNAM', PreparationBordCnamComponent],
  ];
  for (const [nom, composant] of ecrans) {
    describe(nom, () => {
      async function ecranAvecBordereauA() {
        const r = await creer(composant);
        r.ecran.listBord = [{ mat_pers: '1000', tot_net: 12 }];
        r.ecran.codAssur = 'ASS-A';
        r.ecran.bordEnvoiForm.patchValue({
          cod_bord: 'A', cod_assur: 'ASS-A', lib_assur: 'Assureur A', dat_deb: '01/01/2021', dat_fin: '31/01/2021',
          nbr_bult: 5, tot_honor: 100, tot_net: 90,
        });
        return r;
      }
      const enTeteVide = (ecran: any) => {
        const v = ecran.bordEnvoiForm.value;
        for (const champ of ['cod_assur', 'lib_assur', 'dat_deb', 'dat_fin', 'nbr_bult', 'tot_honor', 'tot_net']) {
          expect(v[champ] === '' || v[champ] === null || v[champ] === undefined).toBeTrue();
        }
      };

      it('le bordereau suivant ne laisse ni les bulletins ni l\'en-tête du précédent tant qu\'il n\'est pas chargé', async () => {
        const { ecran } = await ecranAvecBordereauA();
        ecran.search({ cod_bord: 'B', dat_bord: '2021-02-01' });
        expect(ecran.listBord).toEqual([]);
        expect(ecran.codAssur).toBe('');
        enTeteVide(ecran);
        expect(ecran.bordEnvoiForm.value.cod_bord).toBe('B');
      });

      it('un bordereau introuvable (réponse vide) reste vide', async () => {
        const { ecran, http } = await ecranAvecBordereauA();
        ecran.search({ cod_bord: 'B', dat_bord: '2021-02-01' });
        http.match(() => true).forEach(r => r.flush([]));
        expect(ecran.listBord).toEqual([]);
        enTeteVide(ecran);
      });

      it('une erreur du serveur laisse l\'écran vide, pas les données du bordereau précédent', async () => {
        const { ecran, http } = await ecranAvecBordereauA();
        ecran.search({ cod_bord: 'B', dat_bord: '2021-02-01' });
        http.match(() => true).forEach(r => r.flush('erreur', { status: 500, statusText: 'erreur' }));
        expect(ecran.listBord).toEqual([]);
        enTeteVide(ecran);
      });
    });
  }
});

describe('Changement de fiche : écrans adhérent de Remboursement et certificats', () => {
  const ecrans: Array<[string, Type<any>, string[]]> = [
    ['Consultation des plafonds', ConsPlafondComponent, ['listPlafAssur', 'listPlafCnam']],
    ['Mise à jour des plafonds', MajPlafondComponent, ['listPlafAssur', 'listPlafCnam']],
    ['Adhésions CNAM', MajAffiliationComponent, ['listPersAffil']],
    ['Dossier médical (APCI)', MajDossMldComponent, ['listDossierMld', 'listFamille']],
    ['Prises en charge maladie', MajPecComponent, ['listPriseCharge', 'listFamille']],
    ['Certificats de scolarité', MajCertifFamComponent, ['listEnfants']],
  ];
  for (const [nom, composant, listes] of ecrans) {
    it(`${nom} : les listes de l'adhérent précédent sont vidées tant que le serveur n'a pas répondu`, async () => {
      const { ecran } = await creer(composant);
      for (const l of listes) ecran[l] = [{ ancien: true }];

      ecran.search({ cod_soc: '01', mat_pers: '2000', nom_pers: 'ben falten' });

      for (const l of listes) expect(ecran[l]).toEqual([]);
    });

    it(`${nom} : une erreur du serveur laisse les listes vides`, async () => {
      const { http, ecran } = await creer(composant);
      for (const l of listes) ecran[l] = [{ ancien: true }];
      ecran.search({ cod_soc: '01', mat_pers: '2000', nom_pers: 'ben falten' });
      http.match(() => true).forEach(r => r.flush('erreur', { status: 500, statusText: 'erreur' }));
      for (const l of listes) expect(ecran[l]).toEqual([]);
    });
  }
});

describe('Changement de fiche : filières', () => {
  it('les valeurs de la filière précédente sont vidées avant le chargement', async () => {
    const { ecran } = await creer(ParamRefFilliereComponent);
    ecran.listRefFillAct = [{ ancien: true }];
    ecran.listRefFillActFiltr = [{ ancien: true }];
    ecran.search({ cod_fil: 'F2', mnt_adher: null, cod_activ: null });
    expect(ecran.listRefFillAct).toEqual([]);
    expect(ecran.listRefFillActFiltr).toEqual([]);
  });
});

describe('Changement de fiche : bulletins', () => {
  const ligne = (fb: FormBuilder) => fb.group({ marqueur: ['ANCIEN'] });
  const sansAncien = (...formulaires: any[]) =>
    formulaires.forEach(f => expect(JSON.stringify(f.value).includes('ANCIEN')).toBeFalse());
  const bulletin = {
    cod_soc: '01', mat_pers: '1000', num_fam: '0', dat_soin: '2021-03-05 00:00:00.0', cod_bord: 'B1', cod_fil: 'F1',
    cod_assur: 'ASS', num_assur: 'NA', dat_saisie: '2021-03-06 00:00:00.0', num_soin: 'S1', num_pec: null, nom_complet_pers: 'ben falten',
  };

  describe('Consultation des bulletins mutuelle', () => {
    it('un bulletin sans acte ni médicament vide les tableaux du bulletin précédent', async () => {
      const { ecran } = await creer(ConsBuletinMutuelleComponent);
      const fb = TestBed.inject(FormBuilder);
      ecran.ligPretForm.setControl('lignes', fb.array([ligne(fb)]));
      ecran.ligPharForm.setControl('phar', fb.array([ligne(fb)]));
      ecran.loadDataIntoTable([]);
      ecran.loadDataIntoTablePhar([]);
      expect(ecran.lignes.length).toBe(0);
      expect(ecran.phar.length).toBe(0);
      sansAncien(ecran.ligPretForm, ecran.ligPharForm);
    });

    it('au changement de bulletin, les tableaux sont vidés avant même la réponse du serveur', async () => {
      const { ecran, http } = await creer(ConsBuletinMutuelleComponent);
      const fb = TestBed.inject(FormBuilder);
      ecran.ligPretForm.setControl('lignes', fb.array([ligne(fb)]));
      ecran.ligPharForm.setControl('phar', fb.array([ligne(fb)]));
      ecran.search(bulletin);
      http.match(r => r.url.includes('Fiche') || r.url.includes('getBultMutFiche')).forEach(r => r.flush([bulletin]));
      expect(ecran.lignes.length).toBe(0);
      expect(ecran.phar.length).toBe(0);
      expect(ecran.numFam).toBe('0');
    });

    it('les chargements du bulletin précédent sont annulés quand on en affiche un autre', async () => {
      const { ecran, http } = await creer(ConsBuletinMutuelleComponent);
      ecran.search(bulletin);
      http.match(r => r.url.includes('getBultMutFiche')).forEach(r => r.flush([bulletin]));
      const premiers = http.match(() => true);                 // chargements du premier bulletin
      expect(premiers.length).toBeGreaterThan(0);

      ecran.search({ ...bulletin, mat_pers: '2000' });
      http.match(r => r.url.includes('getBultMutFiche')).forEach(r => r.flush([{ ...bulletin, mat_pers: '2000' }]));

      expect(premiers.every(r => r.cancelled)).toBeTrue();     // plus aucune réponse de l'ancien bulletin ne sera appliquée
    });
  });

  describe('Prise en charge bulletin mutuelle', () => {
    it('un bulletin sans acte ni médicament vide les tableaux du bulletin précédent', async () => {
      const { ecran } = await creer(BuletinMutuelleComponent);
      const fb = TestBed.inject(FormBuilder);
      ecran.ligPretForm.setControl('lignes', fb.array([ligne(fb)]));
      ecran.ligPharForm.setControl('phar', fb.array([ligne(fb)]));
      ecran.loadDataIntoTable([]);
      ecran.loadDataIntoTablePhar([]);
      expect(ecran.lignes.length).toBe(0);
      expect(ecran.phar.length).toBe(0);
      sansAncien(ecran.ligPretForm, ecran.ligPharForm);
    });

    it('le plafond est calculé avec la date de naissance du bénéficiaire de CE bulletin, pas celle du précédent', async () => {
      const { ecran, http } = await creer(BuletinMutuelleComponent);
      ecran.datNais = '1980-01-01';                              // bénéficiaire du bulletin précédent

      ecran.search({ ...bulletin, num_fam: '1' });
      expect(demandes(http, 'get_plafond_mutuelle').length).toBe(0);   // pas avant d'avoir la bonne date

      demandes(http, 'getDatNaiss').forEach(r => r.flush({ dat_nais: '2015-05-05' }));
      const plafond = demandes(http, 'get_plafond_mutuelle');
      expect(plafond.length).toBe(1);
      expect(plafond[0].request.params.get('datNais')).toBe('2015-05-05');
      plafond[0].flush({ ageAn: 6, ageMois: 2, soldPlafond: 100, soldPlafondEstim: 90 });
      expect(ecran.ageAn).toBe(6);
      expect(ecran.datNais).toBe('2015-05-05');
    });
  });

  describe('Prise en charge bulletin CNAM', () => {
    it('la liste des actes est demandée avec le sexe et la parenté du bénéficiaire de CE bulletin', async () => {
      const { ecran, http } = await creer(BuletinCNAMComponent);
      ecran.sexe = 'M';                                          // bénéficiaire du bulletin précédent
      ecran.parente = 'A';

      ecran.search({ ...bulletin, num_fam: '1' });
      expect(demandes(http, 'getActes').length).toBe(0);

      demandes(http, 'getDatSexe').forEach(r => r.flush({ sexe: 'F', parente: 'E' }));
      const actes = demandes(http, 'getActes');
      expect(actes.length).toBe(1);
      expect(actes[0].request.params.get('sexe')).toBe('F');
      expect(actes[0].request.params.get('parente')).toBe('E');
    });

    it('le nom du bénéficiaire de la fiche précédente est effacé quand aucun membre ne correspond', async () => {
      const { ecran, http } = await creer(BuletinCNAMComponent);
      ecran.nomAdherent = 'ANCIEN BENEFICIAIRE';
      ecran.search({ ...bulletin, num_fam: '7' });
      expect(ecran.nomAdherent).toBe('');
      demandes(http, 'getAdherent').forEach(r => r.flush([{ num_fam: 1, nom_pren: 'AUTRE', dat_nais: '2010-01-01' }]));
      expect(ecran.nomAdherent).toBe('');
    });
  });

  describe('Consultation des bulletins CNAM', () => {
    it('un bulletin sans visite vide le tableau des visites du bulletin précédent', async () => {
      const { ecran } = await creer(ConsBultCnamComponent);
      const fb = TestBed.inject(FormBuilder);
      ecran.ligVisiteForm.setControl('visite', fb.array([ligne(fb)]));
      ecran.loadDataIntoTableVisite([]);
      sansAncien(ecran.ligVisiteForm);
    });

    it('au changement de bulletin, tous les tableaux sont vidés avant la réponse du serveur', async () => {
      const { ecran, http } = await creer(ConsBultCnamComponent);
      const fb = TestBed.inject(FormBuilder);
      ecran.ligPretForm.setControl('lignes', fb.array([ligne(fb)]));
      ecran.ligPharForm.setControl('phar', fb.array([ligne(fb)]));
      ecran.ligVisiteForm.setControl('visite', fb.array([ligne(fb)]));
      ecran.ligAppareilForm.setControl('appareil', fb.array([ligne(fb)]));
      ecran.search(bulletin);
      http.match(r => r.url.includes('getBultCnamCons') || r.url.includes('Cons')).forEach(r => r.flush([bulletin]));
      sansAncien(ecran.ligPretForm, ecran.ligPharForm, ecran.ligVisiteForm, ecran.ligAppareilForm);
    });
  });
});
