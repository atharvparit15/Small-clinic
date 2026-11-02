
import { useCallback, useEffect, useState } from "react";
import "./Patients.css";

const API_URL = "http://localhost:5000/api/patients";

const emptyForm = {
  full_name: "",
  age: "",
  gender: "",
  phone: "",
  address: "",
};

function Patients() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadPatients = useCallback(async (searchText = "") => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}?search=${encodeURIComponent(searchText)}`
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Patients load झाले नाहीत.");
      }

      setPatients(data.patients || []);
    } catch (err) {
      setError(err.message || "Backend connection तपासा.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients(search);
  }, [loadPatients, search]);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!form.full_name.trim()) {
      setError("Patient चे नाव आवश्यक आहे.");
      return;
    }

    try {
      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          full_name: form.full_name.trim(),
          age: form.age ? Number(form.age) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Patient save झाला नाही.");
      }

      setMessage(
        editingId
          ? "Patient successfully updated!"
          : "Patient successfully added!"
      );

      setForm(emptyForm);
      setEditingId(null);
      await loadPatients(search);
    } catch (err) {
      setError(err.message || "Patient save करताना error आला.");
    }
  };

  const handleEdit = (patient) => {
    setEditingId(patient.id);
    setForm({
      full_name: patient.full_name || "",
      age: patient.age ?? "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      address: patient.address || "",
    });
    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (patient) => {
    const confirmed = window.confirm(
      `Delete patient "${patient.full_name}"?`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const response = await fetch(`${API_URL}/${patient.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Patient delete झाला नाही.");
      }

      setMessage("Patient successfully deleted!");
      await loadPatients(search);
    } catch (err) {
      setError(err.message || "Patient delete करताना error आला.");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
    setError("");
  };

  return (
    <div className="patients-page">
      <h2>Patients Management</h2>
      <p>Add, update, delete and search patient records.</p>

      {message && <div className="patients-message">{message}</div>}
      {error && <div className="patients-error">{error}</div>}

      <section className="patients-card">
        <h3>{editingId ? "Edit Patient" : "Add New Patient"}</h3>

        <form onSubmit={handleSubmit}>
          <div className="patients-form-grid">
            <div className="patients-field">
              <label>Full Name *</label>
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Enter patient name"
                required
              />
            </div>

            <div className="patients-field">
              <label>Age</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                min="0"
                max="150"
                placeholder="Enter age"
              />
            </div>

            <div className="patients-field">
              <label>Gender</label>
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="patients-field">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                maxLength="15"
              />
            </div>

            <div className="patients-field patients-full-width">
              <label>Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Enter address"
                rows="3"
              />
            </div>
          </div>

          <div className="patients-actions">
            <button type="submit" className="patients-save-btn">
              {editingId ? "Update Patient" : "Add Patient"}
            </button>

            {editingId && (
              <button
                type="button"
                className="patients-cancel-btn"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="patients-card">
        <div className="patients-list-heading">
          <h3>Patient Records</h3>
          <span>Total: {patients.length}</span>
        </div>

        <input
          className="patients-search"
          type="search"
          placeholder="Search by name, phone or address..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {loading ? (
          <p>Loading patients...</p>
        ) : (
          <div className="patients-table-wrapper">
            <table className="patients-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {patients.length > 0 ? (
                  patients.map((patient) => (
                    <tr key={patient.id}>
                      <td>{patient.id}</td>
                      <td>{patient.full_name}</td>
                      <td>{patient.age ?? "-"}</td>
                      <td>{patient.gender || "-"}</td>
                      <td>{patient.phone || "-"}</td>
                      <td>{patient.address || "-"}</td>
                      <td>
                        <div className="patients-row-actions">
                          <button
                            type="button"
                            className="patients-edit-btn"
                            onClick={() => handleEdit(patient)}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            className="patients-delete-btn"
                            onClick={() => handleDelete(patient)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7">
                      {search
                        ? "No matching patients found."
                        : "No patient records available."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Patients;
