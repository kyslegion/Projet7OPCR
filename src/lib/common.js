import axios from 'axios';
import jwt_decode from 'jwt-decode';

// let token = localStorage.getItem('token');
// let decoded;

try {
  // decoded = jwt_decode(token);
  // console.log(decoded.userId);
} catch (error) {
  console.error('Une erreur s\'est produite lors du décodage du jeton :', error.message);
}
import { API_ROUTES } from '../utils/constants';

function formatBooks(bookArray) {
  return bookArray.map((book) => {
    const newBook = { ...book };
    // eslint-disable-next-line no-underscore-dangle
    newBook.id = newBook._id;
    return newBook;
  });
}

export function storeInLocalStorage(token, userId) {
  localStorage.setItem('token', token);
  localStorage.setItem('userId', userId);
}

export function getFromLocalStorage(item) {
  return localStorage.getItem(item);
}

export async function getAuthenticatedUser() {
  const defaultReturnObject = { authenticated: false, user: null };
  try {
    const tokenString = getFromLocalStorage('token');
    const tokenObject = JSON.parse(tokenString);
    // console.log('test token:', tokenObject);
    if (!tokenObject) {
      return defaultReturnObject;
    }
    return { authenticated: true, user: tokenObject  };
  
  } catch (err) {
    console.error('getAuthenticatedUser, Something Went Wrong', err);
    return defaultReturnObject;
  }
}

export async function getBooks() {
  try {
    const response = await axios({
      method: 'GET',
      url: `${API_ROUTES.BOOKS}`,
    });
    // eslint-disable-next-line array-callback-return
    const books = formatBooks(response.data);
    return books;
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function getBook(id) {
  try {
    const response = await axios({
      method: 'GET',
      url: `${API_ROUTES.BOOKS}/${id}`,
    });
    const book = response.data;
    // eslint-disable-next-line no-underscore-dangle
    book.id = book._id;
    return book;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function getBestRatedBooks() {
  try {
    const response = await axios({
      method: 'GET',
      url: `${API_ROUTES.BEST_RATED}`,
    });
    return formatBooks(response.data);
  } catch (e) {
    console.error(e);
    return [];
  }
}
export async function deleteBook(id) {
  try {
    await axios.delete(`${API_ROUTES.BOOKS}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}

export async function rateBook(id, userId, rating) {
  // console.log("dans rate",id,userId,rating);
  console.log("dans ratebook fonction");

  let token = localStorage.getItem('token');
  let decoded;
  
try {
  decoded = jwt_decode(token);
} catch (error) {
  
}
  const data = {
    userId:decoded.userId,
    rating: parseInt(rating, 10),
  };

  try {
    const response = await axios.post(`${API_ROUTES.BOOKS}/${id}/rating`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    const book = response.data;
    // eslint-disable-next-line no-underscore-dangle
    book.id = book._id;
    return book;
  } catch (e) {
    console.error(e);
    return e.message;
  }
}

export async function addBook(data) {
let LS = localStorage.getItem('token');
let{ userId } = jwt_decode(LS);
let grade=parseInt(data.rating);
const x = [
  {
    userId: userId,
    grade: grade
  }
];
// const xString = JSON.stringify(x);
  const book = {
    title: data.title,
    author: data.author,
    year: data.year,
    genre: data.genre,
    ratings:x ,
    // averageRating: parseInt(data.rating, 10),
  };
  
  const bodyFormData = new FormData();
  bodyFormData.append('book', JSON.stringify(book));
  bodyFormData.append('image', data.file[0]);
    console.log(bodyFormData);
  try {
    const response = await fetch(`${API_ROUTES.BOOKS}`, {
      method: 'POST',
      body: bodyFormData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
  
    if (!response.ok) {
      console.log(response);
    }
  
    return await response.json();
  } catch (err) {
    console.error(err);
    return { error: true, message: err.message };
  }
  
}

export async function updateBook(data, id) {
  // const a = localStorage.getItem('token');
  // let tokenObject = JSON.parse(a);
  // let userId = tokenObject.userId;
// console.log(userId,"userId");
// console.log(data,"data");
// console.log(id,"id");
  // const userId = localStorage.getItem('token');
// console.log(data);
  let newData;
  const book = {
    id: data.id,
    title: data.title,
    author: data.author,
    year: data.year,
    genre: data.genre,
  };
  // console.log("dans updatebook");
  if (data.file[0]) {
    newData = new FormData();
    newData.append('book', JSON.stringify(book));
    newData.append('image', data.file[0]);
  } else {
    newData = { ...book };
  }

  try {
    const newBook = await axios({
      method: 'put',
      url: `${API_ROUTES.BOOKS}/${id}`,
      data: newData,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return newBook;
  } catch (err) {
    console.error(err);
    return { error: true, message: err.message };
  }
}
