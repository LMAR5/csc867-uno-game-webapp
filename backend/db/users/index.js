import { createHash } from "crypto";

import db from "../connection.js";

const Sql = {
  INSERT:
    "INSERT INTO users (email, password, gravatar, first_name, last_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, gravatar",
  EXISTS: "SELECT id FROM users WHERE email=$1",
  // Note that this is ONLY for use in our backend (since it returns the password)
  FIND: "SELECT * FROM users WHERE email=$1",
};

const create = async (email, password, first_name, last_name) => {
  const hash = createHash("sha256").update(email).digest("hex");

  try{
    const newUser = await db.one(Sql.INSERT, [email, password, hash, first_name, last_name]);
    return newUser;
  } catch (error) {
    console.error(error);
    throw new Error("Error creating the user.");
  }
  return db.one(Sql.INSERT, [email, password, hash]);
};
const exists = async (email) => {
  return null !== (await db.oneOrNone(Sql.EXISTS, [email]));
};
const find = async (email) => {
  const result = await db.oneOrNone(Sql.FIND, [email]);

  if (result === null) {
    throw "User with those credentials not found";
  } else {
    return result;
  }
};

export default {
  create,
  exists,
  find,
};
