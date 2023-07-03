/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line react/prop-types
export default function SignUp({ setUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: '',
    password: '',
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

    fetch('http://localhost:4000/api/auth/signup', requestOptions)
      .then((response) => response.json())
      .then((data) =>{
        if (data.token) {
          localStorage.setItem('token', data.token);
    
          setUser({
            userId: data.userId,
            token: data.token,
          });
          navigate('/');
    
        } else {
          console.error('Erreur lors de l\'inscription: le token est vide');
        }
        console.log(data)
      } 
      )
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />

      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" value={form.password} onChange={handleChange} />

      <input type="submit" value="Submit" />
    </form>
  );
}
