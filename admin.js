(() => {
  const cfg = window.APP_CONFIG;
  const db = supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);
  const $ = id => document.getElementById(id);
  let rows = [];
  let revealed = false;
  let refreshTimer = null;
  let realtimeChannel = null;

  const metrics = [
    ['post_position', 'Concordância final'],
    ['conviction', 'Convicção'],
    ['emotion_intensity', 'Intensidade emocional'],
    ['anger', 'Indignação/raiva'],
    ['willingness_to_talk', 'Disposição para dialogar'],
    ['perceived_competence', 'Desqualificação de quem discorda'],
    ['would_read_more', 'Interesse em ler mais'],
    ['changed_opinion', 'Mudança percebida']
  ];

  function average(items, key) {
    const values = items.map(item => item[key]).filter(value => value !== null && value !== undefined);
    return values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : null;
  }

  function format(value) {
    return value === null ? '—' : value.toFixed(1);
  }

  function bar(label, value) {
    const percentage = Math.max(0, Math.min(100, value || 0));
    return `<div class="metric"><div class="metric-head"><span>${label}</span><strong>${format(value)}</strong></div><div class="bar"><span style="width:${percentage}%"></span></div></div>`;
  }

  function render() {
    const completed = rows.filter(row => row.post_position !== null);
    $('stats').innerHTML = `
      <div class="stat"><span>Respostas registradas</span><strong>${completed.length}</strong></div>
      <div class="stat"><span>Última atualização</span><strong>${new Date().toLocaleTimeString('pt-BR')}</strong></div>`;
    $('aggregate-charts').innerHTML = metrics
      .map(([key, label]) => bar(label, average(completed, key))).join('');
    if (revealed) renderSplit();
  }

  function renderSplit() {
    const completed = rows.filter(row => row.post_position !== null);
    const groupA = completed.filter(row => row.condition_code === 'A');
    const groupB = completed.filter(row => row.condition_code === 'B');
    $('split-results').hidden = false;
    $('split-results').innerHTML = `
      <p><strong>Condição A:</strong> ${groupA.length} respostas &nbsp; <strong>Condição B:</strong> ${groupB.length} respostas</p>
      <div class="columns">
        <div><h3>Condição A</h3>${metrics.map(([key, label]) => bar(label, average(groupA, key))).join('')}</div>
        <div><h3>Condição B</h3>${metrics.map(([key, label]) => bar(label, average(groupB, key))).join('')}</div>
      </div>
      <p class="muted">As médias são descritivas. Considere o tamanho da amostra e as limitações da dinâmica antes de interpretar diferenças.</p>`;
  }

  async function refresh() {
    const { data, error } = await db
      .from('experiment_responses')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao carregar resultados:', error);
      $('aggregate-charts').textContent = 'Erro ao carregar os dados. Verifique as permissões da conta administrativa.';
      return;
    }
    rows = data || [];
    render();
  }

  async function startDashboard() {
    $('login').hidden = true;
    $('dashboard').hidden = false;
    await refresh();

    realtimeChannel = db.channel('experiment-live')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'experiment_responses'
      }, refresh)
      .subscribe();

    // Alternativa caso o Realtime não esteja habilitado ou a conexão caia.
    refreshTimer = setInterval(refresh, 5000);
  }

  $('login-form').addEventListener('submit', async event => {
    event.preventDefault();
    const email = $('email').value.trim();
    const password = $('password').value;
    $('login-btn').disabled = true;
    $('login-status').textContent = 'Autenticando…';

    const { error } = await db.auth.signInWithPassword({ email, password });
    if (error) {
      $('login-status').textContent = 'Não foi possível entrar. Confira o e-mail e a senha.';
      $('login-btn').disabled = false;
      return;
    }
    $('login-status').textContent = '';
    await startDashboard();
  });

  $('logout-btn').addEventListener('click', async () => {
    if (refreshTimer) clearInterval(refreshTimer);
    if (realtimeChannel) await db.removeChannel(realtimeChannel);
    await db.auth.signOut();
    rows = [];
    revealed = false;
    $('split-results').hidden = true;
    $('reveal').hidden = false;
    $('dashboard').hidden = true;
    $('login').hidden = false;
    $('password').value = '';
    $('login-btn').disabled = false;
  });

  $('reveal').addEventListener('click', () => {
    revealed = true;
    $('reveal').hidden = true;
    renderSplit();
  });

  // Reaproveita uma sessão administrativa ainda válida neste navegador.
  db.auth.getSession().then(({ data }) => {
    if (data.session) startDashboard();
  });
})();
