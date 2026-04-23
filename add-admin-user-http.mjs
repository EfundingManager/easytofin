async function addAdminUser() {
  try {
    console.log('Requesting OTP for admin user...');
    
    const response = await fetch('http://localhost:3000/api/trpc/emailAuth.requestOtp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        input: {
          email: 'info@easytofin.ie',
          rememberMe: false,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.result?.data?.devCode) {
      console.log('\n✓ OTP sent successfully');
      console.log('OTP Code (dev):', data.result.data.devCode);
      console.log('\nNext steps:');
      console.log('1. Go to https://easytofin.com/email-auth');
      console.log('2. Enter email: info@easytofin.ie');
      console.log('3. Enter OTP code:', data.result.data.devCode);
      console.log('4. Complete registration and you will be redirected to profile page');
      console.log('5. After registration, the user will need to be promoted to admin role');
    } else {
      console.log('Response:', data);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addAdminUser();
