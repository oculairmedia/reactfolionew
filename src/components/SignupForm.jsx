import React, { useState } from 'react';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Subscribing...');

    try {
      const ghostUrl = import.meta.env.REACT_APP_GHOST_URL || 'https://blog.emmanuelu.com';
      const response = await fetch(`${ghostUrl}/members/api/send-magic-link/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          emailType: 'subscribe',
        }),
      });

      if (response.ok) {
        setStatus('Thank you for subscribing! Please check your email to confirm.');
        setEmail('');
      } else {
        const errorData = await response.json();
        setStatus(`Error: ${errorData.errors[0].message}`);
      }
    } catch (error) {
      setStatus('An error occurred. Please try again later.');
    }
  };

  return (
    <div style={{
      backgroundColor: '#08090c',
      color: '#FFFFFF',
      padding: '20px',
      marginTop: '2rem',
      marginBottom: '2rem'
    }}>
      <h2 style={{ marginBottom: '10px' }}>Emmanuel</h2>
      <p style={{ marginBottom: '20px' }}>Thoughts, insights and ideas.</p>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          required
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '4px',
            border: 'none'
          }}
        />
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#FF1A75',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Subscribe
        </button>
      </form>
      {status && <p style={{ marginTop: '10px' }}>{status}</p>}
    </div>
  );
};

export default SignupForm;
