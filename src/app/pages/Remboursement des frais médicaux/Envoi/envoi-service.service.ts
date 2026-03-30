import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BordereauRequest } from './preparation-bord-cnam/preparation-bord-cnam.component';
import { map, of, switchMap } from 'rxjs';

import { environment } from 'src/environments/environment';
const API_URL = environment.urlServer;
@Injectable({
  providedIn: 'root'
})
export class EnvoiServiceService {


  constructor(private http: HttpClient) { }



  getCodBord = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Remb/BordEnvoi/getCodBord?soc=" + soc);
  };



  getBord = (codBord: any, datBord: any): Observable<any[]> => {
    let params = new HttpParams().set('codBord', codBord);
    if (datBord) {
      params = params.set('datBord', datBord);
    }
    return this.http.get<any[]>(API_URL + "Remb/BordEnvoi/getBord", { params });
  };

  getCodBordMut = (soc: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Remb/BordEnvoi/getCodBordMut?soc=" + soc);
  };



  getBordMut = (codBord: any, datBord: any): Observable<any[]> => {
    let params = new HttpParams().set('codBord', codBord);
    if (datBord) {
      params = params.set('datBord', datBord);
    }
    return this.http.get<any[]>(API_URL + "Remb/BordEnvoi/getBordMut", { params });
  };


  getBsoinBordCnam = (codSoc: any, codBord: any, codAssur: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Remb/BordEnvoi/getBsoinBordCnam?codSoc=" + codSoc + "&codBord=" + codBord + "&codAssur=" + codAssur);
  };
  getBsoinBordMut = (codSoc: any, codBord: any, codAssur: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Remb/BordEnvoi/getBsoinBordMut?codSoc=" + codSoc + "&codBord=" + codBord + "&codAssur=" + codAssur);
  };

  findBultEnvoiByCodBord = (codSoc: any, codBord: any, codAssur: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Remb/Remboursement/BultArriverByCodBord3?cod_bord=" + codBord);
  };


  getAssur = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Remb/BordEnvoi/getAssur");
  };

  consultationBultSoin = (codSoc: any, codAssur: any, datDeb: any, datFin: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Remb/BordEnvoi/consBs?codSoc=" + codSoc + "&codAssur=" + codAssur + "&datDeb=" + datDeb + "&datFin=" + datFin);
  };

  consultationBultSoinMut = (codSoc: any, codAssur: any, datDeb: any, datFin: any): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Remb/BordEnvoi/consBsMut?codSoc=" + codSoc + "&codAssur=" + codAssur + "&datDeb=" + datDeb + "&datFin=" + datFin);
  };
  callDeletBord(codSoc: string, codBord: string): Observable<any> {
    const url = `${API_URL}Remb/BordEnvoi/callDeletBord`;

    return this.http.post<any>(url, null, {
      params: {
        codSoc: codSoc,
        codBord: codBord
      }
    });
  }




  generateCodeBordMut(
    codAssur: string,
    codSoc: string,
    datDeb: string | null,
    datFin: string | null,
    nbrBult: number,
    totHonor: number,
    totNet: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('codAssur', codAssur)
      .set('codSoc', codSoc)
      .set('nbrBult', nbrBult.toString())
      .set('totHonor', totHonor.toString())
      .set('totNet', totNet.toString());

    // Add dates only if they exist and are non-empty
    if (datDeb && datDeb.trim() !== '') {
      params = params.set('datDeb', datDeb);
    }

    if (datFin && datFin.trim() !== '') {
      params = params.set('datFin', datFin);
    }

    console.log('params:', params.toString());

    return this.http.post(
      API_URL + `Remb/BordEnvoi/generateCodeBordMut`,
      null,
      { params, responseType: 'text' } // backend returns a string, not JSON
    );
  }

  generateCodeBord(
    codAssur: string,
    codSoc: string,
    datDeb: string | null,
    datFin: string | null,
    nbrBult: number,
    totHonor: number,
    totNet: number
  ): Observable<any> {
    let params = new HttpParams()
      .set('codAssur', codAssur)
      .set('codSoc', codSoc)
      .set('nbrBult', nbrBult.toString())
      .set('totHonor', totHonor.toString())
      .set('totNet', totNet.toString());

    // Add dates only if they exist and are non-empty
    if (datDeb && datDeb.trim() !== '') {
      params = params.set('datDeb', datDeb);
    }

    if (datFin && datFin.trim() !== '') {
      params = params.set('datFin', datFin);
    }

    console.log('params:', params.toString());

    return this.http.post(
      API_URL + `Remb/BordEnvoi/generateCodeBord`,
      null,
      { params, responseType: 'text' } // backend returns a string, not JSON
    );
  }


  processBulletins(
    codBord: string,
    matPers: string,
    codSoc: string,
    datSoin: string,    // Format 'yyyy-MM-dd'
    numFam: number,
    ordBult: number,
    totHonor: number,
    totNet: number
  ): Observable<string> {
    let params = new HttpParams()
      .set('codBord', codBord)
      .set('matPers', matPers)
      .set('codSoc', codSoc)
      .set('datSoin', datSoin)
      .set('numFam', numFam.toString())
      .set('ordBult', ordBult.toString())
      .set('totHonor', totHonor.toString())
      .set('totNet', totNet.toString());

    return this.http.post(API_URL + 'Remb/BordEnvoi/updateBultSoinCnam', null, { params, responseType: 'text' });
  }


  modifProc(
    pCodAssur: string,
    pCodSoc: string,
    pMatPers: string,
    pNumFam: string,
    pDatSoin: string, // Send as a string (ISO format)
    pTotHonor: number,
    pTotNet: number,
    pChoix: string,
    pCodBord: string,
    vNbrBult: number
  ): Observable<any> {
    // Convert parameters to HttpParams
    const params = new HttpParams()
      .set('pCodAssur', pCodAssur)
      .set('pCodSoc', pCodSoc)
      .set('pMatPers', pMatPers)
      .set('pNumFam', pNumFam)
      .set('pDatSoin', pDatSoin) // Ensure ISO format (yyyy-MM-dd)
      .set('pTotHonor', pTotHonor.toString())
      .set('pTotNet', pTotNet.toString())
      .set('pChoix', pChoix)
      .set('pCodBord', pCodBord)
      .set('vNbrBult', vNbrBult.toString());

    console.log('Sending params:', params.toString());

    // Make the POST request
    return this.http.post(API_URL + `Remb/BordEnvoi/modifProc`, null, { params });
  }
  generateCodeBordmut(
    codAssur: string,
    codSoc: string
  ): Observable<any> {
    const params = new HttpParams()
      .set('codAssur', codAssur)
      .set('codSoc', codSoc)

    console.log('params:', params.toString());

    return this.http.post(API_URL + `Remb/BordEnvoi/generateCodeBord`, null, { params });
  }
  createBord(
    pCodAssur: string,
    pCodSoc: string,
    pTotHonor: number,
    pTotNet: number,
    pChoix: string,
    vNbrBult: number,
    pCodBord: string,
    datDeb: string,
    datFin: string
  ): Observable<any> {
    // Create HttpParams and append the parameters
    const params = new HttpParams()
      .set('pCodAssur', pCodAssur)
      .set('pCodSoc', pCodSoc)
      .set('pTotHonor', pTotHonor)
      .set('pTotNet', pTotNet)
      .set('pChoix', pChoix)
      .set('vNBRBult', vNbrBult)
      .set('pCodBord', pCodBord)
      .set('datDeb', datDeb)
      .set('datFin', datFin);

    console.log('Sending params:', params.toString());

    // Make the POST request and return the observable
    return this.http.post(API_URL + `Remb/BordEnvoi/createBord`, null, { params });
  }


  totauCnam(
    pCodSoc: string,
    pMatPers: string,
    pNumFam: Number,
    pDatSoin: string,


  ): Observable<any> {
    // Create HttpParams
    const params = new HttpParams()
      .set('pCodSoc', pCodSoc)
      .set('pMatPers', pMatPers)
      .set('pNumFam', pNumFam.toString())
      .set('pDatSoin', pDatSoin)


    console.log('params:', params);

    // Make the POST request with params as part of the options
    return this.http.post(API_URL + `Remb/BordEnvoi/totauCnam`, null, { params });
  }

  deletBultin(nat: any): Observable<any> {
    return this.http.post<any>(API_URL + `Remb/BordEnvoi/deletBultin`, nat);
  }


  updateBultinCnam(updatedData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.put<any>(
      API_URL + `Remb/BordEnvoi/updateBultinCnam`,
      JSON.stringify(updatedData), // Wrap in array & ensure it's JSON
      { headers }
    );
  }





  updateBultSoin(codSoc: string, matPers: string, numFam: number, datSoin: string, mntHonor: number, mntTot: number): Observable<any> {
    const params = {
      codSoc: codSoc,
      matPers: matPers,
      numFam: numFam.toString(),
      datSoin: datSoin, // Ensure date is in YYYY-MM-DD format
      mntHonor: mntHonor.toString(),
      mntTot: mntTot.toString()
    };

    return this.http.post<any>(API_URL + `Remb/BordEnvoi/updateBultSoin`, null, { params });
  }

  prepFichCnam(codSoc: string, codBord: string): Observable<any> {
    const params = new HttpParams()
      .set('codSoc', codSoc)
      .set('codBord', codBord);

    return this.http.post<any>(API_URL + `Remb/BordEnvoi/prepFich`, {}, { params });
  }

  envoiBordEnvoi(codSoc: string, codBord: string): Observable<any> {
    const params = new HttpParams()
      .set('codSoc', codSoc)
      .set('codBord', codBord);

    return this.http.post<any>(API_URL + `Remb/BordEnvoi/envoiBord`, {}, { params });
  }
  generateFile(request: any): Observable<{ seq?: number; message: string; errorDetails?: string }> {
    return this.http.post<{ seq?: number; message: string; errorDetails?: string }>(API_URL + `Remb/api/cnam-fich/generate`, request);
  }

  downloadFile(seq: number): Observable<HttpResponse<Blob>> {
    return this.http.get(API_URL + `Remb/api/cnam-fich/download/${seq}`, {
      observe: 'response',
      responseType: 'blob'
    });
  }

  private rapportCodeCache = new Map<string, string>();

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

  imprimerBordCnamGlobal(codSoc: string, bord: string): Observable<any> {
    return this.getNumRap('bord_bs_cnam').pipe(
      switchMap((numRap) => {
        const body = { cod_soc: codSoc, bord: bord };
        const params = new HttpParams().set('numRap', numRap);
        return this.http.post<any>(API_URL + 'Print/Print/pdf', body, { params, responseType: 'blob' as 'json' });
      })
    );
  }

  imprimerBordCnamDetail(codSoc: string, bord: string): Observable<any> {
    return this.getNumRap('bord_bs_det_cnam').pipe(
      switchMap((numRap) => {
        const body = { cod_soc: codSoc, bord: bord };
        const params = new HttpParams().set('numRap', numRap);
        return this.http.post<any>(API_URL + 'Print/Print/pdf', body, { params, responseType: 'blob' as 'json' });
      })
    );
  }

  imprimerBordMutGlobal(codSoc: string, bord: string): Observable<any> {
    return this.getNumRap('bord_bs_mut').pipe(
      switchMap((numRap) => {
        const body = { soc: codSoc, bord: bord };
        const params = new HttpParams().set('numRap', numRap);
        return this.http.post<any>(API_URL + 'Print/Print/pdf', body, { params, responseType: 'blob' as 'json' });
      })
    );
  }

  imprimerBordMutDetail(codSoc: string, bord: string): Observable<any> {
    return this.getNumRap('bord_bs_det_mut').pipe(
      switchMap((numRap) => {
        const body = { soc: codSoc, bord: bord };
        const params = new HttpParams().set('numRap', numRap);
        return this.http.post<any>(API_URL + 'Print/Print/pdf', body, { params, responseType: 'blob' as 'json' });
      })
    );
  }

}
export interface CnamFichRequest {
  codSoc: string;
  codBord: string;
}
