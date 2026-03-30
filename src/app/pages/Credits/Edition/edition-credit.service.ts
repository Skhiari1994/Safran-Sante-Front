import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class EditionCreditService {

  constructor(private http: HttpClient) { }
  private readonly API_URL = environment.urlServer;


  getPretPers = (mat: any): Observable<any[]> => {
    const params = new HttpParams().set("mat", mat)
    return this.http.get<any[]>(this.API_URL + "Print/personnel/getPretPers", { params });
  };

  getGroupePret = (): Observable<any[]> => {
    return this.http.get<any[]>(this.API_URL + "Print/personnel/getGroupePret");
  };
  getTypePret = (): Observable<any[]> => {
    return this.http.get<any[]>(this.API_URL + "Print/personnel/getTypePret");
  };

  genererFich = (soc: any, mois: any, corps: any, grpPret: any, typPret: any): Observable<any[]> => {
    const params = new HttpParams().set("soc", soc).set("mois", mois).set("corps", corps).set("grpPret", grpPret).set("typPret", typPret)
    return this.http.get<any[]>(this.API_URL + "Print/personnel/genererFich", { params });
  };
  editionTabAmmort(numRap: any, soc: any, codPret: any, mat: any) {
    const body = {
      soc: soc,
      cod_pret: codPret,
      mat: mat,
    };
    const params = new HttpParams().set('numRap', numRap);
    const httpOptions = {
      params,
      responseType: 'blob' as 'json'
    };
    return this.http.post<any>(this.API_URL + "Print/Print/pdf", body, httpOptions);
  }

  editionTabAmmortExcel(numRap: any, soc: any, codPret: any, mat: any) {
    const body = {
      soc: soc,
      cod_pret: codPret,
      mat: mat,
    };
    const params = new HttpParams().set('numRap', numRap);
    const httpOptions = {
      params,
      responseType: 'blob' as 'json'
    };
    return this.http.post<any>(this.API_URL + "Print/Print/excel", body, httpOptions);
  }

  editionEtatRetenuPret(numRap: any, soc: any, mat_deb: any, mat_fin: any, mois: any) {
    const body = {
      soc: soc,
      mat_deb: mat_deb,
      mat_fin: mat_fin,
      moi: mois
    };
    const params = new HttpParams().set('numRap', numRap);
    const httpOptions = {
      params,
      responseType: 'blob' as 'json'
    };
    return this.http.post<any>(this.API_URL + "Print/Print/pdf", body, httpOptions);
  }

  editionEtatRetenuPretExcel(numRap: any, soc: any, mat_deb: any, mat_fin: any, mois: any) {
    const body = {
      soc: soc,
      mat_deb: mat_deb,
      mat_fin: mat_fin,
      moi: mois
    };
    const params = new HttpParams().set('numRap', numRap);
    const httpOptions = {
      params,
      responseType: 'blob' as 'json'
    };
    return this.http.post<any>(this.API_URL + "Print/Print/excel", body, httpOptions);
  }
  editionBalancePret(numRap: any, soc: any, mat_deb: any, mat_fin: any, datDeb: any, datFin: any, grpPret: any, corps: any, etat: any, typ_reg: any) {
    const body = { soc, matDeb: mat_deb, matFin: mat_fin, datDeb, datFin, grpPret, corps, etat, typ_reg };
    const params = new HttpParams().set('numRap', numRap);
    return this.http.post<any>(this.API_URL + "Print/Print/pdf", body, { params, responseType: 'blob' as 'json' });
  }

  editionBalancePretExcel(numRap: any, soc: any, mat_deb: any, mat_fin: any, datDeb: any, datFin: any, grpPret: any, corps: any, etat: any, typ_reg: any) {
    const body = { soc, matDeb: mat_deb, matFin: mat_fin, datDeb, datFin, grpPret, corps, etat, typ_reg };
    const params = new HttpParams().set('numRap', numRap);
    return this.http.post<any>(this.API_URL + "Print/Print/excel", body, { params, responseType: 'blob' as 'json' });
  }

  editionPretDeblc(numRap: any, soc: any, grpPret: any, typPret: any, mois: any) {
    const body = {
      cod_soc: soc,
      cod_grp_pret: grpPret,
      typ_pret: typPret,
      moisAnnee: mois,
    };
    const params = new HttpParams().set('numRap', numRap);
    const httpOptions = {
      params,
      responseType: 'blob' as 'json'
    };
    return this.http.post<any>(this.API_URL + "Print/Print/pdf", body, httpOptions);
  }

  editionPretDeblcExcel(numRap: any, soc: any, grpPret: any, typPret: any, mois: any) {
    const body = {
      cod_soc: soc,
      cod_grp_pret: grpPret,
      typ_pret: typPret,
      moisAnnee: mois,
    };
    const params = new HttpParams().set('numRap', numRap);
    const httpOptions = {
      params,
      responseType: 'blob' as 'json'
    };
    return this.http.post<any>(this.API_URL + "Print/Print/excel", body, httpOptions);
  }
  editionPretAnticip(numRap: any, soc: any, grpPret: any, typPret: any, mois: any, corps: any) {
    const body = {
      cod_soc: soc,
      cod_grp_pret: grpPret,
      typ_pret: typPret,
      moisAnnee: mois,
      corps: corps
    };
    const params = new HttpParams().set('numRap', numRap);
    const httpOptions = {
      params,
      responseType: 'blob' as 'json'
    };
    return this.http.post<any>(this.API_URL + "Print/Print/pdf", body, httpOptions);
  }

  editionPretAnticipExcel(numRap: any, soc: any, grpPret: any, typPret: any, mois: any, corps: any) {
    const body = {
      cod_soc: soc,
      cod_grp_pret: grpPret,
      typ_pret: typPret,
      moisAnnee: mois,
      corps: corps
    };
    const params = new HttpParams().set('numRap', numRap);
    const httpOptions = {
      params,
      responseType: 'blob' as 'json'
    };
    return this.http.post<any>(this.API_URL + "Print/Print/excel", body, httpOptions);
  }
  editionBalance(numRap: any, soc: any, grpPret: any, typPret: any, date: any) {
    const body = {
      codSoc: soc,
      codGrpPret: grpPret,
      typePret: typPret,
      date: date,
    };
    const params = new HttpParams().set('numRap', numRap);
    const httpOptions = {
      params,
      responseType: 'blob' as 'json'
    };
    return this.http.post<any>(this.API_URL + "Print/Print/pdf", body, httpOptions);
  }

  editionBalanceExcel(numRap: any, soc: any, grpPret: any, typPret: any, date: any) {
    const body = {
      codSoc: soc,
      codGrpPret: grpPret,
      typePret: typPret,
      date: date,
    };
    const params = new HttpParams().set('numRap', numRap);
    const httpOptions = {
      params,
      responseType: 'blob' as 'json'
    };
    return this.http.post<any>(this.API_URL + "Print/Print/excel", body, httpOptions);
  }

  editionComm(numRap: any, soc: any, num_comm: any, corps: any) {
    const body = { cod_soc: soc, num_comm, corps };
    const params = new HttpParams().set('numRap', numRap);
    return this.http.post<any>(this.API_URL + "Print/Print/pdf", body, { params, responseType: 'blob' as 'json' });
  }

  editionCommExcel(numRap: any, soc: any, num_comm: any, corps: any) {
    const body = { cod_soc: soc, num_comm, corps };
    const params = new HttpParams().set('numRap', numRap);
    return this.http.post<any>(this.API_URL + "Print/Print/excel", body, { params, responseType: 'blob' as 'json' });
  }

  editionCommDebloc(numRap: any, soc: any, comm: any, ddat: any, corps: any) {
    const body = { soc, comm, ddat, corps };
    const params = new HttpParams().set('numRap', numRap);
    return this.http.post<any>(this.API_URL + "Print/Print/pdf", body, { params, responseType: 'blob' as 'json' });
  }

  editionCommDeblocExcel(numRap: any, soc: any, comm: any, ddat: any, corps: any) {
    const body = { soc, comm, ddat, corps };
    const params = new HttpParams().set('numRap', numRap);
    return this.http.post<any>(this.API_URL + "Print/Print/excel", body, { params, responseType: 'blob' as 'json' });
  }

  private rapportInfoCache = new Map<string, { codRap: string; titre: string }>();

  private getRapportInfo(libRapJsp: string): Observable<{ codRap: string; titre: string }> {
    const cached = this.rapportInfoCache.get(libRapJsp);
    if (cached) return of(cached);
    return this.http.get<any[]>(this.API_URL + 'Print/RapportRubController/findAll').pipe(
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

  editionCommDeblocAuto(soc: any, comm: any, ddat: any, corps: any): Observable<any> {
    return this.getRapportInfo('p_edit_comm_debloc').pipe(
      switchMap((info) => {
        const body = { soc, comm, ddat, corps, titre: info.titre };
        const params = new HttpParams().set('numRap', info.codRap);
        return this.http.post<any>(this.API_URL + 'Print/Print/pdf', body, { params, responseType: 'blob' as 'json' });
      })
    );
  }


  telechargerFichier(filename: string): void {
    const params = new HttpParams()
      .set('fileName', filename)

    this.http.get(this.API_URL + "Print/personnel/genererFichExel", {
      params,
      responseType: 'blob',
      observe: 'response',
    }).subscribe(response => {
      const blob = new Blob([response.body!], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename ? (filename.endsWith('.xlsx') ? filename : filename.replace(/\.(xls|xlsx)?$/, '') + '.xlsx') : 'fichier.xlsx';
      link.click();

      URL.revokeObjectURL(link.href);
    });
  }

  getRetMensByType = (soc: string, dat: string, type: string): Observable<any[]> => {
    const params = new HttpParams()
      .set("soc", soc)
      .set("dat", dat)
      .set("type", type);
    return this.http.get<any[]>(this.API_URL + "Credits/PrepRetMens/getRetMensByType", { params });
  };

  getDetRetMens = (soc: string, mat: string, dat: string, abrv: string): Observable<any[]> => {
    const params = new HttpParams()
      .set("soc", soc)
      .set("mat", mat)
      .set("dat", dat)
      .set("abrv", abrv);
    return this.http.get<any[]>(this.API_URL + "Credits/PrepRetMens/getDetRetMens", { params });
  };

  // Print retenue_mensuelle or retenue_mensuelle_spec (COD_RAP 135 or 137)
  printRetenueMensuelle(codRap: string, soc: string, mois: string): Observable<any> {
    const body = {
      soc_: soc,
      mois_: mois
    };
    const params = new HttpParams().set('numRap', codRap);
    return this.http.post(this.API_URL + 'Print/Print/pdf', body, {
      params,
      responseType: 'blob' as 'json'
    });
  }

  // Print retenue_mensuelle_glob (COD_RAP 136) - needs dd/mm/yyyy format
  printRetenueMensuelleGlob(codRap: string, soc: string, dat: string): Observable<any> {
    // Convert mm/yyyy to dd/mm/yyyy (use 01 as day)
    const datFormatted = `01/${dat}`;
    const body = {
      soc_: soc,
      dat_: datFormatted
    };
    const params = new HttpParams().set('numRap', codRap);
    return this.http.post(this.API_URL + 'Print/Print/pdf', body, {
      params,
      responseType: 'blob' as 'json'
    });
  }

  // Print non_retenue_mensuelle (COD_RAP 134)
  printNonRetenueMensuelle(codRap: string, dat: string): Observable<any> {
    const body = {
      dat_: dat
    };
    const params = new HttpParams().set('numRap', codRap);
    return this.http.post(this.API_URL + 'Print/Print/pdf', body, {
      params,
      responseType: 'blob' as 'json'
    });
  }

  // Print retenue_mensuelle or retenue_mensuelle_spec Excel
  printRetenueMensuelleExcel(codRap: string, soc: string, mois: string): Observable<any> {
    const body = {
      soc_: soc,
      mois_: mois
    };
    const params = new HttpParams().set('numRap', codRap);
    return this.http.post(this.API_URL + 'Print/Print/excel', body, {
      params,
      responseType: 'blob' as 'json'
    });
  }

  // Print retenue_mensuelle_glob Excel
  printRetenueMensuelleGlobExcel(codRap: string, soc: string, dat: string): Observable<any> {
    const datFormatted = `01/${dat}`;
    const body = {
      soc_: soc,
      dat_: datFormatted
    };
    const params = new HttpParams().set('numRap', codRap);
    return this.http.post(this.API_URL + 'Print/Print/excel', body, {
      params,
      responseType: 'blob' as 'json'
    });
  }

  // Print non_retenue_mensuelle Excel
  printNonRetenueMensuelleExcel(codRap: string, dat: string): Observable<any> {
    const body = {
      dat_: dat
    };
    const params = new HttpParams().set('numRap', codRap);
    return this.http.post(this.API_URL + 'Print/Print/excel', body, {
      params,
      responseType: 'blob' as 'json'
    });
  }

  editionListRetNonReg(numRap: any, cod_soc: any, corps: any, codGrp: any, mois: any) {
    const body = {
      cod_soc: cod_soc,
      corps: corps,
      codGrp: codGrp,
      mois: mois
    };
    const params = new HttpParams().set('numRap', numRap);
    const httpOptions = {
      params,
      responseType: 'blob' as 'json'
    };
    return this.http.post<any>(this.API_URL + "Print/Print/pdf", body, httpOptions);
  }

  editionListRetNonRegExcel(numRap: any, cod_soc: any, corps: any, codGrp: any, mois: any) {
    const body = {
      cod_soc: cod_soc,
      corps: corps,
      codGrp: codGrp,
      mois: mois
    };
    const params = new HttpParams().set('numRap', numRap);
    const httpOptions = {
      params,
      responseType: 'blob' as 'json'
    };
    return this.http.post<any>(this.API_URL + "Print/Print/excel", body, httpOptions);
  }
}
