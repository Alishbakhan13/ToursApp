const hideAlert = () => {
    const el = document.querySelector('.alert');
    if (el) el.parentElement.removeChild(el);
};

// type can be error or success
export const showAlert = (type, message) => {
    //  hideAlert();
    const markup = `<div class="alert alert--${type}"> ${message} </div>`;

    document.querySelector('body').insertAdjacentHTML('afterbegin', markup);
    window.setInterval(hideAlert, 5000);
};
