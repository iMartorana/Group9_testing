import { useState } from "react";
import { Card, Form, Button, Image, Alert } from "react-bootstrap";
import Navbar from "../components/Navbar";


<Navbar/>
export default function ProfilePhotoSection() {
  const [previewUrl, setPreviewUrl] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  const onFileChange = (e) => {
    setError("");
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }

    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const onSave = async () => {
    // just show that user “captured” it
    console.log("Selected file:", file);
    alert("Selected photo (preview only for now). Next step is uploading to the server.");
  };

  return (
    <Card className="mb-3">
      <Card.Header>Profile Photo</Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="d-flex align-items-center gap-3 mb-3">
          <Image
            src={previewUrl || "https://placehold.co/96x96"}
            roundedCircle
            width={96}
            height={96}
            alt="Profile"
          />
          <div>
            <Form.Group controlId="photo">
              <Form.Label className="mb-1">Upload a photo</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={onFileChange} />
              <div className="form-text">PNG/JPG, max 5MB.</div>
            </Form.Group>
          </div>
        </div>

        <Form className="mb-3">
            <Form.Group className="mb-2">
            <Form.Label>First Name</Form.Label>
            <Form.Control type="text" placeholder="First name" />
        </Form.Group>

        <Form.Group className="mb-2">
            <Form.Label>Last Name</Form.Label>
            <Form.Control type="text" placeholder="Last name" />
        </Form.Group>

        <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" placeholder="Email" />
        </Form.Group>

        <Form.Group className="mb-2">
            <Form.Label>Phone</Form.Label>
            <Form.Control type="text" placeholder="Phone number" />
        </Form.Group>
        </Form>

        <Button onClick={onSave} disabled={!file}>
          Save Photo
        </Button>
      </Card.Body>
    </Card>
  );
}