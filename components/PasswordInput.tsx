'use client';
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export function PasswordInput(props: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        className={props.className}
        autoComplete={props.autoComplete}
        style={{ paddingInlineEnd: '2.6rem', width: '100%' }}
      />
      <button
        type="button"
        aria-label={show ? 'Hide password' : 'Show password'}
        className="auth-eye-toggle"
        onClick={() => setShow((s) => !s)}
        style={{
          position: 'absolute',
          insetInlineEnd: '0.7rem',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#8a8f9c',
          display: 'flex',
        }}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
