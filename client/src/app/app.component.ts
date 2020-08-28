import { Component } from '@angular/core';
import { MENU_ITEMS } from './pages-menu';
import { NbSidebarService } from '@nebular/theme';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	title = 'trz-fronend-challenge';
	menu = MENU_ITEMS;

	constructor(private sidebarService: NbSidebarService){}

	toggleMenu() {
		// this.sidebarService.toggle(false, 'left');
		this.sidebarService.toggle(true, 'left');
	}
}
