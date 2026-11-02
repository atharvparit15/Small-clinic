
import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/prescriptions";
const PATIENTS_API = "http://localhost:5000/api/patients";
const DOCTORS_API = "http://localhost:5000/api/doctors";

const initialForm = {
  patient_id: "",
  doctor_name: "",
  diagnosis: "",
  medicine_name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
  prescription_date: new Date().toLocaleDateString("en-CA"),
};

function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ ...initialForm });
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function readResponse(response) {
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Request failed");
    }

    return result;
  }

  async function loadPrescriptions() {
    try {
      setLoading(true);
      const response = await fetch(API);
      const result = await readResponse(response);
      setPrescriptions(result.data || []);
    } catch (error) {
      setMessage("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadOptions() {
    try {
      const [patientResponse, doctorResponse] = await Promise.all([
        fetch(PATIENTS_API),
        fetch(DOCTORS_API),
      ]);

      const patientResult = await readResponse(patientResponse);
      const doctorResult = await readResponse(doctorResponse);

      setPatients(patientResult.data || []);
      setDoctors(doctorResult.data || []);
    } catch (error) {
      setMessage("Error loading patients/doctors: " + error.message);
    }
  }

  useEffect(() => {
    loadPrescriptions();
    loadOptions();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function resetForm() {
    setForm({ ...initialForm });
    setEditingId(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");

    if (
      !form.patient_id ||
      !form.doctor_name.trim() ||
      !form.diagnosis.trim() ||
      !form.medicine_name.trim() ||
      !form.dosage.trim() ||
      !form.frequency.trim() ||
      !form.duration.trim() ||
      !form.prescription_date
    ) {
      setMessage("Please fill all required fields.");
      return;
    }

    setSaving(true);

    try {
      const url = editingId ? `${API}/${editingId}` : API;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          patient_id: Number(form.patient_id),
          doctor_name: form.doctor_name.trim(),
          diagnosis: form.diagnosis.trim(),
          medicine_name: form.medicine_name.trim(),
          dosage: form.dosage.trim(),
          frequency: form.frequency.trim(),
          duration: form.duration.trim(),
          instructions: form.instructions.trim(),
        }),
      });

      const result = await readResponse(response);

      setMessage(
        editingId
          ? "Prescription updated successfully!"
          : "Prescription saved successfully!"
      );

      resetForm();
      await loadPrescriptions();
    } catch (error) {
      setMessage("Error: " + error.message);
    } finally {
      setSaving(false);
    }
  }

  function editPrescription(item) {
    setForm({
      patient_id: String(item.patient_id),
      doctor_name: item.doctor_name || "",
      diagnosis: item.diagnosis || "",
      medicine_name: item.medicine_name || "",
      dosage: item.dosage || "",
      frequency: item.frequency || "",
      duration: item.duration || "",
      instructions: item.instructions || "",
      prescription_date: String(item.prescription_date || "").slice(0, 10),
    });

    setEditingId(item.id);
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deletePrescription(id) {
    if (!window.confirm("Delete this prescription?")) return;

    setMessage("");

    try {
      const response = await fetch(`${API}/${id}`, {
        method: "DELETE",
      });

      const result = await readResponse(response);

      if (editingId === id) resetForm();

      setMessage(result.message || "Prescription deleted successfully!");
      await loadPrescriptions();
    } catch (error) {
      setMessage("Error: " + error.message);
    }
  }

  return (
    <div className="prescriptions-page">
      <section className="panel">
        <h2>{editingId ? "Edit Prescription" : "Add Prescription"}</h2>

        {message && (
          <p
            role="status"
            className={
              message.startsWith("Error:") ? "error-message" : "success-message"
            }
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="prescription-form-grid">
            <label>
              Patient *
              <select
                name="patient_id"
                value={form.patient_id}
                onChange={handleChange}
                required
              >
                <option value="">Select patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.full_name} (ID: {patient.id})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Doctor *
              <select
                name="doctor_name"
                value={form.doctor_name}
                onChange={handleChange}
                required
              >
                <option value="">Select doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.doctor_name}>
                    {doctor.doctor_name} — {doctor.specialization}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Diagnosis *
              <input
                name="diagnosis"
                value={form.diagnosis}
                onChange={handleChange}
                placeholder="Enter diagnosis"
                required
              />
            </label>

            <label>
              Medicine Name *
              <input
                name="medicine_name"
                value={form.medicine_name}
                onChange={handleChange}
                placeholder="Medicine name"
                required
              />
            </label>

            <label>
              Dosage *
              <input
                name="dosage"
                value={form.dosage}
                onChange={handleChange}
                placeholder="As prescribed by doctor"
                required
              />
            </label>

            <label>
              Frequency *
              <input
                name="frequency"
                value={form.frequency}
                onChange={handleChange}
                placeholder="As prescribed by doctor"
                required
              />
            </label>

            <label>
              Duration *
              <input
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="As prescribed by doctor"
                required
              />
            </label>

            <label>
              Prescription Date *
              <input
                type="date"
                name="prescription_date"
                value={form.prescription_date}
                onChange={handleChange}
                required
              />
            </label>

            <label className="prescription-full-width">
              Instructions
              <textarea
                name="instructions"
                value={form.instructions}
                onChange={handleChange}
                placeholder="Additional instructions"
                rows="3"
              />
            </label>
          </div>

          <div className="prescription-form-actions">
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Prescription"
                  : "Save Prescription"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setMessage("");
                }}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="prescription-list-header">
          <h2>Prescription List ({prescriptions.length})</h2>
          <button
            type="button"
            onClick={loadPrescriptions}
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p>Loading prescriptions...</p>
        ) : (
          <div className="prescription-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Diagnosis</th>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Frequency</th>
                  <th>Duration</th>
                  <th>Instructions</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {prescriptions.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>
                      {item.patient_name || `Patient ID: ${item.patient_id}`}
                    </td>
                    <td>{item.doctor_name}</td>
                    <td>{item.diagnosis}</td>
                    <td>{item.medicine_name}</td>
                    <td>{item.dosage}</td>
                    <td>{item.frequency}</td>
                    <td>{item.duration}</td>
                    <td>{item.instructions || "-"}</td>
                    <td>
                      {String(item.prescription_date || "").slice(0, 10)}
                    </td>
                    <td>
                      <div className="prescription-row-actions">
                        <button
                          type="button"
                          onClick={() => editPrescription(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deletePrescription(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {prescriptions.length === 0 && (
                  <tr>
                    <td colSpan="11">No prescriptions found.</td>
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

export default Prescriptions;
