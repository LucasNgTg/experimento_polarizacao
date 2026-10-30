(() => {
  const cfg = window.APP_CONFIG;
  const db = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  const sessionId = sessionStorage.getItem('experiment_session_id');
  const condition = sessionStorage.getItem('experiment_condition_code');
  const submittedKey = 'experiment_response_submitted';
  const form = document.getElementById('survey');
  const status = document.getElementById('status');
  const submitButton = form.querySelector('button[type="submit"]');

  document.querySelectorAll('input[type="range"]').forEach(input => {
    const output = input.parentElement.querySelector('output');
    const update = () => { output.value = input.value; };
    input.addEventListener('input', update);
    update();
  });

  if (!sessionId || !['A', 'B'].includes(condition)) {
    status.textContent = 'Não encontramos sua sessão. Volte ao link inicial e leia o texto antes de responder.';
    submitButton.disabled = true;
    return;
  }

  if (sessionStorage.getItem(submittedKey) === 'true') {
    status.textContent = 'Suas respostas já foram registradas. Obrigado pela participação.';
    submitButton.disabled = true;
    return;
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    submitButton.disabled = true;
    status.textContent = 'Enviando respostas…';

    const formData = new FormData(form);
    const fields = [
      'pre_position', 'post_position', 'conviction', 'emotion_intensity',
      'anger', 'willingness_to_talk', 'perceived_competence',
      'would_read_more', 'changed_opinion'
    ];

    const payload = {
      session_id: sessionId,
      condition_code: condition
    };
    fields.forEach(field => {
      payload[field] = Number(formData.get(field));
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
