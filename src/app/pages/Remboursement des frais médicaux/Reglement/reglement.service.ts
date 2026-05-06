import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';


const API_URL = environment.urlServer;
@Injectable({
  providedIn: 'root'
})
export class ReglementService {
  private rapportCodeCache = new Map<string, string>();

  constructor(private http: HttpClient) { 
  }

  getAllBordArriver = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Remb/Reglement/BordEnvoi");
  };
  PayBordEnvoi = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Remb/Reglement/PayBordEnvoi/" + soc);
  };
  getAllBordEnvoi = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Remb/Reglement/BordEnvoi/" + soc);
  };

  ControleBordMutuelle(cod_soc: string, cod_bord: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc).set('cod_bord', cod_bord);

    return this.http.get<any>(API_URL + "Remb/Reglement/ControleBordMutuelle", { params });
  }
  getPayBordMutuelle(cod_soc: string, cod_bord: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc).set('cod_bord', cod_bord);

    return this.http.get<any>(API_URL + "Remb/Reglement/getPayBordMutuelle", { params });
  }
  majModPayement(cod_soc: string, cod_bord: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc).set('cod_bord', cod_bord);

    return this.http.get<any>(API_URL + "Remb/Reglement/majModPayement", { params });
  }
  regler_bord(cod_soc: string, cod_bord: string, codAssur: string): Observable<any> {
    const params = new HttpParams()
      .set('soc', cod_soc).set('codBord', cod_bord).set('codAssur', codAssur);

    return this.http.get<any>(API_URL + "Remb/Reglement/regler_bord", { params });
  }

  ReglerAdh(
    soc: any,
    mat: string,
    numFam: string,
    dat: string,
    reg: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('soc', soc)
      .set('mat', mat)
      .set('numFam', numFam)
      .set('dat', dat);

    return this.http.put(`${API_URL}Remb/Reglement/reglerAdh/${reg}`, null, { params });
  }

  getBordArriver(): Observable<any> {

    return this.http.get<any>(API_URL + "Remb/Reglement/getBordArriver");
  }
  ConsultBordArriver(): Observable<any> {

    return this.http.get<any>(API_URL + "Remb/Reglement/ConsultBordArriver");
  }
  getBultArriverReg(cod_bord: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_bord', cod_bord);

    return this.http.get<any>(API_URL + "Remb/Reglement/findBultArriverReg", { params });
  }

  findBultArriverCptCnam(cod_bord: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_bord', cod_bord);

    return this.http.get<any>(API_URL + "Remb/Reglement/findBultArriverCptCnam", { params });
  }
  LigVisitArriverById(cod_soc: string, mat_pers: string, num_fam: number, dat_soin: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
      .set('mat_pers', mat_pers)
      .set('num_fam', num_fam.toString())
      .set('dat_soin', dat_soin);

    return this.http.get<any>(API_URL + "Remb/Remboursement/LigVisitArriverById", { params });
  }

  getBultArriverById(cod_soc: string, mat_pers: string, num_fam: number, dat_soin: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
      .set('mat_pers', mat_pers)
      .set('num_fam', num_fam.toString())
      .set('dat_soin', dat_soin);

    return this.http.get<any>(API_URL + "Remb/Remboursement/BultArriverById", { params });
  }


  geLigActArriverById(cod_soc: string, mat_pers: string, num_fam: number, dat_soin: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
      .set('mat_pers', mat_pers)
      .set('num_fam', num_fam.toString())
      .set('dat_soin', dat_soin);

    return this.http.get<any>(API_URL + "Remb/Remboursement/LigActArriverById", { params });
  }

  LigAppArriverById(cod_soc: string, mat_pers: string, num_fam: number, dat_soin: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
      .set('mat_pers', mat_pers)
      .set('num_fam', num_fam.toString())
      .set('dat_soin', dat_soin);

    return this.http.get<any>(API_URL + "Remb/Remboursement/LigAppArriverById", { params });
  }

  LigMedArriverById(cod_soc: string, mat_pers: string, num_fam: number, dat_soin: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
      .set('mat_pers', mat_pers)
      .set('num_fam', num_fam.toString())
      .set('dat_soin', dat_soin);

    return this.http.get<any>(API_URL + "Remb/Remboursement/LigMedArriverById", { params });
  }

  getLigBultArriver(cod_soc: string, mat_pers: string, num_fam: number, dat_soin: string): Observable<any> {
    const params = new HttpParams()
      .set('soc', cod_soc)
      .set('mat', mat_pers)
      .set('numFam', num_fam.toString())
      .set('datSoin', dat_soin);

    return this.http.get<any>(API_URL + "Remb/Reglement/getLigBultArriver", { params });
  }

  updateBordArriver(cod_soc: string, assur: string, bord: string): Observable<any> {
    const params = new HttpParams()
      .set('soc', cod_soc)
      .set('assur', assur)
      .set('bord', bord)

    return this.http.get<any>(API_URL + "Remb/Reglement/updateBordArriver", { params });
  }


  updateBultArriver(data: any, reclam: string): Observable<any> {
    const params = new HttpParams().set('reclam', reclam);

    return this.http.put<any>(`${API_URL}Remb/Reglement/addReclam`, data, { params });
  }



  vir_bord(
    soc: any,
    codBord: string,
    nomFichier: string,
  ): Observable<any> {
    const params = new HttpParams()
      .set('soc', soc)
      .set('codBord', codBord)
      .set('nomFichier', nomFichier)


    return this.http.get(`${API_URL}Remb/Reglement/vir_bord`, { params });
  }
  download_file(fileName: string): Observable<any> {
    const params = new HttpParams().set('fileName', fileName);

    return this.http.get(`${API_URL}Remb/Reglement/download-file`, {
      responseType: 'blob',
      params: params
    });
  }


  MajModPayCnam(
    soc: any,
    mat: string,
    numFam: string,
    dat: string,
    modPay: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('soc', soc)
      .set('mat', mat)
      .set('numFam', numFam)
      .set('dat', dat);

    return this.http.put(`${API_URL}Remb/Reglement/MajModPayCnam/${modPay}`, null, { params });
  }


  getBultSoinCpt(cod_soc: string, cod_bord: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc).set('cod_bord', cod_bord);

    return this.http.get<any>(API_URL + "Remb/Reglement/getBultSoinCpt", { params });
  }
  getBultSoinCheqCpt(cod_soc: string, cod_bord: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc).set('cod_bord', cod_bord);

    return this.http.get<any>(API_URL + "Remb/Reglement/getBultSoinCheqCpt", { params });
  }
  // majRegAdh(
  //   soc: any,
  //   mat: string,
  //   numFam: string,
  //   dat: string,
  //   reg_adh: string
  // ): Observable<any> {
  //   const params = new HttpParams()
  //     .set('soc', soc)
  //     .set('mat', mat)
  //     .set('numFam', numFam)
  //     .set('dat', dat);

  //   return this.http.put(`http://localhost:8222/Remb/Reglement/majRegAdh/${reg_adh}`, null, { params });
  // }

  majRegAdh(
    soc: any,
    codBord: string,

  ): Observable<any> {
    const params = new HttpParams()
      .set('soc', soc)
      .set('codBord', codBord)
    return this.http.get(`${API_URL}Remb/Reglement/majRegAdh`, { params });
  }

  majRegAdhVirCnam(
    soc: any,
    codBord: string,

  ): Observable<any> {
    const params = new HttpParams()
      .set('soc', soc)
      .set('codBord', codBord)
    return this.http.get(`${API_URL}Remb/Reglement/majRegAdhVirCnam`, { params });
  }
  generateVirFile(codSoc: string, codBord: string): Observable<any> {
    return this.http.post(`${API_URL}Remb/api/vir/fich/generate`, { codSoc, codBord });
  }

  downloadVirFile(seq: number): Observable<Blob> {
    return this.http.get(`${API_URL}Remb/api/vir/fich/download/${seq}`, { responseType: 'blob' });
  }
  generateVirFileCnam(codSoc: string, codBord: string): Observable<any> {
    return this.http.post(`${API_URL}Remb/api/vir/fich/generateCnam`, { codSoc, codBord });
  }

  downloadVirFileCnam(seq: number): Observable<Blob> {
    return this.http.get(`${API_URL}Remb/api/vir/fich/downloadCnam/${seq}`, { responseType: 'blob' });
  }

  MajModPay(
    soc: any,
    mat: string,
    numFam: string,
    dat: string,
    modPay: string | null
  ): Observable<any> {
    const params = new HttpParams()
      .set('soc', soc)
      .set('mat', mat)
      .set('numFam', numFam)
      .set('dat', dat);

    return this.http.put(`${API_URL}Remb/Reglement/MajModPay/${modPay}`, null, { params });
  }
  validateBord(codSoc: string, codAssur: string, codBord: string): Observable<any> {
    let params = new HttpParams()
      .set('codSoc', codSoc)
      .set('codAssur', codAssur)
      .set('codBord', codBord);

    return this.http.put(API_URL + "Remb/BordArriv/validate", null, { params });
  }


  // Helper method to get report code dynamically
  private getNumRap(libRapJsp: string): Observable<string> {
    const cached = this.rapportCodeCache.get(libRapJsp);
    if (cached) return of(cached);
    return this.http.get<any[]>(API_URL + 'Print/RapportRubController/findAll').pipe(
      map((list) => {
        const rap = list.find((r: any) => r.lib_rap_jsp === libRapJsp);
        const code = rap?.cod_rap?.toString();
        if (!code) throw new Error('Code rapport introuvable: ' + libRapJsp);
        this.rapportCodeCache.set(libRapJsp, code);
        return code;
      })
    );
  }

  // Print methods for MajModePay reports
  printEtatEmargMut(cod_soc: string, cod_bord: string): Observable<any> {
    return this.getNumRap('etat_emarg_mut').pipe(
      switchMap((reportCode) => {
        const body = {
          soc: cod_soc,
          bord: cod_bord
        };
        const params = new HttpParams().set('numRap', reportCode);

        const httpOptions = {
          params,
          responseType: 'blob' as 'json'
        };

        return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
      })
    );
  }

  printEtatChequeMut(cod_soc: string, cod_bord: string): Observable<any> {
    return this.getNumRap('etat_cheque_mut').pipe(
      switchMap((reportCode) => {
        const body = {
          soc: cod_soc,
          bord: cod_bord
        };
        const params = new HttpParams().set('numRap', reportCode);

        const httpOptions = {
          params,
          responseType: 'blob' as 'json'
        };

        return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
      })
    );
  }

  printOrdreVirementMut(cod_soc: string, cod_bord: string): Observable<any> {
    return this.getNumRap('ord_vir_mut').pipe(
      switchMap((reportCode) => {
        const body = {
          soc: cod_soc,
          bord: cod_bord
        };
        const params = new HttpParams().set('numRap', reportCode);

        const httpOptions = {
          params,
          responseType: 'blob' as 'json'
        };

        return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
      })
    );
  }


  printReclamationAdherent(soc: string, mat: string, dat_soin: string, num: string, numf: string): Observable<any> {
    return this.getNumRap('reclam_adherant').pipe(
      switchMap((reportCode) => {
        const body = {
          soc: soc,
          mat: mat,
          dat_soin: dat_soin,
          num: num,
          numf: numf
        };
        const params = new HttpParams().set('numRap', reportCode);

        const httpOptions = {
          params,
          responseType: 'blob' as 'json'
        };

        return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
      })
    );
  }

  // Print methods for MajModPayBordCnam reports
  printOrdreVirementCompLibre(cod_soc: string, cod_bord: string): Observable<any> {
    const reportId = cod_bord.startsWith('L') ? 'ord_vir_comp_l' : 'ord_vir_comp';
    return this.getNumRap(reportId).pipe(
      switchMap((reportCode) => {
        const body = {
          soc: cod_soc,
          bord: cod_bord
        };
        const params = new HttpParams().set('numRap', reportCode);

        const httpOptions = {
          params,
          responseType: 'blob' as 'json'
        };

        return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
      })
    );
  }

  printEtatEmargCompLibre(cod_soc: string, cod_bord: string): Observable<any> {
    const reportId = cod_bord.startsWith('L') ? 'etat_emarg_comp_libre' : 'etat_emarg_comp';

    return this.getNumRap(reportId).pipe(
      switchMap((reportCode) => {
        const body = {
          soc: cod_soc,
          bord: cod_bord
        };
        const params = new HttpParams().set('numRap', reportCode);

        const httpOptions = {
          params,
          responseType: 'blob' as 'json'
        };

        return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
      })
    );
  }

  printBordereauGlobal(cod_soc: string, cod_bord: string): Observable<any> {
    return this.getNumRap('comp_bord_arriv').pipe(
      switchMap((reportCode) => {
        const body = {
          soc: cod_soc,
          bord: cod_bord
        };
        const params = new HttpParams().set('numRap', reportCode);

        const httpOptions = {
          params,
          responseType: 'blob' as 'json'
        };

        return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
      })
    );
  }

  printBordereauDetailed(cod_soc: string, cod_bord: string): Observable<any> {
    return this.getNumRap('comp_bord_det_arriv').pipe(
      switchMap((reportCode) => {
        const body = {
          soc: cod_soc,
          bord: cod_bord
        };
        const params = new HttpParams().set('numRap', reportCode);

        const httpOptions = {
          params,
          responseType: 'blob' as 'json'
        };

        return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
      })
    );
  }

  cloture_bord_vir(cod_soc: string, cod_assur: string, cod_bord: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
      .set('cod_assur', cod_assur)
      .set('cod_bord', cod_bord);

    return this.http.get<any>(API_URL + "Remb/Remboursement/cloture_bord_vir", { params });
  }

  GetAllBordArriver = (cod_soc: string): Observable<any[]> => {
    const params = new HttpParams()
      .set('cod_soc', cod_soc)
    return this.http.get<any[]>(API_URL + "Remb/Remboursement/GetAllBordArriver", { params });
  };
  getBultArriverByCodBord4(cod_bord: string): Observable<any> {
    const params = new HttpParams()
      .set('cod_bord', cod_bord);

    return this.http.get<any>(API_URL + "Remb/Remboursement/BultArriverByCodBord4", { params });
  }
}
