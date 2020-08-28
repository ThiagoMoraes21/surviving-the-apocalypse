const { getPoints } = require('../services/trades');
const { validInventory } = require('../services/trades');
const { exchangeItems } = require('../services/trades');

describe('getPoints', () => {
    test('Returns the total points from a inventory list', () => {
        const list = {
            'Fiji Water': 2,
            'Campbell Soup': 1, 
            'First Aid Pouch': 3,
            'AK47': 8
        }

        expect(isNaN(getPoints(list))).toEqual(false);
        expect(getPoints(list)).toEqual(134);
    });
});

describe('validInventory', () => {
    const list = {
        'Fiji Water': 2,
        'Campbell Soup': 1, 
        'First Aid Pouch': 3,
        'AK47': 8
    }
    test('Should return true if the list has all the item in the inventory', () => {
        const inventory = [
            { name: 'Fiji Water', amount: 2 },
            { name: 'Campbell Soup', amount: 1 },
            { name: 'First Aid Pouch', amount: 3 },
            { name: 'AK47', amount: 8 }
        ];

        expect(validInventory(list, inventory)).toEqual(true);

    });

    test('Should return false if the list does not have the items in the inventory', () => {
        const inventory = [
            { name: 'Fiji Water', amount: 2 },
            { name: 'Campbell Soup', amount: 1 }
        ];

        expect(validInventory(list, inventory)).toEqual(false);
    });

    test(`Should return false if the amount of items in the inventory doens't match the items amount in the list`, () => {
        const inventory = [
            { name: 'Fiji Water', amount: 1 },
            { name: 'Campbell Soup', amount: 1 },
            { name: 'First Aid Pouch', amount: 2 },
            { name: 'AK47', amount: 4 }
        ];

        expect(validInventory(list, inventory)).toEqual(false);
    });
});

describe('exchangeItems', () => {
    test('Should exchange items between two inventories', () => {
        const selection = {
            'Fiji Water': 2
        }
        const payment = {
            'First Aid Pouch': 2,
            'AK47': 1
        }

        const survivor_list = [
            { name: 'Fiji Water', amount: 2, points: 28 },
            { name: 'Campbell Soup', amount: 3, points: 36 },
            { name: 'First Aid Pouch', amount: 4, points: 40 },
            { name: 'AK47', amount: 8, points: 64 }
        ];

        const dealer_list = [
            { name: 'Fiji Water', amount: 4, points: 56 },
            { name: 'Campbell Soup', amount: 10, points: 120 },
            { name: 'First Aid Pouch', amount: 10, points: 100 },
            { name: 'AK47', amount: 6, points: 48 }
        ];

        const { survivor_inventory,  dealer_inventory } = exchangeItems(selection, payment, survivor_list, dealer_list);

        const dealer_fiji_water = dealer_inventory.find(el => String(el.name) === 'Fiji Water');
        const survivor_fiji_water = survivor_inventory.find(el => String(el.name) === 'Fiji Water');

        const survivor_first_aid_pouch = survivor_inventory.find(el => String(el.name) === 'First Aid Pouch');
        const survivor_ak47 = survivor_inventory.find(el => String(el.name) === 'AK47');

        const dealer_first_aid_pouch = dealer_inventory.find(el => String(el.name) === 'First Aid Pouch');
        const dealer_ak47 = dealer_inventory.find(el => String(el.name) === 'AK47');

        expect(survivor_fiji_water.amount).toEqual(0);
        expect(survivor_first_aid_pouch.amount).toEqual(6);
        expect(survivor_ak47.amount).toEqual(9);

        expect(dealer_fiji_water.amount).toEqual(6);
        expect(dealer_first_aid_pouch.amount).toEqual(8);
        expect(dealer_ak47.amount).toEqual(5);
    });
});