import axios from 'axios';
import { showAlert } from './alert';
export const updateData = async (data, type) => {
    const URL =
        type === 'password' ? '/api/v1/users/updatecurrentpassword' : '/api/v1/users/updateuser';
    try {
        const res = await axios({
            method: 'PATCH',
            url: URL,
            data
        });

        if (res.data.status === 'success') {
            showAlert('success', `${type} Updated Successfully`);
        }
    } catch (err) {
        showAlert('error', err.response.data.message);
    }
};
