(() => {
  const cfg = window.APP_CONFIG;
  const client = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  const sessionKey = 'experiment_session_id';
  const conditionKey = 'experiment_condition_code';

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

  function getCondition() {
    let condition = sessionStorage.getItem(conditionKey);
    if (!condition) {
      condition = Math.random() < 0.5 ? 'A' : 'B';
      sessionStorage.setItem(conditionKey, condition);
    }
    return condition;
  }

  function showError(message) {
    const loading = document.getElementById('loading');
    loading.textContent = message;
  }

  function init() {
    if (!cfg.SUPABASE_URL || cfg.SUPABASE_URL.includes('SEU-PROJETO') ||
        !cfg.SUPABASE_ANON_KEY || cfg.SUPABASE_ANON_KEY.includes('SUA_CHAVE')) {
      showError('O sistema ainda não foi configurado com as credenciais do Supabase.');
      return;
    }

    getSessionId();
    const condition = getCondition();
    const text = condition === 'A'
      ? EXPERIMENT_TEXTS.versionA
      : EXPERIMENT_TEXTS.versionB;

    document.getElementById('text-title').textContent = text.title;
    const body = document.getElementById('text-body');
    body.replaceChildren();
    text.paragraphs.forEach(paragraph => {
      const element = document.createElement('p');
      element.textContent = paragraph;
      body.appendChild(element);
    });

    document.getElementById('survey-link').href = 'survey.html';
    document.getElementById('loading').hidden = true;
    document.getElementById('reading').hidden = false;
  }

  init();
})();
