const mongoose = require('mongoose');
const Survivor = require('../models/survivors');
const { tryCatch } = require('../services/utils');

module.exports = async (req, res, next) => {
    const { _id, survivor_id, dealer_id } = req.body;

    if(_id) {
        const [err_find_survivor, survivor] = await tryCatch(
            Survivor.findOne({ _id: mongoose.Types.ObjectId(_id) }).exec()
        );
    
        if(!err_find_survivor) {
            if(survivor.is_infected)
                return res.status(403).json({
                    message: 'Infected survivors cannot performe this action.'
                });
        }
    } else {
        const [err_find_survivors, survivors] = await tryCatch(
            Survivor.find({ _id: {
                $in: [ 
                    mongoose.Types.ObjectId(survivor_id),
                    mongoose.Types.ObjectId(dealer_id)
                ]
            }})
            .lean()
            .exec()
        );
        
        if(!err_find_survivors) {
            if(survivors.find(el => el.is_infected))
                return res.status(403).json({
                    message: 'Infected survivors cannot performe this action.'
                });
        }
    }

    next();
}