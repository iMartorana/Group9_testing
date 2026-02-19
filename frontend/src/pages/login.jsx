import { useAuth0 } from "@auth0/auth0-react";

export default function Login() {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = () => loginWithRedirect();
  const handleSignup = () => loginWithRedirect({
      authorizationParams: { screen_hint: "signup" },
  });

  return (
    <div className="page">
      <div className="shell">
        <div className="authCard" style={{ gridTemplateColumns: "1fr" }}>
          <div className="left" style={{ textAlign: "center" }}>
            <h1 className="title">UWM TradeSkill App</h1>
            <p className="subtitle">Sign in or create an account to continue.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <button className="btn btn-primary" onClick={handleLogin}> Login </button>
              <button className="btn btn-outline-primary" onClick={handleSignup}> Sign Up </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
