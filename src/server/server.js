/* eslint-disable */
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const sharp = require('sharp');
const mongoose = require('mongoose')

const models = require('../models/models');
require('dotenv').config({ path: '../../.env'});

const saltRounds = 10;
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src/assets/books')));
app.use(cors());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

const url = 'mongodb+srv://kyslegion:12345@cluster0.ytv6p.mongodb.net/projet7?retryWrites=true&w=majority';

const connectionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
mongoose.connect(url,connectionParams)
  .then(() => {
    console.log('Connected to database ')
  })
  .catch((err) => {
    console.error(`Error connecting to the database. \n${err}`);
  });

let Book = models.Book;
let User = models.User;

const uploadPath = path.join(__dirname, '../../public/assets/book');
app.use('/assets/book', express.static(uploadPath));
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, uploadPath); 
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname); 
//   }
// });

//fonctionn
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../../public/assets/book'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); 
  }
});
const upload = multer({ storage: storage });
const fsPromises = fs.promises;

const resizeImageAsync = async (originalPath) => {
  try {
    const buffer = await fsPromises.readFile(originalPath);
    const resizedImageBuffer = await sharp(buffer)
      .resize(463, 595) 
      .jpeg({ quality: 80 })
      .toBuffer();
    await fsPromises.writeFile(originalPath, resizedImageBuffer); 
  } catch (error) {
    throw new Error(`Erreur lors du redimensionnement de l'image : ${error.message}`);
  }
}


const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Token from request:', token); // log the received token

  if (token == null) {
    return res.status(401).json({ message: "Aucun token fourni." });
  }

  try {
    const user = await jwt.verify(token, process.env.TOKEN_SECRET);
    console.log('User from token:', user); // log the user extracted from the token
    req.user = user;
    next();
  } catch (err) {
    console.log('Token verification error:', err); // log any error from verification
    return res.status(403).json({ message: "Token invalide ou expiré." });
  }
};


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
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
app.post('/api/books', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const bookData = JSON.parse(req.body.book);
    resizeImageAsync(req.file.path)
    function calculateAverageRating(grade) {
      const ratingsCount = bookData.ratings.length;
      if (ratingsCount === 0) {
        return 0;
      } else {
        const totalRating = bookData.ratings.reduce((accumulator, currentRating) => accumulator + currentRating.grade, 0);
        return totalRating / ratingsCount;
      }
    }

    const { title, author, year, genre, ratings } = bookData;
    const { userId, grade } = ratings[0];
    const averageRating = calculateAverageRating(grade);

    let newBook;
    try {
      newBook = new Book({
        title,
        author,
        imageUrl: '/assets/book/' + req.file.filename,
        year,
        genre,
        ratings: [{ userId: userId, grade: grade }],
        averageRating
      });

      // const originalPath = req.file.path;
      // await resizeImageSync(originalPath);
      // fs.unlinkSync(originalPath);

      await newBook.save();

      return res.status(201).json({ message: 'Book added successfully' });
      
    } catch (error) {
      console.error(error);
      if (error instanceof SyntaxError) {
        return res.status(400).json({ message: 'Erreur de syntaxe JSON dans les données du livre' });
      } else if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Données du livre non valides : Vérifiez que tous les champs requis sont fournis' });
      }
      return res.status(500).json({ message: 'Erreur lors de l\'ajout du livre' });
    }
  } catch (error) {
    console.error(error);
    // return res.status(400).json({ message: 'Erreur lors de l\'analyse des données du livre' });
  }
});

app.post('/api/auth/signup', async (req, res) => {
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
    const users = await User.find({ email: req.body.email });
    if (!users.length) {
      console.log('No user found with this email');
      return res.status(404).json({ error: 'Aucun utilisateur trouvé avec cet e-mail' });
    }
    
    const user = users[0];

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
app.post('/api/books/:id/rating',authenticateToken, async (req, res) => {
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
app.put('/api/books/:id', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    let imageUrl;
    if (req.file) {
      imageUrl = '/assets/book/' + req.file.filename;
      await resizeImageAsync(req.file.path);
    }

    const { title, author, year, genre, ratings } = req.body;
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      { title, imageUrl, author, year, genre, ratings },
      { new: true }
    );

    return res.status(201).json({ message: 'Votre livre a bien été mis à jour' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Une erreur est survenue lors de la mise à jour du livre' });
  }
});
app.delete('/api/books/:id', authenticateToken, async (req, res) => {
  try {
    const bookimg = await Book.findById(req.params.id);
    if (!bookimg) {
      return res.status(404).send('Aucun livre trouvé avec cet ID');
      
    }
    const imagePath = path.join(__dirname, "../../public", bookimg.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, async (err) => {
        if (err) {
          console.error(err);
          if (err.code !== 'ENOENT') {
            return res.status(500).send(`Une erreur est survenue lors de la suppression de l'image: ${err.message}`);
          }
        }
       
      });
    } else {
      console.log(`Le fichier ${imagePath} n'existe pas`);
    }
    
    const result = await Book.findByIdAndDelete(req.params.id);
    if (!result) {
      if (!res.headersSent) {
        return res.status(404).send('Aucun livre trouvé avec cet ID');
      }
    } else {
      if (!res.headersSent) {
        res.send(`Le livre avec l'ID ${req.params.id} a été supprimé avec succès`);
      }
    }
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).send(`Une erreur est survenue lors de la suppression du livre: ${error.message}`);
    }
  }
});


const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
