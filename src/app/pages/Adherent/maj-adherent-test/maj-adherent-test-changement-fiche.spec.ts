import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TokenStorage } from 'src/app/account/token-storage.service';
import { SaveService } from 'src/app/shared/Service/save.service';
import { CarteCnamAlertService } from '../carte-cnam-alert.service';
import { MajAdherentTestComponent } from './maj-adherent-test.component';

/**
 * « Prise en charge adhérent » : en passant d'une fiche à la suivante (boutons ◀ ▶ ou nouveau choix à la loupe),
 * rien de la fiche précédente ne doit rester : champs à loupe (code et libellé), père / mère / conjoint, photo.
 */
describe('MajAdherentTestComponent : changement de fiche', () => {
  let fixture: ComponentFixture<MajAdherentTestComponent>;
  let ecran: MajAdherentTestComponent;
  let http: HttpTestingController;

  // fiche A : toutes les valeurs renseignées
  const ficheA = {
    cod_soc: '01', mat_pers: '1000', nom_pers: 'ben falten', pren_pers: 'flen 1', sexe: 'M', cin: '10001000',
    cod_natp: 'TUN', cod_lieu_geog: 'L1', cod_affect: 'AF1', cod_typ_depart: 'D1', cod_banq: 'B1', cod_agc: 'AG1',
    rib: '1234', nom_pers_a: 'اسم', corps: 'A', dat_motif: '2020-01-01 00:00:00.0', dat_affect: '2019-05-05 00:00:00.0',
  };
  // fiche B : la base ne contient rien pour tous ces champs
  const ficheB = {
    cod_soc: '01', mat_pers: '1001', nom_pers: 'ben falten', pren_pers: 'flen 2', sexe: 'F', cin: '10001001',
    cod_natp: null, cod_lieu_geog: null, cod_affect: null, cod_typ_depart: null, cod_banq: null, cod_agc: null,
    rib: null, nom_pers_a: null, corps: null, dat_motif: null, dat_affect: null,
  };

  const personne = { cod_soc: '01', mat_pers: '1000', num_fam: '1', parente: 'P', nom_pren: 'PERE DE A', sexe: 'M', pec: 'O' };

  function repondre(motif: string, corps: any, statut?: number) {
    http.match(r => r.url.includes(motif)).forEach(r =>
      statut ? r.flush('erreur', { status: statut, statusText: 'erreur' }) : r.flush(corps));
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MajAdherentTestComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule, NgbModule],
      providers: [
        {
          // toute autre méthode (société, nom…) renvoie une valeur neutre : seul getUser() compte pour ces tests
          provide: TokenStorage,
          useValue: new Proxy({}, {
            get: (_cible, nom) => (nom === 'getUser' ? () => ({ codSoc: '01', roles: [{ id: 5, name: 'ADMIN' }] }) : () => ''),
          }),
        },
        { provide: CarteCnamAlertService, useValue: { verifierExpirationMatricule: () => { } } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(MajAdherentTestComponent, { set: { template: '', templateUrl: undefined, styleUrl: undefined, styleUrls: [], styles: [] } })
      .compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(MajAdherentTestComponent);
    ecran = fixture.componentInstance;
    fixture.detectChanges();

    // listes de référence déjà chargées (le serveur n'est pas interrogé pour elles ici)
    ecran.listNationalite = [{ cod_natp: 'TUN', lib_nat: 'Tunisienne' }, { cod_natp: 'FRA', lib_nat: 'Française' }];
    ecran.listLieu = [{ cod_lieu_geog: 'L1', lib_lieu: 'Tunis' }];
    ecran.listAffectation = [{ cod_affect: 'AF1', lib_affect: 'Direction' }];
    ecran.listTypeDepart = [{ cod_typ_depart: 'D1', lib_typ_depart: 'Retraite' }];
    ecran.listBanque = [{ cod_banq: 'B1', lib_banq: 'Banque 1' }];

    // l'image de la photo existe dans le vrai gabarit
    const img = document.createElement('img');
    img.id = 'product-img';
    img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
    document.body.appendChild(img);
  });

  afterEach(() => {
    document.getElementById('product-img')?.remove();
  });

  it('affiche les codes et les libellés des champs à loupe de la fiche choisie', () => {
    ecran.search(ficheA);
    repondre('getAgence', [{ cod_agc: 'AG1', lib_agc: 'Agence 1' }]);

    expect(ecran.codNatP).toBe('TUN');
    expect(ecran.libNat).toBe('Tunisienne');
    expect(ecran.libLieu).toBe('Tunis');
    expect(ecran.libAffect).toBe('Direction');
    expect(ecran.libTypDepart).toBe('Retraite');
    expect(ecran.libBanque).toBe('Banque 1');
    expect(ecran.libAgence).toBe('Agence 1');
    expect(ecran.formAdherent.get('cod_natp')?.value).toBe('TUN');
  });

  it('une fiche sans valeur ne garde rien de la fiche précédente (codes, libellés, formulaire)', () => {
    ecran.search(ficheA);
    repondre('getAgence', [{ cod_agc: 'AG1', lib_agc: 'Agence 1' }]);
    expect(ecran.libNat).toBe('Tunisienne');

    ecran.search(ficheB);

    for (const code of [ecran.codNatP, ecran.codLieuVal, ecran.codAffectVal, ecran.codTypDepartVal, ecran.codBanqueVal, ecran.codAgenceVal]) {
      expect(code === '' || code === null || code === undefined).toBeTrue();
    }
    expect(ecran.libNat).toBe('');
    expect(ecran.libLieu).toBe('');
    expect(ecran.libAffect).toBe('');
    expect(ecran.libTypDepart).toBe('');
    expect(ecran.libBanque).toBe('');
    expect(ecran.libAgence).toBe('');
    expect(http.match(r => r.url.includes('getAgence')).length).toBe(0);   // pas de banque : aucune agence à charger
    for (const champ of ['cod_natp', 'cod_lieu_geog', 'cod_affect', 'cod_typ_depart', 'cod_banq', 'cod_agc', 'rib', 'nom_pers_a', 'dat_motif', 'dat_affect']) {
      expect(ecran.formAdherent.get(champ)?.value ?? null).toBeNull();
    }
    expect(ecran.formAdherent.get('mat_pers')?.value).toBe('1001');
    expect(ecran.formAdherent.get('pren_pers')?.value).toBe('flen 2');
  });

  it('le libellé suit le code même si deux fiches ont la même nationalité', () => {
    ecran.search(ficheA);
    ecran.search({ ...ficheB, cod_natp: 'FRA' });
    expect(ecran.libNat).toBe('Française');
    ecran.search({ ...ficheB, cod_natp: 'FRA' });
    expect(ecran.libNat).toBe('Française');
  });

  it('un code absent de la liste donne un libellé vide, jamais « undefined »', () => {
    ecran.search({ ...ficheB, cod_affect: 'INCONNU', cod_natp: 'INCONNU' });
    expect(ecran.libAffect).toBe('');
    expect(ecran.libNat).toBe('');
  });

  it('père, mère et conjoint de la fiche précédente disparaissent, même si le serveur répond par une erreur', () => {
    ecran.search(ficheA);
    repondre('getPere', personne);
    repondre('getMere', { ...personne, parente: 'M', nom_pren: 'MERE DE A' });
    repondre('getConjoint', { ...personne, parente: 'C', nom_pren: 'CONJOINT DE A' });
    expect(ecran.formPere.get('nom_pren')?.value).toBe('PERE DE A');
    expect(ecran.formConjoint.get('nom_pren')?.value).toBe('CONJOINT DE A');

    ecran.search(ficheB);
    repondre('getPere', null, 500);
    repondre('getMere', null);
    repondre('getConjoint', null, 404);

    for (const f of [ecran.formPere, ecran.formMere, ecran.formConjoint]) {
      expect(f.get('nom_pren')?.value ?? '').toBe('');
    }
  });

  it('la photo de la fiche précédente ne reste ni affichée ni rattachée à la fiche sans photo', () => {
    ecran.search(ficheA);
    repondre('getPhoto', { photo: btoa('octets'), file_name: 'a.png', file_type: 'image/png', content_type: 'image/png', id_photo_pers: 9 });
    expect(ecran.idAttachment).toBe(9);
    expect(ecran.imageURL).toContain('base64,');

    ecran.search(ficheB);
    repondre('getPhoto', {});

    expect(ecran.idAttachment).toBeUndefined();
    expect(ecran.files).toBeUndefined();
    expect(ecran.imageURL).toBeUndefined();
    expect((document.getElementById('product-img') as HTMLImageElement).src).toContain('R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==');
  });

  it('« Nouveau » vide aussi les libellés et la photo, puis rend la main', () => {
    const save = TestBed.inject(SaveService);
    ecran.search(ficheA);
    repondre('getPhoto', { photo: btoa('octets'), file_name: 'a.png', file_type: 'image/png', content_type: 'image/png', id_photo_pers: 9 });

    save.setAdded(true);

    expect(ecran.libNat).toBe('');
    expect(ecran.codNatP).toBe('');
    expect(ecran.idAttachment).toBeUndefined();
    expect(ecran.formAdherent.get('mat_pers')?.value ?? null).toBeNull();
    let valeurFinale: boolean | undefined;
    save.add$.subscribe(v => (valeurFinale = v)).unsubscribe();   // valeur courante
    expect(valeurFinale).toBeFalse();                              // l'écran a remis l'observable à faux
  });
});
