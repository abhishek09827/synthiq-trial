import cron from 'node-cron';
import axios from 'axios';

const schedulePollRoute = (req, res, next) => {
  // Schedule the /poll route to be called every hour
cron.schedule('*/9 * * * *', async () => {
    try {
      await axios.get('http://localhost:3000/api/poll');
      console.log('Scheduled /poll route called successfully');
    } catch (error) {
      console.error('Error calling /poll route:', error);
    }
  });

  // Call the next middleware or route handler
  next();
};

export default schedulePollRoute;