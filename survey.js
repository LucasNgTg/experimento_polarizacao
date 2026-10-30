(() => {
  const cfg = window.APP_CONFIG;
  const db = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  const sessionId = sessionStorage.getItem('experiment_session_id');
  const condition = sessionStorage.getItem('experiment_condition_code');
  const submittedKey = 'experiment_response_submitted';

  const form = document.getElementById('survey');
  const questionsContainer = document.getElementById('questions');
  const status = document.getElementById('status');
  const submitButton = form.querySelector('button[type="submit"]');

  // Gera o formulário a partir da configuração central em content.js.
  window.EXPERIMENT_QUESTIONS.forEach((question, index) => {
    const section = document.createElement('div');
    section.className = 'question';

    const label = document.createElement('label');
    label.htmlFor = question.field;
    label.textContent = `${index + 1}. ${question.label}`;

    const scale = document.createElement('div');
    scale.className = 'scale';

    const low = document.createElement('span');
    low.textContent = question.lowLabel;

    const high = document.createElement('span');
    high.textContent = question.highLabel;

    scale.append(low, high);

    const input = document.createElement('input');
    input.id = question.field;
    input.name = question.field;
    input.type = 'range';
    input.min = '0';
    input.max = '100';
    input.value = String(question.initialValue);

    const output = document.createElement('output');
    output.htmlFor = question.field;
    output.textContent = String(question.initialValue);

    input.addEventListener('input', () => {
      output.value = input.value;
    });

    section.append(label, scale, input, output);
    questionsContainer.appendChild(section);
  });

  if (!sessionId || !['A', 'B'].includes(condition)) {
    status.textContent =
      'Não encontramos sua sessão. Volte ao link inicial e leia o texto antes de responder.';
    submitButton.disabled = true;
    return;
  }

  if (sessionStorage.getItem(submittedKey) === 'true') {
    status.textContent =
      'Suas respostas já foram registradas. Obrigado pela participação.';
    submitButton.disabled = true;
    return;
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    submitButton.disabled = true;
    status.textContent = 'Enviando respostas…';

    const formData = new FormData(form);
    const payload = {
      session_id: sessionId,
      condition_code: condition
    };

    window.EXPERIMENT_QUESTIONS.forEach(question => {
      payload[question.field] = Number(formData.get(question.field));
    });

    const { error } = await db
      .from('experiment_responses')
      .insert(payload);

    if (error) {
      console.error('Erro ao registrar respostas:', error);

      status.textContent = error.code === '23505'
        ? 'Esta sessão já enviou uma resposta. Obrigado pela participação.'
        : 'Não foi possível enviar suas respostas. Verifique a conexão e tente novamente.';

      if (error.code === '23505') {
        sessionStorage.setItem(submittedKey, 'true');
      } else {
        submitButton.disabled = false;
      }
      return;
    }

    sessionStorage.setItem(submittedKey, 'true');
    status.textContent = 'Respostas registradas. Obrigado pela participação.';
  });
})();
