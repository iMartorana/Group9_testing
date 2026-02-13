import { useAuth0 } from "@auth0/auth0-react";

export default function Login() {
  const {
    isLoading,
    isAuthenticated,
    loginWithRedirect,
    logout,
    user,
    error,
  } = useAuth0();

  if (isLoading) return <p>Loading...</p>;

  return (
    <div style={{ padding: 30 }}>
      {error && <p>{error.message}</p>}

      {isAuthenticated ? (
        <>
          <h2>Welcome {user?.name || user?.email}</h2>

          <pre>{JSON.stringify(user, null, 2)}</pre>

          <button
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <button onClick={() => loginWithRedirect()}>Login</button>
          <button
            onClick={() =>
              loginWithRedirect({
                authorizationParams: { screen_hint: "signup" },
              })
            }
          >
            Signup
          </button>
        </>
      )}
    </div>
  );
}
