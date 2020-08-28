import { NgModule } from "@angular/core";
import { ENV } from "./environment-variables.token";
import { environment } from "./environment";
// import { prodVariables } from "./production";
// import { testVariables } from "./testing";

declare const process: any; // Typescript compiler will complain without this

export function environmentFactory() {
	const NODE_ENV = !(typeof process.env.NODE_ENV === "undefined") ? process.env.NODE_ENV : "dev";
	console.log("Using " + NODE_ENV + " variables.");

	let vars;

	switch (NODE_ENV) {
		// case "prod":
		// 	vars = prodVariables
		// 	break;
		// case "testing":
		// 	vars = testVariables
		// 	break;
		default:
			vars = environment;
			break;
	}

	return vars
}

@NgModule({
	providers: [
		{
			provide: ENV,
			useFactory: environmentFactory
		}
	]
})
export class EnvironmentsModule {}