import { Component, OnInit, TemplateRef } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { PeopleService } from '../providers/people.service';
import { UtilsProvider } from '../commons/utils';
import { Router } from '@angular/router';
import { NbDialogService } from '@nebular/theme';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { PropertiesService } from '../providers/properties.service';
import { ToasterProvider } from '../commons/toaster';

@Component({
	selector: 'app-survivors',
	templateUrl: './survivors.component.html',
	styleUrls: ['./survivors.component.scss']
})
export class SurvivorsComponent implements OnInit {
	public survivor: any;
	public data = [];
	public settings = {
		pager: {
			perPage: 10
		},
		actions: {
			edit: true,
			delete: true,
			add: false,
			columnTitle: 'Actions'
		},
		edit: {
			editButtonContent: 'Trade'
		},
		delete: {
			deleteButtonContent: 'Is Infected',
			confirmDelete: true
		},
		columns: {
			name: {
				title: 'Name',
				type: 'string',
			},
			gender: {
				title: 'Gender',
				type: 'string'
			},
			age: {
				title: 'Age',
				type: 'number',
			},
			infected: {
				title: 'Infected',
				type: 'boolean'
			}
		},
		mode: 'external'
	};
	public firstForm: FormGroup;
	public secondForm: FormGroup;
	public total = 0;
	public payment = 0;
	public person: any;
	public consumer: any;

	constructor(
		private survivorService: PeopleService,
		private propertiesService: PropertiesService,
		private utils: UtilsProvider,
		private router: Router,
		private dialogService: NbDialogService,
		private _formBuilder: FormBuilder,
		private toaster: ToasterProvider
	) { }

	ngOnInit(): void {
		const currentSurvivor = JSON.parse(localStorage.getItem('current_survivor'));
		this.survivor = currentSurvivor ? currentSurvivor : undefined;
		this.getAllSurvivors();
	}

	async getAllSurvivors() {
		const [errFetchSurvivors, survivors] = await this.utils.tryCatch(
			this.survivorService.getSurvivors()
		);

		if (errFetchSurvivors) {
			this.toaster.showErrorToast(
				"Error trying to fetch survivors.",
				"It wasn't possible to retrieve the survivors, please try again later.",
				8000
			);
			return;
		}

		this.data = survivors;
	}

	async reportInfection(event) {
		if (!this.survivor) {
			this.toaster.showWarningToast(
				"Warning",
				"To report an infected survivor you must register yourself, you can do that in the dashboard.",
				8000
			);
			return;
		}

		if (window.confirm('Are you sure you want to flag this person as infected?')) {
			const data = event.data;
			const infected = this.getId(data);
			const id = this.survivor.id;

			const [errReportInfected, infectedSurvivor] = await this.utils.tryCatch(
				this.survivorService.reportInfection({ infected, id })
			);

			if (errReportInfected) {
				this.toaster.showErrorToast(
					"Error.",
					"It wasn't possible to complete the report for this survivor, please try again later.",
					8000
				);
				return;
			}

			this.toaster.showSuccessToast("Your report was successfull!");
			this.getAllSurvivors();
		}
	}

	async initTrade(event, dialog: TemplateRef<any>) {
		if (!this.survivor) {
			if (window.confirm('To make a trade you must register yourself first, wanna do that now ?')) {
				return this.router.navigateByUrl('/dashboard');
			} else return;
		}

		if (this.survivor.infected || event.data.infected) {
			this.toaster.showWarningToast(
				"Warining",
				"Because you or the person is infected this trade can't happening :c",
				8000
			);
			return;
		}

		this.person = event.data;
		this.consumer = { ...this.survivor };

		if(this.person.name === this.consumer.name) {
			this.toaster.showWarningToast(
				"Warning",
				"You cannot trade with yourself :)",
				8000
			);
			return;
		}

		// Get the survivors' invetories
		const [errGetPersonInventory, personInventory] = await this.utils.tryCatch(
			this.getInventory(this.person)
		);

		if(errGetPersonInventory) {
			this.toaster.showErrorToast(
				"Error",
				"An error occurred while trying to retrive the survivors inventory.",
				8000
			);
			return;
		}

		const [errGetConsumerInventory, consumerInventory] = await this.utils.tryCatch(
			this.getInventory(this.consumer)
		);

		if(errGetConsumerInventory) {
			this.toaster.showErrorToast(
				"Error",
				"An error occurred while trying to retrive the survivors inventory.",
				8000
			);
			return;
		}

		// Attribute the inventories to there respectives survivors
		this.person.invetory = personInventory;
		this.consumer.invetory = consumerInventory;

		// initialize forms
		this.initializeForms();

		const data = { person: {...this.person}, consumer: {...this.consumer} };

		// // initialize dialog
		this.dialogService.open(
			dialog,
			{ context: data, dialogClass: 'model-full' }
		);
	}

	initializeForms() {
		const groups = {
			'Fiji Water': ['', undefined],
			'Campbell Soup': ['', undefined],
			'First Aid Pouch': ['', undefined],
			'AK47': ['', undefined]
		}

		this.firstForm = this._formBuilder.group(groups);
		this.secondForm = this._formBuilder.group(groups);
	}

	getInventory(survivor: any) {
		return new Promise(async (resolve, reject) => {
			const id = this.getId(survivor);
			
			const [errGetInvetory, inventory] = await this.utils.tryCatch(
				this.propertiesService.getInventoryItems({ person_id: id })
			);

			if(errGetInvetory) return reject(errGetInvetory);

			resolve(inventory.map(el => {
				return {
					name: el.item.name,
					quantity: el.quantity,
					points: el.item.points
				}
			}));
		})
		.catch(err => {
			console.log('ERROR TRYING TO GET SURVIVOR INVENTORY...', err);
			throw err;
		});
	}

	getId(survivor: any) {
		if(survivor.id) return survivor.id;

		const url = survivor.location.split('/');
		const id = url[url.length - 1];
		return id;
	}

	getPoints(form, value, item) {
		let total = 0;
		let fields = { ...form.value };
		const itemPoints = {
			'Fiji Water': 14,
			'Campbell Soup': 12 ,
			'First Aid Pouch': 10 ,
			'AK47': 8
		}

		for(const val in fields) {
			if(!fields[val]) continue;
			if(fields[val] > item.quantity) {
				this[value] = `'${val}' value is too large.`
				return;
			}
			total += parseInt(fields[val]) * itemPoints[val];
		}

		this[value] = undefined;
		this[value] = total;
	}

	validInputs(value) {
		return isNaN(this[value]) || this[value] === 0 ? true : false;
	}

	validPayment() {
		return this.payment !== this.total ? true : false;
	}

	async tradeItems() {
		const pick = { ...this.firstForm.value };
		const payment = { ...this.secondForm.value };

		let consumerPayment = '';
		let consumerPick = '';

		for(const item in pick) {
			if(pick[item] > 0) consumerPick += `${item}:${pick[item]};`;
			if(payment[item] > 0) consumerPayment += `${item}:${payment[item]};`;
		}
		
		const params = {
			'person_id': this.getId(this.person),
			'consumer': {
				'name': this.consumer.name,
				'pick': consumerPayment,
				'payment': consumerPick
			}
		}

		const [errTrade, trade] = await this.utils.tryCatch(
			this.propertiesService.tradeItems(params)
		);

		if(errTrade) {
			this.toaster.showErrorToast(
				"Error",
				"An error occurred while trying to exchange items.",
				8000
			);
			return;
		}

		const [errGetNewInventory, newInventory] = await this.utils.tryCatch(
			this.getInventory(this.survivor)
		);

		if(errGetNewInventory) {
			this.toaster.showErrorToast(
				'Error update inventory', 
				'An error occurred while trying to get your inventory.', 
				5000
			);
			return;
		}

		let inventory = {};
		for(const item of newInventory) {
			inventory[item.name] = item.quantity;
		}

		localStorage.removeItem('inventory');
		localStorage.setItem('inventory', JSON.stringify(inventory));
	}
}
