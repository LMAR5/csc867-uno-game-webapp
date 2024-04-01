import express from 'express';

const router = express.Router();

router.use((request, response, next) => {
  console.log('Request made to /AuthController route');
  next();
});

// Uri: http://localhost:3001/api/AuthController/
router.get('/', (request, response) => {
  const name = 'This if for all the backend methods for authentication';
  response.render('root', { name });
});

export default router;
