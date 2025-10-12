import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthSuccess = ({ setLoggedIn, setUserState }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const user = Object.fromEntries(params.entries());

    if (user && user._id) {
      localStorage.setItem("user", JSON.stringify(user));
      setUserState(user);
      setLoggedIn(true);
      navigate("/home", { replace: true });
    } else {
      console.error("❌ No user data received in auth-success");
      navigate("/login");
    }
  }, [navigate, setLoggedIn, setUserState]);

  return <div>Logging you in...</div>;
};

export default AuthSuccess;
