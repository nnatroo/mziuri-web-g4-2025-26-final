const togglePasswordButtons = document.querySelectorAll('.toggle-password-icon');

togglePasswordButtons.forEach(button => {
    button.addEventListener('click', () => {
        const passwordInput = button.previousElementSibling;
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';

        if (type === 'text') {
            button.src = '/images/hide-password-icon.svg';
        } else {
            button.src = '/images/show-password-icon.svg';
        }

        passwordInput.setAttribute('type', type);
    })
});
