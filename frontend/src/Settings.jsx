
import { useState } from "react";
import "./App.css";

const defaultSettings = {
  clinicName: "Small Clinic",
  doctorName: "",
  phone: "",
  address: "",
};

function loadSettings() {
  try {
    const saved = localStorage.getItem("clinicSettings");

    return saved
      ? { ...defaultSettings, ...JSON.parse(saved) }
      : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

export default function Settings() {
  const [settings, setSettings] = useState(loadSettings);
  const [message, setMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setSettings((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  }

  function handleSave(e) {
    e.preventDefault();

    try {
      localStorage.setItem(
        "clinicSettings",
        JSON.stringify(settings)
      );

      setMessage("Settings saved successfully!");
    } catch {
      setMessage("Unable to save settings. Please try again.");
    }
  }

  return (
    <div className="settings-page">
      <h2>Clinic Settings</h2>
      <p>Manage your clinic information.</p>

      <form className="settings-form" onSubmit={handleSave}>
        <label htmlFor="clinicName">Clinic Name</label>
        <input
          id="clinicName"
          name="clinicName"
          value={settings.clinicName}
          onChange={handleChange}
          required
        />

        <label htmlFor="doctorName">Doctor Name</label>
        <input
          id="doctorName"
          name="doctorName"
          value={settings.doctorName}
          onChange={handleChange}
          placeholder="Enter doctor name"
        />

        <label htmlFor="phone">Phone Number</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          value={settings.phone}
          onChange={handleChange}
          placeholder="Enter phone number"
        />

        <label htmlFor="address">Clinic Address</label>
        <textarea
          id="address"
          name="address"
          value={settings.address}
          onChange={handleChange}
          placeholder="Enter clinic address"
          rows={3}
        />

        <button type="submit">Save Settings</button>

        {message && (
          <p className="settings-success">{message}</p>
        )}
      </form>
    </div>
  );
}
