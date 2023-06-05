import { User } from "../db/models";

const findByUsername = async (username) => {
  try {
    const user = await User.findOne({
      username: username,
    }).exec();
    return user || -1;
  } catch (error) {
    return null;
  }
};

const createUser = async (user) => {
  try {
    const newUser = new User(user);
    await newUser.save();
    return newUser || -1;
  } catch (error) {
    return null;
  }
};

const findById = async (id) => {
  try {
    const user = await User.findById(id).exec();
    return user || -1;
  } catch (error) {
    return null;
  }
};

const getAll = async (select = "-password") => {
  try {
    let query = User.find();
    if (select) {
      query = query.select(select);
    }
    const users = await query.exec();
    return users;
  } catch (error) {
    return null;
  }
};

const removeById = async (id) => {
  try {
    const user = await User.findByIdAndRemove(id).exec();
    return user || -1;
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = {
  findByUsername,
  createUser,
  findById,
  getAll,
  removeById,
};
