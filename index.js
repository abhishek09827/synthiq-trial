// index.js
import server from './app.js';
import { config } from 'dotenv';

config();

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
