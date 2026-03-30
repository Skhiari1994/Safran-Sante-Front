import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
const API_URL = environment.urlServer;
import { OffDTO } from './sais-dem-conv/sais-dem-conv.component';

@Injectable({
  providedIn: 'root'
})
export class ConventionServiceService {


  constructor(private http: HttpClient) { }

  getgetListConv(data: any): Observable<any> {
    return this.http.put<any>(API_URL + "api/auth/updatePass", data);
  }



  getConvSusp(data: any): Observable<any> {
    return this.http.get<any[]>(API_URL + "Convention/conv/demConv/" + data);
  };

  getOffConv = (conv: any, mat: any): Observable<any[]> => {
    const params = new HttpParams().set('conv', conv).set('mat', mat)
    return this.http.get<any[]>(API_URL + "Convention/conv/getOffConv", { params });
  };







  addDemConv(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "Convention/conv/addDemConv", data);
  }

  findAllMotif = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Convention/conv/findAllMotif");
  };

  addOffDemConv(data: any): Observable<any> {
    return this.http.post<any>(API_URL + "Convention/conv/addOffDemConv", data);
  }

  getLigOffConv = (soc: any, mois: any, corps: any): Observable<any[]> => {

    const params = new HttpParams().set('soc', soc).set('mois', mois).set('corps', corps)
    return this.http.get<any[]>(API_URL + "Convention/conv/getLigOffConv", { params });
  };

  updateLigOffConvModPay(conv: any, off: any, mat: any, seq: any, pay: any): Observable<any> {
    const params = new HttpParams().set('conv', conv).set('off', off).set('mat', mat).set('seq', seq).set('pay', pay)
    return this.http.get<any>(API_URL + "Convention/conv/updateLigOffConvModPay", { params });
  }

  updateLigOffConvModEtat(conv: any, soc: any, off: any, mat: any, seq: any, mois: any, pay: any): Observable<any> {
    const params = new HttpParams().set('conv', conv).set('soc', soc).set('off', off).set('mat', mat).set('seq', seq).set('mois', mois).set('etat', pay)
    return this.http.put<any>(API_URL + "Convention/conv/updateLigOffConvModEtat", null, { params });
  }

  updateLigOffConv(conv: any, soc: any, off: any, mat: any, seq: any, mois: any, pay: any): Observable<any> {
    const params = new HttpParams().set('conv', conv).set('soc', soc).set('off', off).set('mat', mat).set('seq', seq).set('mois', mois).set('etat', pay)
    return this.http.put<any>(API_URL + "Convention/conv/updateLigOffConv", null, { params });
  }

  updateLigOffConvVir(conv: any, soc: any, off: any, mat: any, seq: any, mois: any, vir: any): Observable<any> {
    const params = new HttpParams().set('conv', conv).set('soc', soc).set('off', off).set('mat', mat).set('seq', seq).set('mois', mois).set('vir', vir)
    return this.http.put<any>(API_URL + "Convention/conv/updateLigOffConvVir", null, { params });
  }
  getDiskPret = (corps: any, mois: any): Observable<any[]> => {

    const params = new HttpParams().set('corps', corps).set('mois', mois)
    return this.http.get<any[]>(API_URL + "Convention/conv/getDiskPret", { params });
  };

  maj_convention = (soc: any, mois: any, corps: any, mat: any): Observable<any[]> => {

    const params = new HttpParams().set('soc', soc).set('mois', mois).set('corps', corps).set('mat', mat)
    return this.http.get<any[]>(API_URL + "Convention/conv/maj_convention", { params });
  };
  getListConv(soc: any): Observable<any> {
    return this.http.get<any>(API_URL + "Convention/conv/demConv/" + soc);
  }
  getListCodOff(codOff: any): Observable<any> {
    return this.http.get<any>(API_URL + "Convention/conv/listOffConv/" + codOff);
  }

  getListCodConv(): Observable<any> {
    return this.http.get<any>(API_URL + "Convention/conv/listCodConv");
  }


  getListPersonnel(): Observable<any> {
    return this.http.get<any>(API_URL + "Convention/conv/listPers");
  }


  getNais(soc: any, mat: any): Observable<any> {
    return this.http.get<any>(API_URL + "Convention/conv/getNais/" + soc + "/" + mat);
  }

  executeProcedure(offDto: OffDTO): Observable<any> {
    return this.http.post<any>(API_URL + "Convention/conv/execProcOff", offDto);
  }

  addOffDemande(off: any): Observable<any> {
    return this.http.post<any>(API_URL + "Convention/conv/addOff", off);
  }


  getNextSeq(codSoc: string, matPers: string, codConv: string, codOff: string): Observable<number> {
    const params = new HttpParams()
      .set('codSoc', codSoc)
      .set('matPers', matPers)
      .set('codConv', codConv)
      .set('codOff', codOff);

    return this.http.get<number>(API_URL + "Convention/conv/seq", { params });
  }

  addDemOffreConv(conv: any): Observable<any> {
    return this.http.post<any>(API_URL + "Convention/conv/addDemConv", conv);
  }

  getListDemOff(
    codConv: string,
    codSoc: string,
    matPers: string,
  ): Observable<any[]> {
    const params = new HttpParams()
      .set('codConv', codConv)
      .set('codSoc', codSoc)
      .set('matPers', matPers)

    return this.http.get<any[]>(API_URL + "Convention/conv/list-dem-off", { params });
  }

  getListDemOffPers(
    codSoc: string,
    matPers: string,
  ): Observable<any[]> {
    const params = new HttpParams()
      .set('codSoc', codSoc)
      .set('matPers', matPers)

    return this.http.get<any[]>(API_URL + "Convention/conv/getListDemOffPers", { params });
  }
  updateEtatDemConvBatch(requestData: any): Observable<any> {
    return this.http.post(API_URL + "Convention/conv/updateEtatDemConvBatch", requestData);
  }

  getAllOffConv = (): Observable<any[]> => {
    return this.http.get<any[]>(API_URL + "Print/personnel/getOffConv");
  };
  editionEtatSusp(numRap: any, soc: any, matDeb: any, annee: any) {
    const body = {
      cod_soc: soc,
      mat_deb: matDeb,
      moisAnnee: annee,
    };

    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }

  editionListConv(numRap: any, soc: any, codConv: any, offConv: any, matDeb: any, matFin: any, datDeb: any, datFin: any, etat: any) {
    const body = {
      cod_soc: soc,
      mat_deb: matDeb,
      mat_fin: matFin,
      date_deb: datDeb,
      date_fin: datFin,
      cod_conv: codConv,
      off_conv: offConv,
      etat_off_dem: etat
    };

    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }
  editionListConvGlb(numRap: any, soc: any, codConv: any, matDeb: any, matFin: any, datDeb: any, datFin: any, etat: any) {
    const body = {
      cod_soc: soc,
      mat_deb: matDeb,
      mat_fin: matFin,
      date_deb: datDeb,
      date_fin: datFin,
      cod_conv: codConv,
      etat_off_dem: etat
    };

    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }
  editionListConvMois(numRap: any, soc: any, mois: any, matDeb: any, matFin: any, etat: any) {
    const body = {
      cod_soc: soc,
      mat_deb: matDeb,
      mat_fin: matFin,
      moisAnnee: mois,
      etat: etat
    };
    console.log("body :", body)
    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }

  editionListRegEspece(numRap: any, soc: any, mois: any, matDeb: any, matFin: any, codOff: any, etat: any) {
    const body = {
      cod_soc: soc,
      mat_deb: matDeb,
      mat_fin: matFin,
      moisAnnee: mois,
      cod_off: codOff,
      etat: etat
    };
    console.log("body :", body)
    const params = new HttpParams().set('numRap', numRap);

    const httpOptions = {
      params, // => query params
      responseType: 'blob' as 'json' // pour recevoir un PDF
    };

    return this.http.post<any>(API_URL + "Print/Print/pdf", body, httpOptions);
  }

  getConvVal(
    codSoc: string,
    matPers: string,
  ): Observable<any[]> {
    const params = new HttpParams()
      .set('codSoc', codSoc)
      .set('matPers', matPers)

    return this.http.get<any[]>(API_URL + "Convention/conv/getConvVal", { params });
  }

  getConvValIn(
    codSoc: string,
    matPers: string,
  ): Observable<any[]> {
    const params = new HttpParams()
      .set('codSoc', codSoc)
      .set('matPers', matPers)

    return this.http.get<any[]>(API_URL + "Convention/conv/getConvValIn", { params });
  }


  getConvValInCodConv(
    codSoc: string,
    matPers: string,
    codConv: string
  ): Observable<any[]> {
    const params = new HttpParams()
      .set('codSoc', codSoc)
      .set('matPers', matPers)
      .set('codConv', codConv)

    return this.http.get<any[]>(API_URL + "Convention/conv/getConvValInCodConv", { params });
  }

  getConvValSusp(
    codSoc: string
  ): Observable<any[]> {
    const params = new HttpParams()
      .set('codSoc', codSoc)

    return this.http.get<any[]>(API_URL + "Convention/conv/getConvValSusp", { params });
  }

  getDateRetraite(codSoc: string, matPers: string): Observable<string> {
    const params = new HttpParams()
      .set('codSoc', codSoc)
      .set('matPers', matPers);
    return this.http.get(API_URL + "Convention/conv/dateRetr", { params, responseType: 'text' });
  }
}
