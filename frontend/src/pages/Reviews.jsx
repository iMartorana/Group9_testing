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
  const studentIdFromUrl = params.get("studentId");

  const [dbUser, setDbUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [activeStudentId, setActiveStudentId] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ avg: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: currentUser, error: userError } = await getUserByEmail(user.email);
    if (userError) {
      console.error("Failed to load current user:", userError);
      setLoading(false);
      return;
    }

    setDbUser(currentUser || null);

    let resolvedStudentId = studentIdFromUrl;

    if (!resolvedStudentId && currentUser?.role === "student") {
      resolvedStudentId = currentUser.user_id;
    }

    if (!resolvedStudentId) {
      setActiveStudentId(null);
      setStudent(null);
      setReviews([]);
      setSummary({ avg: 0, count: 0 });
      setLoading(false);
      return;
    }

    setActiveStudentId(Number(resolvedStudentId));

    const { data: studentData, error: studentError } = await getUserById(resolvedStudentId);
    if (studentError) {
      console.error("Failed to load student:", studentError);
    }
    setStudent(studentData || null);

    const [
      { data: reviewList, error: reviewError },
      { data: reviewSummary, error: summaryError },
    ] = await Promise.all([
      getReviewsForStudent(resolvedStudentId),
      getReviewSummary(resolvedStudentId),
    ]);

    if (reviewError) {
      console.error("Failed to load reviews:", reviewError);
      setReviews([]);
    } else {
      setReviews(reviewList || []);
    }

    if (summaryError) {
      console.error("Failed to load review summary:", summaryError);
      setSummary({ avg: 0, count: 0 });
    } else {
      setSummary(reviewSummary || { avg: 0, count: 0 });
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [user, studentIdFromUrl]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  return (
    <>
      <Navbar />
      <Container className="py-4">
        <h2 className="mb-3">Ratings & Reviews</h2>

        {loading ? (
          <div>Loading...</div>
        ) : !activeStudentId ? (
          <Card className="shadow-sm">
            <Card.Body>
              {dbUser?.role === "client"
                ? "Open a student's reviews from the Jobs page."
                : "No reviews available."}
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
                      : `User #${activeStudentId}`}
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
                revieweeUserId={activeStudentId}
                onSubmitted={load}
              />
            )}

            {dbUser?.role === "student" && (
              <Card className="mb-3 shadow-sm">
                <Card.Body className="text-muted">
                  These are the reviews clients have left for you.
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