import { useState } from "react";
import { Card, Form, Button, Alert } from "react-bootstrap";
import { upsertReview } from "../../services/supabaseapi";

export default function ReviewForm({
  reviewerUserId,
  revieweeUserId,
  onSubmitted,
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");

    if (!reviewerUserId) return setErr("Missing reviewer id.");
    if (!revieweeUserId) return setErr("Missing student id.");

    setSaving(true);

    const { error } = await upsertReview({
      bookingId: null,
      reviewerUserId,
      revieweeUserId,
      rating: Number(rating),
      comment,
    });

    setSaving(false);

    if (error) {
      setErr(error.message || "Failed to submit review.");
      return;
    }

    setMsg("Review saved successfully.");
    setComment("");

    if (onSubmitted) onSubmitted();
  };

  return (
    <Card className="mb-4">
      <Card.Header>Leave a Review</Card.Header>
      <Card.Body>
        {err && <Alert variant="danger">{err}</Alert>}
        {msg && <Alert variant="success">{msg}</Alert>}

        <Form onSubmit={submit}>
          <Form.Group className="mb-3">
            <Form.Label>Rating</Form.Label>
            <Form.Select value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value="5">5 - Excellent</option>
              <option value="4">4 - Good</option>
              <option value="3">3 - Okay</option>
              <option value="2">2 - Poor</option>
              <option value="1">1 - Bad</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Review</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe the student's work quality, professionalism, communication, and overall behavior."
            />
          </Form.Group>

          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Submit Review"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}