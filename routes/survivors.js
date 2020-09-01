const mongoose = require('mongoose');
const Survivor = require('../models/survivors');
const Inventory = require('../models/inventory');
const { tryCatch } = require('../services/utils');
const { items_list } = require('../services/trades');
const { validateParams } = require('../middlewares/validate_params');

module.exports = app => {
    /**
    * @function
    * @description [GET] - Fetches all survivors, returns an array of json
    * @returns {Object} code 200 (Success)
    * @returns {Object} code 500 (Internal Server Error)
    */
    app.get('/api/survivors', async (req, res) => {
        const [err_find_survivors, survivors] = await tryCatch(
            Survivor
                .find({})
                .populate({ path: 'inventory_ref', model: Inventory })
                .lean()
                .exec()
        );

        if (err_find_survivors)
            return res.status(500).json({
                message: 'An error occurred while fetching survivors, please try again later.',
                err_find_survivors
            });

        res.status(200).send(survivors);
    });


    /**
    * @function
    * @description [POST] - Creates a new survivor, returns the json with the survivor's data
    * @param {JSON} body 
    * @param {String} body.name Survivor name
    * @param {Number} body.age Survivor age
    * @param {String} body.gender Survivor gender
    * @param {Object} body.last_location Survivor last location, in the form { latitude: 0000, longitude: -0.1009 }
    * @param {Object} body.items The list of items that the survivor has
    * @returns {Object} code 200 (Success)
    * @returns {Object} code 400 (Bad Request)
    * @returns {Object} code 500 (Internal Server Error)
    */
    app.post('/api/survivors',
        validateParams({
            properties: {
                name: { type: 'string' },
                age: { type: 'number' },
                gender: { type: 'string', enum: ['M', 'F'] },
                last_location: {
                    type: 'object',
                    minProperties: 2,
                    maxProperties: 2,
                    required: ['longitude', 'latitude']
                },
                items: { type: 'object' }
            },
            required: ['name', 'age', 'gender', 'last_location', 'items']
        }),
        async (req, res) => {
            const { name, age, gender, last_location, items } = req.body;
            const new_items = [];

            for (const item in items) {
                if (items_list[item])
                    new_items.push({
                        name: item,
                        points: parseInt(items[item] * items_list[item]),
                        amount: items[item]
                    });
            }

            const [err_creating_inventory, inventory] = await tryCatch(
                Inventory.create({ items: new_items })
            );

            if (err_creating_inventory)
                return res.status(500).json({
                    message: 'An error occurred while creating the inventory.',
                    err_creating_inventory
                });

            const new_survivor = new Survivor({
                name,
                age,
                gender,
                last_location,
                inventory_ref: mongoose.Types.ObjectId(inventory._id)
            });

            const [err_creating_survivor, survivor] = await tryCatch(
                new_survivor.save()
            );

            if (err_creating_survivor)
                return res.status(500).json({
                    message: 'An error occurred while registering the new survivor, please try again later.',
                    err_creating_survivor
                });

            res.status(200).json({ survivor, inventory });
        });

    
    /**
    * @function
    * @description [PATCH] - Updates survivor's last location
    * @param {JSON} body 
    * @param {String} body._id Survivor id
    * @param {Object} body.last_location Survivor last location, in the form { latitude: 0000, longitude: -0.1009 }
    * @returns {Object} code 200 (Success)
    * @returns {Object} code 400 (Bad Request)
    * @returns {Object} code 500 (Internal Server Error)
    */
    app.patch('/api/survivors',
        validateParams({
            properties: {
                _id: {
                    type: 'string',
                    maxLength: 24,
                    minLength: 24
                },
                last_location: {
                    type: 'object',
                    minProperties: 2,
                    maxProperties: 2,
                    required: ['longitude', 'latitude']
                }
            },
            required: ['_id', 'last_location']
        }),
        async (req, res) => {
            const { _id, last_location } = req.body;

            const options = { upsert: true, new: true };
            const params = {
                last_location: {
                    latitude: last_location.latitude,
                    longitude: last_location.longitude
                }
            }

            const [err_update_survivor, survivor] = await tryCatch(
                Survivor.findOneAndUpdate({ _id: mongoose.Types.ObjectId(_id) }, params, options).exec()
            );

            if (err_update_survivor)
                return res.status(500).json({
                    message: `An error occurred while trying to update the survivor's register.`,
                    err_update_survivor
                });

            res.status(200).json({ message: `Survivor's register was updated successfully.`, survivor });
        });


    /**
    * @function
    * @description [POST] - Flag a survivor as infected
    * @param {JSON} body 
    * @param {String} body._id Survivor id
    * @param {Object} body.infected Target survivor to flag as infected
    * @returns {Object} code 200 (Success)
    * @returns {Object} code 400 (Bad Request)
    * @returns {Object} code 500 (Internal Server Error)
    */
    app.post('/api/survivors/flag_survivor',
        validateParams({
            properties: {
                _id: {
                    type: 'string',
                    maxLength: 24,
                    minLength: 24
                },
                infected: {
                    type: 'string',
                    maxLength: 24,
                    minLength: 24
                }
            },
            required: ['_id', 'infected']
        }),
        async (req, res) => {
            const { _id, infected } = req.body;

            const [err_find_survivor, survivor] = await tryCatch(
                Survivor.findOne({ _id: mongoose.Types.ObjectId(infected) }).lean().exec()
            );

            if (err_find_survivor)
                return res.status(500).json({
                    message: 'An error occurred while trying to find infected survivor.',
                    err_find_survivor
                });

            const already_flagged_by = survivor.flagged_by.find(el => String(el) === String(_id));
            if (already_flagged_by || String(_id) === String(infected))
                return res.status(403).json({
                    message: `Nop, either you already flagged or you're trying to flag yourself as infected...`
                });

            const options = { upsert: true };
            const params = {
                is_infected: survivor.flagged_by.length + 1 >= 5 ? true : false,
                $push: {
                    flagged_by: mongoose.Types.ObjectId(_id)
                }
            }

            const [err_flagging_survivor, flagged_survivor] = await tryCatch(
                Survivor.findOneAndUpdate({ _id: mongoose.Types.ObjectId(infected) }, params, options).exec()
            );

            if (err_flagging_survivor)
                return res.status(500).json({
                    message: 'An error occurred while trying to update the infected survivor.',
                    err_flagging_survivor
                });

            res.status(200).json({ message: 'Survivor flagged successully!' });
        });
}
