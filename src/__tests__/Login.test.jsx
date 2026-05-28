import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Login } from '../components/Login.jsx';

// Apply theme vars so CSS variable references don't cause issues
beforeEach(() => {
  document.body.style.setProperty('--bg', '#0d1117');
  document.body.style.setProperty('--panel', '#161b22');
  document.body.style.setProperty('--text', '#e6edf3');
  document.body.style.setProperty('--muted', '#8b949e');
  document.body.style.setProperty('--accent', '#f59e0b');
  document.body.style.setProperty('--crit', '#ef4444');
  document.body.style.setProperty('--card', '#1c2230');
  document.body.style.setProperty('--border', '#2a3242');
});

describe('Login component', () => {
  it('renders email and password inputs', () => {
    render(<Login onLogin={() => {}} />);
    expect(screen.getByLabelText('Email')).toBeTruthy();
    expect(screen.getByLabelText('Password')).toBeTruthy();
    expect(screen.getByText(/sign in/i)).toBeTruthy();
  });

  it('calls onLogin with the email when credentials are valid', () => {
    const onLogin = vi.fn();
    render(<Login onLogin={onLogin} />);

    // Default pre-filled values: manager@ecomeal.app / demo1234
    fireEvent.click(screen.getByText(/sign in/i));
    expect(onLogin).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'manager@ecomeal.app' })
    );
  });

  it('shows an error when email is invalid', () => {
    const onLogin = vi.fn();
    render(<Login onLogin={onLogin} />);

    // Clear email and type invalid one
    const emailInput = screen.getAllByRole('textbox')[0];
    fireEvent.change(emailInput, { target: { value: 'notanemail' } });
    fireEvent.click(screen.getByText(/sign in/i));

    expect(onLogin).not.toHaveBeenCalled();
    expect(screen.getByText(/valid email/i)).toBeTruthy();
  });

  it('shows an error when password is too short', () => {
    const onLogin = vi.fn();
    render(<Login onLogin={onLogin} />);

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'test@example.com' } });
    // password input is type="password" so not in getAllByRole('textbox')
    const pwInput = document.querySelector('input[type="password"]');
    fireEvent.change(pwInput, { target: { value: '123' } });

    fireEvent.click(screen.getByText(/sign in/i));
    expect(onLogin).not.toHaveBeenCalled();
    expect(screen.getByText(/valid email and password/i)).toBeTruthy();
  });

  it('submits on Enter key in password field', () => {
    const onLogin = vi.fn();
    render(<Login onLogin={onLogin} />);

    const pwInput = document.querySelector('input[type="password"]');
    fireEvent.keyDown(pwInput, { key: 'Enter' });
    expect(onLogin).toHaveBeenCalled();
  });

  it('persists session to localStorage when remember is checked', () => {
    const onLogin = vi.fn();
    render(<Login onLogin={onLogin} />);

    // "remember me" checkbox is checked by default
    fireEvent.click(screen.getByText(/sign in/i));
    const stored = localStorage.getItem('ecomeal_user');
    expect(stored).not.toBeNull();
    expect(JSON.parse(stored).email).toBe('manager@ecomeal.app');
  });
});
