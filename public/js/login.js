/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';
export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            }
        });
        if (res.data.status === 'success') {
            showAlert('success', 'Logged In Successfully');

            window.setInterval(() => {
                location.assign('/');
            }, 1500);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};

export const logOut = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/logout'
        });
        if (res.data.status === 'success') {
            //  location.reload(true); // fresh  request  to server
            location.assign('/');
        }
    } catch (err) {
        console.log(err.response);
        showAlert('error', 'logging out failed');
    }
};
