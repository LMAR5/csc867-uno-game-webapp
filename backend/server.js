import express from 'express';

// Map routes for backend controllers (routes)
import authRoute from './routes/authentication.js';
import chatRoute from './routes/chat-mgmt.js';
import gameRoute from './routes/game-mgmt.js';

// Instance of express app
const app = express();
const PORT = process.env.PORT || 3001;

// "app.set" is used to assign settings to our Express app (usually key-value pairs)
// This sets "ejs" as the default templating engine in our Express app
app.set('view engine', 'ejs');
// To server static files (this folder contains the js and css for our views to render)
app.use(express.static('static'));

app.use('/api/AuthController', authRoute);
app.use('/api/GameController', gameRoute);
app.use('/api/ChatController', chatRoute);

app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
});
