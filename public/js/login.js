/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';
export const login = async (email, password) => {
    console.log(email);
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
            console.log('ghgfh');
            window.setInterval(() => {
                location.assign('/');
            }, 1500);
        }
        console.log(res.jwt);
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
            console.log('here');
            //  location.reload(true); // fresh  request  to server
            location.assign('/');
        }
    } catch (err) {
        console.log(err.response);
        showAlert('error', 'logging out failed');
    }
};
