import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, forkJoin, map, Observable, of, switchMap } from "rxjs";
import { LovNumFilCnamLibre, PageResponse } from "./sais-man-dcpt-libr-cnam/sais-man-dcpt-libr-cnam.component";
import { environment } from "src/environments/environment";
import { TokenStorage } from "src/app/account/token-storage.service";

export const API_URL = environment.urlServer || environment.urlServer;
@Injectable({
  providedIn: "root",
})

export class ReceptionRemboursementService {

  ///// variable globales 
  cod_soc: string | null = null;

  // constructor do not ovverride this method
  constructor(private http: HttpClient, private tokenStorage : TokenStorage) {
    this.cod_soc = this.tokenStorage.getUser().codSoc
  }

  getAllBordArriver = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Remb/Remboursement/BordArriver");
  };

  getAllBordEnvoi = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Remb/Remboursement/BordEnvoiEntete/" + soc);
  };
  getBordArriverById = (cod_bord: any): Observable<any> => {
    return this.http.get<any>
      (API_URL + "Remb/Remboursement/BordArriver/" + cod_bord
      );
  };
  getAllBordEnvoiCnam = (cod_soc: string): Observable<any[]> => {
    const params = new HttpParams().set('cod_soc', cod_soc);
    return this.http.get<any[]>(API_URL + "Remb/BordEnvoi/getAllBordEnvoi", { params });
  };

  getBordEnvoiDetails = (cod_bord: string, dat_bord: string): Observable<any> => {
    const params = new HttpParams()
      .set('codBord', cod_bord)
      .set('datBord', dat_bord);  // Send as-is (dd/MM/yyyy format)
    return this.http.get<any>(API_URL + "Remb/BordEnvoi/getBord", { params });
  };
  getAllBultArriver = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Remb/Remboursement/BordArriver");
  };
  getcodBordArriver = (cod_bord: string): Observable<any> => {
    const params = new HttpParams()
      .set('bord', cod_bord)
    return this.http.get<any>(API_URL + "Remb/BordArriv/getcodBordArriver", { params });
  };

  getBultArriverById(cod_soc: string, mat_pers: string, num_fam: number, dat_soin: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
      .set('mat_pers', mat_pers)
      .set('num_fam', num_fam.toString())
      .set('dat_soin', dat_soin);

    return this.http.get<any>(API_URL + "Remb/BordArriv/BultArriverById", { params });
  }


  geLigActArriverById(cod_soc: string, mat_pers: string, num_fam: number, dat_soin: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
      .set('mat_pers', mat_pers)
      .set('num_fam', num_fam.toString())
      .set('dat_soin', dat_soin);

    return this.http.get<any>(API_URL + "Remb/BordArriv/LigActArriverById", { params });
  }

  LigAppArriverById(cod_soc: string, mat_pers: string, num_fam: number, dat_soin: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
      .set('mat_pers', mat_pers)
      .set('num_fam', num_fam.toString())
      .set('dat_soin', dat_soin);

    return this.http.get<any>(API_URL + "Remb/BordArriv/LigAppArriverById", { params });
  }

  LigMedArriverById(cod_soc: string, mat_pers: string, num_fam: number, dat_soin: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
      .set('mat_pers', mat_pers)
      .set('num_fam', num_fam.toString())
      .set('dat_soin', dat_soin);

    return this.http.get<any>(API_URL + "Remb/BordArriv/LigMedArriverById", { params });
  }

  LigVisitArriverById(cod_soc: string, mat_pers: string, num_fam: number, dat_soin: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
      .set('mat_pers', mat_pers)
      .set('num_fam', num_fam.toString())
      .set('dat_soin', dat_soin);

    return this.http.get<any>(API_URL + "Remb/BordArriv/LigVisitArriverById", { params });
  }

  getLigBultArriver(cod_soc: string, mat_pers: string, num_fam: number, dat_soin: string): Observable<any> {
    const params = new HttpParams()
      .set('soc', cod_soc)
      .set('mat', mat_pers)
      .set('numFam', num_fam.toString())
      .set('datSoin', dat_soin);

    return this.http.get<any>(API_URL + "Remb/BordArriv/getLigBultArriver", { params });
  }


  getBultArriverByCodBord(cod_bord: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', this.cod_soc ?? '')
      .set('cod_bord', cod_bord);

    console.log('params', params);

    return this.http.get<any>(API_URL + "Remb/Remboursement/BultArriverByCodBord", { params });
  }
  getBultArriverByCodBord2(cod_bord: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_bord', cod_bord);

    return this.http.get<any>(API_URL + "Remb/Remboursement/BultArriverByCodBord2", { params });
  }

  getBultArriverByCodBord4(cod_bord: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_bord', cod_bord);

    return this.http.get<any>(API_URL + "Remb/Remboursement/BultArriverByCodBord4", { params });
  }


  getControleBordCnam(cod_soc: string, cod_bord: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc).set('cod_bord', cod_bord);

    return this.http.get<any>(API_URL + "Remb/Remboursement/ControleBordCnam", { params });
  }

  getAllEnvoiBordEnvoi = (cod_soc: string): Observable<any[]> => {
    const params = new HttpParams()
      .set('soc', cod_soc)
    return this.http.get<any[]>(API_URL + "Remb/BultSoin/getBordtCnam", { params });
  };
  getBultCnam = (soc: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getBultCnam", { params });
  }
  EnteteSaisieLibreCnam = (cod_soc: string): Observable<any[]> => {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
    return this.http.get<any[]>(API_URL + "Remb/Remboursement/EnteteSaisieLibreCnam", { params });
  };
  EnteteSaisieBordArriverManuLibreCnam = (cod_soc: string): Observable<any[]> => {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
    return this.http.get<any[]>(API_URL + "Remb/Remboursement/EnteteSaisieBordArriverManuLibreCnam", { params });
  };
  EnteteCalCompteLibreCnam = (cod_soc: string): Observable<any[]> => {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
    return this.http.get<any[]>(API_URL + "Remb/Remboursement/EnteteCalCompteLibreCnam", { params });
  };

  GetAllBordArriver = (cod_soc: string): Observable<any[]> => {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
    return this.http.get<any[]>(API_URL + "Remb/Remboursement/GetAllBordArriver", { params });
  };


  GetAllAssurance() {
    return this.http.get(API_URL + "referentiel/Parametrage/Assurance");
  }

  AjouterBordereau(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "Remb/Remboursement/EnteteSaisieBordArriverManuCnam", data);
  }

  AjouterBultArriver(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "Remb/Remboursement/BultArriver", data);
  }

  getListPersonnelBultSoin(cod_soc: string, cod_assur: string, cod_bord: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
      .set('cod_bord', cod_bord)
      .set('cod_assur', cod_assur);

    return this.http.get<any>(API_URL + "Remb/Personnel/getPersonnelBultSoinSaisie", { params });

  }

  getPersonnelBultSoinSaisieLibre(cod_soc: string, cod_assur: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
      .set('ass', cod_assur);

    return this.http.get<any>(API_URL + "Remb/Personnel/getPersonnelBultSoinSaisieLibre", { params });

  }
  getPersonnelBultSoinSaisieCnam(cod_soc: string, cod_assur: string, cod_bord: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
      .set('ass', cod_assur)
      .set('cod_bord', cod_bord);

    return this.http.get<any>(API_URL + "Remb/Personnel/getPersonnelBultSoinSaisieCnam", { params });

  }

  getListPersonnelBultSoinFil(cod_soc: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc);

    return this.http.get<any>(API_URL + "Remb/Personnel/getPersonnelBultSoinSaisie", { params });
  }
  getListFamillePersonnelBultSoin(cod_soc: string, mat_pers: string, cod_bord: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
      .set('mat_pers', mat_pers)
      .set('cod_bord', cod_bord);

    return this.http.get<any>(API_URL + "Remb/Personnel/getFamillePersonnelBultSoinSaisie", { params });
  }
  getListAdherentFamille(cod_soc: string, mat_pers: string, num_fam: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
      .set('mat_pers', mat_pers)
      .set('num_fam', num_fam);

    return this.http.get<any>(API_URL + "Remb/Personnel/getListAdherentFamille", { params });
  }

  getListFamillePersonnelBultSoinLibre(cod_soc: string, mat_pers: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
      .set('pers', mat_pers)
    return this.http.get<any>(API_URL + "Remb/Personnel/getListFamillePersonnelBultSoinLibre", { params });
  }
  GetAllRegimeRemb() {
    return this.http.get(API_URL + "Remb/BultSoin/getRegimeRemb");
  }

  getBultArriveLibrCnam(cod_bord: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_bord', cod_bord);

    return this.http.get<any>(API_URL + "Remb/Remboursement/BultArriveLibrCnam", { params });
  }
  getNumLigAct = (soc: any, mat: any, numFam: any, datSoin: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getNumLigAct", { params });
  }

  getNumLigMed = (soc: any, mat: any, numFam: any, datSoin: any, codMed: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin).set("codMed", codMed)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getNumLigMed", { params });
  }

  getNumLigApp = (soc: any, mat: any, numFam: any, datSoin: any, codApp: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("numFam", numFam).set("datSoin", datSoin).set("codApp", codApp)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getNumLigApp", { params });
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

  existeLigActArriver(data: any) {
    return this.http.post<boolean>(API_URL + "Remb/BordArriv/existeLigActArriver", data);
  }
  existeLigVisitArriver(data: any) {
    return this.http.post<boolean>(API_URL + "Remb/BordArriv/existeLigVisitArriver", data);
  }
  existeLigAppArriver(data: any) {
    return this.http.post<boolean>(API_URL + "Remb/BordArriv/existeLigAppArriver", data);
  }
  existeLigMedArriver(data: any) {
    return this.http.post<boolean>(API_URL + "Remb/BordArriv/existeLigMedArriver", data);
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



  calculer_montant_net_med = (soc: any, mat: any, codMed: any, mntHnor: any, datSoin: any, prixRemb: any, indice: any, cumulNet: any, sauvNet: any): Observable<any> => {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("codMed", codMed).set("mntHnor", mntHnor).set("datSoin", datSoin).set("prixRemb", prixRemb)
      .set("indice", indice).set("cumulNet", cumulNet).set("sauvNet", sauvNet)
    return this.http.get<any>(API_URL + "Remb/BultSoin/calculer_montant_net_med", { params });
  }

  getVisite = (parente: any, sexe: any, codFil: any, codAssur: any): Observable<any> => {
    const params = new HttpParams().set("parente", parente).set("sexe", sexe).set("codFil", codFil).set("codAssur", codAssur)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getVisit", { params });
  }

  getAppareil = (codFil: any, codAssur: any): Observable<any> => {
    const params = new HttpParams().set("codFil", codFil).set("codAssur", codAssur)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getAppareil", { params });
  }
  getActes = (parente: any, sexe: any, codFil: any, codAssur: any): Observable<any> => {
    const params = new HttpParams().set("parente", parente).set("sexe", sexe).set("codFil", codFil).set("codAssur", codAssur)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getActes", { params });
  }

  getMeds = (codFil: any, codAssur: any): Observable<any> => {
    const params = new HttpParams().set("codFil", codFil).set("codAssur", codAssur)
    return this.http.get<any>(API_URL + "Remb/BultSoin/getMeds", { params });
  }

  generateCodBordArrive(codSoc: string): Observable<string> {
    const params = new HttpParams()
      .set('codSoc', codSoc)

    return this.http.get(API_URL + 'Remb/BordArriv/generate', { params, responseType: 'text' });
  }

  saveBordArriver(data: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(API_URL + 'Remb/BordArriv/saveBordArrive', data, { headers });
  }



  lovNumFilCnamLibre(codSoc: string, page: number = 0, size: number = 100): Observable<LovNumFilCnamLibre[]> {
    const params = new HttpParams()
      .set('codSoc', codSoc)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<PageResponse<LovNumFilCnamLibre>>(API_URL + 'Remb/BordArriv/lov-numfil', { params })
      .pipe(
        map((response: { content: any; }) => response.content)
      );
  }


  reglerBord(cod_soc: string, cod_bord: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
      .set('cod_bord', cod_bord);

    return this.http.get<any>(API_URL + "Remb/Remboursement/regler_bord", { params });
  }

  cloture_bord(cod_soc: string, cod_assur: string, cod_bord: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
      .set('cod_assur', cod_assur)
      .set('cod_bord', cod_bord);

    return this.http.get<any>(API_URL + "Remb/Remboursement/cloture_bord", { params });
  }




  deleteLigActArriver(soc: any, mat: any, fam: any, datSoin: any, abrv: any, numLig: any, datAct: any, codAct: any) {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("fam", fam).set("datSoin", datSoin).set("abrv", abrv)
      .set("numLig", numLig).set("datAct", datAct).set("codAct", codAct)
    return this.http.delete<any>(API_URL + "Remb/BordArriv/deleteLigActArriver", { params })
  }

  deleteLigVisitArriver(soc: any, mat: any, fam: any, datSoin: any, abrv: any, datAct: any, codVisit: any, numLig: any) {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("fam", fam).set("datSoin", datSoin).set("abrv", abrv)
      .set("datAct", datAct).set("codVisit", codVisit).set("numLig", numLig)
    return this.http.delete<any>(API_URL + "Remb/BordArriv/deleteLigVisitArriver", { params })
  }

  deleteLigAppArriver(soc: any, mat: any, fam: any, datSoin: any, abrv: any, numLig: any, codApp: any) {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("fam", fam).set("datSoin", datSoin).set("abrv", abrv)
      .set("numLig", numLig).set("codApp", codApp)
    return this.http.delete<any>(API_URL + "Remb/BordArriv/deleteLigAppArriver", { params })
  }
  deleteLigMedArriver(soc: any, mat: any, fam: any, datSoin: any, abrv: any, numLig: any, codMed: any) {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("fam", fam).set("datSoin", datSoin).set("abrv", abrv)
      .set("numLig", numLig).set("codMed", codMed)
    return this.http.delete<any>(API_URL + "Remb/BordArriv/deleteLigMedArriver", { params })
  }

  deleteLigBultArriver(soc: any, mat: any, fam: any, datSoin: any, numLig: any) {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("fam", fam).set("datSoin", datSoin)
      .set("numLig", numLig)
    return this.http.delete<any>(API_URL + "Remb/BordArriv/deleteLigBultArriver", { params })
  }

  deleteBultArrive(soc: any, mat: any, fam: any, datSoin: any) {
    const params = new HttpParams().set("soc", soc).set("mat", mat).set("fam", fam).set("datSoin", datSoin)
    return this.http.delete<any>(API_URL + "Remb/BordArriv/deleteBultArrive", { params })
  }




  // Add this new method to your ReceptionRemboursementService
  addAllLigBultArriver(dataVisit: any, dataAct: any, dataMed: any, dataApp: any): Observable<any> {
    return forkJoin({
      visit: this.http.post<any[]>(API_URL + "Remb/BordArriv/addLigVisitArriver", dataVisit).pipe(
        catchError(error => {
          console.error("Erreur Visit Arriver:", error);
          return of({ error: true, message: "Erreur Visit Arriver", details: error });
        })
      ),
      act: this.http.post<any[]>(API_URL + "Remb/BordArriv/addLigActArriver", dataAct).pipe(
        catchError(error => {
          console.error("Erreur Act Arriver:", error);
          return of({ error: true, message: "Erreur Act Arriver", details: error });
        })
      ),
      med: this.http.post<any[]>(API_URL + "Remb/BordArriv/addLigMedArriver", dataMed).pipe(
        catchError(error => {
          console.error("Erreur Med Arriver:", error);
          return of({ error: true, message: "Erreur Med Arriver", details: error });
        })
      ),
      app: this.http.post<any[]>(API_URL + "Remb/BordArriv/addLigAppArriver", dataApp).pipe(
        catchError(error => {
          console.error("Erreur App Arriver:", error);
          return of({ error: true, message: "Erreur App Arriver", details: error });
        })
      )
    });
  }

  uploadFile(selectedFileLines: any[], soc: string): Observable<any> {
    const payload = {
      lines: selectedFileLines,
      codSoc: soc
    };

    return this.http.post<any>(`${API_URL}Remb/BordArriv/upload-file`, payload);
  }

  private rapportInfoCache = new Map<string, { codRap: string; titre: string }>();

  private getRapportInfo(libRapJsp: string): Observable<{ codRap: string; titre: string }> {
    const cached = this.rapportInfoCache.get(libRapJsp);
    if (cached) return of(cached);
    return this.http.get<any[]>(API_URL + 'Print/RapportRubController/findAll').pipe(
      map((list) => {
        const rap = list.find((r: any) => r.lib_rap_jsp === libRapJsp);
        const codRap = rap?.cod_rap?.toString();
        const titre = rap?.titre ?? '';
        if (!codRap) throw new Error('Code rapport introuvable: ' + libRapJsp);
        const info = { codRap, titre };
        this.rapportInfoCache.set(libRapJsp, info);
        return info;
      })
    );
  }

  imprimerBordArrivGlobal(codSoc: string, bord: string): Observable<any> {
    return this.getRapportInfo('bord_bs_arriv').pipe(
      switchMap((info) => {
        const body = { titre: info.titre || 'Bordereau arriver CNAM', soc: codSoc, bord: bord };
        const params = new HttpParams().set('numRap', info.codRap);
        return this.http.post<any>(API_URL + 'Print/Print/pdf', body, { params, responseType: 'blob' as 'json' });
      })
    );
  }

  imprimerBordArrivDetail(codSoc: string, bord: string): Observable<any> {
    return this.getRapportInfo('bord_bs_det_arriv').pipe(
      switchMap((info) => {
        const body = { soc: codSoc, bord: bord };
        const params = new HttpParams().set('numRap', info.codRap);
        return this.http.post<any>(API_URL + 'Print/Print/pdf', body, { params, responseType: 'blob' as 'json' });
      })
    );
  }

}
