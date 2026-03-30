import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


export interface Personnel {
  mat_pers: string;
  mat_int: string;
  dat_nais: string;
  num_retr: string;
  nom: string;
}

const API_URL = environment.urlServer;

@Injectable({
  providedIn: 'root'
})
export class AdherentService {

  constructor(private http: HttpClient) { }
  AddPersonnel(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "adherent/Personnel/addUser", data);
  }
  AddPhoto(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "adherent/Personnel/addPhoto", data);
  }
  AddCarteSoinPers(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "adherent/famille/AddCarteSoin", data);
  }
  AddEnfants(data: any[]): Observable<any> {
    return this.http.post<any>(API_URL + "adherent/famille/AddEnfant", data);
  }
  AddPere(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "adherent/famille/saveFam", data);
  }
  AddMere(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "adherent/famille/saveFam", data);
  }
  AddConjoint(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "adherent/famille/saveFam", data);
  }
  AddAdresse(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "adherent/Personnel/addAdresse", data);
  }
  countMat = (soc: String, mat: String): Observable<any> => {
    return this.http.get(API_URL + "adherent/Personnel/countMat/" + soc + "/" + mat);
  };
  getNationalite = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getNationalite");
  };
  getPhoto = (soc: String, mat: String): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getPhoto/" + soc + "/" + mat);
  };
  getLieu = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getLieu");
  };
  getAffectation = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getAffectation");
  };
  getTypeDepart = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getTypeDepart");
  };
  getBanque = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getBanque");
  };
  getAgence = (banq: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getAgence/" + banq);
  };
  getGouv = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getGouvernorat");
  };
  getPoste = (poste: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getPoste/" + poste);
  };
  getAdresse = (soc: String, mat: String): Observable<any> => {
    return this.http.get<any>(API_URL + "adherent/Personnel/getAdresse/" + soc + "/" + mat);
  };
  getPere = (soc: String, mat: String): Observable<any> => {
    return this.http.get<any>(API_URL + "adherent/famille/getPere/" + soc + "/" + mat);
  };
  getMere = (soc: String, mat: String): Observable<any> => {
    return this.http.get<any>(API_URL + "adherent/famille/getMere/" + soc + "/" + mat);
  };
  getConjoint = (soc: String, mat: String): Observable<any> => {
    return this.http.get<any>(API_URL + "adherent/famille/getConjoint/" + soc + "/" + mat);
  };
  getMaxNumAdr = (soc: String, mat: String): Observable<number> => {
    return this.http.get<number>(API_URL + "adherent/Personnel/getMaxNumAdr/" + soc + "/" + mat);
  };
  getEnfants = (soc: String, mat: String): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/famille/getEnfants/" + soc + "/" + mat);
  };
  getMaxNumFamEnfants = (soc: String, mat: String): Observable<number> => {
    return this.http.get<number>(API_URL + "adherent/famille/getMaxNumFamEnfants/" + soc + "/" + mat);
  };
  getFamille = (soc: String, mat: String): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/famille/getFamille/" + soc + "/" + mat);
  };
  getNbrEnf = (soc: any, mat: any): Observable<any> => {
    const params = new HttpParams().set('soc', soc).set('mat', mat)
    return this.http.get<any>(API_URL + "adherent/famille/getNbreEnf", { params });
  };
  getPersonnelsByMat = (mat: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getPersonnelles/" + mat);
  };
  getPersonnels = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getPersonnelles");
  };
  getPersonnelsCredit = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getPersonnels");
  };
  getPersonnelsEnInstance = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getPersonnellesEnInstance");
  };
  getCarteSoin = (soc: String, mat: String): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/famille/getcarteSoinsPers/" + soc + "/" + mat);
  };
  getActivite = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/famille/getActivite");
  };
  getMatInt = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getMatInt");
  };
  getCertifEnf = (mat_pers: any, num_fam: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getCertifEnf/" + mat_pers + "/" + num_fam);
  };
  getCorps = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getCorps");
  };
  getAffilPers = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getAffilPers/" + soc);
  };

  getAffilPersMut = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getAffilPersMut/" + soc);
  };
  getAffilPersByMat = (soc: any, mat: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getAffilPersByMat/" + soc + "/" + mat);
  };
  getAffilMutuelle = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getAffilMutuelle");
  };
  getAffilPersRenouvAdhesion = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getAffilPersRenouvAdhesion/" + soc);
  };
  getAffilMutuelleEnInstance = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getAffilPersEnInstance/" + soc);
  };
  getListDepart = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/listDepart/" + soc);
  };
  getListPersonnelDepart = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/listPersonnelDepart/" + soc);
  };
  getListReiteg = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/listReinteg/" + soc);
  };
  getListPersonnelReinteg = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/listPersonnelReinteg/" + soc);
  };
  getListPersonnelDepartReinteg = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/listDepartReintegInstance/" + soc);
  };
  AddCertifFamille(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "adherent/Personnel/AddCertifEnf", data);
  }
  AddAffiliation(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "adherent/Personnel/AddAffiliation", data);
  }
  AddDepartPers(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "adherent/Personnel/AddDepartPers", data);
  }
  updateEtat(data: any, Etat: any): Observable<any> {
    return this.http.put<any>(API_URL + "adherent/Personnel/updateAffil/" + Etat, data);
  }

  ValiderAff(soc: any, etatAff: any, typAff: any, mat: any, dat: any): Observable<any[]> {

    const params = new HttpParams().set("soc", soc).set("etat_aff", etatAff).set("typ_aff", typAff).set("mat", mat).set("dat", dat)
    return this.http.get<any[]>(API_URL + "adherent/Personnel/callValiderAff", { params });
  }
  getStatusOptions(soc: String, mat: String): Observable<{ label: string; value: string }[]> {
    return this.http.get<any[]>(API_URL + "adherent/famille/getEnfants/" + soc + "/" + mat).pipe(
      map(response =>
        response.map(item => ({
          label: item.nom_pren,      // Map 'name' field to 'label'
          value: item.num_fam // Map 'status_code' field to 'value'
        }))
      )
    );
  }

  deleteFamille(soc: any, num_fam: any, mat: any) {
    return this.http.delete<any>(API_URL + "adherent/famille/" + soc + "/" + num_fam + "/" + mat);

  }
  deleteCertifFamille(soc: any, num_fam: any, mat: any, annee: any) {
    return this.http.delete<any>(API_URL + "adherent/Personnel/" + soc + "/" + num_fam + "/" + mat + "/" + annee);

  }
  deleteAffil(soc: string, mat: string, dat: string): Observable<void> {
    const params = new HttpParams()
      .set('soc', soc)
      .set('mat', mat)
      .set('dat', dat);

    return this.http.delete<void>(API_URL + "adherent/Personnel/deleteAffil", { params });
  }

  import_fichier(data: FormData): Observable<any> {
    return this.http.post<any>(API_URL + "CaisseRetr/CaiseeRetr/import-fichier", data);
  }

  getDiskPret(mois: string): Observable<void> {
    const params = new HttpParams()
      .set('mois', mois);

    return this.http.get<void>(API_URL + "adherent/Personnel/getDiskPretImport", { params });
  }

  fichier_salarie(
    soc: string,
    nomFichier: string,
    etat_act: string,

  ): Observable<any> {
    const params = new HttpParams()
      .set("soc", soc)
      .set('nomFichier', nomFichier)
      .set('etat_act', etat_act);
    console.log("params :", params)
    return this.http.get(API_URL + `adherent/Personnel/fichier_salarie`, { params });
  }

  downloadFile(fileName: string) {
    const params = new HttpParams()
      .set('fileName', fileName)
    return this.http.get(API_URL + "adherent/Personnel/download-file", {
      params,
      responseType: 'blob' as 'json' // Blob pour gérer les fichiers binaires
    });
  }
  getTrsPers = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getTrsPers");
  };
  addTrsPers(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "adherent/Personnel/addTrsPers", data);
  }

  deleteTrsPers() {
    return this.http.delete<any>(API_URL + "adherent/Personnel/deleteTrsPers");

  }

  // GET ALL PERSONNEL
  getAllPersonnel(soc: string): Observable<Personnel[]> {
    const params = new HttpParams().set('soc', soc);
    return this.http.get<Personnel[]>(API_URL + "Print/personnel", { params });
  }
  getPersonnelByMatPers(soc: string, matPers: string): Observable<Personnel[]> {
    const params = new HttpParams()
      .set('soc', soc)
      .set('mat_pers', matPers);
    return this.http.get<Personnel[]>(API_URL + "Print/personnel/by-mat", { params });
  }


  editionAdhesionMutuell(numRap: any, soc: any, matDeb: any, matFin: any) {
    const body = {
      cod_soc: soc,
      mat_deb: matDeb,
      mat_fin: matFin,
    };

    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }





  editionListAdherent(numRap: any, soc: any, mat: any, matFin: any, typDepart: any, corps: any, lieu: any, etat: any) {
    const body = {
      cod_soc: soc,
      mat_deb: mat,
      mat_fin: matFin,
      corps: corps,
      cod_typ_depart: typDepart,
      cod_lieu_geog: lieu,
      etat_act: etat,
    };

    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }

  editionListFamPErs(numRap: any, soc: any, mat: any, matFin: any, parente: any, pec: any) {
    const body = {
      cod_soc: soc,
      mat_deb: mat,
      mat_fin: matFin,
      parente: parente,
      pec: pec,
    };

    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }

  editionListCarte(numRap: any, soc: any, mat: any, matFin: any, dat_cart: any, dat_cart_fin: any, nat_cart: any, etat_cart: any, perdu: any) {
    const body = {
      cod_soc: soc,
      mat_deb: mat,
      mat_fin: matFin,
      dat_cart: dat_cart,
      dat_cart_fin: dat_cart_fin,
      nat_cart: nat_cart,
      etat_cart: etat_cart,
      perdu: perdu
    };

    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }

  editionFicheAdherent(numRap: any, soc: any, mat: any, matFin: any) {
    const body = {
      cod_soc: soc,
      mat_deb: mat,
      mat_fin: matFin,
    }
    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }

  editionListAdherentSusp(numRap: any, soc: any, mat: any, matFin: any, corps: any) {
    const body = {
      cod_soc: soc,
      mat_deb: mat,
      mat_fin: matFin,
      corps: corps
    }
    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }
  editionListReinteg(numRap: any, soc: any, mat: any, matFin: any, dat_deb: any, dat_fin: any) {
    const body = {
      cod_soc: soc,
      mat_deb: mat,
      mat_fin: matFin,
      dat_deb: dat_deb,
      dat_fin: dat_fin
    }
    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }

  editionListEnfant(numRap: any, soc: any, age_deb: any, age_fin: any) {
    const body = {
      soc: soc,
      age_deb: age_deb,
      age_fin: age_fin,
    }
    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }
  editionListCarteSoin(numRap: any, soc: any, mat: any, matFin: any, nat_cart: any, perdu: any, etat_cart: any) {
    const body = {
      cod_soc: soc,
      mat_deb: mat,
      mat_fin: matFin,
      nat_cart: nat_cart,
      perdu: perdu,
      etat_cart: etat_cart
    }
    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }

}
