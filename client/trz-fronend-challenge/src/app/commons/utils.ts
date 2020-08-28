import { Injectable } from "@angular/core";

@Injectable({
    providedIn: "root"
})
export class UtilsProvider {
    public files = [];
    constructor(
    ) { }

    tryCatch(promise) {
        return promise.then(data => {
            return [null, data];
        })
        .catch(err => [err]);
    }
}