const mongoose = require('mongoose');
const Survivor = require('../models/survivors');
const Inventory = require('../models/inventory');
const { tryCatch } = require('../services/utils');
const { getPoints } = require('../services/trades');
const { validInventory } = require('../services/trades');
const { exchangeItems } = require('../services/trades');
const { validateParams } = require('../middlewares/validate_params');
const isInfected = require('../middlewares/is_infected');


module.exports = app => {

    /**
    * @function
    * @description [GET] - Fetches all items of the survivor
    * @param {JSON} body 
    * @param {String} body.survivor_id Survivor Id
    * @returns {Object} code 200 (Success)
    * @returns {Object} code 406 (Not Acceptable)
    * @returns {Object} code 500 (Internal Server Error)
    */
    app.get('/api/inventory',
        validateParams({
            properties: {
                survivor_id: {
                    type: 'string',
                    maxLength: 24,
                    minLength: 24
                }
            },
            required: ['survivor_id']
        }),
        isInfected,
        async (req, res) => {
            const { survivor_id } = req.body;

            // Checks if it's a valid _id
            if (!mongoose.Types.ObjectId.isValid(survivor_id))
                return res.status(406).json({
                    message: 'You must provide a valid survivor object _id.'
                });

            // Gets all items from the survivors's inventory
            const [err_find_items, items] = await tryCatch(
                Survivor
                    .findOne({ _id: mongoose.Types.ObjectId(survivor_id) })
                    .populate({ path: 'inventory_ref', model: Inventory })
                    .select('inventory_ref')
                    .lean()
                    .exec()
            );

            // Handles query errors
            if (err_find_items)
                return res.status(500).json({
                    message: 'An error occurred while trying to fetche the items.',
                    err_find_items
                });

            res.status(200).send(items);
        });


    /**
    * @function
    * @description [POST] - Trade inventory items between survivors
    * @param {JSON} body 
    * @param {String} body.survivor_id Survivor Id
    * @param {String} body.dealer_id Dealer Id
    * @param {Object} body.selection The list of items and quantities selected by the dealer, in the format { Fiji Water:10; Campbell Soup:5 }
    * @param {Object} body.payment The list of items and quantities to pay the selection, in the format { Fiji Water:5;Campbell Soup:10 }
    * @returns {Object} code 200 (Success)
    * @returns {Object} code 406 (Not Acceptable)
    * @returns {Object} code 500 (Internal Server Error)
    */
    app.post('/api/inventory',
        validateParams({
            properties: {
                survivor_id: {
                    type: 'string',
                    maxLength: 24,
                    minLength: 24
                },
                dealer_id: {
                    type: 'string',
                    maxLength: 24,
                    minLength: 24
                },
                selection: { type: 'object' },
                payment: { type: 'object' }
            },
            required: ['survivor_id', 'dealer_id', 'selection', 'payment']
        }),
        isInfected,
        async (req, res) => {
            const { survivor_id, dealer_id, selection, payment } = req.body;

            // Get survivors inventories
            const [err_find_inventories, inventories] = await tryCatch(
                Survivor
                    .find({
                        _id: {
                            $in: [
                                mongoose.Types.ObjectId(survivor_id),
                                mongoose.Types.ObjectId(dealer_id)
                            ]
                        }
                    })
                    .populate({ path: 'inventory_ref', model: Inventory })
                    .select('inventory_ref')
                    .lean()
                    .exec()
            );

            if (err_find_inventories)
                return res.status(500).json({
                    message: `An error occurred while trying to find the survivors' inventories.`
                });


            const survivor_list = inventories.find(el => String(el._id) === String(survivor_id));
            const dealer_list = inventories.find(el => String(el._id) === String(dealer_id));

            // Verifies if the inventories have the selected items before start the trade,
            // the items' amount in the inventory must be equal or greater than the items being trade.
            if (!validInventory(selection, survivor_list.inventory_ref.items) ||
                !validInventory(payment, dealer_list.inventory_ref.items))
                return res.status(401).json({
                    message: `The provided selection|payment does not matches the survivors' inventories.`
                });

            // Get the total points of the selection and payment lists
            const selection_points = getPoints(selection);
            const payment_points = getPoints(payment);

            // Checks if both sides of the trade have the same amount of points, if yes
            // starts the exchange, if no returns a warning message.
            if (payment_points === selection_points) {
                // Exchange items between survivors' inventories
                const { survivor_inventory, dealer_inventory } = exchangeItems(
                    selection,
                    payment,
                    survivor_list.inventory_ref.items,
                    dealer_list.inventory_ref.items
                );

                // updates the survivor inventory
                const options = { upsert: true };
                const [err_survivor_inventory, new_survivor_inventory] = await tryCatch(
                    Inventory
                        .update(
                            { _id: mongoose.Types.ObjectId(survivor_list.inventory_ref._id) },
                            { items: survivor_inventory },
                            options
                        )
                        .exec()
                );

                if (err_survivor_inventory)
                    return res.status(500).json({
                        message: 'An error occurred while trying to complete the trade.',
                        err_survivor_inventory
                    });

                // updates the dealer inventory
                const [err_dealer_inventory, new_dealer_inventory] = await tryCatch(
                    Inventory
                        .update(
                            { _id: mongoose.Types.ObjectId(dealer_list.inventory_ref._id) },
                            { items: dealer_inventory },
                            options
                        )
                        .exec()
                );

                if (err_dealer_inventory)
                    return res.status(500).json({
                        message: 'An error occurred while trying to complete the trade.',
                        err_dealer_inventory
                    });

            } else {
                return res.status(401).json({
                    message: `Both sides of the trade need to have the same points.`,
                    selection_points,
                    payment_points
                });
            }

            res.status(200).json({ message: 'Trade completed successfuly!' });
        });
}