const mongoose = require('mongoose');
const Survivors = require('../models/survivors');
const Inventory = require('../models/inventory');
const isInfected = require('../middlewares/is_infected');
const { validateParams } = require('../middlewares/validate_params')
const { tryCatch } = require('../services/utils');
const { items_list } = require('../services/utils');

module.exports = app => {
    /**
    * @function
    * @description [GET] - Gets the percentage of infected survivors.
    * @returns {Object} code 200 (Success)
    * @returns {Object} code 500 (Internal Server Error)
    */
    app.get('/api/reports/infected', async (req, res) => {
        const [err_find_survivors, survivors] = await tryCatch(
            Survivors.find().lean().select('is_infected').exec()
        );

        if (err_find_survivors)
            return res.status(500).json({
                messege: 'An error occurred searching for survivors.',
                err_find_survivors
            });

        const total_survivors = survivors.length;
        const infected = survivors.filter(el => el.is_infected);
        const infected_percentage = (infected.length * 100) / total_survivors;

        res.status(200).json({
            description: 'Percentage of infected survivors',
            infected_percentage: `${infected_percentage.toFixed(2)}%`
        });
    });


    /**
    * @function
    * @description [GET] - Gets the percentage of non-infected survivors.
    * @returns {Object} code 200 (Success)
    * @returns {Object} code 500 (Internal Server Error)
    */
    app.get('/api/reports/non_infected', async (req, res) => {
        const [err_find_survivors, survivors] = await tryCatch(
            Survivors.find().lean().select('is_infected').exec()
        );

        if (err_find_survivors)
            return res.status(500).json({
                messege: 'An error occurred searching for survivors.',
                err_find_survivors
            });

        const total_survivors = survivors.length;
        const non_infected = survivors.filter(el => !el.is_infected);
        const non_infected_percentage = (non_infected.length * 100) / total_survivors;

        res.status(200).json({
            description: 'Percentage of non-infected survivors',
            non_infected_percentage: `${non_infected_percentage.toFixed(2)}%`
        });
    });


    /**
    * @function
    * @description [GET] - Gets the average amount of each kind of resource by the survivor (e.g. 10 Fiji Waters per survivor)
    * @returns {Object} code 200 (Success)
    * @returns {Object} code 500 (Internal Server Error)
    */
    app.get('/api/reports/survivor_inventory', async (req, res) => {
        const [err_find_survivors, survivors] = await tryCatch(
            Survivors
                .find({ is_infected: false })
                .populate({ path: 'inventory_ref', model: Inventory })
                .select('inventory_ref')
                .lean()
                .exec()
        );

        if (err_find_survivors)
            return res.status(500).json({
                messege: 'An error occurred searching for survivors.',
                err_find_survivors
            });

        let inventory_items = {};
        for (const inventory of survivors) {
            for (const item of inventory.inventory_ref.items) {
                inventory_items[item.name] = (inventory_items[item.name] || 0) + item.amount;
            }
        }

        let average = {};
        for (const item in items_list) {
            const total_items = inventory_items[item] || 0;
            average[item] = total_items || survivors.length === 0 ? 0 : Math.ceil(total_items / survivors.length);
        }

        res.status(200).json({
            description: 'The average amount of each kind of resource by the survivor ',
            average
        });
    });


    /**
    * @function
    * @description [GET] - Gets the points lost because of an infected survivor.
    * @returns {Object} code 200 (Success)
    * @returns {Object} code 500 (Internal Server Error)
    */
    app.get('/api/reports/points_lost', async (req, res) => {
        const [err_find_survivors, survivors] = await tryCatch(
            Survivors
                .find({ is_infected: true })
                .populate({ path: 'inventory_ref', model: Inventory })
                .select('inventory_ref')
                .lean()
                .exec()
        );

        if (err_find_survivors)
            return res.status(500).json({
                messege: 'An error occurred searching for survivors.',
                err_find_survivors
            });

        let total_points_lost = 0;
        for (const inventory of survivors) {
            for (const item of inventory.inventory_ref.items) {
                total_points_lost += item.points;
            }
        }

        res.status(200).json({
            description: "Total points lost in items that belong to infected people",
            total_points_lost
        });
    });
}