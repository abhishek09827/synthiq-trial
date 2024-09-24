import { createClerkClient  as Clerk  } from '@clerk/clerk-sdk-node';

const clerk = Clerk({ secretKey: process.env.CLERK_SECRET_KEY });

export default clerk;