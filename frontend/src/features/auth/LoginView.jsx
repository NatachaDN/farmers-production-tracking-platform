import React, { useState } from 'react';
import { AcreaLogo, IconArrowRight, IconCheckCircle, IconCrop, IconEye, IconEyeOff, IconLivestock, IconLock, IconUser } from '../../shared/components/Icons';
import { GoogleSignInSection } from './GoogleSignInSection';
import { authService } from './services/authService';
import fieldPhoto from './assets/acrea-login-field.jpg';
import './LoginView.css';

export function LoginView({ onNavigate, onLoginSuccess, initialError = '', initialIdentifier = '', initialSuccess = '' }) {
  const [emailOrPhone, setEmailOrPhone] = useState(initialIdentifier);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [success, setSuccess] = useState(initialSuccess);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const response = await authService.login(emailOrPhone, password);
      if (onLoginSuccess) onLoginSuccess(response.farmer);
      else onNavigate?.('dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="acrea-login">
      <aside className="acrea-login__hero" aria-label="About Acrea">
        <img className="acrea-login__photo" src={fieldPhoto} alt="" fetchPriority="high" />
        <div className="acrea-login__hero-inner">
          <AcreaLogo size={40} textColor="#FFFFFF" showTagline={false} />
          <div className="acrea-login__story">
            <h2>From data to a<br />thriving farm.</h2>
            <p>Keep track of what you grow, what you raise, and the work behind every harvest.</p>
            <ul className="acrea-login__features">
              <li><IconCrop size={17} /> Crop cycles</li>
              <li><IconLivestock size={17} /> Animal groups</li>
            </ul>
          </div>
        </div>
      </aside>

      <div className="acrea-login__workspace">
        <div className="acrea-login__masthead">
          <div className="acrea-login__mobile-logo"><AcreaLogo size={33} textColor="#164230" showTagline={false} /></div>
          <span className="acrea-login__access"><IconLock size={15} /> Secure farmer access</span>
        </div>

        <section className="acrea-login__panel" aria-labelledby="login-title">
          <header>
            <h1 id="login-title">Welcome back</h1>
            <p>Sign in to continue tracking your farm’s work and production.</p>
          </header>

          {success && <div className="acrea-login__notice" role="status"><IconCheckCircle size={18} />{success}</div>}
          {error && <div className="acrea-login__notice acrea-login__notice--error" role="alert">{error}</div>}

          <form onSubmit={handleSubmit} className="acrea-login__form">
            <div className="acrea-login__field">
              <label htmlFor="login-identifier">Email or phone number</label>
              <div className="acrea-login__input">
                <IconUser size={18} />
                <input id="login-identifier" type="text" placeholder="name@example.com or phone"
                  value={emailOrPhone} onChange={(event) => setEmailOrPhone(event.target.value)}
                  autoComplete="username" autoCapitalize="none" spellCheck={false} required />
              </div>
            </div>
            <div className="acrea-login__field">
              <div className="acrea-login__label-row">
                <label htmlFor="login-password">Password</label>
                <button id="forgot-password-link" type="button" className="acrea-login__link"
                  onClick={() => onNavigate?.('forgot-password')}>Forgot password?</button>
              </div>
              <div className="acrea-login__input">
                <IconLock size={18} />
                <input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password"
                  value={password} onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password" required />
                <button type="button" className="acrea-login__reveal" onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <IconEyeOff size={19} /> : <IconEye size={19} />}
                </button>
              </div>
            </div>
            <button id="login-submit-button" className="acrea-login__submit" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <IconArrowRight size={18} />}
            </button>
          </form>

          <GoogleSignInSection onError={setError} />

          <p className="acrea-login__register">
            New to Acrea?{' '}
            <button id="goto-register-button" className="acrea-login__link" type="button"
              onClick={() => onNavigate?.('register')}>Create an account</button>
          </p>
        </section>

        <footer className="acrea-login__footer">Acrea Agricultural Platform</footer>
      </div>
    </main>
  );
}
