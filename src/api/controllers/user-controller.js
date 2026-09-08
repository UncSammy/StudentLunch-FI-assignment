import userItems from '../models/user-model.js';

// Hae kaikki käyttäjät
const getUsers = (req, res) => {
  res.json(userItems);
};

// Hae yksi käyttäjä ID:n perusteella
const getUserById = (req, res) => {
  const id = Number(req.params.id);

  const user = userItems.find((item) => item.user_id === id);

  if (!user) {
    return res.status(404).json({
      message: 'User not found.',
    });
  }

  res.json(user);
};

// Lisää uusi käyttäjä
const createUser = (req, res) => {
  const newUser = {
    user_id: Date.now(),
    ...req.body,
  };

  userItems.push(newUser);

  res.status(201).json(newUser);
};

// Päivitä käyttäjä
const updateUser = (req, res) => {
  res.json({
    message: 'User item updated.',
  });
};

// Poista käyttäjä
const deleteUser = (req, res) => {
  res.json({
    message: 'User item deleted.',
  });
};

export {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};