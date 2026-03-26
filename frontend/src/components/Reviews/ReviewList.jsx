import { Card } from "react-bootstrap";
import RatingStars from "./RatingStars";
/*
Displays ratings. Uses the RatingsStars file to format the visual stars
*/
export default function ReviewList({ reviews = [] }) {
  if (!reviews.length) {
    return (
      <Card>
        <Card.Body>No reviews yet.</Card.Body>
      </Card>
    );
  }

  return (
    <div className="d-flex flex-column gap-3">
      {reviews.map((r) => (
        <Card key={r.review_id}>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <strong>Client:</strong>{" "}
                {r.users
                  ? `${r.users.first_name || ""} ${r.users.last_name || ""}`.trim()
                  : "Anonymous"}
              </div>
              <div>
                <RatingStars value={r.rating} />
              </div>
            </div>

            {r.comment && <div className="mb-2">{r.comment}</div>}

            <div style={{ fontSize: "0.9em", opacity: 0.7 }}>
              {new Date(r.created_at).toLocaleString()}
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}