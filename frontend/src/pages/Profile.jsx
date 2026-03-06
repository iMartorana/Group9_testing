import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Navbar from "../components/Navbar";

export default function Profile() {
  const { user } = useAuth0();

  const storageKey = user?.email
    ? `profile_${user.email.toLowerCase()}`
    : "profile_guest";

  const imageKey = user?.email
    ? `profile_image_${user.email.toLowerCase()}`
    : "profile_image_guest";

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    password: "",
  });

  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const savedProfile = localStorage.getItem(storageKey);
    const savedImage = localStorage.getItem(imageKey);

    if (savedProfile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(JSON.parse(savedProfile));
    } else {
      setForm({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        bio: "",
        password: "",
      });
    }

    if (savedImage) {
      setPreviewUrl(savedImage);
    } else {
      setPreviewUrl(user?.picture || "");
    }
  }, [user, storageKey, imageKey]);

  const handleChange = (e) => {
    setSuccess("");
    const { name, value } = e.target;

    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setForm({ ...form, phone: digitsOnly });
      return;
    }

    setForm({ ...form, [name]: value });
  };

  const handleImageChange = (e) => {
    setError("");
    setSuccess("");

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setError("");

    if (form.phone && form.phone.length !== 10) {
      setError("Phone number must be exactly 10 digits.");
      return;
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(form));
      if (previewUrl) {
        localStorage.setItem(imageKey, previewUrl);
      }
      setSuccess("Profile changes saved successfully.");
    } catch (err) {
      setError("Could not save profile changes.");
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />

      <div className="container py-4">
        <h2 className="mb-4">My Profile</h2>

        <div className="row g-4">
          <div className="col-lg-4">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <img
                  src={previewUrl || "https://placehold.co/140x140"}
                  alt="Profile"
                  className="rounded-circle mb-3"
                  width="140"
                  height="140"
                  style={{ objectFit: "cover" }}
                />

                <div className="mb-3 text-start">
                  <label className="form-label fw-semibold">
                    Upload Profile Photo
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <div className="form-text">PNG or JPG, max 5MB.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3">Edit Profile Details</h5>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSave}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={form.name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        value={form.email}
                        disabled
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="text"
                        name="phone"
                        className="form-control"
                        placeholder="Enter 10-digit phone number"
                        value={form.phone}
                        onChange={handleChange}
                        maxLength={10}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        placeholder="Enter new password"
                        value={form.password}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Bio</label>
                      <textarea
                        name="bio"
                        className="form-control"
                        rows="4"
                        placeholder="Tell us about yourself"
                        value={form.bio}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="col-12">
                      <button type="submit" className="btn btn-primary px-4">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}