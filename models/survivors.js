const mongoose = require('mongoose');
const { Schema } = mongoose;

const survivorSchema = new Schema({
    name: { 
        type: String,
        required: true
    },
    age: { 
        type: Number,
        required: true
    },
    gender: { 
        type: String,
        enum: ['M', 'F'],
        required: true
    },
    last_location: { 
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    inventory_ref: {
        type: Schema.Types.ObjectId,
        ref: 'Inventory'
    },
    is_infected: {
        type: Boolean,
        default: false
    },
    flagged_by: [{
        type: Schema.Types.ObjectId,
        ref: 'Survivor'
    }]
});

module.exports = mongoose.model('Survivor', survivorSchema);
