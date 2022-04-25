//Handler Functions
const hideAlert = () => {
    const el = document.querySelector(".alert");
    if (el) {
        el.parentElement.removeChild(el);
    }
};

const showAlert = (type, msg) => {
    hideAlert();
    const markup = `<div class='alert alert--${type}'>${msg}</div>`;
    document.querySelector("body").insertAdjacentHTML('afterbegin', markup)
    window.setTimeout(hideAlert, 1500);
}

const login = async (email, password) => {
    try {
        const result = await axios.post('/api/v1/auth/login', {
            email,
            password
        });

        if (result.data.status === "success") {
            showAlert("success", "Logged in successfully")
            setTimeout(() => {
                location.assign("/");
            }, 1500);
        }

    } catch (error) {
        showAlert("error", error.response.data.message);
    }
}

const updateUserDetail = async (name, email) => {
    try {
        const result = await axios.patch('/api/v1/auth/changeUserDetail', {
            email,
            name
        });

        if (result.data.status === "success") {
            showAlert("success", "Account detail update successfully");
        }

    } catch (error) {
        showAlert("error", error.response.data.message);
    }
}


const changePassword = async (oldpassword, newpassword) => {
    try {
        const result = await axios.patch('/api/v1/auth/changepassword', {
            oldpassword, newpassword
        });

        if (result.data.status === "success") {
            showAlert("success", "Password update successfully");
        }

    } catch (error) {
        showAlert("error", error.response.data.message);
    }
}


//Variables
const loginForm = document.querySelector(".form-login")
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

const btnLogout = document.querySelector(".nav__el--logout");
const btnChangePassword = document.querySelector(".btn-change-password");

//Login & Logout
if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const email = document.querySelector("#email").value;
        const password = document.querySelector("#password").value;
        login(email, password);
    })
}

btnLogout.addEventListener("click", async function (e) {
    try {
        e.preventDefault();

        const result = await axios.get('/logout');
        if (result.data.status === "success") {
            location.assign("/login");
        }

    } catch (error) {
        showAlert("error", error.response.data.message);
    }
})

//User Account
if (userDataForm) {
    userDataForm.addEventListener("submit", async function (e) {
        try {
            e.preventDefault();
            const name = document.querySelector("#name").value;
            const email = document.querySelector("#email").value;
            updateUserDetail(name, email);

        } catch (error) {
            showAlert("error", error.response.data.message);
        }
    })
}

//Change Password

if (userPasswordForm) {
    userPasswordForm.addEventListener("submit", async function (e) {
        try {
            e.preventDefault();
            const currentPassword = document.querySelector("#password-current").value;
            const newPassword = document.querySelector("#password").value;
            const confirmPassword = document.querySelector("#password-confirm").value;
            btnChangePassword.innerHTML = "Loading..."

            await changePassword(currentPassword, newPassword);
            btnChangePassword.innerHTML = "Save"

        } catch (error) {
            showAlert("error", error.response.data.message);
        }
    })
}