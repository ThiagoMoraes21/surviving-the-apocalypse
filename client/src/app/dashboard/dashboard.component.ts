import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SurvivorsService } from '../../providers/survivors.service';
import { UtilsProvider } from '../commons/utils';
import { AgmMap, MapsAPILoader, MouseEvent } from '@agm/core';
import { ToasterProvider } from '../commons/toaster';
import { styles } from '../commons/map-styles';

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
	public markers = [];
	public survivor: any;
	public firstForm: FormGroup;
	public secondForm: FormGroup;
	public thirdForm: FormGroup;
	public genders = [
		{
			type: 'Masculine',
			value: 'M'
		},
		{
			type: 'Feminine',
			value: 'F'
		}
	]
	public location = {
		latitude: undefined,
		longitude: undefined
	}
	public mapStyles = styles;

	@ViewChild(AgmMap, { static: true }) public agmMap: AgmMap;
	constructor(
		private _formBuilder: FormBuilder,
		private survivorService: SurvivorsService,
		private utils: UtilsProvider,
		private apiloader: MapsAPILoader,
		private toaster: ToasterProvider
	) { }

	ngOnInit(): void {
		const currentSurvivor = JSON.parse(localStorage.getItem('current_survivor'));
		this.survivor = currentSurvivor ? currentSurvivor : undefined;

		this.firstForm = this._formBuilder.group({
			name: ['', Validators.required],
			age: ['', Validators.required],
			gender: ['', Validators.required]
		});

		this.secondForm = this._formBuilder.group({
			'Fiji Water': ['', Validators.required],
			'Campbell Soup': ['', Validators.required],
			'First Aid Pouch': ['', Validators.required],
			'AK47': ['', Validators.required]
		});

		this.thirdForm = this._formBuilder.group({
			thirdCtrl: ['', undefined]
		});

		if (this.survivor && this.survivor.lonlat) {
			let lonlat = this.survivor.lonlat.replace(/point/gi, '');
			lonlat = lonlat.replace(/[()]/g, '');
			this.location.longitude = parseFloat(lonlat.trim().split(' ')[0]);
			this.location.latitude = parseFloat(lonlat.trim().split(' ')[1]);
		}

		this.getCurrentLocation();
	}

	getPersonalInfo() {
		const survivorData = this.firstForm.value;
		const list = [];

		for (const item in survivorData) {
			list.push({
				title: item.charAt(0).toUpperCase() + item.slice(1),
				value: survivorData[item]
			});
		}

		return list;
	}

	getInventory() {
		const inventory = this.secondForm.value;
		const list = [];

		for (const item in inventory) {
			list.push({
				title: item.charAt(0).toUpperCase() + item.slice(1),
				value: inventory[item]
			});
		}

		return list;
	}

	getLocation() {
		if (!this.location.latitude || !this.location.longitude) return []
		const list = [];
		for (const info in this.location) {
			list.push({
				title: info.charAt(0).toUpperCase() + info.slice(1),
				value: this.location[info].toString()
			});
		}
		return list;
	}

	getSurvivorInfo() {
		const survivorData = { ...this.survivor };
		const list = [];

		delete survivorData.id;
		delete survivorData.created_at;
		delete survivorData.updated_at;
		delete survivorData.lonlat;

		for (const item in survivorData) {
			list.push({
				title: item.charAt(0).toUpperCase() + item.slice(1),
				value: survivorData[item]
			});
		}

		return list;
	}

	getPosition() {
		return { lat: this.location.latitude, lng: this.location.longitude };
	}

	mapClicked($event: MouseEvent) {
		this.location.latitude = $event.coords.lat;
		this.location.longitude = $event.coords.lng;
		this.apiloader.load().then(() => {
			let geocoder = new google.maps.Geocoder;
			let latlng = {
				lat: this.location.latitude,
				lng: this.location.longitude
			};
			geocoder.geocode({
				'location': latlng
			}, function (results) {
				if (results[0]) {
					this.currentLocation = results[0].formatted_address;
					console.log('current location: ', this.currentLocation);
				}
			});
		});
	}

	getCurrentLocation() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition((position: Position) => {
				if (position) {
					this.apiloader.load().then(() => {
						this.location.latitude = this.location.latitude ? this.location.latitude : position.coords.latitude;
						this.location.longitude = this.location.longitude ? this.location.longitude : position.coords.longitude;
						// const latitude = this.location.latitude ? this.location.latitude : position.coords.latitude;
						// const longitude = this.location.latitude ? this.location.longitude : position.coords.longitude;
						
						let geocoder = new google.maps.Geocoder;
						let latlng = {
							'lat': this.location.latitude,
							'lng': this.location.longitude
						};
						geocoder.geocode({
							'location': latlng
						}, function (results) {
							if (results[0]) {
								this.currentLocation = results[0].formatted_address;
								console.log('current location: ', results);

								let test = results[0].geometry.location.lat();
								let test2 = results[0].geometry.location.lng();
								console.log('TEST', test, test2)
							}
						});
					});
				}
			})
		}
	}

	resetDashboard() {
		this.survivor = undefined;
		this.location.latitude = undefined;
		this.location.longitude = undefined;
		localStorage.clear();
	}

	async updateSuvivorLocation() {
		let params = this.survivor;
		params.lonlat = `Point(${this.location.longitude} ${this.location.latitude})`;
		const [errUpdateLocation, newLocation] = await this.utils.tryCatch(
			this.survivorService.updateSuvivor(params)
		);

		if (errUpdateLocation) {
			this.toaster.showErrorToast(
				"Error trying to update location",
				"It wasn't possible to update your location, please try again later."
			);
			return;
		}

		this.survivor = newLocation;
		localStorage.removeItem('current_survivor');
		localStorage.setItem('current_survivor', JSON.stringify(this.survivor));
		this.toaster.showSuccessToast("Localização atualizada com sucesso!");
	}

	async submit() {
		const data = { ...this.firstForm.value };
		const inventory = { ...this.secondForm.value }
		let items = '';

		for (const item in inventory) {
			items += `${item}:${inventory[item]};`
		}

		data.items = items;
		data.lonlat = `Point(${this.location.longitude} ${this.location.latitude})`;

		const [errRegisterSuvivor, newSurvivor] = await this.utils.tryCatch(
			this.survivorService.registerSuvivor(data)
		);

		if (errRegisterSuvivor) {
			this.toaster.showErrorToast("Erro ao atualizar localização", "Não foi possível atualizar sua localização, tente novamente mais tarde.");
			return;
		}

		this.survivor = newSurvivor;
		localStorage.clear();
		localStorage.setItem('current_survivor', JSON.stringify(newSurvivor));
		localStorage.setItem('inventory', JSON.stringify(inventory));
		this.toaster.showSuccessToast("Survivor was registered successfully!");
	}

}
