import React, { useState } from 'react';

export default function GetBok() {
  const [form, setForm] = useState({
    imageUrl: '',
    title: '',
    author: '',
    year: '',
    genre: '',
  });

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    };

    fetch('http://localhost:3000/api/auth/signup', requestOptions)
      .then((response) => response.json())
      .then((data) => console.log(data))
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor='imageUrl'>Image URL:</label>
      <input id='imageUrl' name='imageUrl' type='text' value={form.imageUrl} onChange={handleChange} />

      <label htmlFor='title'>Title:</label>
      <input id='title' name='title' type='text' value={form.title} onChange={handleChange} />

      <label htmlFor='author'>Author:</label>
      <input id='author' name='author' type='text' value={form.author} onChange={handleChange} />

      <label htmlFor='year'>Year:</label>
      <input id='year' name='year' type='number' value={form.year} onChange={handleChange} />

      <label htmlFor='genre'>Genre:</label>
      <input id='genre' name='genre' type='text' value={form.genre} onChange={handleChange} />

      <input type='submit' value='Submit' />
    </form>
  );
}
