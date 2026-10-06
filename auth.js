(() => {
  const PROJECT_URL = "https://drouoptqpggvaomqacho.supabase.co";
  const PUBLISHABLE_KEY = "sb_publishable_MCkhERDuogH8NoVK2OIL-Q_BzqK3I6l";

  const form = document.querySelector("#authEntry");
  const authForm = document.querySelector("#authForm");
  const modeButtons = [...document.querySelectorAll("[data-auth-mode]")];
  const nameField = document.querySelector("#displayNameField");
  const nameInput = document.querySelector("#displayName");
  const emailInput = document.querySelector("#authEmail");
  const passwordInput = document.querySelector("#authPassword");
  const submitButton = document.querySelector("#authSubmit");
  const status = document.querySelector("#authStatus");
  const accountState = document.querySelector("#accountState");
  const accountGreeting = document.querySelector("#accountGreeting");
  const signOutButton = document.querySelector("#signOut");

  if (!window.supabase || !window.supabase.createClient) {
    status.textContent = "Aanmelden is tijdelijk niet beschikbaar. Vernieuw de pagina.";
    return;
  }

  const client = window.supabase.createClient(PROJECT_URL, PUBLISHABLE_KEY);
  const redirectUrl = window.location.origin + window.location.pathname;
  let mode = "signin";
  let sessionVersion = 0;

  function setStatus(message, kind) {
    status.textContent = message;
    status.className = kind ? "auth-status auth-status--" + kind : "auth-status";
  }

  function setMode(nextMode) {
    mode = nextMode;
    const signingUp = mode === "signup";
    nameField.hidden = !signingUp;
    nameInput.required = signingUp;
    passwordInput.autocomplete = signingUp ? "new-password" : "current-password";
    submitButton.textContent = signingUp ? "Account maken" : "Inloggen";
    modeButtons.forEach((button) => {
      const selected = button.dataset.authMode === mode;
      button.setAttribute("aria-pressed", String(selected));
    });
    setStatus("", "");
  }

  async function saveProfile(user, version) {
    const displayName = (user.user_metadata && user.user_metadata.display_name) || "";
    const { data, error } = await client
      .from("profiles")
      .upsert(
        { id: user.id, display_name: displayName, updated_at: new Date().toISOString() },
        { onConflict: "id" }
      )
      .select("display_name")
      .single();

    if (version !== sessionVersion) return;
    const name = data && data.display_name ? data.display_name : displayName;
    accountGreeting.textContent = name
      ? "Welkom, " + name + " (" + user.email + ")"
      : "Ingelogd als " + user.email;
    if (error) {
      accountGreeting.textContent = "Ingelogd als " + user.email;
      setStatus("Je bent ingelogd. Je profiel kon nog niet worden geladen.", "error");
    }
  }

  function renderSession(session) {
    sessionVersion += 1;
    const version = sessionVersion;
    const user = session && session.user;
    form.hidden = Boolean(user);
    accountState.hidden = !user;
    if (!user) {
      setStatus("", "");
      return;
    }
    accountGreeting.textContent = "Ingelogd als " + user.email;
    setStatus("", "");
    Promise.resolve().then(() => saveProfile(user, version)).catch(() => {
      if (version === sessionVersion) {
        setStatus("Je bent ingelogd. Je profiel kon nog niet worden geladen.", "error");
      }
    });
  }

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => setMode(button.dataset.authMode));
  });

  authForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    submitButton.disabled = true;
    setStatus(mode === "signup" ? "Je account wordt aangemaakt…" : "Je wordt ingelogd…", "");

    try {
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (mode === "signup") {
        const { data, error } = await client.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: nameInput.value.trim() },
            emailRedirectTo: redirectUrl
          }
        });
        if (error) throw error;
        if (data.session) {
          renderSession(data.session);
          setStatus("Je account is aangemaakt en je bent ingelogd.", "success");
        } else {
          setStatus("Account aangemaakt. Controleer je e-mail om je account te bevestigen.", "success");
        }
      } else {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setStatus("Je bent ingelogd.", "success");
      }
    } catch (error) {
      setStatus(error && error.message ? error.message : "Er ging iets mis. Probeer het opnieuw.", "error");
    } finally {
      submitButton.disabled = false;
    }
  });

  signOutButton.addEventListener("click", async () => {
    signOutButton.disabled = true;
    const { error } = await client.auth.signOut();
    if (error) setStatus("Uitloggen is niet gelukt. Probeer het opnieuw.", "error");
    else setStatus("Je bent uitgelogd.", "success");
    signOutButton.disabled = false;
  });

  client.auth.onAuthStateChange((_event, session) => renderSession(session));
  client.auth.getSession().then(({ data, error }) => {
    if (error) setStatus("De aanmeldstatus kon niet worden geladen.", "error");
    else renderSession(data.session);
  }).catch(() => setStatus("De aanmeldstatus kon niet worden geladen.", "error"));
})();