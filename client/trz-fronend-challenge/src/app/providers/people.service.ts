import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({
	providedIn: 'root'
})
export class PeopleService {

	constructor(
		private http: HttpService
	) { }

	reportInfection(data: any) {
		return new Promise((resolve, reject) => {
			this.http.post(`people/${data.id}/report_infection.json`, false, data).then(res => {
				resolve(res);
			}).catch(err => reject(err));
		});
	}

	getSurvivors() {
		return new Promise((resolve, reject) => {
			this.http.get(`people.json`, false).then(res => {
				resolve(res);
			}).catch(err => reject(err));
		});
	}

	registerSuvivor(data: any) {
		console.log('PARAMS: ', data);
		return new Promise((resolve, reject) => {
			this.http.post(`people.json`, false, data).then(res => {
				resolve(res);
			}).catch(err => reject(err));
		});
	}

	getSurvivor(id: string) {
		return new Promise((resolve, reject) => {
			this.http.get(`people/${id}.json`, false).then(res => {
				resolve(res);
			}).catch(err => reject(err));
		});
	}

	updateSuvivor(data: any) {
		return new Promise((resolve, reject) => {
			this.http.patch(`people/${data.id}.json`, false, data).then(res => {
				resolve(res);
			}).catch(err => reject(err));
		});
	}
}