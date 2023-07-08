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

app.post('/api/auth/login', async (req, res) => {
  try {
    const users = await User.find({ email: req.body.email });

    if (!users.length) {
      console.log('No user found with this email');
      return res.status(404).json({ error: 'Aucun utilisateur trouvé avec cet e-mail' });
    }
    const user = users[0];
    console.log("User found", user);

    const valid = await bcrypt.compare(req.body.password, user.password)

    if(!valid){
      console.log('Invalid password');
      return res.status(401).json({ error: new Error('Not Authorized') })
    }

    let token;
    try {
      token = jwt.sign(
        {userId : user.id},
        process.env.TOKEN_SECRET,
        { expiresIn: '24h' }
      );
    } catch (error) {
      console.log('Failed to generate token', error);
      return res.status(500).json({ error: new Error('Failed to generate token') });
    }

    if (!token) {
      console.log('Failed to generate token');
      return res.status(500).json({ error: new Error('Failed to generate token') });
    }

    console.log('Login successful, returning response');
    return res.status(200).json({
      userId: user.id,
      token: token
    });
    
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
    const ratings = await Rating.find({});
    
    ratings.sort((a, b) => b.rating - a.rating);
    
    const top3Ratings = ratings.slice(0, 3);
    
    return res.status(200).json(top3Ratings);
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
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).send('Aucun livre trouvé avec cet ID');
    }

    if (req.file) {
      book.imageUrl = '/assets/books/' + req.file.filename;
    }
    if (req.body.book) {
      book.title = req.body.book;
    }
    const updatedBook = await book.save();

    res.send(updatedBook);
  } catch (error) {
    res.status(500).send(`Une erreur est survenue lors de la mise à jour du livre: ${error.message}`);
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
    let data = {
      userId: req.body.userId,   
      rating: req.body.rating
    }
    let rating = new Rating(data);
    await rating.save();

    res.json(rating);
  } catch (error) {
    res.status(500).json({message:error.message});
  }
});


const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
