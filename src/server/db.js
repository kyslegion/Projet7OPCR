/* eslint-disable */
const mongoose = require('mongoose')
const url = "mongodb+srv://kyslegion:12345@cluster0.ytv6p.mongodb.net/projet7?retryWrites=true&w=majority";
const connectionParams={
    useNewUrlParser: true,
    useUnifiedTopology: true 
}
mongoose.connect(url,connectionParams)
    .then( () => {
        console.log('Connected to database ')
    })
    .catch( (err) => {
        console.error(`Error connecting to the database. \n${err}`);
    })
const bookSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  }
}, { collection: 'book' });
const Book = mongoose.model('Book', bookSchema);
Book.find({}, function(err, docs) {
  if (err) {
    console.error(err);
  } else {
    console.log(docs);
  }
});
