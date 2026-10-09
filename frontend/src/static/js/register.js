const form = document.querySelector("#FormRegister");
const passwordInput = form.elements["password"];
const passwordConfirmInput = form.elements["password_confirm"];
const passwordLengthRequirement = document.querySelector("#password-length");
const passwordSpecialRequirement = document.querySelector("#password-special");
const registerError = document.querySelector("#register-error");

// Exige pelo menos 9 caracteres e um caractere especial que não seja espaço.
const passwordRegex = /^(?=.*[^a-zA-Z0-9\s])[\s\S]{9,}$/;

function updateRequirement(element, isValid) {
    element.classList.toggle("requirement-valid", isValid);
    element.classList.toggle("requirement-invalid", !isValid);
}

function validatePassword() {
    const password = passwordInput.value;
    const hasMinimumLength = password.length >= 9;
    const hasSpecialCharacter = /[^a-zA-Z0-9\s]/.test(password);

    updateRequirement(passwordLengthRequirement, hasMinimumLength);
    updateRequirement(passwordSpecialRequirement, hasSpecialCharacter);

    return passwordRegex.test(password);
}

function showRegisterError(message) {
    registerError.textContent = message;
    registerError.hidden = false;
}

function clearRegisterError() {
    registerError.textContent = "";
    registerError.hidden = true;
}

passwordInput.addEventListener("input", () => {
    validatePassword();
    clearRegisterError();
});

passwordConfirmInput.addEventListener("input", clearRegisterError);

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearRegisterError();

    const name = form.elements["name"].value.trim();
    const email = form.elements["email"].value.trim();
    // Não aplicar trim à senha: espaços podem fazer parte da senha.
    const password = passwordInput.value;
    const passwordConfirm = passwordConfirmInput.value;

    if (!validatePassword()) {
        showRegisterError("A senha precisa ter pelo menos 9 caracteres e incluir um caractere especial.");
        passwordInput.focus();
        return;
    }

    if (password !== passwordConfirm) {
        showRegisterError("As senhas não coincidem.");
        passwordConfirmInput.focus();
        return;
    }

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (response.ok && data.message === "success") {
            form.reset();
            validatePassword();
            window.location.href = "/login";
            return;
        }

        showRegisterError(data.message === "email_exists"
            ? "Não foi possível criar a conta com esses dados."
            : "Não foi possível concluir o cadastro. Verifique os dados e tente novamente.");
    } catch {
        showRegisterError("Não foi possível conectar ao servidor. Tente novamente.");
    }
});

validatePassword();
