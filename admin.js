const OWNER_USER_ID = "1ec07a6f-27a3-4408-9ace-fa28ec4e749e";

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    loginMessage.textContent = "Logging in...";

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {
        loginMessage.textContent = error.message;
        return;
    }

    if (data.user.id !== OWNER_USER_ID) {
        await supabaseClient.auth.signOut();
        loginMessage.textContent = "You are not authorized as the owner.";
        return;
    }

    loginMessage.textContent = "Login successful! Redirecting...";

window.location.href = "dashboard.html";
});
const forgotPasswordLink = document.getElementById("forgotPasswordLink");

forgotPasswordLink.addEventListener("click", async function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;

    if (!email) {
        loginMessage.textContent = "Please enter your registered email first.";
        return;
    }

    loginMessage.textContent = "Sending password reset email...";

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/admin.html"
    });

    if (error) {
        loginMessage.textContent = error.message;
    } else {
        loginMessage.textContent = "Password reset email sent. Check your inbox.";
    }
});
const togglePassword = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

togglePassword.addEventListener("click", function() {

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
    } else {
        passwordInput.type = "password";
        togglePassword.innerHTML = '<i class="fa-regular fa-eye"></i>';
    }

});
// PASSWORD RESET FUNCTIONALITY

const resetSection = document.getElementById("resetPasswordSection");
const updatePasswordButton = document.getElementById("updatePasswordButton");

supabaseClient.auth.onAuthStateChange((event, session) => {

    console.log("Auth event:", event);

    if (event === "PASSWORD_RECOVERY" && session) {
        loginForm.style.display = "none";
        resetSection.style.display = "block";
    }

});


updatePasswordButton.addEventListener("click", async function() {

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const resetMessage = document.getElementById("resetMessage");

    if (newPassword.length < 6) {
        resetMessage.textContent = "Password must contain at least 6 characters.";
        return;
    }

    if (newPassword !== confirmPassword) {
        resetMessage.textContent = "Passwords do not match.";
        return;
    }

    resetMessage.textContent = "Updating password...";

    const { error } = await supabaseClient.auth.updateUser({
        password: newPassword
    });

    if (error) {
        resetMessage.textContent = error.message;
        return;
    }

    resetMessage.textContent = "Password updated successfully! You can now log in.";

    await supabaseClient.auth.signOut();

    resetSection.style.display = "none";
    document.getElementById("loginForm").style.display = "block";
});