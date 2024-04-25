import express from "express";
import { Users } from "../../db/index.js";
import { checkPassword, encryptPassword } from "./password-handling.js";
import { format } from "morgan";

const router = express.Router();

router.get("/register", (_request, response) => {
  response.render("auth/register");
});

router.post("/register", async (request, response) => {
  const { password, email, confirmPassword, firstName, lastName } = request.body;

  if(password != confirmPassword){
    return response.status(400).send({ 
      errorMessage: "Passwords don't match. Please Try again.",
    });
  }

  if (await Users.exists(email)) {
    // The user email already exists in our database
    return response.status(400).send({
      errorMessage: "Email already in use."
    });
  } else {
    try{
    const encryptedPassword = await encryptPassword(password);
    request.session.user = await Users.create(email, encryptedPassword, firstName, lastName);
    response.redirect("/auth/login");
    } catch (error){
      console.error(error);
      response.status(400).send({
        errorMessage: "Error occurred. Please try again.",
      });
    }
  }
});

router.get("/login", (_request, response) => {
  response.render("auth/login");
});

router.post("/login", async (request, response) => {
  const { password, email } = request.body;

  try {
    if (await checkPassword(email, password)) {
      const user = await Users.find(email);
      request.session.user = {
        id: user.id,
        email: user.email,
        gravatar: user.gravatar,
      };

      response.redirect("/lobby");
    } else {
      throw "User not found";
    }
  } catch (error) {
    console.error(error);
      response.send(400).send({
        errorMessage: "Error occurred. Please try again.",
        format: 'login'
      });
  }
});

router.get("/logout", (request, response, next) => {
  request.session.user = null;
  request.session.save((error) => {
    if (error) {
      next(error);
    }

    request.session.regenerate((error) => {
      if (error) {
        next(error);
      }
      response.redirect("/auth/login");
    });
  });
});

export default router;