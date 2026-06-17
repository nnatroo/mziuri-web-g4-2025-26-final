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
