(() => {
  const cfg = window.APP_CONFIG;
  const client = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  const sessionKey = "experiment_session_id";
  const conditionKey = "experiment_condition_code";

  function getSessionId() {
    let id = sessionStorage.getItem(sessionKey);

    if (!id) {
      id = crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      sessionStorage.setItem(sessionKey, id);
    }

    return id;
  }

  async function getCondition(sessionId) {
    // Consulta o banco mesmo se já houver uma condição armazenada.
    // O Supabase retorna a condição previamente atribuída à sessão,
    // sem avançar a sequência.
    const { data, error } = await client.rpc("assign_experiment_condition", {
      p_session_id: sessionId,
    });

    if (error) {
      console.error("Erro ao atribuir condição:", error);

      console.error("Detalhes do erro:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      throw new Error("Não foi possível determinar a versão do texto.");
    }

    if (data !== "A" && data !== "B") {
      throw new Error("O Supabase retornou uma condição inválida.");
    }

    sessionStorage.setItem(conditionKey, data);

    return data;
  }

  function showError(message) {
    const loading = document.getElementById("loading");
    loading.textContent = message;
  }

  async function init() {
    if (
      !cfg.SUPABASE_URL ||
      cfg.SUPABASE_URL.includes("SEU-PROJETO") ||
      !cfg.SUPABASE_ANON_KEY ||
      cfg.SUPABASE_ANON_KEY.includes("SUA_CHAVE")
    ) {
      showError("O sistema ainda não foi configurado com as credenciais do Supabase.");
      return;
    }

    try {
      const sessionId = getSessionId();
      const condition = await getCondition(sessionId);

      const text =
        condition === "A" ? EXPERIMENT_TEXTS.versionA : EXPERIMENT_TEXTS.versionB;

      document.getElementById("text-title").textContent = text.title;

      const body = document.getElementById("text-body");
      body.replaceChildren();

      text.paragraphs.forEach((paragraph) => {
        const element = document.createElement("p");
        element.textContent = paragraph;
        body.appendChild(element);
      });

      document.getElementById("survey-link").href = "survey.html";
      document.getElementById("loading").hidden = true;
      document.getElementById("reading").hidden = false;
    } catch (error) {
      console.error(error);
      showError(error.message);
    }
  }

  init();
})();
