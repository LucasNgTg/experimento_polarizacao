// Conteúdo editável do experimento.
// Para alterar os textos, edite EXPERIMENT_TEXTS.
// Para alterar, adicionar, remover ou reordenar perguntas, edite EXPERIMENT_QUESTIONS.
// O campo "field" de cada pergunta deve corresponder a uma coluna de experiment_responses.

window.EXPERIMENT_TEXTS = {
  versionA: {
    title: "Acabem com o anonimato nas redes. Já.",
    paragraphs: [
      "O anonimato é o esconderijo de quem odeia, mente e ameaça sem pagar por nada. Sem rosto, ninguém se sente responsável pelo que diz. Perfis falsos espalham boatos e atacam em bando. É isso que o anonimato produz. Quem o defende é ingênuo ou tem algo a esconder.",
      "Identidade verificada não é censura. Ela obriga o agressor a responder pelos seus atos e dá à vítima o poder de denunciar. Ativistas e denunciantes precisam de proteção, e terceiros de confiança podem verificar a identidade sem expô-la ao público. Usar esses casos como desculpa para proteger agressores é puro cinismo. Acabem com isso."
    ]
  },
  versionB: {
    title: "Talvez fosse o caso de repensar o anonimato nas redes, não é?",
    paragraphs: [
      "Bem, não sou especialista, mas parece que o anonimato pode, de certa forma, facilitar o ódio e a desinformação, não é mesmo? Talvez as pessoas se sintam um pouco menos responsáveis quando não estão identificadas. Os perfis falsos também parecem ajudar bastante a espalhar boatos e a atacar em grupo.",
      "Com todo respeito a quem pensa diferente, talvez valesse a pena considerar a verificação de identidade, que poderia ajudar a responsabilizar quem ofende e as vítimas a denunciar. A preocupação com ativistas e denunciantes é muito compreensível, mas quem sabe uma verificação por terceiros de confiança, sem expor a identidade ao público, resolvesse? Se me permitem a sugestão."
    ]
  }
};

// As mesmas definições geram o formulário e os gráficos do painel.
// Para alterar uma pergunta, edite label, lowLabel e highLabel.
// Para alterar sua posição, mova o objeto correspondente dentro deste array.
window.EXPERIMENT_QUESTIONS = [
  {
    field: "identity_verification_support",
    label: "O quanto você concorda que as redes sociais deveriam exigir verificação de identidade real de todos os usuários?",
    lowLabel: "Discordo totalmente",
    highLabel: "Concordo totalmente",
    initialValue: 50
  },
  {
    field: "response_certainty",
    label: "O quão certo você está da sua resposta anterior?",
    lowLabel: "Nenhuma certeza",
    highLabel: "Certeza absoluta",
    initialValue: 50
  },
  {
    field: "topic_importance",
    label: "O quão importante é esse tema para você?",
    lowLabel: "Nada importante",
    highLabel: "Extremamente importante",
    initialValue: 50
  },
  {
    field: "text_aggressiveness",
    label: "O quão agressivo ou ofensivo foi o texto que você leu?",
    lowLabel: "Nada agressivo",
    highLabel: "Extremamente agressivo",
    initialValue: 50
  },
  {
    field: "author_confidence",
    label: "O quão seguro e firme o autor parecia estar do que dizia?",
    lowLabel: "Muito hesitante e inseguro",
    highLabel: "Totalmente seguro e firme",
    initialValue: 50
  },
  {
    field: "text_respectfulness",
    label: "O quão respeitoso o texto foi com quem pensa diferente?",
    lowLabel: "Nada respeitoso",
    highLabel: "Muito respeitoso",
    initialValue: 50
  },
  {
    field: "text_balance",
    label: "O quão equilibrado e razoável o texto pareceu?",
    lowLabel: "Totalmente parcial e exagerado",
    highLabel: "Totalmente equilibrado e razoável",
    initialValue: 50
  },
  {
    field: "argument_strength",
    label: "O quão fortes foram os argumentos apresentados?",
    lowLabel: "Muito fracos",
    highLabel: "Muito fortes",
    initialValue: 50
  },
  {
    field: "author_trust",
    label: "O quanto você confiou no autor?",
    lowLabel: "Nenhuma confiança",
    highLabel: "Confiança total",
    initialValue: 50
  },
  {
    field: "author_sympathy",
    label: "O quanto você simpatizou com o autor?",
    lowLabel: "Antipatia total",
    highLabel: "Muita simpatia",
    initialValue: 50
  },
  {
    field: "text_persuasiveness",
    label: "O quão persuasivo o texto foi, independentemente de você concordar?",
    lowLabel: "Nada persuasivo",
    highLabel: "Extremamente persuasivo",
    initialValue: 50
  },
  {
    field: "anger_indignation",
    label: "O quanto o texto despertou raiva ou indignação em você?",
    lowLabel: "Nenhuma",
    highLabel: "Máxima",
    initialValue: 50
  },
  {
    field: "calm_tranquility",
    label: "O quanto o texto despertou calma ou tranquilidade em você?",
    lowLabel: "Nenhuma",
    highLabel: "Total",
    initialValue: 50
  },
  {
    field: "urge_to_rebut",
    label: "Quanta vontade você teve de rebater ou responder ao texto?",
    lowLabel: "Nenhuma vontade",
    highLabel: "Vontade enorme",
    initialValue: 50
  },
  {
    field: "ingroup_attitude",
    label: "O quão positiva é a sua visão de pessoas que pensam como você sobre esse tema?",
    lowLabel: "Muito negativa",
    highLabel: "Muito positiva",
    initialValue: 50
  },
  {
    field: "outgroup_attitude",
    label: "O quão positiva é a sua visão de pessoas que pensam diferente de você sobre esse tema?",
    lowLabel: "Muito negativa",
    highLabel: "Muito positiva",
    initialValue: 50
  },
  {
    field: "opponent_good_faith",
    label: "O quão de boa-fé você acha que são as pessoas que discordam de você?",
    lowLabel: "Nenhuma boa-fé, agem por má-fé",
    highLabel: "Total boa-fé",
    initialValue: 50
  },
  {
    field: "perceived_room_agreement",
    label: "Que porcentagem da sala você acha que concorda com você?",
    lowLabel: "0% da sala",
    highLabel: "100% da sala",
    initialValue: 50
  },
  {
    field: "willingness_to_dialogue",
    label: "O quanto você estaria disposto a conversar com calma com alguém que discorda de você?",
    lowLabel: "Nada disposto",
    highLabel: "Totalmente disposto",
    initialValue: 50
  },
  {
    field: "sharing_intention",
    label: "O quanto você teria vontade de compartilhar esse texto com outras pessoas?",
    lowLabel: "Nenhuma vontade",
    highLabel: "Vontade enorme",
    initialValue: 50
  }
];
