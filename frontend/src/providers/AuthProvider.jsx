import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export default function AuthProvider({ children }) {
  const navigate = useNavigate();

  return (
    <Auth0Provider
      domain="YOUR_DOMAIN"
      clientId="YOUR_CLIENT_ID"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
      onRedirectCallback={(appState, user) => {
        const role = user?.["https://capstone/roles"]?.[0];

        if (role === "admin") navigate("/admin");
        else if (role === "student") navigate("/student");
        else navigate("/client");
      }}
    >
      {children}
    </Auth0Provider>
  );
}
