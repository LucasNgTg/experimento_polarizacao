(() => {
  const cfg = window.APP_CONFIG;
  const db = supabase.createClient(
    cfg.SUPABASE_URL,
    cfg.SUPABASE_ANON_KEY
  );

  const $ = id => document.getElementById(id);
  const questions = window.EXPERIMENT_QUESTIONS;

  let rows = [];
  let stage = 1;
  let refreshTimer = null;
  let realtimeChannel = null;
  let dashboardStarted = false;

  const intervals = Array.from({ length: 10 }, (_, index) => {
    const min = index * 10;
    const max = index === 9 ? 100 : min + 9;
    return { min, max, label: `${min}–${max}` };
  });

  function getDistribution(items, field) {
    const values = items
      .map(item => item[field])
      .filter(value =>
        typeof value === 'number' &&
        Number.isFinite(value) &&
        value >= 0 &&
        value <= 100
      );

    return intervals.map(interval => {
      const count = values.filter(value =>
        value >= interval.min && value <= interval.max
      ).length;

      return {
        ...interval,
        count,
        percentage: values.length ? count / values.length * 100 : 0
      };
    });
  }

  function renderHorizontalQuestion(question, items) {
    const distribution = getDistribution(items, question.field);
    const total = distribution.reduce((sum, item) => sum + item.count, 0);

    const rowsHtml = distribution.map(item => `
      <div class="horizontal-row">
        <span class="horizontal-label">${item.label}</span>
        <div class="horizontal-track" aria-label="${item.percentage.toFixed(1)}%">
          <div class="horizontal-bar" style="width: ${item.percentage}%"></div>
        </div>
        <span class="horizontal-value">${item.count} <small>(${item.percentage.toFixed(1)}%)</small></span>
      </div>
    `).join('');

    return `
      <article class="question-chart-card horizontal-question-card">
        <h4>${question.label}</h4>
        <p class="chart-total">${total} respostas</p>
        <div class="horizontal-chart">${rowsHtml}</div>
      </article>
    `;
  }

  function renderColumnQuestion(question, items) {
    const distribution = getDistribution(items, question.field);
    const total = distribution.reduce((sum, item) => sum + item.count, 0);

    if (total === 0) {
      return `
        <article class="question-chart-card column-question-card">
          <h4>${question.label}</h4>
          <p class="chart-total">Sem respostas</p>
        </article>
      `;
    }

    const columns = distribution.map(item => `
      <div class="chart-column">
        <span class="column-value">${item.count}</span>
        <div class="column-track">
          <div
            class="column-bar"
            style="height: ${item.percentage}%"
            title="${item.count} respostas (${item.percentage.toFixed(1)}%)"
          ></div>
        </div>
        <span class="column-label">${item.label}</span>
        <span class="column-percentage">${item.percentage.toFixed(1)}%</span>
      </div>
    `).join('');

    return `
      <article class="question-chart-card column-question-card">
        <h4>${question.label}</h4>
        <p class="chart-total">${total} respostas</p>
        <div class="distribution-chart column-chart">${columns}</div>
      </article>
    `;
  }

  function renderAggregateStage() {
    $('aggregate-grid').innerHTML = questions
      .map(question => renderHorizontalQuestion(question, rows))
      .join('');
  }

  function renderDetailStage() {
    const groupA = rows.filter(row => row.condition_code === 'A');
    const groupB = rows.filter(row => row.condition_code === 'B');

    $('aggregate-detail-grid').innerHTML = questions
      .map(question => renderHorizontalQuestion(question, rows))
      .join('');

    $('group-a-grid').innerHTML = questions
      .map(question => renderColumnQuestion(question, groupA))
      .join('');

    $('group-b-grid').innerHTML = questions
      .map(question => renderColumnQuestion(question, groupB))
      .join('');
  }

  function render() {
    $('aggregate-stage').hidden = stage !== 1;
    $('detail-stage').hidden = stage !== 2;

    $('stage-kicker').textContent = `VISÃO ${stage}`;
    $('stage-status').textContent = `${stage} de 2`;
    $('stage-page').textContent = `${stage} de 2`;
    $('stage-title').textContent = stage === 1 ? 'Respostas' : 'Distribuição';

    $('stage-prev').disabled = stage === 1;
    $('stage-next').disabled = stage === 2;
    $('stage-next').textContent = stage === 1 ? 'Próxima' : 'Concluído';

    if (stage === 1) {
      renderAggregateStage();
    } else {
      renderDetailStage();
    }

    $('stats').innerHTML = `
      <div class="stat">
        <span>Respostas registradas</span>
        <strong>${rows.length}</strong>
      </div>
      <div class="stat">
        <span>Última atualização</span>
        <strong>${new Date().toLocaleTimeString('pt-BR')}</strong>
      </div>
    `;
  }

  function goNext() {
    if (stage === 1) {
      stage = 2;
      render();
    }
  }

  function goPrevious() {
    if (stage === 2) {
      stage = 1;
      render();
    }
  }

  async function refresh() {
    const { data, error } = await db
      .from('experiment_responses')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao carregar respostas:', error);
      $('login-status').textContent = `Erro: ${error.message}`;
      return;
    }

    rows = data || [];
    if (dashboardStarted) render();
  }

  async function startDashboard() {
    if (dashboardStarted) return;
    dashboardStarted = true;

    $('login').hidden = true;
    $('dashboard').hidden = false;

    await refresh();
    render();

    realtimeChannel = db.channel('experiment-live')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'experiment_responses'
      }, refresh)
      .subscribe();

    refreshTimer = setInterval(refresh, 5000);
  }

  $('stage-prev').addEventListener('click', goPrevious);
  $('stage-next').addEventListener('click', goNext);

  $('login-form').addEventListener('submit', async event => {
    event.preventDefault();

    const email = $('email').value.trim();
    const password = $('password').value;

    $('login-btn').disabled = true;
    $('login-status').textContent = 'Autenticando…';

    const { error } = await db.auth.signInWithPassword({ email, password });

    if (error) {
      $('login-status').textContent =
        'Não foi possível entrar. Confira o e-mail e a senha.';
      $('login-btn').disabled = false;
      return;
    }

    $('login-status').textContent = '';
    await startDashboard();
  });

  $('logout-btn').addEventListener('click', async () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }

    if (realtimeChannel) {
      await db.removeChannel(realtimeChannel);
      realtimeChannel = null;
    }

    await db.auth.signOut();

    rows = [];
    stage = 1;
    dashboardStarted = false;

    $('dashboard').hidden = true;
    $('login').hidden = false;
    $('password').value = '';
    $('login-btn').disabled = false;
  });

  db.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.error('Erro ao recuperar sessão:', error);
      return;
    }

    if (data.session) startDashboard();
  });
})();
