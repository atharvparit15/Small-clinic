
import { useEffect, useState } from "react";

const API = "http://localhost:5000";

export default function Clinics() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    clinic_name: "",
    login_id: "",
    password: "",
    phone: "",
    address: "",
  });

  async function loadClinics() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API}/api/clinics`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to load clinics."
        );
      }

      setClinics(data.data || []);
    } catch (err) {
      setError(err.message || "Backend server check kara.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClinics();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch(`${API}/api/clinics`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to create clinic."
        );
      }

      setMessage("Clinic created successfully!");

      setForm({
        clinic_name: "",
        login_id: "",
        password: "",
        phone: "",
        address: "",
      });

      await loadClinics();
    } catch (err) {
      setError(err.message || "Unable to create clinic.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-content">
      <header className="header">
        <div>
          <h1>Manage Clinics</h1>
          <p>Create and view clinic accounts</p>
        </div>

        <button
          type="button"
          onClick={loadClinics}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      <section className="panel">
        <h2>Create New Clinic</h2>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p role="status">{message}</p>
        )}

        <form onSubmit={handleSubmit}>
          <label htmlFor="clinic_name">
            Clinic Name
          </label>
          <input
            id="clinic_name"
            name="clinic_name"
            value={form.clinic_name}
            onChange={handleChange}
            required
          />

          <label htmlFor="login_id">
            Clinic Login ID
          </label>
          <input
            id="login_id"
            name="login_id"
            value={form.login_id}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">
            Temporary Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            autoComplete="new-password"
            required
          />

          <label htmlFor="phone">Phone</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
          />

          <label htmlFor="address">Address</label>
          <input
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
          />

          <button type="submit" disabled={saving}>
            {saving ? "Creating..." : "Create Clinic"}
          </button>
        </form>
      </section>

      <section className="panel">
        <h2>Registered Clinics ({clinics.length})</h2>

        {loading ? (
          <p>Loading clinics...</p>
        ) : clinics.length === 0 ? (
          <p>No clinics registered yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Clinic Name</th>
                  <th>Login ID</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {clinics.map((clinic) => (
                  <tr key={clinic.id}>
                    <td>{clinic.id}</td>
                    <td>{clinic.clinic_name}</td>
                    <td>{clinic.login_id}</td>
                    <td>{clinic.phone || "-"}</td>
                    <td>{clinic.address || "-"}</td>
                    <td>{clinic.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
