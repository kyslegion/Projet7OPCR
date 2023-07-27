const express = require('express');
let models=require('../models/models');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config({ path: '../../.env'});


const saltRounds = 10; 
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src/assets/books')));

const cors = require('cors');
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

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

    let Image = models.Image;
    let Book = models.Book;
    let User = models.User;
    let Rating = models.Rating;

    const storage = multer.diskStorage({
      destination: function (req, file, cb) {
        cb(null, '../../public/assets/book'); 
      },
      filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); 
      }
    });
    
const upload = multer({ storage: storage });
app.get('/', async (req, res) => {
    try {
      const books = await Book.find().exec();
      res.json(books);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error fetching books");
    }
});
app.post('/api/books', upload.single('image'), async (req, res) => {
  try {
    // const imageUrl = req.file.filename;
    const bookData = JSON.parse(req.body.book);
    function calculateAverageRating(grade) {
      const ratingsCount = ratings.length;
      if (ratingsCount === 0) {
        return 0;
      } else {
        const totalRating = ratings.reduce((accumulator, currentRating) => accumulator + currentRating.grade, 0);
        return totalRating / ratingsCount;
      }
    }
    const { title, author, year, genre, ratings } = bookData;
    const { userId, grade } = ratings[0];
    const averageRating = calculateAverageRating(grade);
    const newBook = new Book({
      title,
      author,
      imageUrl:'/assets/book/' + req.file.filename,
      year,
      genre,
      ratings: [{ userId:userId, grade:grade }],
      averageRating
    });
    

    await newBook.save();

    return res.status(201).json({ message: 'Book added successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});
app.post('/api/auth/signup', async (req, res) => {
  console.log(req.body);
 
  if(!req.body.email || !req.body.password){
		return res.status(400).send({
			message: "Must have email and password"
		});
	}
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return res.status(400).json({ error: 'Un utilisateur avec cet e-mail existe déjà' });
  }
  const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

  let newUser = new User({
    email: req.body.email,
    password: hashedPassword 
  });
  
  newUser.save()
    .then((user) => {
      const token = jwt.sign(
        {userId : user.id},
        process.env.TOKEN_SECRET,
        { expiresIn: '24h' }
      );

      res.json({ token, message: 'Utilisateur ajouté avec succès' });
    })
    .catch(err => {
      console.error(`Erreur lors de l'ajout de l'utilisateur : ${err}`);
      res.status(500).json({ error: 'Une erreur s\'est produite lors de l\'inscription' });
    });
});
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log(req.body.email);
    const users = await User.find({ email: req.body.email });
console.log(users);
    if (!users.length) {
      console.log('No user found with this email');
      return res.status(404).json({ error: 'Aucun utilisateur trouvé avec cet e-mail' });
    }
    
    const user = users[0];
    // console.log("User found", user);

    const valid = await bcrypt.compare(req.body.password, user.password)

    if(!valid){
      console.log('Invalid password');
      return res.status(401).json({ error: 'Mot de passe incorrect' });
    }

    let token;

    if (valid) {
      try {
        token = jwt.sign(
          { userId: user.id },
          process.env.TOKEN_SECRET,
          { expiresIn: '24h' }
        );
      } catch (error) {
        console.log('Failed to generate token', error);
        return res.status(500).json({ error: 'Échec de génération du jeton d\'authentification' });
      }

      if (!token) {
        console.log('Failed to generate token');
        return res.status(500).json({ error: 'Échec de génération du jeton d\'authentification' });
      }

      console.log('Login successful, returning response');
      return res.status(200).json({
        userId: user.id,
        token: token
      });
    } else {
      console.log('Invalid user or password');
      return res.status(401).json({ error: 'Identifiant utilisateur ou mot de passe incorrect' });
    }
    
  } catch (error) {
    console.error('An error occurred:', error);
    return res.status(500).json({ error: error.message });
  }
});
app.get('/api/books', async (req, res) => {
  const books = await Book.find({});
  return res.status(200).json(books)
});
app.get('/api/books/bestrating', async (req, res) => {
  try {
    const topRatedBooks = await Book.find({})
  .sort({ averageRating: -1 })
  .limit(3);
    
    return res.status(200).json(topRatedBooks);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    console.log("hello");
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
app.post('/api/books', upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file.filename; 
    
    const bookData = JSON.parse(req.body.book);
    const { title, author, year, genre, ratings} = bookData;
    function calculateAverageRating(ratings) {
      const ratingsCount = ratings.length;
      if (ratingsCount === 0) {
        return 0;
      } else {
        const totalRating = ratings.reduce((accumulator, currentRating) => accumulator + currentRating.grade, 0);
        return totalRating / ratingsCount;
      }
    }
    console.log(imageUrl);
    console.log("bookdatua",bookData);
    const newBook = new Book({
      title:title,
      author:author,
      imageUrl:imageUrl,
      year:year,
      genre:genre,
      ratings:ratings
    });
    
    await newBook.save(); 
    
    return res.status(201).json({ message: 'Book added successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

app.put('/api/books/:id', upload.single('image'), async (req, res) => {
  try {
    let imageUrl;
    if (req.file) {
      imageUrl = '/assets/book/' + req.file.filename;
    } else {
    }
    const { title, author, year, genre, ratings } = req.body;
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { title, imageUrl, author, year, genre, ratings }, 
      { new: true }
     
    );
    return res.status(200).json(updatedBook);
  } catch (error) {
    console.log(error)
  }
});

app.delete('/api/books/:id', async (req, res) => {
  try {
    const result = await Book.findByIdAndDelete(req.params.id);
    
    if (!result) {
      return res.status(404).send('Aucun livre trouvé avec cet ID');
    }

    res.send(`Le livre avec l'ID ${req.params.id} a été supprimé avec succès`);
  } catch (error) {
    res.status(500).send(`Une erreur est survenue lors de la suppression du livre: ${error.message}`);
  }
});
app.post('/api/books/:id/rating', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).send('Aucun livre trouvé avec cet ID');
    }
  
    const { userId, rating } = req.body;
    const grade = parseInt(rating, 10); 
  
    const ratingIndex = book.ratings.findIndex(rating => rating.userId === userId);
    if (ratingIndex !== -1) {
      book.ratings[ratingIndex].grade = grade;
    } else {
      book.ratings.push({ userId, grade });
    }
  
    let totalGrade = 0;
    let totalRatings = book.ratings.length;
  
    for (let i = 0; i < book.ratings.length; i++) {
      totalGrade += book.ratings[i].grade;
    }
  
    let newAverageRating = totalGrade / totalRatings;
    let roundedAverageRating = Math.round(newAverageRating);
  
    book.averageRating = roundedAverageRating;
  
    const updatedBook = await book.save();
    res.send(updatedBook);
  } catch (error) {
    res.status(500).send(`Une erreur est survenue lors de la mise à jour du livre : ${error.message}`);
  }
});

const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
