(() => {
 const cfg=window.APP_CONFIG;
 const client=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
 const key='experiment_session_id';
 let sessionId=sessionStorage.getItem(key);
 if(!sessionId){ sessionId=(crypto.randomUUID?crypto.randomUUID():String(Date.now())+Math.random().toString(36).slice(2)); sessionStorage.setItem(key,sessionId); }
 async function init(){
   const {data:existing,error:readErr}=await client.from('experiment_responses').select('condition_code').eq('session_id',sessionId).maybeSingle();
   let condition=existing?.condition_code;
   if(!condition){
     condition=Math.random()<0.5?'A':'B';
     // Criar um registro preliminar evita trocar de condição ao recarregar.
     const {error}=await client.from('experiment_responses').insert({session_id:sessionId,condition_code:condition});
     if(error){
       // Se houve corrida/registro duplicado, recupera a condição já salva.
       const retry=await client.from('experiment_responses').select('condition_code').eq('session_id',sessionId).maybeSingle();
       if(retry.data) condition=retry.data.condition_code;
       else { document.getElementById('loading').innerHTML='<p>Não foi possível conectar ao sistema. Verifique a configuração e tente novamente.</p>'; return; }
     }
   }
   const obj=condition==='A'?EXPERIMENT_TEXTS.versionA:EXPERIMENT_TEXTS.versionB;
   document.getElementById('text-title').textContent=obj.title;
   const body=document.getElementById('text-body');
   obj.paragraphs.forEach(p=>{const el=document.createElement('p');el.textContent=p;body.appendChild(el);});
   document.getElementById('survey-link').href='survey.html';
   document.getElementById('loading').hidden=true;
   document.getElementById('reading').hidden=false;
 }
 init();
 window.experimentClient=client;
})();
