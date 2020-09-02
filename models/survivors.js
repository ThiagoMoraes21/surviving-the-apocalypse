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
    lonlat: { 
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    inventoryRef: {
        type: Schema.Types.ObjectId,
        ref: 'Inventory'
    },
    isInfected: {
        type: Boolean,
        default: false
    },
    flaggedBy: [{
        type: Schema.Types.ObjectId,
        ref: 'Survivor'
    }]
});

module.exports = mongoose.model('Survivor', survivorSchema);
