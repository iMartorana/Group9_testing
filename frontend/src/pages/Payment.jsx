// import { useEffect, useState } from "react";
// import { useAuth0 } from "@auth0/auth0-react";
// import Navbar from "../components/Navbar";
// import supabase from "../supabaseconfig";
// import { PayPalButtons } from "@paypal/react-paypal-js";

// function PaymentHistory() {
//   const { user } = useAuth0();
//   const [payments, setPayments] = useState([]);

//   useEffect(() => {
//     const fetchPayments = async () => {
//       const { data, error } = await supabase
//         .from("payments")
//         .select("*")
//         .eq("payer_email", user?.email)
//         .order("created_at", { ascending: false });

//       if (error) console.error(error);
//       else setPayments(data || []);
//     };

//     if (user?.email) fetchPayments();
//   }, [user]);

//   return (
//     <div className="card shadow-sm">
//       <div className="card-body">
//         <h5 className="card-title mb-3">Payment History</h5>

//         <table className="table">
//           <thead>
//             <tr>
//               <th>Recipient</th>
//               <th>Amount</th>
//               <th>Status</th>
//               <th>Date</th>
//             </tr>
//           </thead>

//           <tbody>
//             {payments.map((payment) => (
//               <tr key={payment.id}>
//                 <td>{payment.recipient_email}</td>
//                 <td>${payment.amount}</td>
//                 <td>{payment.status}</td>
//                 <td>{new Date(payment.created_at).toLocaleDateString()}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// export default function Payment() {
//   const { user } = useAuth0();
//   const [role, setRole] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchRole = async () => {
//       const { data, error } = await supabase
//         .from("users")
//         .select("role")
//         .eq("email", user.email)
//         .single();

//       if (!error) setRole(data.role);
//       setLoading(false);
//     };

//     if (user?.email) fetchRole();
//   }, [user]);

//   if (loading) return <div className="container py-4">Loading...</div>;

//   return (
//     <>
//       <Navbar />

//       <div className="container py-4">
//         <h2 className="mb-4">Payments</h2>

//         <div className="row g-4">

//           <div className="col-md-4">
//             <div className="card shadow-sm">
//               <div className="card-body">
//                 <h5>Send Payment</h5>

//                 <PayPalButtons
//                   createOrder={(data, actions) => {
//                     return actions.order.create({
//                       purchase_units: [
//                         {
//                           amount: { value: "25.00" }
//                         }
//                       ]
//                     });
//                   }}

//                   onApprove={async (data, actions) => {
//                     const details = await actions.order.capture();
//                     console.log("Payment complete:", details);
//                   }}
//                 />

//               </div>
//             </div>
//           </div>

//           <div className="col-md-8">
//             <PaymentHistory />
//           </div>

//         </div>
//       </div>
//     </>
//   );
// }

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

                <PayPalScriptProvider
                  options={{
                    clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
                    currency: "USD",
                  }}
                >
                  <PayPalButtons
                    createOrder={(data, actions) => {
                      return actions.order.create({
                        purchase_units: [
                          {
                            amount: { value: "25.00" },
                          },
                        ],
                      });
                    }}
                    onApprove={async (data, actions) => {
                      const details = await actions.order.capture();
                      console.log("Payment approved:", details);
                    }}
                    onError={(err) => {
                      console.error("PayPal error:", err);
                    }}
                  />
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
