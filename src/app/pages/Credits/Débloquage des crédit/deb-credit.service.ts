import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

const API_URL = environment.urlServer;
@Injectable({
  providedIn: 'root'
})
export class DebCreditService {

  constructor(private http: HttpClient) { }

  getPersonnelCredit = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Credits/Commission/getPersonnelCredit/" + soc);
  };
  getPersonnelCreditByMat = (soc: any, mat: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Credits/Commission/getPersonnelCreditByMat/" + soc + "/" + mat);
  };
  getPersonnelsCredit = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Credits/Personnel/getPersonnels");
  };
  getOrgPret = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Credits/Credit/orgPret");
  };
  getDetailPret = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Credits/Credit/getDetailPret/" + soc);
  };
  getGroupePret = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Credits/Credit/getGroupePret/" + soc);
  };
  getLigPretRegManuel(soc: any, mois: any, filtre: any, corps: any, grpPret: any): Observable<any[]> {

    const params = new HttpParams().set("soc", soc).set("mois", mois).set("filtre", filtre).set("corps", corps).set("grpPret", grpPret)
    return this.http.get<any[]>(API_URL + "Credits/Credit/getLigPretReg", { params });
  }
  verif_dat_acc(codSoc: any, mat_: any, wcodGrpPret: any, wtypPret: any, wdatEmb: any, wDatAcc: any): Observable<any[]> {

    const params = new HttpParams().set("codSoc", codSoc).set("mat_", mat_).set("wcodGrpPret", wcodGrpPret).set("wtypPret", wtypPret).set("wdatEmb", wdatEmb).set("wDatAcc", wDatAcc)
    return this.http.get<any[]>(API_URL + "Credits/Credit/verifDatAcc", { params });
  }

  verif_dat_deb(codSoc: any, wprtEch: any, prt_dat_acc: any, wdatDeb: any, wdatRetr: any): Observable<any[]> {

    const params = new HttpParams().set("codSoc", codSoc).set("wprtEch", wprtEch).set("prt_dat_acc", prt_dat_acc).set("wdatDeb", wdatDeb).set("wdatRetr", wdatRetr)
    return this.http.get<any[]>(API_URL + "Credits/Credit/verifDatDeb", { params });
  }

  calcul_detail_credit(wcodSoc: any, wdatfin: any, wdatretr: any, wprtmntglb: any, wprtech: any, wprttaux: any, wmntreport: any, codGrpPret: any): Observable<any[]> {

    const params = new HttpParams().set("wcodSoc", wcodSoc).set("wdatfin", wdatfin).set("wdatretr", wdatretr).set("wprtmntglb", wprtmntglb).set("wprtech", wprtech).set("wprttaux", wprttaux).set("wmntreport", wmntreport).set("codGrpPret", codGrpPret)
    return this.http.get<any[]>(API_URL + "Credits/Credit/getDetailCredit", { params });
  }
  verif_pret_cours(wcodSoc: any, wmatPers: any, wcodGrpPret: any, wtypPret: any, prtDatDeb: any): Observable<any[]> {

    const params = new HttpParams().set("wcodSoc", wcodSoc).set("wmatPers", wmatPers).set("wcodGrpPret", wcodGrpPret).set("wtypPret", wtypPret).set("prtDatDeb", prtDatDeb)
    return this.http.get<any[]>(API_URL + "Credits/Credit/verifPretCours", { params });
  }
  deletPrt(wcodSoc: string, wmatPers: string, codPret: number): Observable<any> {
    const body = { wcodSoc, wmatPers, codPret };
    return this.http.post<any>(API_URL + "Credits/Credit/deletElement", body);
  }


  verif_pret_coursreech(codSoc: any, matPers: any, codPret: any, codPretAnt: any, codGrpPret: any, typPret: any): Observable<any[]> {

    const params = new HttpParams().set("codSoc", codSoc).set("matPers", matPers).set("codPret", codPret).set("codPretAnt", codPretAnt).set("codGrpPret", codGrpPret).set("typPret", typPret)
    return this.http.get<any[]>(API_URL + "Credits/Credit/calc_mnt_pret_ant", { params });
  }

  insertRembTranch(wcodSoc: any, wmat_pers: any, wcod_pret: any, wcod_etat_pret: any, wprt_dat_acc: any, wprt_mnt_rem: any, wnbr_tranche: any): Observable<any[]> {

    const params = new HttpParams().set("wcodSoc", wcodSoc).set("wmat_pers", wmat_pers).set("wcod_pret", wcod_pret).set("wcod_etat_pret", wcod_etat_pret).set("wprt_dat_acc", wprt_dat_acc).set("wprt_mnt_rem", wprt_mnt_rem).set("wnbr_tranche", wnbr_tranche)
    return this.http.get<any[]>(API_URL + "Credits/Credit/insertRembTranch", { params });
  }
  insertLigPret(soc: any, wmat_pers: any, wcod_pret: any, wprt_dat_deb: any, wprt_dat_fin: any, wprt_interet: any, wprt_ech: any, wprt_mnt_rem: any, wrem_men: any, wdern_rem_men: any): Observable<any[]> {

    const params = new HttpParams().set("soc", soc).set("wmat_pers", wmat_pers).set("wcod_pret", wcod_pret).set("wprt_dat_deb", wprt_dat_deb).set("wprt_dat_fin", wprt_dat_fin).set("wprt_interet", wprt_interet)
      .set("wprt_ech", wprt_ech).set("wprt_mnt_rem", wprt_mnt_rem).set("wrem_men", wrem_men).set("wdern_rem_men", wdern_rem_men)
    return this.http.get<any[]>(API_URL + "Credits/Credit/insertLigPret", { params });
  }
  AjoutCredit(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "Credits/Credit/ajoutCredit", data);
  }
  AjoutPiece(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "Credits/Credit/addPiece", data);
  }
  getValidCommission = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Credits/Commission/getCommissionValider/" + soc);
  };

  getMaxPret = (soc: any, mat: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Credits/Credit/maxPret/" + soc + "/" + mat);
  };
  getPretEnCours = (soc: string, mat: string): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Credits/Credit/getPretEnCours/" + soc + "/" + mat);
  };

  getPretEnCoursLov(soc: string, mat?: string, nom?: string, numComm?: string, etat?: string, codPret?: string, modRemb?: string, datSaisie?: string, numRetr?: string): Observable<any[]> {
    let params = new HttpParams().set('soc', soc);
    if (mat) params = params.set('mat', mat);
    if (nom) params = params.set('nom', nom);
    if (numComm) params = params.set('numComm', numComm);
    if (etat) params = params.set('etat', etat);
    if (codPret) params = params.set('codPret', codPret);
    if (modRemb) params = params.set('modRemb', modRemb);
    if (datSaisie) params = params.set('datSaisie', datSaisie);
    if (numRetr) params = params.set('numRetr', numRetr);

    return this.http.get<any[]>(API_URL + "Credits/Credit/en-cours-lov", { params });
  }

  getPretValid = (soc: string): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Credits/Credit/getPretValid/" + soc);
  };
  getPretDelet = (soc: string): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Credits/Credit/getPretDelet/" + soc);
  };
  getPretDebl = (soc: string): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Credits/Credit/getPretDebl/" + soc);
  };
  getPiecePretPers = (soc: string, mat: string, pret: string): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Credits/Credit/getPiecePret/" + soc + "/" + mat + "/" + pret);
  };
  getLigPRet(soc: any, mat: any, pret: any): Observable<any[]> {

    const params = new HttpParams().set("soc", soc).set("mat", mat).set("pret", pret)
    return this.http.get<any[]>(API_URL + "Credits/Credit/getLigPret", { params });
  }

  // ------------------------
  // lig-pret.service.ts
  // ------------------------

  updateListLigPret(listLigPret: any[], options?: any) {
    return this.http.put(API_URL + "Credits/Credit/updateRegPret", listLigPret, { responseType: 'text' });
  }

  getEtatPret(): Observable<any[]> {


    return this.http.get<any[]>(API_URL + "Credits/Credit/getEtatPret");
  }


  upLigPret(
    soc: any,
    mat: string,
    codPret: string,
    lpret: string,
    reg: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('soc', soc)
      .set('mat', mat)
      .set('codPret', codPret)
      .set('lpret', lpret);

    return this.http.put(`${API_URL}Credits/Credit/reglerLigPret/${reg}`, null, { params });
  }

  getDiskPret(
    mat: string,
    corps: string,
    mois: string,
    codPret: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('mat', mat)
      .set('corps', corps)
      .set('mois', mois)
      .set('codPret', codPret);
    console.log("params :", params)
    return this.http.get(`${API_URL}Credits/Credit/getDiskPret`, { params });
  }

  ValiderAutomatique(
    wcodSoc: string,
    wmatPers: string,
    wcodGrpPret: string,
    corps: string,
    mois: string
  ): Observable<any> {
    const params = new HttpParams()
      .set("wcodSoc", wcodSoc)
      .set('wmatPers', wmatPers)
      .set('wcodGrpPret', wcodGrpPret)
      .set('corps', corps)
      .set('mois', mois);
    console.log("params :", params)
    return this.http.get(`${API_URL}Credits/Credit/maj_lig_pret`, { params });
  }

  downloadFile() {
    return this.http.get(API_URL + "Credits/Credit/download-file", {
      responseType: 'blob' as 'json' // Blob pour gérer les fichiers binaires
    });
  }

  vir_carte(
    wcodSoc: string,
    num_comm_: string,
    dat_deblc: string,

  ): Observable<any> {
    const params = new HttpParams()
      .set("wcodSoc", wcodSoc)
      .set('num_comm_', num_comm_)
      .set('dat_deblc', dat_deblc);
    console.log("params :", params)
    return this.http.get(`${API_URL}Credits/Credit/vir_carte`, { params });
  }
  deblocage_carte(
    wcodSoc: string,
    dat_deblc: string,
    num_comm_: string,
    refMetier: string,
    datOp: string
  ): Observable<any> {

    const params = new HttpParams()
      .set('wcodSoc', wcodSoc)
      .set('dat_deblc', dat_deblc)
      .set('num_comm_', num_comm_)
      .set('refMetier', refMetier)
      .set('datOp', datOp);

    console.log(' Deblocage Carte params:', params.toString());

    return this.http.get<any>(
      `${API_URL}Credits/Credit/deblocage_carte`,
      { params }
    );
  }


  generateFile(request: VirCartePretRequest): Observable<{ seq?: number; message: string; errorDetails?: string }> {
    return this.http.post<{ seq?: number; message: string; errorDetails?: string }>(`${API_URL}Credits/Credit/generate`, request);
  }


  downloadFilePret(seq: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${API_URL}Credits/Credit/download/${seq}`, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  checkPret(mat: string, codGrp: string) {
    return this.http.get<boolean>(
      `${API_URL}Credits/Credit/checkExistPret`,
      { params: { mat, codGrp } }
    );
  }
  anticipPret(
    soc: string,
    mat: string,
    cod: number,
    codAnt: number
  ) {
    return this.http.post(
      `${API_URL}Credits/Credit/anticip`,
      null,
      {
        params: {
          soc,
          mat,
          cod,
          codAnt
        }
      }
    );
  }

}
export interface VirCartePretRequest {
  soc: any;
  datDebloc: any;
  numComm: any;
  idFile: any;
}