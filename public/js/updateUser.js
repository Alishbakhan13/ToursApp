import axios from 'axios';
import { showAlert } from './alert';
export const updateData = async (data, type) => {
    console.log('hh');
    const URL =
        type === 'password' ? '/api/v1/users/updatecurrentpassword' : '/api/v1/users/updateuser';
    console.log(URL);
    console.log(email);
    try {
        const res = await axios({
            method: 'PATCH',
            url: URL,
            data
        });
        console.log(res.data);
        if (res.data.status === 'success') {
            console.log('success');
            showAlert('success', `${type} Updated Successfully`);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
