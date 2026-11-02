
import { useEffect, useCallback, useState } from "react";
import "./Appointments.css";

const API = "http://localhost:5000/api/appointments";
const PATIENTS_API = "http://localhost:5000/api/patients";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const emptyForm = {
    patient_id: "",
    doctor_name: "",
    appointment_date: "",
    appointment_time: "",
    reason: "",
    status: "Scheduled",
  };

  const [form, setForm] = useState(emptyForm);

  const loadAppointments = useCallback(async () => {
    try {
      const response = await fetch(
        `${API}?search=${encodeURIComponent(search)}`
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load appointments");
      }

      setAppointments(result.appointments ?? result.data ?? []);
    } catch (error) {
      setMessage(error.message);
    }
  }, [search]);

  const loadPatients = useCallback(async () => {
    try {
      const response = await fetch(PATIENTS_API);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error("Could not load patients");
      }

      setPatients(result.patients ?? result.data ?? []);
    } catch (error) {
      setMessage(error.message);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    try {
      const url = editingId ? `${API}/${editingId}` : API;
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          patient_id: Number(form.patient_id),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not save appointment");
      }

      setMessage(editingId ? "Appointment updated!" : "Appointment added!");
      setForm(emptyForm);
      setEditingId(null);
      await loadAppointments();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function handleEdit(appointment) {
    setEditingId(appointment.id);
    setForm({
      patient_id: String(appointment.patient_id),
      doctor_name: appointment.doctor_name,
      appointment_date: String(appointment.appointment_date).slice(0, 10),
      appointment_time: String(appointment.appointment_time).slice(0, 5),
      reason: appointment.reason || "",
      status: appointment.status,
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this appointment?")) return;

    try {
      const response = await fetch(`${API}/${id}`, { method: "DELETE" });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not delete appointment");
      }

      setMessage("Appointment deleted!");
      await loadAppointments();
    } catch (error) {
      setMessage(error.message);
    }
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  return (
    <div className="appointments-page">
      <h1>Appointments</h1>
      <p className="appointments-subtitle">
        Manage clinic appointments
      </p>

      {message && <p className="appointment-message">{message}</p>}

      <section className="appointment-card">
        <h2>{editingId ? "Edit Appointment" : "Add Appointment"}</h2>

        <form onSubmit={handleSubmit} className="appointment-form">
          <label>
            Patient
            <select
              name="patient_id"
              value={form.patient_id}
              onChange={handleChange}
              required
            >
              <option value="">Select patient</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.full_name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Doctor Name
            <input
              name="doctor_name"
              value={form.doctor_name}
              onChange={handleChange}
              placeholder="Enter doctor name"
              required
            />
          </label>

          <label>
            Appointment Date
            <input
              type="date"
              name="appointment_date"
              value={form.appointment_date}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Appointment Time
            <input
              type="time"
              name="appointment_time"
              value={form.appointment_time}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Reason
            <input
              name="reason"
              value={form.reason}
              onChange={handleChange}
              placeholder="Reason for visit"
            />
          </label>

          <label>
            Status
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>

          <div className="appointment-form-actions">
            <button type="submit">
              {editingId ? "Update Appointment" : "Add Appointment"}
            </button>

            {editingId && (
              <button type="button" className="cancel-button" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="appointment-card">
        <div className="appointment-list-header">
          <h2>Appointment List</h2>
          <input
            className="appointment-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search patient, doctor, status..."
          />
        </div>

        <div className="appointment-table-wrapper">
          <table className="appointment-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.id}</td>
                  <td>{appointment.patient_name || `Patient #${appointment.patient_id}`}</td>
                  <td>{appointment.doctor_name}</td>
                  <td>{String(appointment.appointment_date).slice(0, 10)}</td>
                  <td>{String(appointment.appointment_time).slice(0, 5)}</td>
                  <td>{appointment.reason || "-"}</td>
                  <td>{appointment.status}</td>
                  <td className="appointment-actions">
                    <button type="button" onClick={() => handleEdit(appointment)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => handleDelete(appointment.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {appointments.length === 0 && (
                <tr>
                  <td colSpan="8">No appointments found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Appointments;
