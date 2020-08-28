import { Component, OnInit } from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { UtilsProvider } from '../commons/utils';
import { ReportsService } from '../providers/reports.service';
import { ToasterProvider } from '../commons/toaster';

@Component({
	selector: 'app-reports',
	templateUrl: './reports.component.html',
	styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
	public options: any = {};
	public itemPerSurvivorOptions: any = {};
	public themeSubscription: any;
	public pointsLost: any;

	constructor(
		private theme: NbThemeService,
		private utils: UtilsProvider,
		private reportsService: ReportsService,
		private toaster: ToasterProvider
	) { }

	ngOnInit(): void {
		this.getInfected();
		this.getAverageItems();
		this.getPointsLost();
	}

	async getInfected() {
		const [errGetInfected, infected] = await this.utils.tryCatch(
			this.reportsService.getInfectededs()
		);

		if(errGetInfected) {
			this.toaster.showErrorToast(
				"Error trying to find infected survivors",
				"It wasn't possible retrieve infected survivors from the database, please try again later."
			);
			return;
		}

		const [errGetNonInfected, nonInfected] = await this.utils.tryCatch(
			this.reportsService.getNonInfectededs()
		);

		if(errGetNonInfected) {
			this.toaster.showErrorToast(
				"Error trying to find non-infected survivors",
				"It wasn't possible retrieve non-infected survivors from the database, please try again later."
			);
			return;
		}

		const data = [
			{ value: infected.report.average_infected, name: 'Infected' },
			{ value: nonInfected.report.average_healthy, name: 'Non-Infected' },
		];

		const legend = ['Infected', 'Non-Infected'];

		this.startChart('options', data, legend);
	}

	async getAverageItems() {
		const [errGetInventories, inventoriesAverage] = await this.utils.tryCatch(
			this.reportsService.getSuvivorInventories()
		);

		if(errGetInventories) {
			this.toaster.showErrorToast(
				"Error trying to the survivors' inventories",
				"It wasn't possible retrieve the inventories of the survivors from the database, please try again later."
			);
			return;
		}

		const itemsPerSurvivor = inventoriesAverage.report.average_quantity_of_each_item_per_person;

		const data = [
			{ value: itemsPerSurvivor['AK47'], name: 'AK47' },
			{ value: itemsPerSurvivor['Campbell Soup'], name: 'Campbell Soup' },
			{ value: itemsPerSurvivor['Fiji Water'], name: 'Fiji Water' },
			{ value: itemsPerSurvivor['First Aid Pouch'], name: 'First Aid Pouch' },
		];

		const legend = ['AK47', 'Campbell Soup', 'Fiji Water', 'First Aid Pouch'];

		this.startChart('itemPerSurvivorOptions', data, legend);
	}


	startChart(options: string, data: any, legend: any) {
		this.themeSubscription = this.theme.getJsTheme().subscribe(config => {
			const colors = config.variables;
			// const echarts: any = config.variables.echarts;

			this[options] = {
				backgroundColor: "#323259",
				color: [colors.warningLight, colors.infoLight, colors.dangerLight, colors.successLight, colors.primaryLight],
				tooltip: {
					trigger: 'item',
					formatter: '{a} <br/>{b} : {c} ({d}%)',
				},
				legend: {
					orient: 'vertical',
					left: 'left',
					data: legend,
					textStyle: {
						color: "#ffffff",
					},
				},
				series: [
					{
						name: 'Survivors',
						type: 'pie',
						radius: '80%',
						center: ['50%', '50%'],
						data: data,
						itemStyle: {
							emphasis: {
								shadowBlur: 10,
								shadowOffsetX: 0,
								shadowColor: "#a16eff",
							},
						},
						label: {
							normal: {
								textStyle: {
									color: "#ffffff",
								},
							},
						},
						labelLine: {
							normal: {
								lineStyle: {
									color: "ffffff",
								},
							},
						},
					},
				],
			};
		});
	}

	async getPointsLost() {
		const [errGetPointsLost, pointsLost] = await this.utils.tryCatch(
			this.reportsService.getPointsLost()
		);

		if(errGetPointsLost) {
			this.toaster.showErrorToast(
				"Error trying to get points lost",
				"It wasn't possible retrieve the lost points for infected survivors, please try again later."
			);
			return;
		}

		this.pointsLost = pointsLost.report.total_points_lost;
	}

	ngOnDestroy(): void {
		this.themeSubscription.unsubscribe();
	}
}
