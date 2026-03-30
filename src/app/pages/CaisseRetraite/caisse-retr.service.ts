import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, of, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
const API_URL = environment.urlServer;

@Injectable({
  providedIn: 'root'
})
export class CaisseRetrService {

  constructor(private http: HttpClient) { }

  getMaxNum = (soc: any, mat: any): Observable<any> => {
    const params = new HttpParams().set('soc', soc).set('mat', mat)
    return this.http.get<any>(API_URL + "CaisseRetr/CaiseeRetr/getMaxNum", { params });
  };

  getAllPrimes = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "CaisseRetr/CaiseeRetr/getAllPrimes");
  };

  getAllVald = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "CaisseRetr/CaiseeRetr/getAllVald");
  };
  verifLigCotisation = (soc: any, mat: any, datDeb: any, datFin: any): Observable<any> => {
    const params = new HttpParams().set('soc', soc).set('mat', mat).set('datDeb', datDeb).set('datFin', datFin)
    return this.http.get<any>(API_URL + "CaisseRetr/CaiseeRetr/verifLigCotisation", { params });
  };

  getAllByMat = (mat: any): Observable<any> => {
    const params = new HttpParams().set('mat', mat)
    return this.http.get<any>(API_URL + "CaisseRetr/CaiseeRetr/getAllByMat", { params });
  };
  getAllLigByMat = (soc: any, mat: any, num: any, dat1: any, dat2: any): Observable<any> => {
    const params = new HttpParams().set('soc', soc).set('mat', mat).set('num', num).set('dat1', dat1).set('dat2', dat2)
    return this.http.get<any>(API_URL + "CaisseRetr/CaiseeRetr/getAllLigByMat", { params });
  };
  calculCotisation = (soc: any, mat: any, datDeb: any, datFin: any, brut: any): Observable<any> => {
    const params = new HttpParams().set('soc', soc).set('mat', mat).set('datDeb', datDeb).set('datFin', datFin).set('brut', brut)
    return this.http.get<any>(API_URL + "CaisseRetr/CaiseeRetr/calculCotisation", { params });
  };
  majLigCotisationRetr = (soc: any, mat: any, num: any, datDeb: any, datFin: any, cot: any): Observable<any> => {
    const params = new HttpParams().set('soc', soc).set('mat', mat).set('num', num).set('datDeb', datDeb).set('datFin', datFin).set('cot', cot)
    return this.http.get<any>(API_URL + "CaisseRetr/CaiseeRetr/majLigCotisationRetr", { params });
  };
  getPersPrimeSearch = (soc: any): Observable<any[]> => {
    const params = new HttpParams().set('soc', soc)
    return this.http.get<any[]>(API_URL + "CaisseRetr/CaiseeRetr/getPersPrime", { params });
  };

  addPrime(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "CaisseRetr/CaiseeRetr/addPrime", data);
  }

  chargement_pers_prime = (soc: any, mois: any, mat: any): Observable<any[]> => {
    const params = new HttpParams().set('soc', soc).set('mois', mois).set('mat', mat)
    return this.http.get<any[]>(API_URL + "CaisseRetr/CaiseeRetr/chargement_pers_prime", { params });
  };
  getPrimePersVal = (soc: any, mois: any, corps: any, matricule: any): Observable<any[]> => {
    const params = new HttpParams().set('soc', soc).set('mois', mois).set('corps', corps).set('matricule', matricule)
    return this.http.get<any[]>(API_URL + "CaisseRetr/CaiseeRetr/getPrimePersVal", { params });
  };



  maj_cotisation(
    soc: string,
    mat: string,
    mois: string,
    corps: string
  ): Observable<number> {

    return this.http.get<number>(
      API_URL + `CaisseRetr/CaiseeRetr/maj_cotisation`,
      { params: { soc, mat, mois, corps } }
    );
  }

  getDiskPret = (mat: any, corps: any, mois: any): Observable<any[]> => {
    let params = new HttpParams();

    if (mois) {
      params = params.set('mois', mois.toString().trim());
    }

    if (mat) {
      params = params.set('mat', mat.toString().trim());
    }

    if (corps) {
      params = params.set('corps', corps.toString().trim());
    }

    const url = API_URL + "CaisseRetr/CaiseeRetr/getDiskPret";
    console.log('Full URL:', `${url}?${params.toString()}`);

    return this.http.get<any[]>(url, { params });
  };

  getPersonnel = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "CaisseRetr/CaiseeRetr/getPersonnel");
  };
  getMotifRembour = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "CaisseRetr/CaiseeRetr/getMotifRembour");
  };
  getFamille = (soc: any, mat: any, nom: any): Observable<any[]> => {
    const params = new HttpParams().set('soc', soc).set('mat', mat).set('nom', nom)
    return this.http.get<any[]>(API_URL + "CaisseRetr/CaiseeRetr/getFamille", { params });
  };

  calcul_prime_retraite = (benef_prime: any, benef_droi: any, taux_prime: any, dat_remb: any, mat_pers: any, soc: any): Observable<any[]> => {
    const params = new HttpParams().set('benef_prime', benef_prime).set('benef_droi', benef_droi).set('taux_prime', taux_prime)
      .set('dat_remb', dat_remb).set('mat_pers', mat_pers).set('soc', soc)
    return this.http.get<any[]>(API_URL + "CaisseRetr/CaiseeRetr/calcul_prime_retraite", { params });
  };

  getNumRemb = (soc: any, mat: any): Observable<any[]> => {
    const params = new HttpParams().set('soc', soc).set('mat', mat)
    return this.http.get<any[]>(API_URL + "CaisseRetr/CaiseeRetr/getNumRemb", { params });
  };

  getBenefPrime = (soc: any, mat: any, num: any): Observable<any[]> => {
    const params = new HttpParams().set('soc', soc).set('mat', mat).set('num', num)
    return this.http.get<any[]>(API_URL + "CaisseRetr/CaiseeRetr/getBenefPrime", { params });
  };

  addPrimeRetr(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "CaisseRetr/CaiseeRetr/addPrimeRetr", data);
  }

  updatePrimeRetr(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "CaisseRetr/CaiseeRetr/updatePrimeRetr", data);
  }

  addBenefPrimeRetr(data: any): Observable<any[]> {
    return this.http.post<any[]>(API_URL + "CaisseRetr/CaiseeRetr/addBenefPrimeRetr", data);
  }

  getPrimeRetr = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "CaisseRetr/CaiseeRetr/getPrimeRetr");
  };
  getPrimeRetrSais = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "CaisseRetr/CaiseeRetr/getPrimeRetrSais");
  };


  getPrimeRetrSaisMat = (mat: any): Observable<any[]> => {
    const params = new HttpParams().set('mat', mat)
    return this.http.get<any[]>(API_URL + "CaisseRetr/CaiseeRetr/getPrimeRetrSaisMat", { params });
  };
  editionEtatPrimeRetr(numRap: any, soc: any, moi: any, etat: any, mat_deb: any, mat_fin: any, corps: any) {
    const body = {
      soc: soc,
      moi: moi,
      etat: etat,
      mat_deb: mat_deb,
      mat_fin: mat_fin,
      corps: corps
    };
    const params = new HttpParams().set('numRap', numRap);
    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
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

  printEtatPrimeMois(soc: any, moi: any, etat: any, mat_deb: any, mat_fin: any, corps: any) {
    const body = {
      soc: moi ? soc : soc,
      moi: moi ? moi : '',
      etat: etat ? etat : '',
      mat_deb: mat_deb ? mat_deb : '',
      mat_fin: mat_fin ? mat_fin : '',
      corps: corps ? corps : ''
    };
    return this.getNumRap('etat_prime_retraite').pipe(
      switchMap((numRap) => {
        const params = new HttpParams().set('numRap', numRap);
        return this.http.post<any>(API_URL + "Print/Print/pdf", body, { params, responseType: 'blob' as 'json' });
      })
    );
  }
  printPrimeRetraite(soc: any, mat_pers: any) {
    const body = {
      soc: soc ? soc : soc,
      mat_pers: mat_pers ? mat_pers : ''
    };
    return this.getNumRap('prime_retraite').pipe(
      switchMap((numRap) => {
        const params = new HttpParams().set('numRap', numRap);
        return this.http.post<any>(API_URL + "Print/Print/pdf", body, { params, responseType: 'blob' as 'json' });
      })
    );
  }

  printPrimeRetraiteExcel(soc: any, mat_pers: any) {
    const body = {
      soc: soc ? soc : soc,
      mat_pers: mat_pers ? mat_pers : ''
    };
    return this.getNumRap('prime_retraite').pipe(
      switchMap((numRap) => {
        const params = new HttpParams().set('numRap', numRap);
        return this.http.post<any>(API_URL + "Print/Print/excel", body, { params, responseType: 'blob' as 'json' });
      })
    );
  }
  updateEtatPrime(
    codSoc: string,
    matPers: string,
    numPrime: number,
    etatPrime: string
  ): Observable<any> {
    const body = {
      cod_soc: codSoc,
      mat_pers: matPers,
      num_prime: numPrime,
      etat_prime: etatPrime,
    };

    return this.http.patch(API_URL + 'updateEtatPrime', body);
  }

  deletePrimeRetr(soc: string, mat: string, num: number, numFam: number): Observable<any> {
    const params = new HttpParams().set('soc', soc).set('mat', mat).set('num', num).set('numFam', numFam)
    return this.http.delete(API_URL + 'CaisseRetr/CaiseeRetr/deletePrime', { params });
  }
}
