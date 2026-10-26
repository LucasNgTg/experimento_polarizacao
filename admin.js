(() => {
 const cfg=window.APP_CONFIG, db=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);
 const $=id=>document.getElementById(id); let rows=[], revealed=false, refreshTimer;
 $('login-btn').addEventListener('click',async()=>{
   if($('password').value!==cfg.ADMIN_PASSWORD){$('login-status').textContent='Senha incorreta.';return;}
   $('login').hidden=true;$('dashboard').hidden=false;await refresh();
   db.channel('experiment-live').on('postgres_changes',{event:'*',schema:'public',table:'experiment_responses'},()=>refresh()).subscribe();
   refreshTimer=setInterval(refresh,5000);
 });
 function avg(arr,key){const a=arr.map(x=>x[key]).filter(v=>v!==null&&v!==undefined);return a.length?a.reduce((s,v)=>s+v,0)/a.length:null;}
 function fmt(v){return v===null?'—':v.toFixed(1)}
 const metrics=[
  ['post_position','Concordância final'],['conviction','Convicção'],['emotion_intensity','Intensidade emocional'],
  ['anger','Indignação/raiva'],['willingness_to_talk','Disposição para dialogar'],['perceived_competence','Desqualificação de quem discorda'],
  ['would_read_more','Interesse em ler mais'],['changed_opinion','Mudança percebida']
 ];
 function bar(label,val){const pct=Math.max(0,Math.min(100,val||0));return `<div class="metric"><div class="metric-head"><span>${label}</span><strong>${fmt(val)}</strong></div><div class="bar"><span style="width:${pct}%"></span></div></div>`}
 function render(){
   $('stats').innerHTML=`<div class="stat"><span>Respostas registradas</span><strong>${rows.filter(r=>r.post_position!==null).length}</strong></div><div class="stat"><span>Última atualização</span><strong>${new Date().toLocaleTimeString('pt-BR')}</strong></div>`;
   $('aggregate-charts').innerHTML=metrics.map(([key,label])=>bar(label,avg(rows,key))).join('');
   if(revealed)renderSplit();
 }
 function renderSplit(){
   const a=rows.filter(r=>r.condition_code==='A'&&r.post_position!==null), b=rows.filter(r=>r.condition_code==='B'&&r.post_position!==null);
   $('split-results').hidden=false;
   $('split-results').innerHTML=`<p><strong>Condição A:</strong> ${a.length} respostas &nbsp; <strong>Condição B:</strong> ${b.length} respostas</p><div class="columns"><div><h3>Condição A</h3>${metrics.map(([k,l])=>bar(l,avg(a,k))).join('')}</div><div><h3>Condição B</h3>${metrics.map(([k,l])=>bar(l,avg(b,k))).join('')}</div></div><p class="muted">As médias são descritivas. Considere o tamanho da amostra e as limitações da dinâmica antes de interpretar diferenças.</p>`;
 }
 $('reveal').addEventListener('click',()=>{revealed=true;$('reveal').hidden=true;renderSplit();});
 async function refresh(){
   const {data,error}=await db.from('experiment_responses').select('*').order('created_at',{ascending:true});
   if(error){$('aggregate-charts').textContent='Erro ao carregar os dados. Verifique a configuração do Supabase.';return;}
   rows=data||[];render();
 }
})();
