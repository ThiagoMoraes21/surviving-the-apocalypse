import { Injectable } from "@angular/core";
import { NbComponentStatus, NbToastrService, NbToastrConfig, NbGlobalPhysicalPosition, NbGlobalPositionStrategy, NbGlobalLogicalPosition, NbGlobalPosition } from '@nebular/theme';

@Injectable({
	providedIn: "root"
})
export class ToasterProvider {

	private config: Partial<NbToastrConfig> = {
		duration: 3000,
		position: NbGlobalLogicalPosition.TOP_END,
		status: "basic",
		limit: 3
	}
	constructor(
		private toaster: NbToastrService,
	) { }

	showSuccessToast(message: any, duration?: number, position?: NbGlobalPosition) {
		this.config.status = "primary"
		if (duration) this.config.duration = duration
		if (position) this.config.position = position
        this.toaster.show("Sucesso", message, this.config);
	}
	
	showErrorToast(title: any, message: any, duration?: number, position?: NbGlobalPosition) {
		this.config.status = "danger"
		if (duration) this.config.duration = duration
		if (position) this.config.position = position
        this.toaster.show(title, message, this.config);
	}
	
		
	showWarningToast(title: any, message: any, duration?: number, position?: NbGlobalPosition) {
		this.config.status = "warning"
		if (duration) this.config.duration = duration
		if (position) this.config.position = position
        this.toaster.show(title, message, this.config);
	}

	showInfoToast(title: any, message: any, duration?: number, position?: NbGlobalPosition) {
		this.config.status = "info"
		if (duration) this.config.duration = duration
		if (position) this.config.position = position
        this.toaster.show(title, message, this.config);
	}
	
	showToast(title: any, message: any, duration?: number, position?: NbGlobalPosition) {
		this.config.status = "basic"
		if (duration) this.config.duration = duration
		if (position) this.config.position = position
        this.toaster.show(message, title, this.config);
    }
}
