import { useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Container, Card } from "react-bootstrap";
import Navbar from "../components/Navbar";
import ReviewForm from "../components/Reviews/ReviewForm";
import ReviewList from "../components/Reviews/ReviewList";
import RatingStars from "../components/Reviews/RatingStars";
import {
  getUserByEmail,
  getUserById,
  getReviewsForStudent,
  getReviewSummary,
} from "../services/supabaseapi";

export default function Reviews() {
  const { user } = useAuth0();

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const studentId = params.get("studentId");

  const [dbUser, setDbUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ avg: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user?.email || !studentId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: currentUser } = await getUserByEmail(user.email);
    setDbUser(currentUser || null);

    const { data: studentData } = await getUserById(studentId);
    setStudent(studentData || null);

    const [{ data: reviewList }, { data: reviewSummary }] = await Promise.all([
      getReviewsForStudent(studentId),
      getReviewSummary(studentId),
    ]);

    setReviews(reviewList || []);
    setSummary(reviewSummary || { avg: 0, count: 0 });

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user, studentId]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  return (
    <>
      <Navbar />
      <Container className="py-4">
        <h2 className="mb-3">Ratings & Reviews</h2>

        {!studentId ? (
          <Card className="shadow-sm">
            <Card.Body>
              Select a student from the Jobs page to view reviews.
            </Card.Body>
          </Card>
        ) : loading ? (
          <div>Loading...</div>
        ) : (
          <>
            <Card className="mb-3 shadow-sm">
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <div>
                    <strong>Student:</strong>{" "}
                    {student
                      ? `${student.first_name || ""} ${student.last_name || ""}`.trim()
                      : `User #${studentId}`}
                  </div>
                  <div style={{ opacity: 0.75 }}>
                    {summary.count} review{summary.count === 1 ? "" : "s"}
                  </div>
                </div>
                <div>
                  <RatingStars value={summary.avg} />
                </div>
              </Card.Body>
            </Card>

            {dbUser?.role === "client" && (
              <ReviewForm
                reviewerUserId={dbUser.user_id}
                revieweeUserId={Number(studentId)}
                onSubmitted={load}
              />
            )}

            {dbUser?.role !== "client" && (
              <Card className="mb-3 shadow-sm">
                <Card.Body className="text-muted">
                  Only clients can leave reviews.
                </Card.Body>
              </Card>
            )}

            <ReviewList reviews={reviews} />
          </>
        )}
      </Container>
    </>
  );
}