(() => {
 const cfg=window.APP_CONFIG, db=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
 const sid=sessionStorage.getItem('experiment_session_id');
 document.querySelectorAll('input[type=range]').forEach(el=>{
   const out=el.parentElement.querySelector('output'); const upd=()=>out.value=el.value;
   el.addEventListener('input',upd); upd();
 });
 document.getElementById('survey').addEventListener('submit',async e=>{
   e.preventDefault(); const status=document.getElementById('status');
   if(!sid){status.textContent='Sessão não encontrada. Volte ao link do texto e abra o questionário novamente.';return;}
   const f=new FormData(e.currentTarget);
   const fields=['pre_position','post_position','conviction','emotion_intensity','anger','willingness_to_talk','perceived_competence','would_read_more','changed_opinion'];
   const payload={}; fields.forEach(k=>{const map={pre_position:'pre',post_position:'post',conviction:'conviction',emotion_intensity:'emotion',anger:'anger',willingness_to_talk:'talk',perceived_competence:'competence',would_read_more:'more',changed_opinion:'changed'};payload[k]=Number(f.get(map[k]));});
   const {error}=await db.from('experiment_responses').update(payload).eq('session_id',sid);
   if(error){status.textContent='Não foi possível enviar. Verifique a conexão e tente novamente.';return;}
   e.currentTarget.querySelector('button').disabled=true;status.textContent='Respostas registradas. Obrigado pela participação.';
 });
})();
