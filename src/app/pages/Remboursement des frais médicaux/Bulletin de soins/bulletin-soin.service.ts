import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, Observable, of } from 'rxjs';

import { environment } from 'src/environments/environment';
const API_URL = environment.urlServer;
@Injectable({
  providedIn: 'root'
})
export class BulletinSoinService {

  constructor(private http: HttpClient) { }


  getDatNais(soc: any, mat: any, num_fam: any) {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", num_fam)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getDatNaiss", { params })
  }

  getSexe(soc: any, mat: any, numFam: any) {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getDatSexe", { params })
  }

  get_duree_bulletin(wdat_soin: any, wCOD_ASSUR: any) {
    const params = new HttpParams().set("wdat_soin", wdat_soin).set("wCOD_ASSUR", wCOD_ASSUR)
    return this.http.get<any>(API_URL + "Remb/BultSoin/get_duree_bulletin", { params })
  }

  get_plafond_mutuelle(soc: any, mat: any, wdat_soin: any, datNais: any, datSaisie: any) {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("wdat_soin", wdat_soin).set("datNais", datNais).set("datSaisie", datSaisie)
    return this.http.get<any>(API_URL + "Remb/BultSoin/get_plafond_mutuelle", { params })
  }
  get_plafond_cnam(soc: any, mat: any, wdat_soin: any, datNais: any, codAssur: any, datSaisie: any) {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("wdat_soin", wdat_soin).set("datNais", datNais).set("codAssur", codAssur).set("datSaisie", datSaisie)
    return this.http.get<any>(API_URL + "Remb/BultSoin/get_plafond_cnam", { params })
  }
  getPersonnelBultSoin = (soc: any): Observable<any[]> => {
    const params = new HttpParams().set("soc", soc)
    return this.http.get<any[]>(API_URL + "Remb/Personnel/getPersonnelBultSoin", { params });
  };
  getAdherent = (soc: any, mat: any): Observable<any[]> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat)
    return this.http.get<any[]>(API_URL + "Remb/Personnel/getAdherent", { params });
  };

  getNbreBult = (codAssur: any, numSoin: any): Observable<any> => {
    const params = new HttpParams().set("codAssur", codAssur).set("numSoin", numSoin)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getNbreBult", { params });
  };
  getListEtablisPec = (soc: any, mat: any, numFam: any, datSoin: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getListEtablisPec", { params });
  };

  getPersCons = (soc: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getPersCons", { params });
  };
  getBultSoin = (): Observable<any> => {

    return this.http.get<any>(API_URL + "Remb/BultSoin/getBultSoin");
  };


  getBultMut = (soc: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getBultMut", { params });
  }
  getBultSoinCons = (mat?: string, num_fam?: string, dat_soin?: string): Observable<any> => {
    let params: any = {};

    if (mat) params['mat'] = mat;
    if (num_fam) params['num_fam'] = num_fam;
    if (dat_soin) params['dat_soin'] = dat_soin;
    return this.http.get<any>(API_URL + "Remb/BultSoin/getBultSoinCons", { params });
  };

  getBultCnamCons = (mat?: string, num_fam?: string, dat_soin?: string): Observable<any> => {
    let params: any = {};

    if (mat) params['mat'] = mat;
    if (num_fam) params['num_fam'] = num_fam;
    if (dat_soin) params['dat_soin'] = dat_soin;
    return this.http.get<any>(API_URL + "Remb/BultSoin/getBultCnamCons", { params });
  };
  getLigBult = (soc: any, mat: any, numFam: any, datSoin: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getLigBult", { params });
  };
  getLigBultCons = (soc: any, mat: any, numFam: any, datSoin: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getLigBultCons", { params });
  };
  getActe = (codFil: any, codAssur: any, parente: any, sexe: any): Observable<any> => {
    const params = new HttpParams().set("codFil", codFil).set("codAssur", codAssur).set("parente", parente).set("sexe", sexe)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getAct", { params });
  };

  calculer_montant_net = (soc: any, mat: any, codFil: any, codAssur: any, abrvAct: any, datSoin: any, mntHnor: any, indice: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("mntHnor", mntHnor).set("codAssur", codAssur)
      .set("abrvAct", abrvAct).set("datSoin", datSoin).set("codFil", codFil).set("indice", indice)
    return this.http.get<any>(API_URL + "Remb/BultSoin/calculer_montant_net", { params });
  };

  getRefPhysique = (refTyp: any): Observable<any[]> => {
    const params = new HttpParams().set("refTyp", refTyp)
    return this.http.get<any[]>(API_URL + "Remb/BultSoin/refEtablis", { params });
  };
  getRefPhysiqueByCode = (prfCod: any, refTyp: any): Observable<any> => {
    const params = new HttpParams().set("prfCod", prfCod).set("refTyp", refTyp)
    return this.http.get<any[]>(API_URL + "Remb/BultSoin/refEtablisByCode", { params });
  };
  addBultSoin(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "Remb/BultSoin/addBultSoin", data);
  }

  addLigBult(data: any): Observable<any[]> {
    return this.http.post<any[]>(API_URL + "Remb/BultSoin/addLigBult", data);
  }

  getAllActe = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Remb/BultSoin/getAllActe");
  };

  getMed = (codFil: any, codAssur: any): Observable<any[]> => {
    const params = new HttpParams().set("codFil", codFil).set("codAssur", codAssur)
    return this.http.get<any[]>(API_URL + "Remb/BultSoin/getMed", { params });
  };

  getLigPhar = (soc: any, mat: any, numFam: any, datSoin: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getLigPhar", { params });
  };
  getLigPharCons = (soc: any, mat: any, numFam: any, datSoin: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getLigPharCons", { params });
  };
  addLigPhar(data: any): Observable<any[]> {
    return this.http.post<any[]>(API_URL + "Remb/BultSoin/addLigPhar", data);
  }
  addBultArriver(data: any): Observable<any[]> {
    return this.http.post<any[]>(API_URL + "Remb/BordArriv/saveBultArrive", data);
  }

  addBBordArriver(data: any): Observable<any[]> {
    return this.http.post<any[]>(API_URL + "Remb/BordArriv/saveBordArrive", data);
  }
  verif_indice = (abrv_act_: any, cod_fil_: any, cod_assur_: any, indice: any): Observable<any> => {
    const params = new HttpParams().set("abrv_act_", abrv_act_).set("cod_fil_", cod_fil_).set("cod_assur_", cod_assur_).set("indice", indice)
    return this.http.get<any>(API_URL + "Remb/BultSoin/verif_indice", { params });
  };

  verif_vign = (abrv_act_: any, cod_fil_: any, cod_assur_: any, mnt_honor_: any, nbr_vign_: any): Observable<any> => {
    const params = new HttpParams().set("abrv_act_", abrv_act_).set("cod_fil_", cod_fil_).set("cod_assur_", cod_assur_).set("mnt_honor_", mnt_honor_).set("nbr_vign_", nbr_vign_)
    return this.http.get<any>(API_URL + "Remb/BultSoin/verif_vign", { params });
  };

  verif_piece = (abrv_act_: any, cod_fil_: any, cod_assur_: any, mnt_honor_: any, nbr_piece_: any): Observable<any> => {
    const params = new HttpParams().set("abrv_act_", abrv_act_).set("cod_fil_", cod_fil_).set("cod_assur_", cod_assur_).set("mnt_honor_", mnt_honor_).set("nbr_piece_", nbr_piece_)
    return this.http.get<any>(API_URL + "Remb/BultSoin/verif_piece", { params });
  };

  deleteLigBult(soc: any, mat: any, fam: any, datSoin: any, abrv: any, numLig: any) {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("fam", fam).set("datSoin", datSoin).set("abrv", abrv).set("numLig", numLig)
    return this.http.delete<any>(API_URL + "Remb/BultSoin/deleteLigBult", { params })
  }

  deleteLigPhar(soc: any, mat: any, fam: any, datSoin: any, med: any, numLig: any) {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("fam", fam).set("datSoin", datSoin).set("med", med).set("numLig", numLig)
    return this.http.delete<any>(API_URL + "Remb/BultSoin/deleteLigPhar", { params })
  }
  getRegimeRemb = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Remb/BultSoin/getRegimeRemb")
  }

  vetif_mod_remb = (soc: any, mat: any, numFam: any, datSoin: any, reg_remb_: any, parente: any, sexe: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin).set("reg_remb_", reg_remb_).set("parente", parente)
      .set("sexe", sexe)
    return this.http.get<any>(API_URL + "Remb/BultSoin/vetif_mod_remb", { params });
  }

  getVisite = (parente: any, sexe: any, codFil: any, codAssur: any): Observable<any> => {
    const params = new HttpParams().set("parente", parente).set("sexe", sexe).set("codFil", codFil).set("codAssur", codAssur)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getVisit", { params });
  }
  getVisitManuel = (codFil: any, codAssur: any): Observable<any> => {
    const params = new HttpParams().set("codFil", codFil).set("codAssur", codAssur)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getVisitManuel", { params });
  }
  getAppareil = (codFil: any, codAssur: any): Observable<any> => {
    const params = new HttpParams().set("codFil", codFil).set("codAssur", codAssur)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getAppareil", { params });
  }
  getActes = (parente: any, sexe: any, codFil: any, codAssur: any): Observable<any> => {
    const params = new HttpParams().set("parente", parente).set("sexe", sexe).set("codFil", codFil).set("codAssur", codAssur)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getActes", { params });
  }
  getActesManuel = (codFil: any, codAssur: any): Observable<any> => {
    const params = new HttpParams().set("codFil", codFil).set("codAssur", codAssur)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getActesManuel", { params });
  }
  getMeds = (codFil: any, codAssur: any): Observable<any> => {
    const params = new HttpParams().set("codFil", codFil).set("codAssur", codAssur)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getMeds", { params });
  }
  calculer_montant_net_app = (soc: any, mat: any, numFam: any, datSoin: any, mntHnor: any, codApp: any, MutMntNet: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin).set("mntHnor", mntHnor).set("codApp", codApp)
      .set("MutMntNet", MutMntNet)
    return this.http.get<any>(API_URL + "Remb/BultSoin/calculer_montant_net_app", { params });
  }

  calculer_montant_net_visit = (soc: any, mat: any, codVisit: any, mntHnor: any, datSoin: any, prixVisit: any, tauxRemb: any, sauvNet: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("codVisit", codVisit).set("mntHnor", mntHnor).set("datSoin", datSoin).set("prixVisit", prixVisit)
      .set("tauxRemb", tauxRemb).set("sauvNet", sauvNet)
    return this.http.get<any>(API_URL + "Remb/BultSoin/calculer_montant_net_visit", { params });
  }

  calculer_montant_net_act = (soc: any, mat: any, codAct: any, mntHnor: any, datSoin: any, actPrix: any, tauxAct: any, cumulNet: any, sauvNet: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("codAct", codAct).set("mntHnor", mntHnor).set("datSoin", datSoin).set("actPrix", actPrix)
      .set("tauxAct", tauxAct).set("cumulNet", cumulNet).set("sauvNet", sauvNet)
    return this.http.get<any>(API_URL + "Remb/BultSoin/calculer_montant_net_act", { params });
  }

  calculer_montant_net_med = (soc: any, mat: any, codMed: any, mntHnor: any, datSoin: any, prixRemb: any, indice: any, cumulNet: any, sauvNet: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("codMed", codMed).set("mntHnor", mntHnor).set("datSoin", datSoin).set("prixRemb", prixRemb)
      .set("indice", indice).set("cumulNet", cumulNet).set("sauvNet", sauvNet)
    return this.http.get<any>(API_URL + "Remb/BultSoin/calculer_montant_net_med", { params });
  }

  addAllLigBult(dataVisit: any, dataAct: any, dataMed: any, dataApp: any): Observable<any> {
    return forkJoin({
      visit: this.http.post<any[]>(API_URL + "Remb/BultSoin/addLigBultVisit", dataVisit).pipe(
        catchError(error => {
          console.error("Erreur Visit:", error);
          return of({ error: true, message: "Erreur Visit", details: error });
        })
      ),
      act: this.http.post<any[]>(API_URL + "Remb/BultSoin/addLigBultAct", dataAct).pipe(
        catchError(error => {
          console.error("Erreur Act:", error);
          return of({ error: true, message: "Erreur Act", details: error });
        })
      ),
      med: this.http.post<any[]>(API_URL + "Remb/BultSoin/addLigBultMed", dataMed).pipe(
        catchError(error => {
          console.error("Erreur Med:", error);
          return of({ error: true, message: "Erreur Med", details: error });
        })
      ),
      app: this.http.post<any[]>(API_URL + "Remb/BultSoin/addLigBultApp", dataApp).pipe(
        catchError(error => {
          console.error("Erreur App:", error);
          return of({ error: true, message: "Erreur App", details: error });
        })
      )
    });
  }
  addAllLigBultArriver(dataVisit: any, dataAct: any, dataMed: any, dataApp: any): Observable<any> {
    return forkJoin({
      visit: this.http.post<any>(API_URL + "Remb/BordArriv/addLigVisitArriver", dataVisit),
      act: this.http.post<any>(API_URL + "Remb/BordArriv/addLigActArriver", dataAct),
      med: this.http.post<any>(API_URL + "Remb/BordArriv/addLigMedArriver", dataMed),
      app: this.http.post<any>(API_URL + "Remb/BordArriv/addLigAppArriver", dataApp)
    });
  }

  getNumLigMed = (soc: any, mat: any, numFam: any, datSoin: any, codMed: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin).set("codMed", codMed)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getNumLigMed", { params });
  }
  getNumLigAct = (soc: any, mat: any, numFam: any, datSoin: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getNumLigAct", { params });
  }
  getNumLigApp = (soc: any, mat: any, numFam: any, datSoin: any, codApp: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin).set("codApp", codApp)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getNumLigApp", { params });
  }

  getBultCnam = (soc: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getBultCnam", { params });
  }

  getLigBultAct = (soc: any, mat: any, numFam: any, datSoin: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getLigBultAct", { params });
  }
  getLigBultActCons = (soc: any, mat: any, numFam: any, datSoin: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getLigBultActCons", { params });
  }
  getLigBultVisit = (soc: any, mat: any, numFam: any, datSoin: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getLigBultVisit", { params });
  }
  getLigBultVisitCons = (soc: any, mat: any, numFam: any, datSoin: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getLigBultVisitCons", { params });
  }
  getLigBultMed = (soc: any, mat: any, numFam: any, datSoin: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getLigBultMed", { params });
  }
  getLigBultMedCons = (soc: any, mat: any, numFam: any, datSoin: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getLigBultMedCons", { params });
  }
  getLigBultApp = (soc: any, mat: any, numFam: any, datSoin: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getLigBultApp", { params });
  }

  getLigBultAppCons = (soc: any, mat: any, numFam: any, datSoin: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getLigBultAppCons", { params });
  }
  deleteLigBultAct(soc: any, mat: any, fam: any, datSoin: any, abrv: any, numLig: any, datAct: any, codAct: any) {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("fam", fam).set("datSoin", datSoin).set("abrv", abrv)
      .set("numLig", numLig).set("datAct", datAct).set("codAct", codAct)
    return this.http.delete<any>(API_URL + "Remb/BultSoin/deleteLigBultAct", { params })
  }

  deleteLigBultVisit(soc: any, mat: any, fam: any, datSoin: any, abrv: any, numLig: any, datAct: any, codVisit: any) {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("fam", fam).set("datSoin", datSoin).set("abrv", abrv)
      .set("numLig", numLig).set("datAct", datAct).set("codVisit", codVisit)
    return this.http.delete<any>(API_URL + "Remb/BultSoin/deleteLigBultVisit", { params })
  }

  deleteLigBultApp(soc: any, mat: any, fam: any, datSoin: any, abrv: any, numLig: any, codApp: any) {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("fam", fam).set("datSoin", datSoin).set("abrv", abrv)
      .set("numLig", numLig).set("codApp", codApp)
    return this.http.delete<any>(API_URL + "Remb/BultSoin/deleteLigBultApp", { params })
  }
  deleteLigBultMed(soc: any, mat: any, fam: any, datSoin: any, abrv: any, numLig: any, codMed: any) {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("fam", fam).set("datSoin", datSoin).set("abrv", abrv)
      .set("numLig", numLig).set("codMed", codMed)
    return this.http.delete<any>(API_URL + "Remb/BultSoin/deleteLigBultMed", { params })
  }

  existeLigBult(cle: any) {
    return this.http.post<boolean>(API_URL + "Remb/BultSoin/existeLigBult", cle);
  }
  existeLigPhar(data: any) {
    return this.http.post<boolean>(API_URL + "Remb/BultSoin/existeLigPhar", data);
  }
  existeLigBultAct(data: any) {
    return this.http.post<boolean>(API_URL + "Remb/BultSoin/existeLigBultAct", data);
  }
  existeLigBultVisit(data: any) {
    return this.http.post<boolean>(API_URL + "Remb/BultSoin/existeLigBultVisit", data);
  }
  existeLigBultApp(data: any) {
    return this.http.post<boolean>(API_URL + "Remb/BultSoin/existeLigBultApp", data);
  }
  existeLigBultMed(data: any) {
    return this.http.post<boolean>(API_URL + "Remb/BultSoin/existeLigBultMed", data);
  }
}
