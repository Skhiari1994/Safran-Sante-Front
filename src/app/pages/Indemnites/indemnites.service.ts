import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const API_URL = environment.urlServer;

@Injectable({
  providedIn: 'root'
})
export class IndemnitesService {

  constructor(private http: HttpClient) { }

  getgetListTypDon = (typDon: any, codAffect: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Indemnite/piece/getListTypDon/" + typDon + "/" + codAffect);
  };
  getgetListNatDon = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Indemnite/piece/getListNatDons");
  };

  getDemandeDon(data: any): Observable<any> {
    return this.http.post(API_URL + "Indemnite/ind/getDemandeDon", data);
  }

  getPersInd = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Indemnite/ind/PersInd/" + soc);
  };

  getPersIndAff = (soc: any, aff: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Indemnite/ind/PersIndAff/" + soc + "/" + aff);
  };
  execProcTypDon(data: any): Observable<any> {
    return this.http.post(API_URL + "Indemnite/ind/execProcTypDon", data);
  }

  getFamille = (soc: any, matPers: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Indemnite/ind/getFamille/" + soc + "/" + matPers);
  };

  getFamilleEnfant = (soc: any, matPers: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Indemnite/ind/getFameEnfant/" + soc + "/" + matPers);
  };

  getFamAdherent = (soc: any, matPers: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Indemnite/ind/getFamAdherent/" + soc + "/" + matPers);
  };

  getFamConjoint = (soc: any, matPers: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Indemnite/ind/getFamConjoint/" + soc + "/" + matPers);
  };

  getDemInd = (soc: any, matPers: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Indemnite/ind/getDemInd/" + soc + "/" + matPers);
  };

  createDemandeDon(demandeDon: any): Observable<any> {
    return this.http.post(API_URL + "Indemnite/ind/save", demandeDon, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  createPieceDemandeDon(pieceDon: any): Observable<any> {
    return this.http.post(API_URL + "Indemnite/piece/save", pieceDon, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    });
  }

  getPieceDemandeDon(data: any): Observable<any> {
    return this.http.post(API_URL + "Indemnite/piece/getAddedPiece", data);
  }

  getListPiece(): Observable<any> {
    return this.http.get(API_URL + "Indemnite/piece/all");
  }

  getConcerne(concen: any): Observable<any> {
    return this.http.get(API_URL + "Indemnite/ind/numFam?concerne=" + concen);
  }

  ////////////////////service validation Indemnite
  getLieu = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getLieu");
  };

  getCorps = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "adherent/Personnel/getCorps");
  };

  PersCotisActif = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Indemnite/ind/getDemandeVal/" + soc);
  };

  PersIndValid = (soc: any, codAffect: any, natDon: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Indemnite/ind/getDemandeVal?codSoc=" + soc + "&codAffect=" + codAffect + "&natDon=" + natDon);
  };

  PersIndValidationCp = (soc: any, codAffect: any, natDon: any, datDeb: any, datFin: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Indemnite/ind/PersIndValidationCp?codSoc=" + soc + "&codAffect=" + codAffect + "&natDon=" + natDon + "&datDeb=" + datDeb + "&datFin=" + datFin);
  };

  getDemandeIndScol = (soc: any, codAffect: any, natDon: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Indemnite/ind/getDemandeIndScol?codSoc=" + soc + "&codAffect=" + codAffect + "&natDon=" + natDon);
  };

  updateDemandeDon(demandeDon: any): Observable<any> {
    return this.http.post(API_URL + "Indemnite/ind/updateValid", demandeDon);
  }
  updateDemandeDonDeblocage(demandeDon: any): Observable<any> {
    return this.http.put(API_URL + "Indemnite/ind/updateDeblocage", demandeDon);
  }
  PersIndDeblocage(soc: any, codAffect: any, natDon: any, datDeb: any, datFin: any, datDeblocag: any, modPayFilter: any): Observable<any> {
    let params = new HttpParams()
      .set('codSoc', soc)
      .set('datDeb', datDeb)
      .set('datFin', datFin).set('datDeblocag', datDeblocag).set('modPay', modPayFilter);

    // Only add optional parameters if they have values
    if (codAffect) {
      params = params.set('codAffect', codAffect);
    }
    if (natDon) {
      params = params.set('natDon', natDon);
    }

    return this.http.get(API_URL + "Indemnite/ind/getDemandeDeblocage", { params });
  }

  saveDelocage(demandeDon: any[]): Observable<any> {
    return this.http.post(API_URL + "Indemnite/ind/saveDelocage", demandeDon);
  }

  deleteDelocage(demandeDon: any[]): Observable<any> {
    return this.http.post(API_URL + "Indemnite/ind/deleteDelocage", demandeDon, { responseType: 'text' });
  }

  vir_carte(
    soc: string,
    datDebloc: string,
    wcodLieuGeog: string,
    wnatDon: string
  ): Observable<any> {
    const params = new HttpParams()
      .set("soc", soc)
      .set('datDebloc', datDebloc)
      .set('wcodLieuGeog', wcodLieuGeog)
      .set('wnatDon', wnatDon);

    console.log("params :", params)
    return this.http.get(API_URL + "Indemnite/virement/vir-scol", { params });
  }

  execProcVir = (soc: any, datDebloc: any, wcodLieuGeog: any, wnatDon: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Indemnite/virement/vir-scol?soc=" + soc + "&datDebloc=" + datDebloc + "&wcodLieuGeog=" + wcodLieuGeog + "&wnatDon=" + wnatDon);
  }

  downloadFile() {
    return this.http.get(API_URL + "Indemnite/virement/download-file", {
      responseType: 'blob' as 'json' // Blob pour gérer les fichiers binaires
    });
  }

  PersIndVirementScol(soc: any, datDebloc: any, wcodLieuGeog: any, wnatDon: any): Observable<any> {
    let params = new HttpParams()
      .set('soc', soc)
      .set('datDebloc', datDebloc);

    // Only add optional parameters if they have values
    if (wcodLieuGeog) {
      params = params.set('wcodLieuGeog', wcodLieuGeog);
    }
    if (wnatDon) {
      params = params.set('wnatDon', wnatDon);
    }

    return this.http.get(API_URL + "Indemnite/ind/PersIndVirementScol", { params });
  }

  deleteAllVirCarteData = (): Observable<any[]> => {
    return this.http.delete<any[]>(API_URL + "Indemnite/virement/delete-all");
  }

  getPersIndVirementScolCloture(soc: any, datDebloc: any, wcodLieuGeog: any, wnatDon: any): Observable<any> {
    return this.http.get(API_URL + "Indemnite/ind/getPersIndVirementScolCloture?soc=" + soc + "&datDebloc=" + datDebloc + "&wcodLieuGeog=" + wcodLieuGeog + "&wnatDon=" + wnatDon);
  }

  execProcFamScol(data: any): Observable<any> {
    return this.http.post(API_URL + "Indemnite/ind/execProcFamScol", data);
  }

  getNatDon(): Observable<any> {
    return this.http.get(API_URL + "Print/personnel/getNatDon");
  }

  getAllLieu(): Observable<any> {
    return this.http.get(API_URL + "Print/personnel/getAllLieu");
  }

  editionEtatIndemnite(numRap: any, soc: any, matDeb: any, matFin: any, datDeb: any, datFin: any, natDon: any) {
    const body = {
      cod_soc: soc,
      mat_deb: matDeb,
      mat_fin: matFin,
      date_deb: datDeb,
      date_fin: datFin,
      nat_don: natDon,
    };

    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }

  editionEtatIndemniteAdherent(numRap: any, soc: any, matDeb: any, matFin: any, datDeb: any, datFin: any, natDon: any) {
    const body = {
      cod_soc: soc,
      mat_deb: matDeb,
      mat_fin: matFin,
      date_deb: datDeb,
      date_fin: datFin,
      nat_don: natDon,
    };

    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }

  editionListIndemnite(numRap: any, soc: any, matDeb: any, matFin: any, datDeb: any, datFin: any, natDon: any, codLieu: any, etatDem: any) {
    const body = {
      cod_soc: soc,
      mat_deb: matDeb,
      mat_fin: matFin,
      date_deb: datDeb,
      date_fin: datFin,
      nat_don: natDon,
      cod_lieu: codLieu,
      etat_dem: etatDem
    };

    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }

  editionListIndemniteDeblc(numRap: any, soc: any, matDeb: any, matFin: any, datDeb: any, datFin: any, natDon: any, etatDem: any, modPay: any, datDeblcDeb: any, datDeblcFin: any) {
    const body = {
      cod_soc: soc,
      mat_deb: matDeb,
      mat_fin: matFin,
      date_deb: datDeb,
      date_fin: datFin,
      nat_don: natDon,
      etat_dem: etatDem,
      mod_pay: modPay,
      datDeblcDeb: datDeblcDeb,
      datDeblcFin: datDeblcFin
    };

    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }

  chekExisteDem(data: any): Observable<any> {
    return this.http.post(API_URL + "Indemnite/ind/chekExisteDem", data);
  }

  generateFile(request: VirCarteRequest): Observable<{ seq?: number; message: string; fileContent: string }> {
    return this.http.post<{ seq?: number; message: string; fileContent: string }>(`${API_URL}Indemnite/virement/generate`, request);
  }

  downloadFileInd(seq: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${API_URL}Indemnite/virement/download/${seq}`, {
      responseType: 'blob',
      observe: 'response'
    });
  }
}

// vir-carte-request.model.ts
export interface VirCarteRequest {
  soc: string;
  datDebloc: string;
  codLieuGeog: string;
  natDon: string;
}