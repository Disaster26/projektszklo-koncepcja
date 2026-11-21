(function(){
  var top=document.getElementById('top'),bg=document.getElementById('burger');
  function zamknij(){top.classList.remove('open');bg.setAttribute('aria-expanded','false');bg.setAttribute('aria-label','Otwórz menu');document.body.style.overflow=''}
  bg.addEventListener('click',function(){var o=top.classList.toggle('open');bg.setAttribute('aria-expanded',o);bg.setAttribute('aria-label',o?'Zamknij menu':'Otwórz menu');document.body.style.overflow=o?'hidden':''});
  document.querySelectorAll('.menu a').forEach(function(a){a.addEventListener('click',zamknij)});

  /* aktywna pozycja menu */
  var links=[].slice.call(document.querySelectorAll('.menu a[href^="#"]:not(.mk)'));
  if('IntersectionObserver' in window){
    var mapaSek={oferta:'#oferta',realizacje:'#realizacje',szklo:'#szklo',jak:'#szklo','o-nas':'#o-nas',wycena:'#wycena',start:''};
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var h=mapaSek[e.target.id];links.forEach(function(l){l.classList.toggle('on',l.getAttribute('href')===h)})}})},{rootMargin:'-45% 0px -50% 0px'});
    Object.keys(mapaSek).forEach(function(id){var t=document.getElementById(id);if(t)io.observe(t)});
    var mob=document.getElementById('mob');
    new IntersectionObserver(function(es){mob.classList.toggle('widac',!es[0].isIntersecting&&es[0].boundingClientRect.top<0)},{threshold:0}).observe(document.querySelector('.hero .cta'));
    var mapa=document.getElementById('mapa');
    new IntersectionObserver(function(es,o){if(es[0].isIntersecting){o.disconnect();var f=document.createElement('iframe');f.src=mapa.dataset.src;f.title='Mapa dojazdu: ul. Instalatorów 23, Warszawa';f.loading='lazy';f.referrerPolicy='no-referrer-when-downgrade';mapa.appendChild(f)}},{rootMargin:'300px 0px'}).observe(mapa);
  }

  /* przeciaganie mysza */
  function przeciagaj(el,krok){
    var down=false,sx=0,sl=0,moved=false;
    el.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0||el.scrollWidth<=el.clientWidth+2)return;down=true;moved=false;sx=e.clientX;sl=el.scrollLeft});
    addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>4){moved=true;el.classList.add('drag');el.style.scrollSnapType='none'}if(moved)el.scrollLeft=sl-dx});
    addEventListener('pointerup',function(){if(!down)return;down=false;el.classList.remove('drag');if(moved){var w=krok();var cel=Math.round(el.scrollLeft/w)*w;el.style.scrollSnapType='';el.scrollTo({left:cel,behavior:'smooth'})}else el.style.scrollSnapType=''});
    el.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();moved=false}},true);
    el.addEventListener('dragstart',function(e){e.preventDefault()});
  }

  /* galerie w kafelkach uslug */
  document.querySelectorAll('.gal').forEach(function(g){
    var gt=g.querySelector('.gt'),kr=g.querySelectorAll('.kr i'),p=g.querySelector('.gp'),n=g.querySelector('.gn');
    function w(){return gt.clientWidth||1}
    var zal=false;function wczytaj(){if(zal)return;zal=true;gt.querySelectorAll('img[data-src]').forEach(function(i){i.src=i.dataset.src;i.removeAttribute('data-src')})}
    ['pointerenter','touchstart','focusin','scroll'].forEach(function(ev){g.addEventListener(ev,wczytaj,{passive:true,once:true})});
    przeciagaj(gt,w);
    var tk=false;
    function upd(){tk=false;var i=Math.round(gt.scrollLeft/w());kr.forEach(function(k,j){k.classList.toggle('on',j===i)});p.disabled=i<=0;n.disabled=i>=gt.children.length-1}
    gt.addEventListener('scroll',function(){if(!tk){tk=true;requestAnimationFrame(upd)}},{passive:true});
    requestAnimationFrame(upd);
    var idx=0;gt.addEventListener('scroll',function(){idx=Math.round(gt.scrollLeft/w())},{passive:true});
    addEventListener('resize',function(){var i=idx;requestAnimationFrame(function(){gt.style.scrollSnapType='none';gt.scrollLeft=i*w();gt.style.scrollSnapType=''})});
    p.addEventListener('click',function(){gt.scrollBy({left:-w(),behavior:'smooth'})});
    n.addEventListener('click',function(){wczytaj();gt.scrollBy({left:w(),behavior:'smooth'})});
  });

  /* pas realizacji z filtrami */
  var pas=document.getElementById('pas'),nav=document.querySelector('.pasnav'),bs=nav.querySelectorAll('button'),ile=document.getElementById('ile');
  var karty=[].slice.call(pas.children);
  function krok(){var k=karty.filter(function(x){return !x.hidden})[0];return k?k.getBoundingClientRect().width+parseFloat(getComputedStyle(pas).columnGap||0):300}
  przeciagaj(pas,krok);
  function updPas(){bs[0].disabled=pas.scrollLeft<4;bs[1].disabled=pas.scrollLeft+pas.clientWidth>=pas.scrollWidth-4}
  var tp=false;pas.addEventListener('scroll',function(){if(!tp){tp=true;requestAnimationFrame(function(){tp=false;updPas()})}},{passive:true});
  addEventListener('resize',function(){requestAnimationFrame(updPas)});
  requestAnimationFrame(updPas);
  bs.forEach(function(b){b.addEventListener('click',function(){pas.scrollBy({left:krok()*(+b.dataset.k),behavior:'smooth'})})});
  var fb=document.querySelectorAll('.filtry button');
  fb.forEach(function(b){b.addEventListener('click',function(){
    var f=b.dataset.f,n=0;fb.forEach(function(x){x.setAttribute('aria-pressed',x===b)});
    karty.forEach(function(k){var ok=f==='*'||k.dataset.k===f;k.hidden=!ok;if(ok)n++});
    pas.scrollLeft=0;ile.textContent=n+' zdjęć';requestAnimationFrame(updPas);
  })});

  /* lightbox */
  var lb=document.getElementById('lb'),li=lb.querySelector('img'),lp=lb.querySelector('p'),cur=0,last=null,grp=[];
  function opis(b){var a=b.closest('.usl');var h=a&&a.querySelector('h3');var im=b.querySelector('img');return h?h.textContent:(im?im.alt:'')}
  function pokaz(i){cur=(i+grp.length)%grp.length;var b=grp[cur];var im=b.querySelector('img');li.src=im.currentSrc||im.src||im.dataset.src;var big=new Image();var u=b.dataset.lb;big.onload=function(){if(grp[cur]===b)li.src=u};big.src=u;li.alt=im?im.alt:'';lp.textContent=opis(b)+(grp.length>1?'  ('+(cur+1)+'/'+grp.length+')':'')}
  document.addEventListener('click',function(e){var b=e.target.closest('[data-lb]');if(!b)return;e.preventDefault();last=b;var g=b.closest('[data-grupa]');grp=g?[].slice.call(g.querySelectorAll('[data-lb]')).filter(function(x){return !x.hidden}):[b];var im=b.querySelector('img');if(im&&im.dataset.src){g.querySelectorAll('img[data-src]').forEach(function(i){i.src=i.dataset.src;i.removeAttribute('data-src')})}pokaz(grp.indexOf(b));lb.classList.add('otw');document.body.style.overflow='hidden';lb.querySelector('.x').focus()});
  function zam(){lb.classList.remove('otw');document.body.style.overflow='';li.removeAttribute('src');if(last)last.focus()}
  lb.querySelector('.x').addEventListener('click',zam);
  lb.querySelector('.p').addEventListener('click',function(){pokaz(cur-1)});
  lb.querySelector('.n').addEventListener('click',function(){pokaz(cur+1)});
  lb.addEventListener('click',function(e){if(e.target===lb||e.target.tagName==='FIGURE')zam()});
  var tx=0;lb.addEventListener('touchstart',function(e){tx=e.touches[0].clientX},{passive:true});
  lb.addEventListener('touchend',function(e){var d=e.changedTouches[0].clientX-tx;if(Math.abs(d)>50)pokaz(cur+(d<0?1:-1))});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){if(lb.classList.contains('otw'))zam();else zamknij()}
    if(!lb.classList.contains('otw'))return;
    if(e.key==='ArrowRight')pokaz(cur+1);if(e.key==='ArrowLeft')pokaz(cur-1);
  });

  /* film - fasada */
  var film=document.getElementById('film');
  film.addEventListener('click',function(){if(film.querySelector('iframe'))return;var f=document.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/eK7DOXHhXL8?autoplay=1&rel=0';f.title='Usługi szklarskie Warszawa - Projekt Szkło';f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;film.appendChild(f);film.querySelector('.gr').style.display='none'});

  /* wybor uslugi z kafelka -> formularz */
  var sel=document.getElementById('f-rodzaj');
  document.querySelectorAll('[data-rodzaj]').forEach(function(a){a.addEventListener('click',function(){sel.value=a.dataset.rodzaj})});
  var pl=document.getElementById('f-plik'),pn=document.getElementById('pn');
  pl.addEventListener('change',function(){var n=pl.files.length;pn.textContent=n?(n===1?pl.files[0].name:'Wybrano zdjęć: '+n):'JPG lub PNG, można kilka'});
  var f=document.getElementById('form'),msg=document.getElementById('msg');
  f.addEventListener('submit',function(e){e.preventDefault();var ok=true;[].forEach.call(f.querySelectorAll('[required]'),function(i){var v=i.type==='checkbox'?(i.checked?'1':''):i.value.trim();var bad=!v;i.setAttribute('aria-invalid',bad);if(bad&&ok){ok=false;i.focus()}});if(!ok)return;msg.hidden=false;f.reset();pn.textContent='JPG lub PNG, można kilka'});
  var r=document.getElementById('rok');if(r)r.textContent=new Date().getFullYear();
})();
