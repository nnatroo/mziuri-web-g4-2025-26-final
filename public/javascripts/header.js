const burgerMenuButtonOpen = document.querySelector('.burger-menu-icon');
const burgerMenu = document.querySelector('.burger-menu');
const burgerMenuButtonClose = document.querySelector('.close-btn-wrapper');

burgerMenuButtonOpen.addEventListener('click', () => {
    burgerMenu.classList.add('opened');
})

burgerMenuButtonClose.addEventListener('click', () => {
    burgerMenu.classList.remove('opened');
})
