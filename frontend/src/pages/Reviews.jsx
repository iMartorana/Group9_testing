import { useEffect, useMemo, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Container, Card } from "react-bootstrap";
import Navbar from "../components/Navbar";
import ReviewForm from "../components/Reviews/ReviewForm";
import ReviewList from "../components/Reviews/ReviewList";
import RatingStars from "../components/Reviews/RatingStars";
import { getReviewsForStudent, getReviewSummary } from "../services/supabaseapi";

export default function Reviews() {
  const { user } = useAuth0();

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const studentEmail = params.get("studentEmail");

  const clientEmail = user?.email;

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState({ avg: 0, count: 0 });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!studentEmail) return;

    setLoading(true);

    const [{ data: list, error: listErr }, { data: sum, error: sumErr }] =
      await Promise.all([getReviewsForStudent(studentEmail), getReviewSummary(studentEmail)]);

    if (!listErr && Array.isArray(list)) setReviews(list);
    if (!sumErr && sum) setSummary(sum);

    setLoading(false);
  };

  useEffect(() => {
    load();

  }, [studentEmail]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  return (
    
    <>
      <Navbar />
      <Container className="py-4">
        <h2 className="mb-3">Ratings & Reviews</h2>

        {!studentEmail ? (
          <Card className="shadow-sm">
            <Card.Body>
              <p className="mb-2">Select a student from the Jobs page to view and add reviews.</p>
              <p className="mb-0 text-muted">
                Example route: <code>/reviews?studentEmail=student@email.com</code>
              </p>
            </Card.Body>
          </Card>
        ) : (
          <>
            <Card className="mb-3 shadow-sm">
              <Card.Body className="d-flex justify-content-between align-items-center">
                <div>
                  <div>
                    <strong>Student:</strong> {studentEmail}
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
            
            {/* Only allow logged in client to submit */}

            {clientEmail && (
              <ReviewForm
                studentEmail={studentEmail}
                clientEmail={clientEmail}
                onSubmitted={load}
              />
            )}

            {loading ? <div>Loading...</div> : <ReviewList reviews={reviews} />}
          </>
        )}
      </Container>
    </>
  );
}