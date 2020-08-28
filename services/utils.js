module.exports = {
    tryCatch: (promise)=> {
		// await without try, catch
		return promise.then(data => {
			return [null, data];
		})
		.catch(err => [err]);
	},
	items_list: {
		'Fiji Water': 14,
		'Campbell Soup': 12,
		'First Aid Pouch': 10,
		'AK47': 8
	}
}