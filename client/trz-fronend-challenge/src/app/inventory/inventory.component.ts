import { Component, OnInit } from '@angular/core';
import { PropertiesService } from '../providers/properties.service';
import { UtilsProvider } from '../commons/utils';
import { PeopleService } from '../providers/people.service';
import { Router } from '@angular/router';
import { ToasterProvider } from '../commons/toaster';

@Component({
	selector: 'app-inventory',
	templateUrl: './inventory.component.html',
	styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit {
	public infected = false;
	public noAccess = true;
	public data = [];
	public settings = {
		pager: {
			perPage: 10
		},
		actions: {
			edit: false,
			delete: false,
			add: false
		},
		columns: {
			name: {
				title: 'Name',
				type: 'string',
			},
			quantity: {
				title: 'Quantity',
				type: 'number'
			},
			points: {
				title: 'Points',
				type: 'number'
			}
		},
		mode: 'external'
	};
	public survivor: any;
	constructor(
		private propertiesService: PropertiesService,
		private utils: UtilsProvider,
		private survivorService: PeopleService,
		private router: Router,
		private toaster: ToasterProvider
	) { }

	ngOnInit(): void {
		this.getProfile();
	}

	async getProfile() {
		const currentSurvivor = JSON.parse(localStorage.getItem('current_survivor'));

		if(!currentSurvivor) {
			this.noAccess = true;
			return;
		}

		const id = currentSurvivor.id;

		const [errGetSurvivor, survivor] = await this.utils.tryCatch(
			this.survivorService.getSurvivor(id)
		);

		if(errGetSurvivor) {
			this.toaster.showErrorToast(
				"Error trying to get Survivor's data.",
				"It wasn't possible to get survivor's data :c"
			);
			this.noAccess = true;
			return;
		}

		this.survivor = Object.assign(currentSurvivor, survivor);

		if(this.survivor.infected) {
			this.infected = true;
			localStorage.removeItem('current_survivor');
			localStorage.setItem('current_survivor', JSON.stringify(this.survivor));
			return;
		}
		this.getProperties();
	}

	async getProperties() {
		const id = this.survivor.id;
		
		const [errGetProperties, properties] = await this.utils.tryCatch(
			this.propertiesService.getInventoryItems({ person_id: id })
		);

		if(errGetProperties) {
			this.toaster.showErrorToast(
				"Error trying to get properties.",
				"It wasn't possible to get the survivors' properties :c"
			);
			return;
		}

		this.data = properties.map(el => {
			return {
				name: el.item.name,
				points: el.item.points,
				quantity: el.quantity
			}
		});

		this.noAccess = false;
	}

	goHome() {
		this.router.navigateByUrl('/dashboard');
	}

}
