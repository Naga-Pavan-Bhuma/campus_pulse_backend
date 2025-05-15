import axios from "axios";
import { useNavigate } from "react-router-dom";

export const useLogout = () => {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await axios.get(`${process.env.REACT_APP_BACKEND_URL}/auth/logout`, {
        withCredentials: true,
      });
            navigate("/login"); 
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  return logout;
};