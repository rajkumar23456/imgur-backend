// Step 3 - this is the code for ./models.js

var mongoose = require('mongoose');

var imageSchema = new mongoose.Schema({
	name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true
    },
    password: {
        type: Number,
        min: 5,
        required: true
    },
    repassword: {
        type: Number,
        min: 5,
        required: true
    }, 
    likes: {
        type: Number
    },
    comments: {
        type: String,
        min: [2 ,"comments cannot be empty"]
    },
	img:
	{
		data: Buffer,
		contentType: String
	}
});

//Image is a model which has a schema imageSchema

module.exports = new mongoose.model('Image', imageSchema);

