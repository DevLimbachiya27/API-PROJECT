import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBills, generateBills, recordPayment } from '../../redux/slices/billingSlice';
import { FiDollarSign, FiCreditCard, FiPlus, FiX } from 'react-icons/fi';
import Loader from '../../components/common/Loader';
import { toast } from 'react-toastify';

const BillList = () => {
  const dispatch = useDispatch();
  const { bills, loading } = useSelector((state) => state.billing);
  const { user } = useSelector((state) => state.auth);
  const [statusFilter, setStatusFilter] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [billForm, setBillForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    dueDate: '',
    breakdown: {
      maintenance: 2000,
      water: 500,
      electricity: 300,
      parking: 200,
      sinkingFund: 500,
      other: 0
    }
  });

  useEffect(() => {
    dispatch(fetchBills({ status: statusFilter }));
  }, [dispatch, statusFilter]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(generateBills(billForm)).unwrap();
      toast.success(result.message);
      setShowGenerateModal(false);
      dispatch(fetchBills({}));
    } catch (err) {
      toast.error(err || 'Failed to generate bills');
    }
  };

  const handlePayment = async (billId) => {
    try {
      await dispatch(recordPayment({
        id: billId,
        paymentData: { paymentMethod: 'online', transactionId: 'TXN' + Date.now() }
      })).unwrap();
      toast.success('Payment recorded!');
    } catch (err) {
      toast.error(err || 'Payment failed');
    }
  };

  const totalAmount = (breakdown) => {
    return Object.values(breakdown || {}).reduce((sum, val) => sum + (Number(val) || 0), 0);
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  if (loading) return <Loader />;

  return (
    <div className="page-container" id="billing-page">
      <div className="page-header">
        <div>
          <h1>{user?.role === 'admin' ? 'Maintenance Billing' : 'My Bills'}</h1>
          <p className="page-subtitle">
            {user?.role === 'admin' ? 'Generate and manage maintenance bills' : 'View and pay your maintenance bills'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary" onClick={() => setShowGenerateModal(true)} id="generate-bills-btn">
            <FiPlus /> Generate Bills
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="form-select filter-select">
          <option value="">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Bills Table */}
      {bills.length > 0 ? (
        <div className="table-container">
          <table className="data-table" id="bills-table">
            <thead>
              <tr>
                {user?.role === 'admin' && <th>Resident</th>}
                <th>Flat</th>
                <th>Period</th>
                <th>Amount</th>
                <th>Penalty</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill._id}>
                  {user?.role === 'admin' && <td>{bill.resident?.name || 'N/A'}</td>}
                  <td>{bill.wing}-{bill.flatNumber}</td>
                  <td>{monthNames[bill.month - 1]} {bill.year}</td>
                  <td className="amount-cell">₹{bill.amount.toLocaleString()}</td>
                  <td className={bill.penalty > 0 ? 'penalty-cell' : ''}>
                    {bill.penalty > 0 ? `₹${bill.penalty}` : '—'}
                  </td>
                  <td>{new Date(bill.dueDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-tag status-${bill.status}`}>{bill.status}</span>
                  </td>
                  <td>
                    {bill.status !== 'paid' && (
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handlePayment(bill._id)}
                      >
                        <FiCreditCard /> Pay
                      </button>
                    )}
                    {bill.status === 'paid' && (
                      <span className="paid-label">✓ Paid</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state-box">
          <h3>No Bills Found</h3>
          <p>No bills match the selected filter.</p>
        </div>
      )}

      {/* Generate Bills Modal */}
      {showGenerateModal && (
        <div className="modal-overlay" onClick={() => setShowGenerateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Generate Monthly Bills</h2>
              <button className="btn-icon" onClick={() => setShowGenerateModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleGenerate}>
              <div className="form-row">
                <div className="form-group">
                  <label>Month</label>
                  <select
                    className="form-select"
                    value={billForm.month}
                    onChange={(e) => setBillForm({...billForm, month: Number(e.target.value)})}
                  >
                    {monthNames.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Year</label>
                  <input
                    type="number"
                    className="form-input"
                    value={billForm.year}
                    onChange={(e) => setBillForm({...billForm, year: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={billForm.dueDate}
                  onChange={(e) => setBillForm({...billForm, dueDate: e.target.value})}
                  required
                />
              </div>

              <h4 className="breakdown-title">Bill Breakdown (₹)</h4>
              <div className="breakdown-grid">
                {Object.entries(billForm.breakdown).map(([key, val]) => (
                  <div className="form-group" key={key}>
                    <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <input
                      type="number"
                      className="form-input"
                      value={val}
                      onChange={(e) => setBillForm({
                        ...billForm,
                        breakdown: { ...billForm.breakdown, [key]: Number(e.target.value) }
                      })}
                    />
                  </div>
                ))}
              </div>

              <div className="total-display">
                <strong>Total: ₹{totalAmount(billForm.breakdown).toLocaleString()}</strong>
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                Generate Bills for All Residents
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillList;
