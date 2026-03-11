import Navbar from "../components/Navbar";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export default function Payment() {
  return (
    <>
      <Navbar />

      <div className="container py-4">
        <h2 className="mb-4">Payments</h2>

        <div className="row g-4">
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Send Payment</h5>

                <PayPalScriptProvider>
                  <PayPalButtons/>
                </PayPalScriptProvider>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Payment History</h5>
                <p>No payments yet.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}