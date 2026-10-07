(() => {
  const PROJECT_URL = "https://drouoptqpggvaomqacho.supabase.co";
  const PUBLISHABLE_KEY = "sb_publishable_MCkhERDuogH8NoVK2OIL-Q_BzqK3I6l";
  if (!window.supabase || !window.supabase.createClient) return;
  const client = window.supabase.createClient(PROJECT_URL, PUBLISHABLE_KEY);
  function questionId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    const h = [...bytes].map(x => x.toString(16).padStart(2, "0")).join("");
    return h.slice(0,8)+"-"+h.slice(8,12)+"-"+h.slice(12,16)+"-"+h.slice(16,20)+"-"+h.slice(20);
  }
  async function recordQuestion(row) {
    try {
      const { data } = await client.auth.getSession();
      if (!data.session) return false;
      const { error } = await client.from("exercise_attempts").insert({
        ...row, user_id: data.session.user.id
      });
      if (error) console.warn("Voortgang opslaan lukte niet.", error.message);
      return !error;
    } catch (error) {
      console.warn("Voortgang opslaan lukte niet.", error);
      return false;
    }
  }
  window.lerenSupabase = client;
  window.lerenProgress = { questionId, recordQuestion };
})();