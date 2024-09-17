import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthGuard({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      // If no token is found, redirect to the login page
      navigate("/login");
    }
  }, [navigate]);

  // If authenticated, render the children (protected components)
  return children;
}
