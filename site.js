const menu=document.querySelector('#menu');const nav=document.querySelector('#nav');menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);menu.querySelector('span').textContent=open?'−':'+';});nav.addEventListener('click',event=>{if(event.target.closest('a')){menu.setAttribute('aria-expanded','false');nav.classList.remove('open');menu.querySelector('span').textContent='+';}});document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.getAttribute('aria-expanded')==='true'){menu.click();menu.focus();}});
const photoViewer=document.querySelector('#photo-viewer');
if(photoViewer){
 const expandedPhoto=photoViewer.querySelector('img');
 document.querySelectorAll('[data-photo]').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();expandedPhoto.src=link.href;expandedPhoto.alt=link.querySelector('img').alt;
  photoViewer.showModal();document.body.classList.add('photo-open');
 }));
 photoViewer.querySelector('button').addEventListener('click',()=>photoViewer.close());
 photoViewer.addEventListener('click',event=>{if(event.target===photoViewer){const r=photoViewer.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)photoViewer.close();}});
 photoViewer.addEventListener('close',()=>document.body.classList.remove('photo-open'));
}
// Project views preserve existing deep links and browser back/forward.
const projects=[...document.querySelectorAll('[data-project]')];
const landing=[...document.querySelector('main').children].filter(el=>!el.matches('[data-project],[data-project-toolbar],footer'));
let returnPosition=null;
let restoreLandingY=null;
try{returnPosition=JSON.parse(sessionStorage.getItem('portfolio-return-position')||'null');}catch{}
document.addEventListener('click',event=>{
 const link=event.target.closest('a[href^="#"]');
 if(!link)return;
 if(link.closest('[data-project-toolbar]')){
  event.preventDefault();
  const destination=returnPosition?.hash||'#proyectos';
  restoreLandingY=Number.isFinite(returnPosition?.y)?returnPosition.y:null;
  returnPosition=null;
  try{sessionStorage.removeItem('portfolio-return-position');}catch{}
  if(location.hash===destination)routeProject();else location.hash=destination;
  return;
 }
 const target=document.getElementById(link.hash.slice(1));
 if(target?.closest('[data-project]')&&!projects.some(project=>!project.hidden)){
  returnPosition={hash:location.hash||'#inicio',y:window.scrollY};
  try{sessionStorage.setItem('portfolio-return-position',JSON.stringify(returnPosition));}catch{}
 }
});
function routeProject(){
 const id=decodeURIComponent(location.hash.slice(1));const target=document.getElementById(id);
 const selected=target?.closest('[data-project]');
 projects.forEach(p=>p.hidden=p!==selected);
 landing.forEach(p=>p.hidden=!!selected);
 document.querySelectorAll('[data-project-toolbar]').forEach(t=>{t.hidden=t.dataset.projectToolbar!==selected?.dataset.project;});
 document.querySelectorAll('.nav-dropdown').forEach(d=>d.open=false);
 requestAnimationFrame(()=>{
  if(!selected&&restoreLandingY!==null){window.scrollTo({top:restoreLandingY,behavior:'instant'});restoreLandingY=null;}
  else if(target)target.scrollIntoView({block:'start',behavior:'instant'});
 });
}
window.addEventListener('hashchange',routeProject);routeProject();

document.addEventListener('click',e=>{document.querySelectorAll('.nav-dropdown[open]').forEach(d=>{if(!d.contains(e.target))d.open=false;});});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelectorAll('.nav-dropdown').forEach(d=>d.open=false);});
document.querySelectorAll('.reels-grid').forEach((track,index)=>{
 track.id ||= 'video-track-'+index;
 const controls=document.createElement('div');controls.className='gallery-controls';
 controls.innerHTML='<span>Deslizá para explorar todos los videos</span><div><button type="button" aria-label="Videos anteriores">←</button><button type="button" aria-label="Más videos">→</button></div>';
 track.before(controls);const [prev,next]=controls.querySelectorAll('button');
 [prev,next].forEach(b=>b.setAttribute('aria-controls',track.id));
 const update=()=>{prev.disabled=track.scrollLeft<=2;next.disabled=track.scrollLeft+track.clientWidth>=track.scrollWidth-3;};
 prev.onclick=()=>track.scrollBy({left:-track.clientWidth*.8,behavior:'smooth'});next.onclick=()=>track.scrollBy({left:track.clientWidth*.8,behavior:'smooth'});
 track.addEventListener('scroll',update,{passive:true});new ResizeObserver(update).observe(track);update();
});
// Local-only cover selection, without changing or trimming the video.
if(['localhost','127.0.0.1'].includes(location.hostname)){
 document.querySelectorAll('.reel video').forEach(video=>{
 const key='portfolio-cover:'+video.querySelector('source').getAttribute('src');
 try{const saved=localStorage.getItem(key);if(saved)video.poster=saved;}catch{}
 const editor=document.createElement('details');editor.className='cover-editor';editor.innerHTML='<summary>Elegir portada</summary><p>Reproducí el video y pausalo en el fotograma que prefieras. La portada se guarda solo en este navegador.</p><button type="button">Usar fotograma actual</button><button type="button" class="reset-cover">Restablecer</button><span role="status"></span>';
 video.after(editor);const original=video.getAttribute('poster');const status=editor.querySelector('[role=status]');
 editor.querySelector('button').onclick=()=>{if(video.readyState<2){status.textContent='Primero reproducí el video y elegí un momento.';return;}video.pause();const canvas=document.createElement('canvas');canvas.width=360;canvas.height=Math.round(360*video.videoHeight/video.videoWidth);canvas.getContext('2d').drawImage(video,0,0,canvas.width,canvas.height);const url=canvas.toDataURL('image/jpeg',.85);try{localStorage.setItem(key,url);video.poster=url;video.load();status.textContent='Portada guardada en este navegador.';}catch{status.textContent='No se pudo guardar la portada. El navegador no tiene espacio disponible.';}};
 editor.querySelector('.reset-cover').onclick=()=>{localStorage.removeItem(key);const source=video.querySelector('source').getAttribute('src');if(source.startsWith('media/francisca/'))video.removeAttribute('poster');else video.poster=source.replace(/\.mp4$/,'.jpg');video.load();status.textContent='Portada original restaurada.';};
 });
}
