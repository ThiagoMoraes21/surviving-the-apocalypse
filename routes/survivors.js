const mongoose = require('mongoose');
const Survivor = require('../models/survivors');
const Inventory = require('../models/inventory');
const { tryCatch } = require('../services/utils');
const { itemsList } = require('../services/trades');
const { validateParams } = require('../middlewares/validate_params');

module.exports = app => {
    /**
    * @function
    * @description [GET] - Fetches all survivors, returns an array of json
    * @returns {Object} code 200 (Success)
    * @returns {Object} code 500 (Internal Server Error)
    */
    app.get('/api/survivors', async (req, res) => {
        const [errFindSurvivors, survivors] = await tryCatch(
            Survivor
                .find({})
                .populate({ path: 'inventoryRef', model: Inventory })
                .lean()
                .exec()
        );

        if (errFindSurvivors)
            return res.status(500).json({
                message: 'An error occurred while fetching survivors, please try again later.',
                errFindSurvivors
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
    * @param {Object} body.lonlat Survivor last location, in the form { latitude: 0000, longitude: -0.1009 }
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
                lonlat: {
                    type: 'object',
                    minProperties: 2,
                    maxProperties: 2,
                    required: ['longitude', 'latitude']
                },
                items: { type: 'object' }
            },
            required: ['name', 'age', 'gender', 'lonlat', 'items']
        }),
        async (req, res) => {
            const { name, age, gender, lonlat, items } = req.body;
            const newItems = [];
            console.log('PARAMS: ', name, age, gender, lonlat, items)
            for (const item in items) {
                if (itemsList[item])
                    newItems.push({
                        name: item,
                        points: parseInt(items[item] * itemsList[item]),
                        amount: items[item]
                    });
            }

            const [errCreatingInventory, inventory] = await tryCatch(
                Inventory.create({ items: newItems })
            );

            if (errCreatingInventory)
                return res.status(500).json({
                    message: 'An error occurred while creating the inventory.',
                    errCreatingInventory
                });

            const newSurvivor = new Survivor({
                name,
                age,
                gender,
                lonlat,
                inventoryRef: mongoose.Types.ObjectId(inventory._id)
            });

            const [errCreatingSurvivor, survivor] = await tryCatch(
                newSurvivor.save()
            );

            if (errCreatingSurvivor)
                return res.status(500).json({
                    message: 'An error occurred while registering the new survivor, please try again later.',
                    errCreatingSurvivor
                });

            res.status(200).json({ survivor, inventory });
        });

    
    /**
    * @function
    * @description [PATCH] - Updates survivor's last location
    * @param {JSON} body 
    * @param {String} body._id Survivor id
    * @param {Object} body.lonlat Survivor last location, in the form { latitude: 0000, longitude: -0.1009 }
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
                lonlat: {
                    type: 'object',
                    minProperties: 2,
                    maxProperties: 2,
                    required: ['longitude', 'latitude']
                }
            },
            required: ['_id', 'lonlat']
        }),
        async (req, res) => {
            const { _id, lonlat } = req.body;

            const options = { upsert: true, new: true };
            const params = {
                lonlat: {
                    latitude: lonlat.latitude,
                    longitude: lonlat.longitude
                }
            }

            const [errUpdateSurvivor, survivor] = await tryCatch(
                Survivor.findOneAndUpdate({ _id: mongoose.Types.ObjectId(_id) }, params, options).exec()
            );

            if (errUpdateSurvivor)
                return res.status(500).json({
                    message: `An error occurred while trying to update the survivor's register.`,
                    errUpdateSurvivor
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

            const [errFindSurvivor, survivor] = await tryCatch(
                Survivor.findOne({ _id: mongoose.Types.ObjectId(infected) }).lean().exec()
            );

            if (errFindSurvivor)
                return res.status(500).json({
                    message: 'An error occurred while trying to find infected survivor.',
                    error: errFindSurvivor
                });

            const alreadyFlaggedBy = survivor.flaggedBy.find(el => String(el) === String(_id));
            if (alreadyFlaggedBy || String(_id) === String(infected))
                return res.status(403).json({
                    message: `Nop, either you already flagged or you're trying to flag yourself as infected...`
                });

            const options = { upsert: true };
            const params = {
                isInfected: survivor.flaggedBy.length + 1 >= 5 ? true : false,
                $push: {
                    flaggedBy: mongoose.Types.ObjectId(_id)
                }
            }

            const [errFlaggingSurvivor, flaggedSurvivor] = await tryCatch(
                Survivor.findOneAndUpdate({ _id: mongoose.Types.ObjectId(infected) }, params, options).exec()
            );

            if (errFlaggingSurvivor)
                return res.status(500).json({
                    message: 'An error occurred while trying to update the infected survivor.',
                    error: errFlaggingSurvivor
                });

            res.status(200).json({ message: 'Survivor flagged successully!' });
        });
}
