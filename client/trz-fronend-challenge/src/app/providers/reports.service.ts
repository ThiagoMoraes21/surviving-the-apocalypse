import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({
	providedIn: 'root'
})
export class ReportsService {

	constructor(
		private http: HttpService
	) { }

	getInfectededs() {
		return new Promise((resolve, reject) => {
			this.http.get(`report/infected.json`, false).then(res => {
				resolve(res);
			}).catch(err => reject());
		});
	}

	getNonInfectededs() {
		return new Promise((resolve, reject) => {
			this.http.get(`report/non_infected.json`, false).then(res => {
				resolve(res);
			}).catch(err => reject());
		});
	}

	getSuvivorInventories() {
		return new Promise((resolve, reject) => {
			this.http.get(`report/people_inventory.json`, false).then(res => {
				resolve(res);
			}).catch(err => reject());
		});
	}

	
	getPointsLost() {
		return new Promise((resolve, reject) => {
			this.http.get(`report/infected_points.json`, false).then(res => {
				resolve(res);
			}).catch(err => reject());
		});
	}
}
