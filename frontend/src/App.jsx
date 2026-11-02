
import { useState } from "react";
import Login from "./Login";
import Patients from "./Patients";
import Appointments from "./Appointments";
import Doctors from "./Doctors";
import Billing from "./Billing";
import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [activeModule, setActiveModule] = useState("");

  const cards = [
    ["👨‍⚕️", "Patients", "Manage patient records"],
    ["📅", "Appointments", "Manage appointments"],
    ["🩺", "Doctors", "View doctor information"],
    ["💳", "Billing", "Manage bills and payments"],
  ];

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  function renderModule() {
    switch (activeModule) {
      case "Patients":
        return <Patients />;

      case "Appointments":
        return <Appointments />;

      case "Doctors":
        return <Doctors />;

      case "Billing":
        return <Billing />;

      default:
        return <p>Please select a module.</p>;
    }
  }

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Small Clinic</h1>
          <p>Appointment &amp; Administration System</p>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={() => {
            setUser(null);
            setActiveModule("");
          }}
        >
          Logout
        </button>
      </header>

      {activeModule === "" ? (
        <>
          <h2>Clinic Dashboard</h2>

          <p>
            Welcome,{" "}
            {user.username || user.name || user.login_id || "User"}!
          </p>

          <div className="dashboard-grid">
            {cards.map(([icon, title, description]) => (
              <button
                type="button"
                className="dashboard-card"
                key={title}
                onClick={() => setActiveModule(title)}
              >
                <div className="dashboard-icon">{icon}</div>
                <h3>{title}</h3>
                <p>{description}</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <section style={{ marginTop: "25px" }}>
          <button
            type="button"
            onClick={() => setActiveModule("")}
            style={{
              padding: "10px 16px",
              marginBottom: "20px",
              border: "none",
              borderRadius: "6px",
              background: "#1976d2",
              color: "white",
              cursor: "pointer",
            }}
          >
            ← Back to Dashboard
          </button>

          {renderModule()}
        </section>
      )}
    </main>
  );
}

export default App;
