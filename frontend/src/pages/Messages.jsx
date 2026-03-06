import Navbar from "../components/Navbar";

export default function Messages() {
  return (
    <>
      <Navbar />
      <div className="container py-4">
        <h2 className="mb-3">Messages</h2>
        <div className="card shadow-sm">
          <div className="card-body">
            <p className="mb-0">
              Messaging will be added in a future phase of the project.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}