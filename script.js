const loginForm =
    document.getElementById("loginForm");

const signupForm =
    document.getElementById("signupForm");

const formTitle =
    document.getElementById("formTitle");

const formSubtitle =
    document.getElementById("formSubtitle");

const switchText =
    document.getElementById("switchText");

const switchButton =
    document.getElementById("switchButton");


// =========================================================
// SWITCH LOGIN / SIGNUP
// =========================================================

if (switchButton) {

    switchButton.addEventListener("click", () => {

        if (
            loginForm.classList.contains("hidden")
        ) {

            loginForm.classList.remove("hidden");

            signupForm.classList.add("hidden");

            formTitle.textContent =
                "Welcome Back";

            formSubtitle.textContent =
                "Login to continue your cinematic journey.";

            switchText.textContent =
                "Don't have an account?";

            switchButton.textContent =
                "Sign Up";

        } else {

            loginForm.classList.add("hidden");

            signupForm.classList.remove("hidden");

            formTitle.textContent =
                "Create Account";

            formSubtitle.textContent =
                "Create your CineMoods account.";

            switchText.textContent =
                "Already have an account?";

            switchButton.textContent =
                "Login";
        }

    });

}


// =========================================================
// LOGIN
// =========================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "loginPassword"
                ).value;


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/login",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                email,
                                password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (
                    data.message ===
                    "Login successful!"
                ) {

                    localStorage.setItem(
                        "cinemoodsUser",
                        JSON.stringify(data.user)
                    );

                    window.location.href =
                        "preferences.html";

                } else {

                    alert(data.message);

                }

            } catch (error) {

                console.error(error);

                alert(
                    "Unable to connect to the CineMoods server."
                );

            }

        }
    );

}


// =========================================================
// SIGNUP
// =========================================================

if (signupForm) {

    signupForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const name =
                document.getElementById(
                    "signupName"
                ).value.trim();

            const email =
                document.getElementById(
                    "signupEmail"
                ).value.trim();

            const password =
                document.getElementById(
                    "signupPassword"
                ).value;


            try {

                const response =
                    await fetch(
                        "http://localhost:5000/signup",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                name,
                                email,
                                password
                            })
                        }
                    );


                const data =
                    await response.json();


                if (data.success) {

                    alert(
                        "Account created successfully! Please login."
                    );


                    signupForm.reset();


                    loginForm.classList.remove(
                        "hidden"
                    );

                    signupForm.classList.add(
                        "hidden"
                    );


                    formTitle.textContent =
                        "Welcome Back";

                    formSubtitle.textContent =
                        "Login to continue your cinematic journey.";

                    switchText.textContent =
                        "Don't have an account?";

                    switchButton.textContent =
                        "Sign Up";

                } else {

                    alert(data.message);

                }

            } catch (error) {

                console.error(error);

                alert(
                    "Unable to connect to the CineMoods server."
                );

            }

        }
    );

}