import axios from "axios";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await axios.get("http://localhost:5000/auth/logout", { withCredentials: true });
      navigate("/login"); // Or "/" based on your flow
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return logout;
};