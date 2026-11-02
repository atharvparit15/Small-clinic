
import { useCallback, useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/doctors";

const emptyForm = {
  name: "",
  specialization: "",
  phone: "",
  qualification: "",
  fee: "",
};

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDoctors = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL);
      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to load doctors");
      }

      setDoctors(Array.isArray(data) ? data : data.doctors || []);
    } catch (err) {
      setError(err.message || "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDoctors();
  }, [loadDoctors]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          fee: Number(form.fee),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to save doctor");
      }

      setMessage(
        editingId
          ? "Doctor updated successfully."
          : "Doctor added successfully."
      );

      resetForm();
      await loadDoctors();
    } catch (err) {
      setError(err.message || "Unable to save doctor");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(doctor) {
    setEditingId(doctor.id);
    setForm({
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      phone: doctor.phone || "",
      qualification: doctor.qualification || "",
      fee: String(doctor.fee ?? ""),
    });
    setMessage("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteDoctor(doctor) {
    const confirmed = window.confirm(
      `Delete Dr. ${doctor.name}? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/${doctor.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Unable to delete doctor");
      }

      if (editingId === doctor.id) resetForm();

      setMessage("Doctor deleted successfully.");
      await loadDoctors();
    } catch (err) {
      setError(err.message || "Unable to delete doctor");
    }
  }

  return (
    <section className="panel">
      <h2>Doctors Management</h2>
      <p>Add, view, edit and delete doctor records.</p>

      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}

      <form onSubmit={handleSubmit}>
        <h3>{editingId ? "Edit Doctor" : "Add New Doctor"}</h3>

        <div className="doctor-form-grid">
          <label>
            Doctor Name
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter doctor name"
              required
            />
          </label>

          <label>
            Specialization
            <input
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              placeholder="e.g. Cardiology"
              required
            />
          </label>

          <label>
            Phone
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
            />
          </label>

          <label>
            Qualification
            <input
              name="qualification"
              value={form.qualification}
              onChange={handleChange}
              placeholder="e.g. MBBS"
              required
            />
          </label>

          <label>
            Consultation Fee (₹)
            <input
              name="fee"
              type="number"
              min="0"
              step="0.01"
              value={form.fee}
              onChange={handleChange}
              placeholder="Enter fee"
              required
            />
          </label>
        </div>

        <div className="doctor-actions">
          <button type="submit" disabled={saving}>
            {saving
              ? "Saving..."
              : editingId
                ? "Update Doctor"
                : "Add Doctor"}
          </button>

          {editingId && (
            <button type="button" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <h3 style={{ marginTop: "28px" }}>Doctor Records</h3>

      {loading ? (
        <p>Loading doctors...</p>
      ) : doctors.length === 0 ? (
        <p>No doctors found. Add your first doctor above.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Specialization</th>
                <th>Phone</th>
                <th>Qualification</th>
                <th>Fee</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {doctors.map((doctor) => (
                <tr key={doctor.id}>
                  <td>{doctor.name}</td>
                  <td>{doctor.specialization}</td>
                  <td>{doctor.phone}</td>
                  <td>{doctor.qualification}</td>
                  <td>₹{Number(doctor.fee).toFixed(2)}</td>
                  <td>
                    <div className="doctor-actions">
                      <button
                        type="button"
                        onClick={() => startEdit(doctor)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteDoctor(doctor)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default Doctors;
