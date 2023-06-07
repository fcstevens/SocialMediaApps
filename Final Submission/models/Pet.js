const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    species: {
        type: String,
        required: true,
    },
    // Include any other fields relevant to your Pet entity

    // Reference to the User owning the pet
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
});

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet;
