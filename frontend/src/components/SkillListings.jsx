import { useState } from "react";
import { useNavigate } from "react-router-dom";

const MOCK_STUDENTS = [
  {
    id: 1,
    name: "Logan Phillips",
    email: "logan@example.com",
    skills: ["React", "Node.js"],
    salary: 25,
    experience: 2,
    availability: "Weekdays",
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob@example.com",
    skills: ["Python", "Excel"],
    salary: 20,
    experience: 1,
    availability: "Weekends",
  },
  {
    id: 3,
    name: "Danny Brown",
    email: "danny@example.com",
    skills: ["Photoshop", "Illustrator"],
    salary: 30,
    experience: 3,
    availability: "Flexible",
  },
  {
    id: 4,
    name: "Mary Johnson",
    email: "mary@example.com",
    skills: ["Math", "Physics"],
    salary: 15,
    experience: 1,
    availability: "Evenings",
  },
];

const ALL_SKILLS = [...new Set(MOCK_STUDENTS.flatMap((s) => s.skills))];
const ALL_AVAILABILITY = [...new Set(MOCK_STUDENTS.map((s) => s.availability))];

export default function SkillListings() {
  const navigate = useNavigate();

  const [skillFilter, setSkillFilter] = useState("");
  const [maxSalary, setMaxSalary] = useState("");
  const [minExperience, setMinExperience] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("");

  const filtered = MOCK_STUDENTS.filter((student) => {
    if (skillFilter && !student.skills.includes(skillFilter)) return false;
    if (maxSalary && student.salary > Number(maxSalary)) return false;
    if (minExperience && student.experience < Number(minExperience)) return false;
    if (availabilityFilter && student.availability !== availabilityFilter) return false;
    return true;
  });

  return (
    <>
      <h2 className="mb-4">Browse Student Talent</h2>

      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <h5 className="card-title mb-3">Filter Students</h5>

          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Skill</label>
              <select
                className="form-select"
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
              >
                <option value="">All</option>
                {ALL_SKILLS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label">Max $/hr</label>
              <input
                className="form-control"
                type="number"
                value={maxSalary}
                onChange={(e) => setMaxSalary(e.target.value)}
                placeholder="Enter max rate"
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Min Experience</label>
              <input
                className="form-control"
                type="number"
                value={minExperience}
                onChange={(e) => setMinExperience(e.target.value)}
                placeholder="Enter min years"
              />
            </div>

            <div className="col-md-3">
              <label className="form-label">Availability</label>
              <select
                className="form-select"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
              >
                <option value="">Any</option>
                {ALL_AVAILABILITY.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
            </div>

            <div className="col-12">
              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSkillFilter("");
                  setMaxSalary("");
                  setMinExperience("");
                  setAvailabilityFilter("");
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {filtered.map((student) => (
          <div className="col-md-6" key={student.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-header fw-semibold">{student.name}</div>

              <div className="card-body">
                <p className="mb-2">Rate: ${student.salary}/hr</p>
                <p className="mb-2">Experience: {student.experience} yrs</p>
                <p className="mb-3">Availability: {student.availability}</p>

                <div className="d-flex flex-wrap gap-2">
                  {student.skills.map((s) => (
                    <span key={s} className="badge bg-primary">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="card-footer d-flex gap-2">
                <button
                  className="btn btn-outline-primary btn-sm flex-grow-1"
                  onClick={() =>
                    navigate(`/profile?email=${encodeURIComponent(student.email)}`)
                  }
                >
                  View Profile
                </button>

                <button
                  className="btn btn-outline-secondary btn-sm flex-grow-1"
                  onClick={() =>
                    navigate(`/reviews?studentEmail=${encodeURIComponent(student.email)}`)
                  }
                >
                  Reviews
                </button>

                <button className="btn btn-primary btn-sm flex-grow-1">
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}