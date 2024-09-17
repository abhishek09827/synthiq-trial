const authProvider = {
  login: async ({ email, password }) => {
    // Implement login logic, e.g., fetch API
    if (email === "test@example.com" && password === "password") {
      localStorage.setItem("authToken", "your-token");
      return Promise.resolve();
    }
    return Promise.reject("Invalid credentials");
  },
  logout: () => {
    localStorage.removeItem("authToken"); // Remove token on logout
    return Promise.resolve();
  },
  checkError: (error) => {
    return Promise.resolve();
  },
  checkAuth: () => {
    return localStorage.getItem("authToken") ? Promise.resolve() : Promise.reject();
  },
  getPermissions: () => Promise.resolve(),
};

export default authProvider;
