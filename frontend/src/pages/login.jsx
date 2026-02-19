import { useAuth0 } from "@auth0/auth0-react";

export default function Login() {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = () => loginWithRedirect();

  const handleSignup = () =>
    loginWithRedirect({
      authorizationParams: { screen_hint: "signup" },
    });

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="card shadow-sm">
              <div className="card-body p-4 text-center">

                <h1 className="h3 mb-3">UWM TradeSkill App</h1>

                <p className="text-muted mb-4">
                  Sign in or create an account to continue.
                </p>

                <div className="d-grid gap-2">
                  <button
                    className="btn btn-primary"
                    onClick={handleLogin}
                  >
                    Login
                  </button>

                  <button
                    className="btn btn-outline-primary"
                    onClick={handleSignup}
                  >
                    Sign Up
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
