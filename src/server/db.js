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

// Définir le schéma
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
// Définir le modèle
const Book = mongoose.model('Book', bookSchema);

// Récupérer les données
Book.find({}, function(err, docs) {
  if (err) {
    console.error(err);
  } else {
    console.log(docs);
  }
});
