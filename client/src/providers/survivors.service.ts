import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({
	providedIn: 'root'
})
export class SurvivorsService {

	constructor(
		private http: HttpService
	) { }

	reportInfection(data: any) {
		return new Promise((resolve, reject) => {
			this.http.post(`api/survivors/flag_survivor`, false, data).then(res => {
				resolve(res);
			}).catch(err => reject(err));
		});
	}

	getSurvivors() {
		return new Promise((resolve, reject) => {
			this.http.get(`api/survivors`, false).then(res => {
				resolve(res);
			}).catch(err => reject(err));
		});
	}

	registerSuvivor(data: any) {
		return new Promise((resolve, reject) => {
			this.http.post(`api/survivors`, false, data).then(res => {
				resolve(res);
			}).catch(err => reject(err));
		});
	}

	getSurvivor(id: string) {
		return new Promise((resolve, reject) => {
			this.http.get(`api/survivor/${id}`, false).then(res => {
				resolve(res);
			}).catch(err => reject(err));
		});
	}

	updateSuvivor(data: any) {
		return new Promise((resolve, reject) => {
			this.http.patch(`api/survivors`, false, data).then(res => {
				resolve(res);
			}).catch(err => reject(err));
		});
	}
}