const mongoose = require('mongoose');
const { Schema } = mongoose;

const inventorySchema = new Schema({
    items: [{
        name: { 
            type: String,
            required: true 
        },
        points: { 
            type: Number,
            required: true
        },
        amount: { 
            type: Number,
            required: true
        }
    }]
});

module.exports = mongoose.model('Inventory', inventorySchema);