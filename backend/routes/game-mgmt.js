import express from 'express';

const router = express.Router();

router.use((request, response, next) => {
  console.log('Request made to /GameController route');
  next();
});

// Uri: http://localhost:3001/api/GameController/
router.get('/', (request, response) => {
  const name = 'This if for all the backend methods for game management';
  response.render('root', { name });
});

export default router;
