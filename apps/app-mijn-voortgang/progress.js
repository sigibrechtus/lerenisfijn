(() => {
 const client=window.lerenSupabase, signedOut=document.getElementById("signedOut"),content=document.getElementById("progressContent"),pageStatus=document.getElementById("pageStatus"),form=document.getElementById("nicknameForm"),nickname=document.getElementById("nickname"),nicknameStatus=document.getElementById("nicknameStatus"),profileSettingsLink=document.getElementById("profileSettingsLink");
 const names={"app-taal-zinnenbouwer":"Zinnenbouwer","app-logica-patronen":"Patroon detective","app-wiskunde-winkelspel":"Het winkelspel","app-taal-spelling":"Themadictee","app-wiskunde-splitsingen":"Splitsingen","app-wiskunde-plus-min":"Plus en min","app-wiskunde-maaldeeltafels":"Maal- en deeltafels","app-wiskunde-kloklezen":"Kloklezen"};
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
 function render(rows){
  document.getElementById("totalCount").textContent=rows.length;
  const eligible=rows.filter(r=>!r.assisted);
  document.getElementById("firstTryRate").textContent=eligible.length?Math.round(eligible.filter(r=>r.first_try_correct).length*100/eligible.length)+"%":"—";
  document.getElementById("practiceDays").textContent=new Set(rows.map(r=>new Date(r.completed_at).toLocaleDateString("nl-BE"))).size;
  const grouped={};rows.forEach(r=>{const g=grouped[r.exercise_key]||(grouped[r.exercise_key]={n:0,ok:0,tracked:0});g.n++;if(!r.assisted){g.tracked++;if(r.first_try_correct)g.ok++}});
  const stats=document.getElementById("exerciseStats");
  stats.innerHTML=Object.keys(grouped).length?Object.entries(grouped).sort((a,b)=>b[1].n-a[1].n).map(([k,g])=>'<div class="exercise-row"><div><strong>'+esc(names[k]||k)+'</strong><small>'+g.n+' afgeronde '+(g.n===1?'vraag':'vragen')+' · goed in één keer</small></div><span class="count">'+(g.tracked?Math.round(g.ok*100/g.tracked)+'%':'—')+'</span></div>').join(""):'<p class="empty">Je hebt nog geen vragen afgerond. Kies een oefening om te beginnen.</p>';
  document.getElementById("recentList").innerHTML=rows.slice(0,20).map(r=>'<div class="recent-row"><div><strong>'+esc(names[r.exercise_key]||r.exercise_key)+'</strong><small>'+new Date(r.completed_at).toLocaleString("nl-BE",{dateStyle:"medium",timeStyle:"short"})+'</small></div><span class="count">'+(r.assisted?'Samen nagekeken':r.first_try_correct?'Goed in één keer':'Na '+r.attempt_count+' pogingen')+'</span></div>').join("")||'<p class="empty">Je recente oefeningen verschijnen hier.</p>';
 }
 async function show(session){
  const user=session&&session.user;profileSettingsLink.hidden=!user;signedOut.hidden=!!user;content.hidden=!user;if(!user)return;
  const p=await client.from("profiles").select("nickname").eq("id",user.id).maybeSingle();if(p.error)pageStatus.textContent="Je profiel kon niet worden geladen.";else nickname.value=(p.data&&p.data.nickname)||"";
  let rows=[],from=0;
  while(true){
   const q=await client.from("exercise_attempts").select("exercise_key,attempt_count,first_try_correct,assisted,completed_at").eq("user_id",user.id).order("completed_at",{ascending:false}).range(from,from+999);
   if(q.error){pageStatus.textContent="Je voortgang kon niet worden geladen. Vernieuw de pagina.";return}
   rows=rows.concat(q.data||[]);if(!q.data||q.data.length<1000)break;from+=1000;
  }
  render(rows);
 }
 form.addEventListener("submit",async e=>{e.preventDefault();nicknameStatus.textContent="";const s=await client.auth.getSession();if(!s.data.session)return;const value=nickname.value.trim();if(!value){nicknameStatus.textContent="Vul een bijnaam in.";return}const r=await client.from("profiles").upsert({id:s.data.session.user.id,nickname:value,updated_at:new Date().toISOString()},{onConflict:"id"});nicknameStatus.textContent=r.error?"Bijnaam bewaren lukte niet. Probeer het opnieuw.":"Bijnaam bewaard."});
 client.auth.onAuthStateChange((_event,s)=>show(s).catch(()=>pageStatus.textContent="Je gegevens konden niet worden geladen."));
 client.auth.getSession().then(r=>r.error?pageStatus.textContent="De aanmeldstatus kon niet worden geladen.":show(r.data.session)).catch(()=>pageStatus.textContent="De aanmeldstatus kon niet worden geladen.");
})();
