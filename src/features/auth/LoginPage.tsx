import { useAuth } from './useAuth'
import './LoginPage.css'

export default function LoginPage() {
  const { signIn, error } = useAuth()

  return (
    <div className="login">
      <div className="login-inner">
        <h1 className="login-mark">Brewboard</h1>
        <p className="login-tag">Where ideas are brewed.</p>

        <button type="button" className="btn btn-primary login-btn" onClick={signIn}>
          Continue with Google
        </button>

        {error && (
          <p className="login-error" role="alert">
            {error}
          </p>
        )}

        <p className="login-note">Your content stays private to your account.</p>
      </div>
    </div>
  )
}
