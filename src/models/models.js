const mongoose = require('mongoose');

// Définition du schéma
const imageSchema = new mongoose.Schema({
  imageUrl: String, // URL de l'image téléchargée
  title: String, // Titre de l'image
  author: String,   // Auteur de l'image
  year: Number,     // Année de l'image
  genre: String     // Genre de l'image
});
const ratingSchema = new mongoose.Schema({
  userId: String,  // Identifiant MongoDB unique de l'utilisateur qui a noté le livre
  grade: Number,   // Note donnée à un livre
});
const bookSchema = new mongoose.Schema({
  userId: String,      // Identifiant MongoDB unique de l'utilisateur qui a créé le livre
  title: String,       // Titre du livre
  author: String,      // Auteur du livre
  imageUrl: String,    // Illustration/Couverture du livre
  year: Number,        // Année de publication du livre
  genre: String,       // Genre du livre
  ratings: ratingSchema, // Notes données à un livre
  averageRating: Number,   // Note moyenne du livre
}, {collection: 'book'});



const userSchema = new mongoose.Schema({
  email: String,
  password: String,
}, {collection: 'users'});



const Image = mongoose.model('Image', imageSchema);
const Book = mongoose.model('Book', bookSchema);
const User = mongoose.model('User', userSchema);
const Rating = mongoose.model('Rating', ratingSchema);
module.exports = {
  Image: mongoose.model('Image', imageSchema),
  Book: mongoose.model('Book', bookSchema),
  User: mongoose.model('User', userSchema),
  Rating: mongoose.model('Rating', ratingSchema),
};