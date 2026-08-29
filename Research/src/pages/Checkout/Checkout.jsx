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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

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
        setStep(1); // Move to Address step instead of navigating away
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

  return (
    <div style={{ background: '#f3f4f6', minHeight: '100vh', padding: 'clamp(1.5rem, 4vw, 3rem) 0' }}>
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 clamp(1rem, 4vw, 3rem)',
        display: 'flex',
        flexWrap: 'wrap',       /* stacks on mobile */
        gap: '2rem',
        alignItems: 'flex-start',
      }}>

        {/* Cart — full width on mobile, 38% on desktop */}
        <div style={{ flex: '1 1 260px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#111', marginBottom: '1.5rem' }}>Your Cart</h2>
          <div style={{ background: '#e0e0e0', width: '100px', height: '130px', borderRadius: '4px' }} />
        </div>

        {/* Form — full width on mobile, grows on desktop */}
        <div style={{ flex: '2 1 300px', background: '#fff', padding: 'clamp(1.2rem, 3vw, 2rem) clamp(1rem, 3vw, 2.5rem)', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>

          {/* Steps */}
          <div style={{ display: 'flex', marginBottom: '2rem' }}>
            {STEPS.map((label, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: i === step ? '#DD1215' : '#e0e0e0',
                  color: i === step ? '#fff' : '#999',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, marginBottom: '4px',
                }}>{i + 1}</div>
                <span style={{ fontSize: 'clamp(0.58rem, 1.5vw, 0.68rem)', color: i === step ? '#DD1215' : '#999', fontWeight: i === step ? 700 : 400, textAlign: 'center' }}>{label}</span>
              </div>
            ))}
          </div>

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
                  <label style={lbl}>Username (6-30 chars: letters, numbers, _ or .)</label>
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

            {error && (
              <p style={{ color: error.includes('created') ? 'green' : '#DD1215', fontSize: '0.82rem', marginBottom: '1rem' }}>{error}</p>
            )}

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
        </div>

      </div>
    </div>
  );
};

export default Checkout;
