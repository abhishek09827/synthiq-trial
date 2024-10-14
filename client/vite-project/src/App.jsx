import React from 'react';
import { useAuth, ClerkProvider, SignInButton, useUser } from '@clerk/clerk-react';
import axios from 'axios';

const clerkFrontendApi = 'https://humane-shrew-49.clerk.accounts.dev'; // Get from Clerk Dashboard

const App = () => {
  return (
    <ClerkProvider frontendApi={clerkFrontendApi} publishableKey='pk_test_aHVtYW5lLXNocmV3LTQ5LmNsZXJrLmFjY291bnRzLmRldiQ'>
      <AuthContent />
    </ClerkProvider>
  );
};

const AuthContent = () => {
  const { isLoaded, getToken } = useAuth();
  const {user} = useUser();

  const handleLogin = async () => {
    const token = await getToken();
    const id = user.id
    
    axios.post('http://localhost:3000/api/call-logs', { id })
      .then(response => console.log(response.data))
      .catch(error => console.error(error));
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div>
        {user ? (
          <h1>Welcome, {user.id}</h1>
        ) : (
          <SignInButton redirectUrl="http://localhost:3000/dashboard" />
        )}
      </div>
      <button onClick={handleLogin}>Hiii</button>
    </>
  );
};

export default App;
