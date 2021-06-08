// Step 1 - set up express & mongoose

var express = require('express')
var app = express()
var bodyParser = require('body-parser');
var mongoose = require('mongoose')

var fs = require('fs');
var path = require('path');
require('dotenv/config');

// Step 2 - connect to the database

mongoose.connect(process.env.MONGO_URL,
	{ useNewUrlParser: true, useUnifiedTopology: true }, err => {
		console.log('connected')
	});


    
// Step 3 - code was added to ./models.js

// Step 4 - set up EJS

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Set EJS as templating engine
app.set("view engine", "ejs");

    // Step 5 - set up multer for storing uploaded files

var multer = require('multer');

var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads')
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname )
	}
});

var upload = multer({ storage: storage });


// Step 6 - load the mongoose model for Image

var imgModel = require('./model');


// Step 7 - the GET request handler that provides the HTML UI

app.get('/', (req, res) => {
	imgModel.find({}, (err, items) => {
		if (err) {
			console.log(err);
			res.status(500).send('An error occurred', err);
		}
		else {
			res.render('imagesPage', { items: items });
		}
	});
});


// Step 8 - the POST handler for processing the uploaded file

app.post('/', upload.single('image'), (req, res, next) => {

    if(!req.body.email) {
        return res.status(400).send({
            message: "email cannot be empty"
        });
    } else if(req.body.password !== req.body.repassword) {
        return res.status(400).send({
            message: "Password does not match"
        })
    }
    
	var obj = {
		name: req.body.name,
		email: req.body.email,
        password: req.body.password,
		repassword: req.body.repassword,
        likes: req.body.likes,
		comments: req.body.comments,
		img: {
			data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
			contentType: 'image/png'
		}
	}
	imgModel.create(obj, (err, item) => {
		if (err) {
			console.log(err);
		}
		else {
			// item.save();
			res.redirect('/');
		}
	});
});

app.get('/:noteId' ,(req , res) => {
	imgModel.findById(req.params.noteId)
	.then(obj => {
		if(!obj) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });            
        }
        res.send(obj);
    }).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Error retrieving note with id " + req.params.noteId
        });
    
	})
})
	
 // Update a Note with noteId
 app.put('/:noteId', (req , res) => {
	  // Find document and update it with the request body
	  imgModel.findByIdAndUpdate(req.params.noteId, {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        repassword: req.body.repassword,
        image: req.body.image,
        likes: req.body.likes || 1,
        comments: req.body.comments
    }, {new: true})
	.then(obj => {
        if(!obj) {
            return res.status(404).send({
                message: "document not found with id " + req.params.noteId
            });
        }
        res.send(obj);
	}).catch(err => {
        if(err.kind === 'ObjectId') {
            return res.status(404).send({
                message: "document not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "error updating document with id " + req.params.noteId
        });
    });
 });

  //update a particular field in document
  app.patch('/:noteId', (req , res) => {
     
    let objToUpdate = {};
    if(req.body.name) objToUpdate = { ...objToUpdate, name: req.body.name }
    if(req.body.email) objToUpdate = { ...objToUpdate, email: req.body.email }
    if(req.body.password) objToUpdate = { ...objToUpdate, password: req.body.password }
    if(req.body.repassword) objToUpdate = { ...objToUpdate, repassword: req.body.repassword}
    if(req.body.image) objToUpdate = { ...objToUpdate, image: req.body.image}
    if(req.body.likes) objToUpdate = { ...objToUpdate, likes: req.body.likes || 1}
    if(req.body.comments) objToUpdate = { ...objToUpdate, comments: req.body.comments}
    imgModel.findOneAndUpdate({ _id: req.params.noteId }, 
        objToUpdate

    , {new: true})
	.then(obj => {
		if(!obj) {
			return res.status(404).send({
				message: "document not found with id " + req.params.noteId
			});
		}
		res.send(obj);
	}).catch(err => {
		if(err.kind === 'ObjectId') {
			return res.status(404).send({
				message: "error document not found with id " + req.params.noteId
			});                
		}
		return res.status(500).send({
			message: "Error updating document with id " + req.params.noteId
		});
	});
  })

 // Delete a Note with noteId
 app.delete('/:noteId', (req , res) => {
	imgModel.findByIdAndRemove(req.params.noteId)
	.then(obj => {
        if(!obj) {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });
        }
        res.send({message: "Note deleted successfully!"});
    }).catch(err => {
        if(err.kind === 'ObjectId' || err.name === 'NotFound') {
            return res.status(404).send({
                message: "Note not found with id " + req.params.noteId
            });                
        }
        return res.status(500).send({
            message: "Could not delete note with id " + req.params.noteId
        });
    });
 });


// Step 9 - configure the server's port

var port = process.env.PORT || '2000'
app.listen(port, err => {
	if (err)
		throw err
	console.log('Server listening on port', port)
})
