import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Small Clinic</h1>
        <p>Appointment & Administration System</p>
      </header>

      <main className="container">
        <h2>Clinic Dashboard</h2>

        <div className="cards">
          <div className="card">
            <h3>Patients</h3>
            <p>Manage patient records</p>
          </div>

          <div className="card">
            <h3>Appointments</h3>
            <p>Manage appointments</p>
          </div>

          <div className="card">
            <h3>Doctors</h3>
            <p>View doctor information</p>
          </div>

          <div className="card">
            <h3>Billing</h3>
            <p>Manage bills and payments</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;