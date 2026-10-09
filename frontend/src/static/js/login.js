const form = document.querySelector("#FormLogin");
const loginError = document.querySelector("#login-error");

function showLoginError(message) {
    loginError.textContent = message;
    loginError.hidden = false;
}

function clearLoginError() {
    loginError.textContent = "";
    loginError.hidden = true;
}

form.elements["email"].addEventListener("input", clearLoginError);
form.elements["password"].addEventListener("input", clearLoginError);

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearLoginError();

    const email = form.elements["email"].value.trim();
    // Não aplicar trim à senha para preservar exatamente o que foi digitado.
    const password = form.elements["password"].value;

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data.message === "success") {
            form.reset();
            window.location.href = "/dashboard";
            return;
        }

        showLoginError("E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.");
    } catch {
        showLoginError("Não foi possível conectar ao servidor. Tente novamente.");
    }
});
