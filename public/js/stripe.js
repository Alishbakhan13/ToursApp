/*eslint-disable*/
import axios from 'axios';
import { showAlert } from './alert';
const stripe = Stripe('pk_test_nUmMF6MiiXahZkLI5lScMLr500OLWNlBuS');

export const payment = async tourId => {
    try {
        const response = await axios(`/api/v1/booking/checkout_session/${tourId}`);
        // now redirect user
        await stripe.redirectToCheckout({ sessionId: response.data.message.session.id });
    } catch (err) {
        showAlert('error', err);
    }
};
