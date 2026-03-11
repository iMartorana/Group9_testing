import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

export default function AuthProvider({ children }) {
  const navigate = useNavigate();

  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: import.meta.env.VITE_AUTH0_AUDIENCE,
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
