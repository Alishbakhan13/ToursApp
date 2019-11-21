import '@babel/polyfill';
import { login, logOut } from './login';
import { displayLocation } from './maps';
import { updateData } from './updateUser';
import { payment } from './stripe';
const loginControl = document.querySelector('.form-login');
const maps = document.getElementById('map');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateForm = document.querySelector('.form-user-data');
const updatePassword = document.querySelector('.form-user-settings');
const bookingbtn = document.getElementById('tourbooking');
// if loaded
if (maps) {
    const toursLocation = JSON.parse(maps.dataset.location);
    displayLocation(toursLocation);
}
if (loginControl) {
    loginControl.addEventListener('submit', event => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if (logOutBtn) {
    logOutBtn.addEventListener('click', logOut);
}

if (updateForm) {
    updateForm.addEventListener('submit', event => {
        event.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        updateData(form, 'User Data');
    });
}

if (updatePassword) {
    updatePassword.addEventListener('submit', async event => {
        event.preventDefault();
        document.querySelector('.save-password').innerHTML = 'Updating .....';
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        await updateData({ passwordCurrent, password, passwordConfirm }, 'password');
        document.querySelector('.save-password').innerHTML = 'Save password';
        document.getElementById('password-current').value = '';
        document.getElementById('password').value = '';
        document.getElementById('password-confirm').value = '';
    });
}

if (bookingbtn) {
    bookingbtn.addEventListener('click', e => {
        e.target.textContent = 'Processing....';
        payment(e.target.dataset.tourId);
    });
}
