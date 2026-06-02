document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.querySelector('form[action*="login.php"]');
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('login_email').value;
      const password = document.getElementById('login_pass').value;
      
      try {
        await api.auth.login(email, password);
        window.location.href = '/account.html';
      } catch (err) {
        alert(err.message || 'Login failed. Please check your credentials.');
      }
    };
  }

  const registerForm = document.querySelector('form[action*="create_account.php"]') || document.getElementById('registerForm');
  if (registerForm) {
    registerForm.onsubmit = async (e) => {
      e.preventDefault();
      
      const formData = new FormData(registerForm);
      const data = Object.fromEntries(formData.entries());
      
      try {
        await api.auth.register({
          first_name: data.FormField_4, // Based on standard bigcommerce forms
          last_name: data.FormField_5,
          email: data.FormField_1,
          password: data.FormField_2,
          phone: data.FormField_7
        });
        window.location.href = '/account.html';
      } catch (err) {
        alert(err.message || 'Registration failed.');
      }
    };
  }
});
