import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { Observable } from 'rxjs';


export const API_URL = environment.urlServer
@Injectable({
  providedIn: 'root'
})
export class ModifCreditService {

  constructor(private http: HttpClient) { }

  getMAxNumVir = (mat: any): Observable<any[]> => {
    const params = new HttpParams().set("mat", mat)
    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/maxNumVir", { params });
  };

  AjoutVirAnticip(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "Credits/ModifCredit/addVirAnticip", data);
  }
  AddEtatPretPers(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "Credits/ModifCredit/AddEtatPretPers", data);
  }
  getAllVirAnticip = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/getAllVirAnticip");
  };
  getEtatPretPers = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/getEtatPretPers");
  };
  getEtatPretPersSusp = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/getEtatPretPersSusp");
  };
  getVirAnticipByMat = (mat: any): Observable<any[]> => {
    const params = new HttpParams().set('mat', mat)
    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/getVirAnticipByMat", { params });
  };
  getVirAnticipInst = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/getVirAnticipInst");
  };
  getnuEtatPret = (soc: any): Observable<any[]> => {
    const params = new HttpParams().set('soc', soc)
    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/getnuEtatPret", { params });
  };
  getPersonnelAnticip = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Credits/Personnel/getPersonnelAnticip/" + soc);
  };
  getPersonnelAnticipByMat = (soc: any, mat: any): Observable<any> => {
    return this.http.get<any>(API_URL + "Credits/Personnel/getPersonnelAnticipByMat/" + soc + "/" + mat);
  };
  getPretAnticip = (soc: any, mat: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat)
    return this.http.get<any>(API_URL + "Credits/ModifCredit/getPretAnticip", { params });
  };
  getPretAnticipByPret = (soc: any, mat: any, codPret: any): Observable<any> => {
    return this.http.get<any>(API_URL + "Credits/ModifCredit/getPretAnticipByPret/" + soc + "/" + mat + "/" + codPret);
  };
  getPretAnticipDetails = (soc: any, mat: any, codPret: any): Observable<any[]> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("codPret", codPret)
    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/getPretAnticipDetails", { params });
  };

  Controller = (wcodSoc: any, wmatPers: any, cod_pret_: any, mois_debut: any, mois_fin: any): Observable<any[]> => {
    const params = new HttpParams().set("wcodSoc", wcodSoc).set("wmatPers", wmatPers).set("cod_pret_", cod_pret_).set("mois_debut", mois_debut).set("mois_fin", mois_fin)
    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/Controller", { params });
  };

  periode_ant_tot = (wcodSoc: any, wmatPers: any, cod_pret_: any): Observable<any> => {
    const params = new HttpParams().set("wcodSoc", wcodSoc).set("wmatPers", wmatPers).set("cod_pret_", cod_pret_)
    return this.http.get<any>(API_URL + "Credits/ModifCredit/periode_ant_tot", { params });
  };
  calcul_ant_part = (wcodSoc: any, wmatPers: any, cod_pret_: any, dat_debut_etat_: any, dat_fin_etat_: any, typ_anticip: any): Observable<any[]> => {
    const params = new HttpParams().set("wcodSoc", wcodSoc).set("wmatPers", wmatPers).set("cod_pret_", cod_pret_).set("dat_debut_etat_", dat_debut_etat_).set("dat_fin_etat_", dat_fin_etat_).set("typ_anticip", typ_anticip)
    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/calcul_ant_part", { params });
  };

  Valider = (wcodSoc: any, wmatPers: any, cod_pret_: any, mod_pay_: any, nat_etat_: any,
    typ_anticip: any, dat_deb_: any, dat_fin_: any, mnt_capital_: any, mnt_anticip_: any,
    mnt_interet_: any, prt_rendu_: any): Observable<any[]> => {
    const params = new HttpParams().set("wcodSoc", wcodSoc).set("wmatPers", wmatPers).set("cod_pret_", cod_pret_).set("mod_pay_", mod_pay_).set("nat_etat_", nat_etat_).set("typ_anticip", typ_anticip).
      set("dat_deb_", dat_deb_).set("dat_fin_", dat_fin_).set("mnt_capital_", mnt_capital_).set("mnt_anticip_", mnt_anticip_).set("mnt_interet_", mnt_interet_).set("prt_rendu_", prt_rendu_)
    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/Valider", { params });
  };

  getLigPRet(soc: any, mat: any, pret: any): Observable<any[]> {

    const params = new HttpParams().set("soc", soc).set("mat", mat).set("pret", pret)
    return this.http.get<any[]>(API_URL + "Credits/Credit/getLigPret", { params });
  }

  reechelonner(wcodSoc: any, wmatPers: any, codPret: any, lPret: any): Observable<any> {

    const params = new HttpParams().set("wcodSoc", wcodSoc).set("wmatPers", wmatPers).set("codPret", codPret).set("lPret", lPret)
    return this.http.get<any>(API_URL + "Credits/ModifCredit/reechelonner", { params });
  }
  reechelonner_2(wcodSoc: any, wmatPers: any, codPret: any): Observable<any> {

    const params = new HttpParams().set("wcodSoc", wcodSoc).set("wmatPers", wmatPers).set("codPret", codPret)
    return this.http.get<any>(API_URL + "Credits/ModifCredit/reechelonner_2", { params });
  }

  getPretReech = (soc: string): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/getPretReech/" + soc);
  };
  getDetailPretReech = (soc: string, mat: string): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/getPretReech/" + soc + "/" + mat);
  };

  getDetailCreditReech(wcodSoc: any, wdatfin: any, wdatretr: any, wprtmntglb: any, wprtech: any, wprttaux: any, wmntreport: any, codGrpPret: any): Observable<any[]> {

    const params = new HttpParams().set("wcodSoc", wcodSoc).set("wdatfin", wdatfin).set("wdatretr", wdatretr).set("wprtmntglb", wprtmntglb).set("wprtech", wprtech).set("wprttaux", wprttaux).set("wmntreport", wmntreport).set("codGrpPret", codGrpPret)
    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/getDetailCreditReech", { params });
  }
  insertRembTranch(wcodSoc: any, wmat_pers: any, wcod_pret: any, wcod_etat_pret: any, wprt_dat_acc: any, wprt_mnt_rem: any, wnbr_tranche: any): Observable<any[]> {

    const params = new HttpParams().set("wcodSoc", wcodSoc).set("wmat_pers", wmat_pers).set("wcod_pret", wcod_pret).set("wcod_etat_pret", wcod_etat_pret).set("wprt_dat_acc", wprt_dat_acc).set("wprt_mnt_rem", wprt_mnt_rem).set("wnbr_tranche", wnbr_tranche)
    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/insertRembTranch", { params });
  }
  calcul_interet(wprt_ech: any, wprt_mnt_glb: any, wprt_taux: any, wprt_mnt_rem: any, wPRT_INTERET: any, wrem_men: any): Observable<any[]> {

    const params = new HttpParams().set("wprt_ech", wprt_ech).set("wprt_mnt_glb", wprt_mnt_glb).set("wprt_taux", wprt_taux).set("wprt_mnt_rem", wprt_mnt_rem).set("wPRT_INTERET", wPRT_INTERET).set("wrem_men", wrem_men)
    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/calcul_interet", { params });
  }

  susp_pret(wcodSoc: any, wmat_pers: any, wcod_pret_ant: any, wcod_pret: any): Observable<any[]> {

    const params = new HttpParams().set("wcodSoc", wcodSoc).set("wmat_pers", wmat_pers).set("wcod_pret_ant", wcod_pret_ant).set("wcod_pret", wcod_pret)
    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/susp_pret", { params });
  }

  getEtatPretSusp(): Observable<any[]> {


    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/getEtatPretSusp");
  }

  getEtatPretSuspByEtat(etat: string): Observable<any> {


    return this.http.get<any>(API_URL + "Credits/ModifCredit/getEtatPretSusp/" + etat);
  }
  ValiderSusp = (wcodSoc: any, wmatPers: any, cod_pret_: any, num_etat_pret: any, etat_pret: any,
    nat_etat: any, typ_anticip: any, dat_deb_: any, dat_fin_: any): Observable<any[]> => {
    const params = new HttpParams().set("wcodSoc", wcodSoc).set("wmatPers", wmatPers).set("cod_pret_", cod_pret_).set("num_etat_pret", num_etat_pret).set("etat_pret", etat_pret).set("nat_etat", nat_etat).
      set("typ_anticip", typ_anticip).set("dat_deb_", dat_deb_).set("dat_fin_", dat_fin_)
    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/ValiderSusp", { params });
  };

  imputationAnticipation(data: { codSoc: string; matPers: string; numVir: number | string; refMetier: string; montVir: number; mntEsp: number; restVir: number }): Observable<any> {
    return this.http.post<any>(API_URL + "Credits/ModifCredit/imputationAnticipation", data);
  }
  getVirementsByMat(codSoc: string, matPers: string): Observable<any[]> {
    const params = new HttpParams().set("codSoc", codSoc).set("matPers", matPers);
    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/getVirementsByMat", { params });
  }
  getDetailCredit(wcodSoc: any, wdatfin: any, wdatretr: any, wprtmntglb: any, wprtech: any, wprttaux: any, wmntreport: any): Observable<any[]> {

    const params = new HttpParams().set("wcodSoc", wcodSoc).set("wdatfin", wdatfin).set("wdatretr", wdatretr).set("wprtmntglb", wprtmntglb).set("wprtech", wprtech).set("wprttaux", wprttaux).set("wmntreport", wmntreport)
    return this.http.get<any[]>(API_URL + "Credits/ModifCredit/getDetailCreditReech", { params });
  }

}

