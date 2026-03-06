import { useState } from "react";
import Navbar from "../components/Navbar";

const ALL_SKILLS = [
  "Lawn-Meowing",
  "Snow re-meow-val",
  "Python",
  "Excel",
  "Photoshop",
  "Illustrator",
  "Math",
  "Physics",
];


export default function StudentProfile() {
  const [profile, setProfile] = useState({
    name: "Milania Mort",
    bio: "I'm a cat attending UWM, attending Purr school of Cat and passionate about landscaping.  I'm very eager to work!",
    Rate: 100,
    experience: 2,
    availability: "Weekdays",
    skills: ["Lawn-Meowing", "Snow re-meow-val"],
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleSkill = (skill) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Saved profile:", profile);
  };

  return (
    <>
    <Navbar />
    <div className="container py-4">
      <h2 className="mb-4">My Profile</h2>

      <form onSubmit={handleSubmit} className="card shadow-sm">
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              className="form-control"
              name="name"
              value={profile.name}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Bio</label>
            <textarea
              className="form-control"
              name="bio"
              rows="3"
              value={profile.bio}
              onChange={handleChange}
            />
          </div>

          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Rate ($/hr)</label>
              <input
                className="form-control"
                type="number"
                name="salary"
                value={profile.salary}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Experience (years)</label>
              <input
                className="form-control"
                type="number"
                name="experience"
                value={profile.experience}
                onChange={handleChange}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Availability</label>
              <select
                className="form-select"
                name="availability"
                value={profile.availability}
                onChange={handleChange}
              >
                <option value="Weekdays">Weekdays</option>
                <option value="Weekends">Weekends</option>
                <option value="Evenings">Evenings</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="form-label d-block">Skills</label>
            <div className="d-flex flex-wrap gap-2">
              {ALL_SKILLS.map((skill) => (
                <button
                  type="button"
                  key={skill}
                  className={`btn btn-sm ${
                    profile.skills.includes(skill)
                      ? "btn-primary"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => toggleSkill(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <button type="submit" className="btn btn-primary">
              Save Profile
            </button>
          </div>
        </div>
      </form>
    </div>
    </>
  );
}