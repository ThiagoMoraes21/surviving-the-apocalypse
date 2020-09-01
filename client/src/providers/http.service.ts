import { Injectable, Inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ENV } from "../environments/environment-variables.token";
import { Observable, of, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class HttpService {
	public user: any;
	private token: any;
	private count = 0;

	constructor(
		private http: HttpClient,
		@Inject(ENV) public ENV: any
	) { }

	get(path: string, auth: boolean = true): any {
		if (!auth) {
			return this.request(path, "get", false);
		} else {
			return this.getToken().then(() => {
				return this.request(path, "get", true);
			});
		}
	}

	post(path: string, auth: boolean = true, data: any): any {
		if (!auth) {
			return this.request(path, "post", false, data);
		} else {
			return this.getToken().then(() => {
				return this.request(path, "post", true, data);
			});
		}
	}

	patch(path: string, auth: boolean = true, data: any): any {
		if (!auth) {
			return this.request(path, "patch", false, data);
		} else {
			return this.getToken().then(() => {
				return this.request(path, "post", true, data);
			});
		}
	}

	getToken(): any {
		return new Promise((resolve, reject) => {
			this.token = localStorage.getItem("currentUser_token");
			resolve(this.token);
		}).catch(err => console.log("Error trying to get token: ", err));
	}

	setToken(token: string): any {
		return new Promise((resolve, reject) => {
			localStorage.setItem("currentUser_token", token);
			this.token = token;
			resolve();
		}).catch(err => console.log("Error trying to set token: ", err));
	}

	request(path: string, method: string, auth: boolean, data: any = {}): any {
		const url: string = String(this.ENV.API_URL) + "/" + String(path);
		const headers: any = {};
		headers["Content-Type"] = "application/json";
		if (auth) {
			headers.Authorization = this.token;
		}

		let params: Array<any>;

		if (method === "post" || method === "patch") {
			params = [url, data, { headers }];

		} else {
			params = [url, { headers }];
		}

		this.count++;
		return new Promise((resolve, reject) => {
			this.http[method](...params)
				.subscribe(res => {
					resolve(res);
				}, (err) => {
					if (err.error.message) return reject(err.error.message)
					reject(err);
				});
		});
	}
	
	showLoader(): void {
		this.ENV.loading = true;
	}

	hideLoader(): void {
		this.ENV.loading = false;
	}
}
