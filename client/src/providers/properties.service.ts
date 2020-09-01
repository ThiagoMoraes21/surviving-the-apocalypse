import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({
	providedIn: 'root'
})
export class PropertiesService {

	constructor(
		private http: HttpService
	) { }

	tradeItems(data: any) {
		return new Promise((resolve, reject) => {
			this.http.post(`people/${data.person_id}/properties/trade_item.json`, false, data).then(res => {
				resolve(res);
			}).catch(err => reject());
		});
	}

	getInventoryItems(data: any) {
		return new Promise((resolve, reject) => {
			this.http.get(`people/${data.person_id}/properties.json`, false).then(res => {
				resolve(res);
			}).catch(err => reject());
		});
	}
}
