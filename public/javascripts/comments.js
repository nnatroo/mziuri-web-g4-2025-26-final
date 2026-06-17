const replyToggleButtons = document.querySelectorAll('.comment-reply-toggle');

replyToggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const targetId = button.dataset.target;
        const form = document.getElementById(targetId);

        if (!form) return;

        const isOpen = form.classList.toggle('opened');
        button.textContent = isOpen ? 'Cancel' : 'Reply';

        if (isOpen) {
            const textarea = form.querySelector('textarea');
            if (textarea) textarea.focus();
        }
    });
});

const editToggleButtons = document.querySelectorAll('.comment-edit-toggle');

editToggleButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const form = document.getElementById(button.dataset.editTarget);

        if (!form) return;

        const isOpen = form.classList.toggle('opened');
        button.textContent = isOpen ? 'Cancel' : 'Edit';

        const wrapper = form.closest('.comment-text');
        const content = wrapper && wrapper.querySelector('.comment-content');
        if (content) content.style.display = isOpen ? 'none' : '';

        if (isOpen) {
            const textarea = form.querySelector('textarea');
            if (textarea) {
                textarea.focus();
                const value = textarea.value;
                textarea.value = '';
                textarea.value = value;
            }
        }
    });
});

const deleteForms = document.querySelectorAll('.comment-delete-form');

deleteForms.forEach((form) => {
    form.addEventListener('submit', (event) => {
        if (!window.confirm('Are you sure you want to delete this?')) {
            event.preventDefault();
        }
    });
});
