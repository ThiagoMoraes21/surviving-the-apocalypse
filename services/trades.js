const itemsList = {
    'Fiji Water': 14,
    'Campbell Soup': 12,
    'First Aid Pouch': 10,
    'AK47': 8
}

/**
 * 
 * @param {object} list 
 */
const getPoints = list => {
    let totalPoints = 0;
    for (const item in list) {
        totalPoints += itemsList[item] * list[item];
    }
    return totalPoints;
}

/**
 * 
 * @param {object} list 
 * @param {array[object]} inventory 
 */
const validInventory = (list, inventory) => {
    for (const item in list) {
        const hasItem = inventory.find(el => String(el.name) === String(item));
        if (!hasItem || list[item] > hasItem.amount) return false;
    }
    return true;
}

/**
 * 
 * @param {object} selection 
 * @param {object} payment 
 * @param {array[object]} survivor_list 
 * @param {array[object]} dealer_list 
 */
const exchangeItems = (selection, payment, survivor_list, dealer_list) => {
    let survivor_inventory = increaseItems(payment, survivor_list);
    survivor_inventory = decreaseItems(selection, survivor_list);

    let dealer_inventory = increaseItems(selection, dealer_list);
    dealer_inventory = decreaseItems(payment, dealer_list);

    return { survivor_inventory,  dealer_inventory };
}

/**
 * 
 * @param {object} insert_list 
 * @param {array[object]} list 
 */
const increaseItems = (insert_list, list) => {
    const new_list = list;
    for(const item in insert_list) {
        const list_item_index = new_list.findIndex(el => String(el.name) === String(item));
        if(list_item_index > -1) {
            new_list[list_item_index].amount += insert_list[item];
            new_list[list_item_index].points = itemsList[item] * new_list[list_item_index].amount;
        } else {
            new_list.push({
                name: item,
                points: itemsList[item] * insert_list[item],
                amount: insert_list[item] 
            });
        }
    }
    return new_list;
}

/**
 * 
 * @param {object} remove_list 
 * @param {array[object]} list 
 */
const decreaseItems = (remove_list, list) => {
    const new_list = list;
    for(const item in remove_list) {
        const list_item_index = new_list.findIndex(el => String(el.name) === String(item));
        if(list_item_index > -1) {
            new_list[list_item_index].amount -= remove_list[item];
            new_list[list_item_index].points = itemsList[item] * new_list[list_item_index].amount;
        }
    }
    return new_list;
}

module.exports = {
    'itemsList': itemsList,
    'getPoints': getPoints,
    'validInventory': validInventory,
    'exchangeItems': exchangeItems
}