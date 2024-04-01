import express from 'express';

const router = express.Router();

router.use((request, response, next) => {
  console.log('Request made to /ChatController route');
  next();
});

// Uri: http://localhost:3001/api/ChatController/
router.get('/', (request, response) => {
  const name = 'This if for all the backend methods for the Chat';
  response.render('root', { name });
});

export default router;
