
import { useCallback, useEffect, useState } from "react";
import "./Billing.css";

const BILL_API = "http://localhost:5000/api/billing";
const PATIENT_API = "http://localhost:5000/api/patients";

function Billing() {
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    patient_id: "",
    bill_description: "",
    consultation_fee: "0",
    medicine_charges: "0",
    other_charges: "0",
    paid_amount: "0",
    bill_date: new Date().toISOString().slice(0, 10),
  });

  const totalAmount =
    Number(form.consultation_fee || 0) +
    Number(form.medicine_charges || 0) +
    Number(form.other_charges || 0);

  const balanceAmount = Math.max(
    0,
    totalAmount - Number(form.paid_amount || 0)
  );

  const money = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    });

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [billResponse, patientResponse] = await Promise.all([
        fetch(BILL_API),
        fetch(PATIENT_API),
      ]);

      const billData = await billResponse.json();

      if (!billResponse.ok || billData.success === false) {
        throw new Error(billData.message || "Bills load झाले नाहीत.");
      }

      setBills(Array.isArray(billData) ? billData : billData.bills || []);

      if (patientResponse.ok) {
        const patientData = await patientResponse.json();
        setPatients(
          Array.isArray(patientData)
            ? patientData
            : patientData.patients || []
        );
      } else {
        setPatients([]);
      }
    } catch (err) {
      setError(
        err.message ||
          "Backend connection तपासा. Server port 5000 वर चालू असावा."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const createBill = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!form.patient_id) {
      setError("कृपया patient निवडा.");
      return;
    }

    if (!form.bill_description.trim()) {
      setError("Bill description लिहा.");
      return;
    }

    if (Number(form.paid_amount) > totalAmount) {
      setError("Paid amount हा total bill पेक्षा जास्त असू शकत नाही.");
      return;
    }

    try {
      const response = await fetch(BILL_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          patient_id: Number(form.patient_id),
          consultation_fee: Number(form.consultation_fee),
          medicine_charges: Number(form.medicine_charges),
          other_charges: Number(form.other_charges),
          paid_amount: Number(form.paid_amount),
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Bill तयार करता आला नाही.");
      }

      setMessage(
        `Bill तयार झाला! Bill ID: ${data.bill_id ?? data.id ?? ""}`
      );

      setForm({
        patient_id: "",
        bill_description: "",
        consultation_fee: "0",
        medicine_charges: "0",
        other_charges: "0",
        paid_amount: "0",
        bill_date: new Date().toISOString().slice(0, 10),
      });

      await loadData();
    } catch (err) {
      setError(err.message || "Bill save करताना error आला.");
    }
  };

  const printBill = (bill) => {
    const safe = (value) =>
      String(value ?? "").replace(/[&<>"']/g, (character) => {
        const entities = {
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        };
        return entities[character];
      });

    const billDate = bill.bill_date
      ? String(bill.bill_date).slice(0, 10)
      : "";

    const printWindow = window.open("", "_blank", "width=850,height=700");

    if (!printWindow) {
      setError("Print window blocked. Browser मध्ये pop-ups allow करा.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bill #${safe(bill.id)}</title>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 35px;
            color: #222;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #222;
            padding-bottom: 15px;
          }
          h1 { margin-bottom: 5px; }
          .details { margin: 25px 0; line-height: 1.8; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #bbb;
            padding: 11px;
            text-align: left;
          }
          th { background: #eee; }
          .amount { text-align: right; }
          .total {
            font-size: 18px;
            font-weight: bold;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
          }
          @media print {
            body { margin: 15mm; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Small Clinic</h1>
          <p>Clinic Management System</p>
          <h2>Patient Bill</h2>
        </div>

        <div class="details">
          <strong>Bill No:</strong> ${safe(bill.id)}<br>
          <strong>Bill Date:</strong> ${safe(billDate)}<br>
          <strong>Patient Name:</strong> ${safe(bill.patient_name)}<br>
          <strong>Phone:</strong> ${safe(bill.patient_phone)}<br>
          <strong>Description:</strong> ${safe(bill.bill_description)}
        </div>

        <table>
          <thead>
            <tr><th>Particulars</th><th class="amount">Amount</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>Consultation Fee</td>
              <td class="amount">${safe(money(bill.consultation_fee))}</td>
            </tr>
            <tr>
              <td>Medicine Charges</td>
              <td class="amount">${safe(money(bill.medicine_charges))}</td>
            </tr>
            <tr>
              <td>Other Charges</td>
              <td class="amount">${safe(money(bill.other_charges))}</td>
            </tr>
            <tr class="total">
              <td>Total Amount</td>
              <td class="amount">${safe(money(bill.total_amount))}</td>
            </tr>
            <tr>
              <td>Paid Amount</td>
              <td class="amount">${safe(money(bill.paid_amount))}</td>
            </tr>
            <tr>
              <td>Balance Amount</td>
              <td class="amount">${safe(money(bill.balance_amount))}</td>
            </tr>
            <tr>
              <td>Payment Status</td>
              <td>${safe(bill.payment_status)}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <p>Thank you for visiting Small Clinic.</p>
          <p>Authorized Signature: __________________</p>
        </div>

        <script>
          window.onload = function() {
            window.focus();
            window.print();
          };
        </script>
      </body>
      </html>
    `);

    printWindow.document.close();
  };

  const filteredBills = bills.filter((bill) => {
    const query = search.toLowerCase();

    return (
      String(bill.id ?? "").includes(query) ||
      String(bill.patient_name ?? "").toLowerCase().includes(query) ||
      String(bill.bill_description ?? "").toLowerCase().includes(query) ||
      String(bill.payment_status ?? "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="billing-page">
      <h2>Billing Management</h2>
      <p>Create bills, print receipts and view billing history.</p>

      {message && <div className="billing-success">{message}</div>}
      {error && <div className="billing-error">{error}</div>}

      <section className="billing-card">
        <h3>Create New Bill</h3>

        <form onSubmit={createBill}>
          <div className="billing-form-grid">
            <div className="billing-field">
              <label>Patient</label>
              <select
                name="patient_id"
                value={form.patient_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Patient</option>
                {patients.map((patient) => (
                  <option key={patient.id} value={patient.id}>
                    {patient.full_name || patient.name} (ID: {patient.id})
                  </option>
                ))}
              </select>
              {patients.length === 0 && (
                <small>Patient list मिळत नसेल तर Patients API तपासा.</small>
              )}
            </div>

            <div className="billing-field">
              <label>Bill Date</label>
              <input
                type="date"
                name="bill_date"
                value={form.bill_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="billing-field full-width">
              <label>Description</label>
              <input
                type="text"
                name="bill_description"
                placeholder="Consultation and medicines"
                value={form.bill_description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="billing-field">
              <label>Consultation Fee (₹)</label>
              <input
                type="number"
                name="consultation_fee"
                min="0"
                step="0.01"
                value={form.consultation_fee}
                onChange={handleChange}
                required
              />
            </div>

            <div className="billing-field">
              <label>Medicine Charges (₹)</label>
              <input
                type="number"
                name="medicine_charges"
                min="0"
                step="0.01"
                value={form.medicine_charges}
                onChange={handleChange}
                required
              />
            </div>

            <div className="billing-field">
              <label>Other Charges (₹)</label>
              <input
                type="number"
                name="other_charges"
                min="0"
                step="0.01"
                value={form.other_charges}
                onChange={handleChange}
                required
              />
            </div>

            <div className="billing-field">
              <label>Paid Amount (₹)</label>
              <input
                type="number"
                name="paid_amount"
                min="0"
                max={totalAmount}
                step="0.01"
                value={form.paid_amount}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="billing-summary">
            <div>
              <span>Total Amount</span>
              <strong>{money(totalAmount)}</strong>
            </div>
            <div>
              <span>Balance Amount</span>
              <strong>{money(balanceAmount)}</strong>
            </div>
          </div>

          <button type="submit" className="billing-primary-btn">
            Save Bill
          </button>
        </form>
      </section>

      <section className="billing-card">
        <div className="billing-history-header">
          <div>
            <h3>Billing History</h3>
            <p>Previous bills and printable receipts.</p>
          </div>
          <button
            type="button"
            className="billing-secondary-btn"
            onClick={loadData}
          >
            Refresh
          </button>
        </div>

        <input
          className="billing-search"
          type="text"
          placeholder="Search by bill ID, patient, description or status"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        {loading ? (
          <p>Loading bills...</p>
        ) : (
          <div className="billing-table-wrapper">
            <table className="billing-table">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Total</th>
                  <th>Paid</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length > 0 ? (
                  filteredBills.map((bill) => (
                    <tr key={bill.id}>
                      <td>{bill.id}</td>
                      <td>
                        {bill.bill_date
                          ? String(bill.bill_date).slice(0, 10)
                          : "-"}
                      </td>
                      <td>{bill.patient_name || `Patient ${bill.patient_id}`}</td>
                      <td>{money(bill.total_amount)}</td>
                      <td>{money(bill.paid_amount)}</td>
                      <td>{money(bill.balance_amount)}</td>
                      <td>
                        <span className="billing-status">
                          {bill.payment_status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="billing-print-btn"
                          onClick={() => printBill(bill)}
                        >
                          Print Bill
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8">
                      {search
                        ? "Search केल्यावर bill सापडला नाही."
                        : "Billing history मध्ये bill उपलब्ध नाही."}
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

export default Billing;
