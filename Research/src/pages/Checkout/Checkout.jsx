import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { FaGoogle, FaApple } from 'react-icons/fa';
import { MdOutlinePassword } from 'react-icons/md';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { addUser } from '../../redux/userSlice';
import { BACKEND_URL } from '../../utils/constants';

const STEPS = ['Login', 'Address', 'Payment', 'Order Complete'];

const inp = {
  width: '100%', border: '1px solid #ddd', padding: '11px 14px',
  fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box', borderRadius: '4px',
};
const lbl = {
  display: 'block', fontSize: '0.8rem', fontWeight: 700,
  color: '#DD1215', marginBottom: '6px',
};

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState(0);
  const [showPass, setShowPass] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '', username: '', dob: '' });
  const [address, setAddress] = useState({ fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' });
  const [payment, setPayment] = useState({ cardNumber: '', expiry: '', cvv: '', cardName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const setAddr = (k) => (e) => setAddress(a => ({ ...a, [k]: e.target.value }));
  const setPay = (k) => (e) => setPayment(p => ({ ...p, [k]: e.target.value }));

  // Step 0 — Login/Signup
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const res = await axios.post(`${BACKEND_URL}/api/login`, { email: form.email, password: form.password }, { withCredentials: true });
        const token = res.data?.token?.token || res.data?.token;
        const user = res.data?.token?.user || res.data?.user || res.data?.data;
        if (user) { dispatch(addUser(user)); localStorage.setItem('user', JSON.stringify(user)); }
        if (token) localStorage.setItem('token', typeof token === 'string' ? token : JSON.stringify(token));
        setStep(1);
      } else {
        await axios.post(`${BACKEND_URL}/api/signup`, {
          name: form.name, email: form.email, password: form.password,
          username: form.username, dob: form.dob,
        }, { withCredentials: true });
        setIsLogin(true);
        setError('Account created! Please log in.');
        setForm({ name: '', email: '', password: '', username: '', dob: '' });
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1 — Address
  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

    // Step 2 — Payment
    const handlePaymentSubmit = (e) => {
      e.preventDefault();
      setLoading(true);
      setTimeout(() => {
        // Mark user as subscribed in localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.researchSubscribed = true;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('researchSubscribed', 'true');
        setLoading(false);
        setStep(3);
      }, 1500);
    };

  const stepContent = () => {
    // Step 0 — Login
    if (step === 0) return (
      <>
        <h2 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.5rem)', fontWeight: 700, color: '#111', marginBottom: '1.5rem' }}>
          {isLogin ? 'Log-in or Register' : 'Create Account'}
        </h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div style={{ marginBottom: '1rem' }}>
                <label style={lbl}>Full Name</label>
                <input style={inp} type="text" placeholder="Your full name" value={form.name} required onChange={set('name')} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={lbl}>Username (6-30 chars)</label>
                <input style={inp} type="text" placeholder="e.g. john_doe123" value={form.username} required minLength={6} maxLength={30} onChange={set('username')} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={lbl}>Date of Birth</label>
                <input style={inp} type="date" value={form.dob} required onChange={set('dob')} />
              </div>
            </>
          )}
          <div style={{ marginBottom: '1rem' }}>
            <label style={lbl}>Email</label>
            <input style={inp} type="email" placeholder="Please type your email here" value={form.email} required onChange={set('email')} />
          </div>
          <div style={{ marginBottom: '0.8rem', position: 'relative' }}>
            <label style={lbl}>Password</label>
            <div style={{ position: 'relative' }}>
              <input style={{ ...inp, paddingRight: '40px' }} type={showPass ? 'text' : 'password'}
                placeholder="Enter your password" value={form.password} required onChange={set('password')} />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                {showPass ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>
          </div>
          {isLogin && (
            <div style={{ marginBottom: '1.5rem' }}>
              <button type="button" style={{ background: 'none', border: 'none', color: '#DD1215', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>
                Forgot password?
              </button>
            </div>
          )}
          {error && <p style={{ color: error.includes('created') ? 'green' : '#DD1215', fontSize: '0.82rem', marginBottom: '1rem' }}>{error}</p>}
          <button type="submit" disabled={loading} style={{
            width: '100%', background: '#DD1215', color: '#fff', border: 'none',
            padding: '0.85rem', fontSize: '0.82rem', fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            cursor: loading ? 'not-allowed' : 'pointer', borderRadius: '4px', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'PLEASE WAIT...' : isLogin ? 'CONTINUE TO CHECK-OUT ›' : 'CREATE ACCOUNT ›'}
          </button>
          <p style={{ textAlign: 'center', fontSize: '0.8rem', marginTop: '1rem', color: '#555' }}>
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }}
              style={{ background: 'none', border: 'none', color: '#DD1215', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </p>
        </form>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
          <span style={{ fontSize: '0.75rem', color: '#999' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#e0e0e0' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          {[<FaGoogle size={20} />, <MdOutlinePassword size={20} />, <FaApple size={20} />].map((icon, i) => (
            <button key={i} style={{ width: '52px', height: '52px', border: '1px solid #ddd', background: '#fff', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444' }}>
              {icon}
            </button>
          ))}
        </div>
      </>
    );

    // Step 1 — Address
    if (step === 1) return (
      <>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111', marginBottom: '1.5rem' }}>Delivery Address</h2>
        <form onSubmit={handleAddressSubmit}>
          {[
            { key: 'fullName', label: 'Full Name', placeholder: 'John Doe', type: 'text' },
            { key: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210', type: 'tel' },
            { key: 'line1', label: 'Address Line 1', placeholder: 'House/Flat No., Street', type: 'text' },
            { key: 'line2', label: 'Address Line 2 (Optional)', placeholder: 'Locality, Area', type: 'text', required: false },
            { key: 'city', label: 'City', placeholder: 'Mumbai', type: 'text' },
            { key: 'state', label: 'State', placeholder: 'Maharashtra', type: 'text' },
            { key: 'pincode', label: 'PIN Code', placeholder: '400001', type: 'text' },
          ].map(({ key, label, placeholder, type, required = true }) => (
            <div key={key} style={{ marginBottom: '1rem' }}>
              <label style={lbl}>{label}</label>
              <input style={inp} type={type} placeholder={placeholder} value={address[key]} required={required} onChange={setAddr(key)} />
            </div>
          ))}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={lbl}>Country</label>
            <select style={inp} value={address.country} onChange={setAddr('country')}>
              <option>India</option>
              <option>United States</option>
              <option>United Kingdom</option>
              <option>Canada</option>
              <option>Australia</option>
            </select>
          </div>
          <button type="submit" style={{
            width: '100%', background: '#DD1215', color: '#fff', border: 'none',
            padding: '0.85rem', fontSize: '0.82rem', fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '4px',
          }}>
            CONTINUE TO PAYMENT ›
          </button>
        </form>
      </>
    );

    // Step 2 — Payment
    if (step === 2) return (
      <>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111', marginBottom: '0.5rem' }}>Payment Details</h2>
        <div style={{ background: '#f9f9f9', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '0.8rem 1rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#555' }}>
          🔒 Your payment is secured with 256-bit SSL encryption
        </div>
        <form onSubmit={handlePaymentSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={lbl}>Card Number</label>
            <input style={inp} type="text" placeholder="1234 5678 9012 3456" maxLength={19}
              value={payment.cardNumber}
              onChange={(e) => setPay('cardNumber')({ target: { value: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() } })}
              required />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={lbl}>Name on Card</label>
            <input style={inp} type="text" placeholder="John Doe" value={payment.cardName} required onChange={setPay('cardName')} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1 }}>
              <label style={lbl}>Expiry Date</label>
              <input style={inp} type="text" placeholder="MM / YY" maxLength={7} value={payment.expiry} required onChange={setPay('expiry')} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={lbl}>CVV</label>
              <input style={inp} type="password" placeholder="•••" maxLength={4} value={payment.cvv} required onChange={setPay('cvv')} />
            </div>
          </div>
          <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: '4px', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#555' }}>
            <strong>Order Summary</strong><br />
            Research Membership — ₹49 / month
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', background: '#DD1215', color: '#fff', border: 'none',
            padding: '0.85rem', fontSize: '0.82rem', fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer', borderRadius: '4px', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? 'PROCESSING...' : 'PAY ₹49 ›'}
          </button>
          <button type="button" onClick={() => setStep(1)} style={{
            width: '100%', background: 'transparent', color: '#555', border: '1px solid #ddd',
            padding: '0.7rem', fontSize: '0.78rem', fontWeight: 600, marginTop: '0.75rem',
            cursor: 'pointer', borderRadius: '4px',
          }}>
            ← Back to Address
          </button>
        </form>
      </>
    );

    // Step 3 — Order Complete
    if (step === 3) return (
      <div style={{ textAlign: 'center', padding: '2rem 0' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111', marginBottom: '0.5rem' }}>Order Confirmed!</h2>
        <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Thank you for subscribing to Research Membership.<br />
          You now have unlimited access to all research papers.
        </p>
        <button onClick={() => navigate('/')} style={{
          background: '#DD1215', color: '#fff', border: 'none',
          padding: '0.85rem 2rem', fontSize: '0.85rem', fontWeight: 700,
          letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', borderRadius: '4px',
        }}>
          START READING ›
        </button>
      </div>
    );
  };

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: 'clamp(1.5rem, 4vw, 3rem) 0' }}>
      <div style={{
        maxWidth: '1100px', margin: '0 auto', padding: '0 clamp(1rem, 4vw, 3rem)',
        display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start',
      }}>

        {/* Cart */}
        <div style={{ flex: '1 1 260px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111', marginBottom: '1.5rem' }}>Your Cart</h2>
          <div style={{ background: '#e0e0e0', width: '100px', height: '130px', borderRadius: '4px' }} />
        </div>

        {/* Form */}
        <div style={{ flex: '2 1 300px', background: '#fff', padding: 'clamp(1.2rem, 3vw, 2rem) clamp(1rem, 3vw, 2.5rem)', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>

          {/* Step indicator */}
          <div style={{ display: 'flex', marginBottom: '2rem' }}>
            {STEPS.map((label, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: i <= step ? '#DD1215' : '#e0e0e0',
                  color: i <= step ? '#fff' : '#999',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px',
                }}>{i + 1}</div>
                <span style={{ fontSize: 'clamp(0.58rem, 1.5vw, 0.68rem)', color: i === step ? '#DD1215' : '#999', fontWeight: i === step ? 700 : 400, textAlign: 'center' }}>{label}</span>
              </div>
            ))}
          </div>

          {stepContent()}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
