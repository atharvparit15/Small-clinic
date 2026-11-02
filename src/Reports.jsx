
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000";

export default function Reports() {
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReports() {
    setLoading(true);
    setError("");

    try {
      const urls = [
        `${API}/api/patients`,
        `${API}/api/appointments`,
        `${API}/api/bills`,
      ];

      const responses = await Promise.all(urls.map((url) => fetch(url)));

      if (responses.some((response) => !response.ok)) {
        throw new Error("Report data मिळाला नाही. Backend तपासा.");
      }

      const results = await Promise.all(
        responses.map((response) => response.json())
      );

      if (results.some((result) => result.success === false)) {
        throw new Error("API ने report data परत केला नाही.");
      }

      setPatients(results[0].data || []);
      setAppointments(results[1].data || []);
      setBills(results[2].data || []);
    } catch (err) {
      setError(err.message || "Reports load करण्यात अडचण आली.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  const totalBilling = bills.reduce(
    (sum, bill) => sum + Number(bill.total_amount || 0),
    0
  );

  const totalPaid = bills.reduce(
    (sum, bill) => sum + Number(bill.paid_amount || 0),
    0
  );

  const totalBalance = bills.reduce(
    (sum, bill) => sum + Number(bill.balance_amount || 0),
    0
  );

  const cards = [
    { title: "Total Patients", value: patients.length, icon: "👥" },
    {
      title: "Total Appointments",
      value: appointments.length,
      icon: "📅",
    },
    { title: "Total Bills", value: bills.length, icon: "🧾" },
    {
      title: "Total Billing",
      value: `₹${totalBilling.toFixed(2)}`,
      icon: "💰",
    },
    {
      title: "Amount Received",
      value: `₹${totalPaid.toFixed(2)}`,
      icon: "✅",
    },
    {
      title: "Balance Due",
      value: `₹${totalBalance.toFixed(2)}`,
      icon: "⏳",
    },
  ];

  return (
    <main className="reports-page">
      <header className="reports-header">
        <div>
          <h1>Reports Dashboard</h1>
          <p>Small Clinic - Activity and Billing Summary</p>
        </div>

        <div className="reports-header-actions">
          <button onClick={loadReports} disabled={loading}>
            Refresh
          </button>
          <button onClick={() => window.print()}>
            Print Report
          </button>
        </div>
      </header>

      {error && <p className="error-message">{error}</p>}

      {loading ? (
        <p>Loading reports...</p>
      ) : (
        <>
          <section className="reports-grid">
            {cards.map((card) => (
              <article className="report-card" key={card.title}>
                <span className="report-icon">{card.icon}</span>
                <p>{card.title}</p>
                <h2>{card.value}</h2>
              </article>
            ))}
          </section>

          <section className="reports-panel">
            <h2>Recent Bills</h2>

            {bills.length === 0 ? (
              <p>No bills available yet.</p>
            ) : (
              <div className="reports-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Bill ID</th>
                      <th>Patient</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Paid</th>
                      <th>Balance</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {bills.slice(0, 10).map((bill) => (
                      <tr key={bill.id}>
                        <td>{bill.id}</td>
                        <td>
                          {bill.patient_name || `Patient ${bill.patient_id}`}
                        </td>
                        <td>{String(bill.bill_date).slice(0, 10)}</td>
                        <td>
                          ₹{Number(bill.total_amount || 0).toFixed(2)}
                        </td>
                        <td>
                          ₹{Number(bill.paid_amount || 0).toFixed(2)}
                        </td>
                        <td>
                          ₹{Number(bill.balance_amount || 0).toFixed(2)}
                        </td>
                        <td>{bill.payment_status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
