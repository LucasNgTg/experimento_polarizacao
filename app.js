const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.APP_CONFIG;

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Alterna entre as condições A e B.
function assignCondition() {
  const lastCondition = localStorage.getItem("lastCondition");

  const condition = lastCondition === "A" ? "B" : "A";

  localStorage.setItem("lastCondition", condition);

  return condition;
}

// Recupera ou cria a sessão do participante.
function getSession() {
  let sessionId = localStorage.getItem("sessionId");
  let condition = localStorage.getItem("condition");

  // Cria uma nova sessão caso ainda não exista.
  if (!sessionId || !condition) {
    sessionId = crypto.randomUUID();
    condition = assignCondition();

    localStorage.setItem("sessionId", sessionId);
    localStorage.setItem("condition", condition);
  }

  return { sessionId, condition };
}

// Obtém a sessão atual.
const { sessionId, condition } = getSession();

// Carrega o texto correspondente à condição atribuída.
const textContainer = document.querySelector("#experiment-text");

if (textContainer) {
  textContainer.textContent = window.EXPERIMENT_CONTENT[condition];
}

// Disponibiliza os dados da sessão para a página da pesquisa.
window.EXPERIMENT_SESSION = {
  sessionId,
  condition
};
