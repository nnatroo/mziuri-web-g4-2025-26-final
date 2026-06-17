const blogDeleteForms = document.querySelectorAll('.blog-delete-form');

blogDeleteForms.forEach((form) => {
    form.addEventListener('submit', (event) => {
        if (!window.confirm('Are you sure you want to delete this blog? This cannot be undone.')) {
            event.preventDefault();
        }
    });
});
