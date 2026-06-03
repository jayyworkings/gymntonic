document.addEventListener('DOMContentLoaded', () => {
  // --- Login Form ---
  const loginForm = document.querySelector('form[action*="login.php"]');
  if (loginForm && !loginForm.action.includes('save_new_account')) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('login_email').value;
      const password = document.getElementById('login_pass').value;
      
      try {
        await api.auth.login(email, password);
        window.location.href = '/index.html';
      } catch (err) {
        alert(err.message || 'Login failed. Please check your credentials.');
      }
    };
  }

  // --- Registration Form ---
  // The BigCommerce form has action="...login.php?action=save_new_account"
  const registerForm = document.querySelector('form[action*="save_new_account"]');
  if (registerForm) {
    // Override the legacy BigCommerce form validation if it exists
    registerForm.removeAttribute('onsubmit');

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Extract values by element ID (BigCommerce form field IDs)
      const email = document.getElementById('FormField_1')?.value?.trim();
      const password = document.getElementById('FormField_2')?.value;
      const confirmPassword = document.getElementById('FormField_3')?.value;
      const firstName = document.getElementById('FormField_4')?.value?.trim();
      const lastName = document.getElementById('FormField_5')?.value?.trim();
      const phone = document.getElementById('FormField_7')?.value?.trim() || '';

      // Basic validation
      if (!email) {
        alert('Please enter your email address.');
        document.getElementById('FormField_1')?.focus();
        return;
      }
      if (!password || password.length < 7) {
        alert('Password must be at least 7 characters long.');
        document.getElementById('FormField_2')?.focus();
        return;
      }
      if (password !== confirmPassword) {
        alert('Passwords do not match.');
        document.getElementById('FormField_3')?.focus();
        return;
      }
      if (!firstName) {
        alert('Please enter your first name.');
        document.getElementById('FormField_4')?.focus();
        return;
      }
      if (!lastName) {
        alert('Please enter your last name.');
        document.getElementById('FormField_5')?.focus();
        return;
      }

      // Show loading
      const submitBtn = registerForm.querySelector('input[type="submit"], button[type="submit"], input[type="image"]');
      const originalValue = submitBtn?.value;
      if (submitBtn) {
        submitBtn.disabled = true;
        if (submitBtn.type !== 'image') submitBtn.value = 'Creating account...';
      }

      try {
        await api.auth.register({
          first_name: firstName,
          last_name: lastName,
          email: email,
          password: password,
          phone: phone
        });
        alert('Account created successfully! Welcome to GymNTonic!');
        window.location.href = '/index.html';
      } catch (err) {
        alert(err.message || 'Registration failed. Please try again.');
        if (submitBtn) {
          submitBtn.disabled = false;
          if (submitBtn.type !== 'image') submitBtn.value = originalValue;
        }
      }
    });
  }
});
