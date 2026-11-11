

(function(){
var $=function(i){return document.getElementById(i)};
var st={bgImg:null,mode:'color',shape:'rounded'};
var HR=14,hudT=0;
function hudOn(ms){var h=document.getElementById('hud');if(!h)return;h.classList.add('show');clearTimeout(hudT);if(ms)hudT=setTimeout(function(){h.classList.remove('show')},ms)}
var L=[],act=-1,uid=0,tool='transform',pm='view',vm='add',view={z:1,x:0,y:0,r:0},selPt=-1;
var DENS=[['mdpi',48,108],['hdpi',72,162],['xhdpi',96,216],['xxhdpi',144,324],['xxxhdpi',192,432]];
var STEPS=[1,2,5,10,15,22.5,30,45,90],si=4;
var edc=$('ed');
function G(i){return $(i).checked}
function cur(){return L[act]}
function mk(w,h){var c=document.createElement('canvas');c.width=w;c.height=h||w;return c}
function cc(c){var n=mk(c.width,c.height);n.getContext('2d').drawImage(c,0,0);return n}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function rgb(h){var n=parseInt(h.slice(1),16);return[n>>16,n>>8&255,n&255]}

/* tabs, theme, panels */
var names={editor:'Editor',export:'Export',settings:'Settings'};
function show(p){['editor','export','settings'].forEach(function(k){$('p-'+k).hidden=k!==p;$('t-'+k).setAttribute('aria-selected',k===p)});$('crumb').textContent=names[p];$('barTools').classList.toggle('hide',p!=='editor');if(p==='export')tree()}
[].forEach.call(document.querySelectorAll('nav button'),function(b){b.onclick=function(){show(b.dataset.p)}});
[].forEach.call(document.querySelectorAll('.ph'),function(b){b.onclick=function(){var p=b.parentNode;p.classList.toggle('min');b.setAttribute('aria-expanded',!p.classList.contains('min'))}});
var root=document.documentElement;
function setTheme(v){if(v==='auto')root.removeAttribute('data-theme');else root.setAttribute('data-theme',v)}
try{var t=localStorage.getItem('aim-theme');if(t){$('theme').value=t;setTheme(t)}}catch(e){}
$('theme').onchange=function(){setTheme(this.value);try{localStorage.setItem('aim-theme',this.value)}catch(e){}};

/* history */
var hist=[],hp=-1;
function snap(){return{act:act,L:L.map(function(l){var o={};for(var k in l){if(k==='cv'||k==='_c'||k==='pts')continue;o[k]=l[k]}
  if(l.mesh)o.mesh=JSON.parse(JSON.stringify(l.mesh));if(l.pts)o.pts=JSON.parse(JSON.stringify(l.pts));if(l.st)o.st=JSON.parse(JSON.stringify(l.st));
  if(l.cv){if(!l._c||l._c.v!==l.ver){l._c={v:l.ver,cv:cc(l.cv)}}o.cvc=l._c.cv}
  return o})}}
function restore(s){L=s.L.map(function(o){var l={};for(var k in o)if(k!=='cvc')l[k]=o[k];if(o.mesh)l.mesh=JSON.parse(JSON.stringify(o.mesh));if(o.pts)l.pts=JSON.parse(JSON.stringify(o.pts));if(o.st)l.st=JSON.parse(JSON.stringify(o.st));if(o.cvc){l.cv=cc(o.cvc);l.ver=0}return l});act=Math.min(s.act,L.length-1);selPt=-1;refresh()}
function commit(){hist=hist.slice(0,hp+1);hist.push(snap());if(hist.length>30)hist.shift();hp=hist.length-1;hbtn()}
function hbtn(){$('undo').disabled=hp<=0;$('redo').disabled=hp>=hist.length-1}
$('undo').onclick=function(){if(hp>0){hp--;restore(hist[hp]);hbtn()}};
$('redo').onclick=function(){if(hp<hist.length-1){hp++;restore(hist[hp]);hbtn()}};
function refresh(){renderList();sync();draw()}

/* layers */
function loadImg(file,cb){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){cb(im)};im.src=r.result};r.readAsDataURL(file)}
function addImage(f){loadImg(f,function(im){var k=Math.min(1,1024/Math.max(im.width,im.height)),c=mk(Math.round(im.width*k),Math.round(im.height*k));c.getContext('2d').drawImage(im,0,0,c.width,c.height);newLayer({type:'image',name:(f.name||'Image').slice(0,18),cv:c})})}
function addFiles(fs){[].forEach.call(fs,function(f){if(/^image\//.test(f.type))addImage(f)})}
$('fg').onchange=function(){addFiles(this.files);this.value=''};
function addDraw(){return newLayer({type:'draw',name:'Layer '+(uid+1),cv:mk(800)})}
function addVec(){return newLayer({type:'vec',name:'Vector',pts:[],closed:false,smooth:.5,smoothLine:true,stroke:'#ffffff',width:8,fillOn:false,fill:'#ff8a00'})}
function addShape(){return fl({type:'shape',name:'Shape',kind:'rect',fill:'#ff8a00',fillOn:true,stroke:'#ffffff',width:0,radius:18,sx:1,sy:1})}
function addText(x,y){return fl({type:'text',name:'Text',text:'Text',font:'Arial',color:'#ffffff',x:x||0,y:y||0})}
function newLayer(o){o.id=++uid;o.x=o.x||0;o.y=o.y||0;o.scale=100;o.rot=0;o.op=100;o.hue=0;o.vis=true;o.ver=0;if(o.type==='vec'&&o.smoothLine===undefined)o.smoothLine=true;var at=act>=0&&act<L.length?act+1:L.length;L.splice(at,0,o);act=at;selPt=-1;refresh();commit();return o}
var z=$('edwrap');
z.ondragover=function(e){e.preventDefault();z.classList.add('over')};
z.ondragleave=function(){z.classList.remove('over')};
z.ondrop=function(e){e.preventDefault();z.classList.remove('over');addFiles(e.dataTransfer.files)};
edc.addEventListener('click',function(){if(!L.length&&tool==='transform')$('fg').click()});
/* add-layer popup */
var menu=$('addMenu');
$('addBtn').onclick=function(e){e.stopPropagation();if(!menu.classList.contains('hide')){menu.classList.add('hide');return}var r=this.getBoundingClientRect(),pr=menu.offsetParent?menu.offsetParent.getBoundingClientRect():{left:0,top:0};menu.style.left=Math.min(r.left,innerWidth-210)+'px';menu.style.top=(r.bottom+6)+'px';menu.style.position='fixed';menu.classList.remove('hide')};
document.addEventListener('click',function(){menu.classList.add('hide')});
menu.onclick=function(e){var b=e.target.closest('[data-add]');if(!b)return;var a=b.dataset.add;menu.classList.add('hide');
  if(a==='shape'){addShape();setTool('transform');edPop(true)}else if(a==='draw')addDraw();else if(a==='image')$('fg').click();else if(a==='vec'){addVec();selPt=-1;setTool('vector');sync();draw()}else{addText();setTool('text')}};
var ICON={shape:'■',image:'▣',text:'T',draw:'✎',vec:'◇'};
var delArm=0,delT=0,ltT=0,ltL=null,teEl=null;
var EYE='<svg viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',EYEOFF='<svg viewBox="0 0 24 24"><path d="M3 3l18 18"/><path d="M10.6 6.1A9.6 9.6 0 0112 5c6 0 10 7 10 7a17 17 0 01-3.2 3.9M6.6 7.6C4 9.3 2 12 2 12s4 7 10 7c1.6 0 3-.4 4.2-1"/></svg>',CLIP='<svg viewBox="0 0 24 24"><path d="M5 4v7a3 3 0 003 3h8"/><path d="M13 10l4 4-4 4"/></svg>',TRASH='<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>';
function selRowHTML(){if(!hasSel)return'';return'<div class="ly selrow" data-sel="1"><button class="ic" data-a="selvis" aria-label="Show or hide selection" title="Show or hide selection">'+(selVis?EYE:EYEOFF)+'</button><span class="nm">▨ Selection <small style="opacity:.7">tools paint inside it</small></span><button class="ic" data-a="seldesel" aria-label="Deselect" title="Deselect (the selection layer cannot be deleted)"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="1.5" stroke-dasharray="3 3"/><path d="M8 8l8 8M16 8l-8 8"/></svg></button></div>'}
function renderList(){
  var h='';
  for(var i=L.length-1;i>=0;i--){var l=L[i];if(l.float)continue;
    h+='<div class="ly'+(i===act?' on':'')+(l.clip?' clipd':'')+'" data-i="'+i+'"><button class="ic" data-a="vis" aria-label="Show or hide" title="Show or hide">'+(l.vis?EYE:EYEOFF)+'</button><span class="nm">'+ICON[l.type]+' '+esc(l.name)+'</span><button class="ic'+(l.clip?' on':'')+'" data-a="clip" aria-label="Clipping mask" title="Clip to the layer below"'+(i===0?' disabled':'')+'>'+CLIP+'</button><span class="gh" data-a="grab" aria-label="Drag to reorder" title="Drag to reorder">⠿</span><button class="ic'+(delArm===l.id?' arm':'')+'" data-a="del" aria-label="Delete layer" title="Delete layer">'+(delArm===l.id?'Delete?':TRASH)+'</button></div>';
  }
  $('list').innerHTML=selRowHTML()+h||'<p class="hint" style="margin:0">No layers yet. Use + Add layer.</p>';
  var ch='';for(var q=L.length-1;q>=0;q--){var l2=L[q];if(l2.float)continue;ch+='<button class="chip'+(q===act?' on':'')+(l2.vis?'':' off')+'" data-i="'+q+'">'+(l2.clip?'↳ ':'')+ICON[l2.type]+' '+esc(l2.name)+'</button>'}$('lchips').innerHTML=ch;
  $('edHint').classList.toggle('hide',L.length>0);
  $('zip').disabled=$('folder').disabled=!L.length;
  if(L.length)$('msg').textContent='Ready.';
  edc.style.cursor=!L.length&&tool==='move'?'pointer':(tool==='move'?(G('aMove')?'grab':'default'):'crosshair');
}
$('list').onclick=function(e){
  var row=e.target.closest('.ly');if(!row)return;
  if(row.dataset.sel){var tb0=e.target.closest('[data-a]'),a0=tb0&&tb0.getAttribute('data-a');if(a0==='seldesel')$('slClr').onclick();else if(a0==='selvis'){selVis=!selVis;renderList();draw()}return}var i=+row.dataset.i,tb=e.target.closest('[data-a]'),a=tb&&tb.getAttribute('data-a');if(a==='grab'||(tb&&tb.disabled))return;
  if(a==='vis')L[i].vis=!L[i].vis;
  else if(a==='clip'){if(i>0)L[i].clip=!L[i].clip}
  else if(a==='del'){var lid=L[i].id;if(delArm!==lid){delArm=lid;clearTimeout(delT);delT=setTimeout(function(){delArm=0;renderList()},2600);renderList();return}delArm=0;L.splice(i,1);if(act>=i)act=Math.min(act-(act>i?1:0),L.length-1)}
  else if(a==='up'&&i<L.length-1){var t=L[i];L[i]=L[i+1];L[i+1]=t;act=i+1}
  else if(a==='dn'&&i>0){var t2=L[i];L[i]=L[i-1];L[i-1]=t2;act=i-1}
  else{selectLayer(i);opOpen()}
  selPt=-1;refresh();commit();
};
var lg=null;
$('list').addEventListener('pointerdown',function(e){var h=e.target.closest('.gh');if(!h)return;e.preventDefault();var row=h.closest('.ly');lg={from:+row.dataset.i,to:+row.dataset.i};row.classList.add('dragging');h.setPointerCapture(e.pointerId)});
$('list').addEventListener('pointermove',function(e){if(!lg)return;var el=document.elementFromPoint(e.clientX,e.clientY),r=el&&el.closest&&el.closest('.ly');[].forEach.call($('list').children,function(x){x.classList.remove('over')});if(r&&$('list').contains(r)){lg.to=+r.dataset.i;r.classList.add('over')}});
function lend(){if(!lg)return;var g=lg;lg=null;if(g.to!==g.from){var it=L.splice(g.from,1)[0];L.splice(g.to,0,it);act=g.to;selPt=-1;refresh();commit()}else renderList()}
$('list').addEventListener('pointerup',lend);$('list').addEventListener('pointercancel',lend);
var P={op:'op',scale:'scale',posX:'x',posY:'y',hue:'hue'};
Object.keys(P).forEach(function(id){$(id).oninput=function(){var l=cur();if(!l)return;l[P[id]]=+this.value;$(id+'V').textContent=Math.round(this.value*10)/10;draw()};$(id).onchange=commit});
function snapRot(v){v=((v%360)+360)%360;if(G('rSnap')){var s=STEPS[si];v=Math.round(v/s)*s%360}return v}
$('rot').oninput=function(){var l=cur();if(!l)return;l.rot=snapRot(+this.value);sync();draw()};$('rot').onchange=commit;
function stepUI(){$('rStepV').textContent=STEPS[si]+'°'}
$('rMinus').onclick=function(){si=Math.max(0,si-1);stepUI()};$('rPlus').onclick=function(){si=Math.min(STEPS.length-1,si+1);stepUI()};
$('rOn').onchange=function(){$('rot').disabled=!this.checked};
/* vector controls */
function vl(){var l=cur();return l&&l.type==='vec'?l:null}
var rtype='line',selVis=true,selShown=false,mdrag=null,pinchOn=false;
var clipObj=null,rul=null,rdrag=false,gradS,gradT,gradB,gradV,bkH={grad:{on:false,c2:'#ffd400',ang:90,rad:false}};
var vsmo={x:200,y:200},vcur={x:200,y:200},vraw={x:200,y:200},pad=null,lastMv=null;
function snapPt(p,ex,lyr){var r={x:p.x,y:p.y,s:false};if(!$('vSnap').checked)return r;var best=16/view.z;
  L.forEach(function(l){if(l.type!=='vec'||!l.vis)return;l.pts.forEach(function(q,i){if(l===lyr&&i===ex)return;var a=toArt(l,q),d=Math.hypot(a.x-p.x,a.y-p.y);if(d<best){best=d;r={x:a.x,y:a.y,s:true}}})});if(!r.s&&G('gShow')){var gn=+$('gDiv').value,gs=400/gn,gx=Math.round(p.x/gs)*gs,gy=Math.round(p.y/gs)*gs;if(Math.hypot(gx-p.x,gy-p.y)<16/view.z)r={x:gx,y:gy,s:true}}return r}
function padXY(){var l=vl(),sp=l&&l.pts[selPt],a=vcur;$('vXY').textContent='X '+Math.round(a.x)+' · Y '+Math.round(a.y)}
function pickCur(){var l=vl();if(!l)return;HR=22;selPt=vhit(l,vcur);sync();draw()}
function grabAt(){var l=vl();if(!l)return null;HR=22;var hh=hhit(l,vcur);if(hh)return{i:selPt,h:hh};var h=vhit(l,vcur);if(h>=0){selPt=h;sync();draw();return{i:h}}return null}
function addPt(kind){var l=vl()||addVec(),q=toLoc(l,snapPt(vcur));if(kind==='corner')q.c=true;l.pts.push(q);selPt=l.pts.length-1;sync();draw();commit()}
$('vSm').oninput=function(){var l=vl();$('vSmV').textContent=this.value;if(l){l.smooth=this.value/100;draw()}};
$('vSmoothLine').onchange=function(){var l=vl();if(l){l.smoothLine=this.checked;draw();commit()}};
$('vW').oninput=function(){var l=vl();$('vWV').textContent=this.value;if(l){l.width=+this.value;draw()}};
$('vStroke').oninput=function(){var l=vl();if(l){l.stroke=this.value;draw()}};
$('vFill').oninput=function(){var l=vl();if(l){l.fill=this.value;draw()}};
$('vFillOn').onchange=function(){var l=vl();if(l){l.fillOn=this.checked;if(this.checked&&!l.closed){l.closed=true}sync();draw();commit()}};
['vSm','vW','vStroke','vFill'].forEach(function(i){$(i).addEventListener('change',commit)});
$('vClose').onchange=function(){var l=vl();if(l){l.closed=this.checked;sync();draw();commit()}};
$('vDel').onclick=function(){var l=vl();if(l&&selPt>=0){l.pts.splice(selPt,1);selPt=-1;sync();draw();commit()}};
function tl2(){var l=cur();return l&&l.type==='text'?l:null}
function applySt(prop,val,tog,nc){var l=tl2();if(!l)return;l.st=l.st||[];var a=$('tText'),s0=a.selectionStart,e0=a.selectionEnd,k;if(s0===e0){s0=0;e0=l.text.length}
  for(k=s0;k<e0;k++)if(!l.st[k])l.st[k]={};
  if(tog){var all=e0>s0;for(k=s0;k<e0;k++)if(!l.st[k][prop])all=false;val=!all}
  for(k=s0;k<e0;k++){if(val)l.st[k][prop]=val;else delete l.st[k][prop]}draw();if(!nc)commit()}
$('tText').oninput=function(){var l=tl2();if(!l)return;var a=l.text,b=this.value,i=0;while(i<a.length&&i<b.length&&a[i]===b[i])i++;var j=0;while(j<a.length-i&&j<b.length-i&&a[a.length-1-j]===b[b.length-1-j])j++;var st=l.st||[],base=st[i-1]||st[i]||{},mid=[];for(var k=0;k<b.length-i-j;k++)mid.push(JSON.parse(JSON.stringify(base)));l.st=st.slice(0,i).concat(mid,st.slice(a.length-j));l.text=b;l.name=(b.split('\n')[0]||'Text').slice(0,18);renderList();draw()};
$('tText').onchange=commit;
[].forEach.call(document.querySelectorAll('[data-ts]'),function(b){b.onpointerdown=function(e){e.preventDefault()};b.onclick=function(){applySt(b.dataset.ts,true,true)}});
$('tCol').oninput=function(){applySt('c',this.value,false,true)};$('tBg').oninput=function(){applySt('bg',this.value,false,true)};$('tCol').onchange=$('tBg').onchange=commit;
$('tBgOff').onclick=function(){applySt('bg','',false)};
$('tFont').onchange=function(){applySt('f',this.value,false)};
[].forEach.call($('tAl').children,function(b){b.onclick=function(){var l=tl2();if(l){l.align=b.dataset.al;sync();draw();commit()}}});
$('tOw').oninput=function(){var l=tl2();if(l){l.ow=+this.value;$('tOwV').textContent=this.value;draw()}};$('tOc').oninput=function(){var l=tl2();if(l){l.oc=this.value;draw()}};
['tOw','tOc'].forEach(function(i){$(i).addEventListener('change',commit)});
function aabb(l){var bb=bnd(l);if(!bb)return null;var d=dims(l,400,400),r=d.rot*Math.PI/180,c=Math.cos(r),s=Math.sin(r),xs=[],ys=[];[[bb.x0,bb.y0],[bb.x1,bb.y0],[bb.x1,bb.y1],[bb.x0,bb.y1]].forEach(function(q){xs.push(d.cx+q[0]*c-q[1]*s);ys.push(d.cy+q[0]*s+q[1]*c)});return{x0:Math.min.apply(0,xs),x1:Math.max.apply(0,xs),y0:Math.min.apply(0,ys),y1:Math.max.apply(0,ys),bw:bb.x1-bb.x0,bh:bb.y1-bb.y0}}
function align(m){var l=cur();if(!l)return;var b=aabb(l);if(!b)return;
  if(m==='full'||m==='fit'){if(m==='full'&&(l.type==='image'||l.type==='shape'||l.type==='vec')){l.rot=0;l.sx=clamp((l.sx||1)*400/b.bw,.05,8);l.sy=clamp((l.sy||1)*400/b.bh,.05,8)}else{l.scale=clamp(Math.round(l.scale*Math.min(400/(b.x1-b.x0),400/(b.y1-b.y0))),10,300)}b=aabb(l);var d0=dims(l,400,400);l.x+=(200-(b.x0+b.x1)/2)/4;l.y+=(200-(b.y0+b.y1)/2)/4}
  else{var dx=0,dy=0;if(m==='l')dx=-b.x0;else if(m==='r')dx=400-b.x1;else if(m==='ch')dx=200-(b.x0+b.x1)/2;else if(m==='t')dy=-b.y0;else if(m==='b')dy=400-b.y1;else if(m==='cv')dy=200-(b.y0+b.y1)/2;l.x+=dx/4;l.y+=dy/4}
  sync();draw();commit()}
[].forEach.call($('algrid').children,function(b){b.onclick=function(){align(b.dataset.a2)}});
$('tfLink').onclick=function(){var l=tfl();if(!l||l.type!=='shape')return;l.unlink=!l.unlink;if(l.unlink&&!l.rads)l.rads=[l.radius,l.radius,l.radius,l.radius];sync();draw();commit()};
[0,1,2,3].forEach(function(i){$('tfR'+i).oninput=function(){var l=tfl();if(l){l.rads=l.rads||[l.radius,l.radius,l.radius,l.radius];l.rads[i]=+this.value;$('tfR'+i+'V').textContent=this.value;draw()}};$('tfR'+i).addEventListener('change',commit)});
function tfl(){var l=cur();return l&&(l.type==='shape'||l.type==='vec')?l:null}
$('tfKind').onchange=function(){var l=tfl();if(l){l.kind=this.value;draw();commit()}};
$('tfFill').oninput=function(){var l=tfl();if(l){l.fill=this.value;l.fillOn=true;if(l.type==='vec')l.closed=true;draw()}};$('tfFill').onchange=function(){sync();commit()};
$('tfStroke').oninput=function(){var l=tfl();if(l){l.stroke=this.value;draw()}};
$('tfW').oninput=function(){var l=tfl();if(l){l.width=+this.value;$('tfWV').textContent=this.value;draw()}};
$('tfR').oninput=function(){var l=tfl();if(l){l.radius=+this.value;$('tfRV').textContent=this.value;draw()}};
['tfStroke','tfW','tfR'].forEach(function(i){$(i).addEventListener('change',commit)});
function sync(){mshSync();var fd=$('floatDone');if(fd){var cl0=cur();fd.hidden=!(cl0&&cl0.float)}

  var l=cur();$('props').classList.toggle('dis',!l);if(!l){$('tfProps').classList.add('hide');$('edText').classList.add('hide');return}
  [['op',l.op],['scale',l.scale],['posX',l.x],['posY',l.y],['hue',l.hue],['rot',l.rot]].forEach(function(p){$(p[0]).value=p[1];var v=$(p[0]+'V');if(v)v.textContent=Math.round(p[1]*10)/10});
  $('rowHue').classList.toggle('hide',l.type!=='image');$('edText').classList.toggle('hide',l.type!=='text');var ts=l.type==='shape'||l.type==='vec';$('tfProps').classList.toggle('hide',!ts);$('tfKind').classList.toggle('hide',l.type!=='shape');$('tfRL').classList.toggle('hide',l.type!=='shape');if(ts){$('tfFill').value=l.fill;$('tfStroke').value=l.stroke;$('tfW').value=l.width;$('tfWV').textContent=l.width;if(l.type==='shape'){$('tfKind').value=l.kind;$('tfR').value=l.radius;$('tfRV').textContent=l.radius;var ul=!!l.unlink;$('tfLink').setAttribute('aria-pressed',!ul);$('tfLink').textContent=ul?'Unlinked':'Linked';$('tfRone').classList.toggle('hide',ul);$('tfRfour').classList.toggle('hide',!ul);var r4=l.rads||[l.radius,l.radius,l.radius,l.radius];for(var ri=0;ri<4;ri++){$('tfR'+ri).value=r4[ri];$('tfR'+ri+'V').textContent=r4[ri]}}}
  if(l.type==='text'){var tx=$('tText');if(document.activeElement!==tx)tx.value=l.text;$('tFont').value=l.font;$('tCol').value=l.color;$('tOw').value=l.ow||0;$('tOwV').textContent=l.ow||0;$('tOc').value=l.oc||'#000000';[].forEach.call($('tAl').children,function(b){b.setAttribute('aria-pressed',b.dataset.al===(l.align||'center'))})}
  if(gradS){gradS.sync();gradT.sync();gradV.sync()}
  if(l.type==='vec'){$('vDashOn').checked=!!l.dashOn;$('vDash').value=l.dash||3;$('vDashV').textContent=l.dash||3;$('vGap').value=l.gap||2;$('vGapV').textContent=l.gap||2;$('vArS').value=l.arS||'none';$('vArE').value=l.arE||'none';$('vArZ').value=l.arZ||3;$('vArZV').textContent=l.arZ||3;[].forEach.call($('vJoin').children,function(b){b.setAttribute('aria-pressed',b.dataset.join===(l.join||'round'))});$('vSm').value=l.smooth*100;$('vSmV').textContent=Math.round(l.smooth*100);$('vSmoothLine').checked=l.smoothLine!==false;$('vW').value=l.width;$('vWV').textContent=l.width;$('vStroke').value=l.stroke;$('vFill').value=l.fill;$('vFillOn').checked=l.fillOn;
    $('vClose').checked=!!l.closed;var sp=l.pts[selPt],n=l.pts.length,ty=!sp?'':sp.c?'corner':(sp.hx!==undefined&&l.smoothLine!==false?'free':'smooth');$('vDel').disabled=!sp;[].forEach.call($('vPT').children,function(b){b.disabled=!sp;b.setAttribute('aria-pressed',b.dataset.pt===ty)});[].forEach.call($('vCap').children,function(b){b.setAttribute('aria-pressed',b.dataset.cap===(l.cap||'round'))});$('vPrev').disabled=$('vNext').disabled=!n;$('vIdx').textContent=(sp?selPt+1:'–')+'/'+n;padXY()}
}
function setPos(x,y){var l=cur();if(!l)return;l.x=x;l.y=y;sync();draw();commit()}
$('ctr').onclick=function(){setPos(0,0)};

/* tools + dock */
function setTool(t){if(t!=='transform'&&t!=='text')bakeFloat();tool=t;if(t==='vector'&&!vl()){var ev=-1;for(var q=L.length-1;q>=0;q--)if(L[q].type==='vec'&&!L[q].pts.length){ev=q;break}if(ev>=0){act=ev;selPt=-1}else addVec()}vhint();$('dkTop').classList.remove('hide');[].forEach.call(document.querySelectorAll('[data-t]'),function(x){x.setAttribute('aria-pressed',x.dataset.t===t)});['brush','eraser','vector','text','bucket','veraser','transform','select','ruler'].forEach(function(k){$('g-'+k).classList.toggle('hide',k!==t)});$('fitBtn').style.display=t==='transform'?'flex':'none';showTab('tool',true);renderList();sync();draw()}
[].forEach.call(document.querySelectorAll('[data-t]'),function(b){b.onclick=function(){setTool(b.dataset.t)}});
[].forEach.call($('pm').children,function(b){b.onclick=function(){pm=b.dataset.pm;[].forEach.call($('pm').children,function(x){x.setAttribute('aria-pressed',x===b)})}});
[].forEach.call($('vModeSel').children,function(b){b.onclick=function(){vm=b.dataset.vm;vhint();[].forEach.call($('vModeSel').children,function(x){x.setAttribute('aria-pressed',x===b)})}});
[['bSize'],['bOp'],['bSm'],['eSize'],['bkTol'],['veSize']].forEach(function(a){var i=a[0];$(i).oninput=function(){$(i+'V').textContent=this.value}});
function zoomTo(v){view.z=clamp(v,.5,8);if(Math.abs(view.z-1)<.04)view.z=1;hudOn(900);$('zV').textContent=Math.round(view.z*100)+'%';draw()}
$('zIn').onclick=function(){zoomTo(view.z*1.25)};$('zOut').onclick=function(){zoomTo(view.z/1.25)};$('zFit').onclick=function(){view={z:1,x:0,y:0,r:0};$('zV').textContent='100%';draw()};

/* background + shape */
$('bgColor').oninput=function(){$('bgHex').value=this.value;draw()};
$('bgHex').oninput=function(){if(/^#[0-9a-f]{6}$/i.test(this.value)){$('bgColor').value=this.value;draw()}};
function setBg(f){loadImg(f,function(im){st.bgImg=im;$('bgThumb').src=im.src;$('bgThumb').classList.remove('hide');$('bgHint').classList.add('hide');$('bgDrop').classList.add('has');draw()})}
$('bgImg').onchange=function(){if(this.files[0])setBg(this.files[0])};
var bd=$('bgDrop');bd.ondragover=function(e){e.preventDefault()};bd.ondrop=function(e){e.preventDefault();var f=e.dataTransfer.files[0];if(f&&/^image\//.test(f.type))setBg(f)};
function seg(id,attr,key){[].forEach.call($(id).children,function(b){b.onclick=function(){[].forEach.call($(id).children,function(x){x.setAttribute('aria-pressed',x===b)});st[key]=b.getAttribute(attr);if(key==='mode'){$('bgColorBox').classList.toggle('hide',st.mode!=='color'&&st.mode!=='dots');$('bgDotBox').classList.toggle('hide',st.mode!=='dots');$('bgImgBox').classList.toggle('hide',st.mode!=='image')}draw()}})}
seg('bgMode','data-m','mode');seg('shape','data-s','shape');

/* guides */
function cl(v){return clamp(Math.round(v*10)/10,-50,50)}
function snapPos(x,y){
  if(G('gSnap')){var s=100/(+$('gDiv').value);x=Math.round((x+50)/s)*s-50;y=Math.round((y+50)/s)*s-50}
  
  return [cl(x),cl(y)];
}
function apply(){var mv=G('aMove');$('posX').disabled=$('posY').disabled=!mv;$('scale').disabled=!G('aScale');renderList();draw()}
['gShow','gSnap','sSafe','aMove','aScale'].forEach(function(i){$(i).addEventListener('change',apply)});
$('gDiv').addEventListener('input',function(){$('gDivV').textContent=this.value;$('gDivW').textContent=this.value;draw()});
['oRound','oAdapt','oStore','path'].forEach(function(i){$(i).addEventListener('input',tree)});

/* rendering */
function maskPath(c,s,shape){
  c.beginPath();
  if(shape==='circle')c.arc(s/2,s/2,s/2,0,Math.PI*2);
  else if(shape==='squircle'){for(var i=0;i<=96;i++){var a=i/96*Math.PI*2,co=Math.cos(a),sn=Math.sin(a),px=s/2+s/2*Math.sign(co)*Math.sqrt(Math.abs(co)),py=s/2+s/2*Math.sign(sn)*Math.sqrt(Math.abs(sn));i?c.lineTo(px,py):c.moveTo(px,py)}c.closePath()}
  else if(shape==='hexagon'||shape==='octagon'||shape==='diamond'||shape==='star'){var HP=shape==='hexagon'?[[.5,0],[.933,.25],[.933,.75],[.5,1],[.067,.75],[.067,.25]]:shape==='octagon'?[[.29,0],[.71,0],[1,.29],[1,.71],[.71,1],[.29,1],[0,.71],[0,.29]]:shape==='diamond'?[[.5,0],[1,.5],[.5,1],[0,.5]]:starPts().map(function(q){return[q[0],q[1]*1.1]});rpoly(c,HP.map(function(q){return[q[0]*s,q[1]*s]}),s*(+$('mRad').value)/100*.3)}
  else if(shape==='teardrop'){c.moveTo(s/2,s);c.lineTo(0,s);c.lineTo(0,s/2);c.arc(s/2,s/2,s/2,Math.PI,Math.PI*2.5,false);c.closePath()}
  else if(shape==='rounded'){var r=s*(+$('mRad').value)/100;c.moveTo(r,0);c.arcTo(s,0,s,s,r);c.arcTo(s,s,0,s,r);c.arcTo(0,s,0,0,r);c.arcTo(0,0,s,0,r);c.closePath()}
  else c.rect(0,0,s,s);
}
function paintBg(c,s){
  if(st.mode==='color'){c.fillStyle=$('bgColor').value;c.fillRect(0,0,s,s)}
  else if(st.mode==='dots'){c.fillStyle=$('bgColor').value;c.fillRect(0,0,s,s);var dn=+$('bgDotN').value,dst=s/dn,dr=dst*(+$('bgDotS').value)/200;c.fillStyle=$('bgDotC').value;for(var gy=0;gy<dn;gy++)for(var gx=0;gx<dn;gx++){c.beginPath();c.arc((gx+.5)*dst,(gy+.5)*dst,dr,0,7);c.fill()}}
  else if(st.mode==='image'&&st.bgImg){var im=st.bgImg,k=Math.max(s/im.width,s/im.height),w=im.width*k,h=im.height*k;c.drawImage(im,(s-w)/2,(s-h)/2,w,h)}
}
function hueShift(src,deg){
  var w=src.width,h=src.height,x=src.getContext('2d'),id=x.getImageData(0,0,w,h),d=id.data,a=deg*Math.PI/180,cs=Math.cos(a),sn=Math.sin(a);
  var m=[.213+cs*.787-sn*.213,.715-cs*.715-sn*.715,.072-cs*.072+sn*.928,.213-cs*.213+sn*.143,.715+cs*.285+sn*.140,.072-cs*.072-sn*.283,.213-cs*.213-sn*.787,.715-cs*.715+sn*.715,.072+cs*.928+sn*.072];
  for(var i=0;i<d.length;i+=4){var r=d[i],g=d[i+1],b=d[i+2];d[i]=r*m[0]+g*m[1]+b*m[2];d[i+1]=r*m[3]+g*m[4]+b*m[5];d[i+2]=r*m[6]+g*m[7]+b*m[8]}
  x.putImageData(id,0,0);return src;
}
function dims(l,s,art){
  var cx=s/2+art*l.x/100,cy=s/2+art*l.y/100,k=l.scale/100,sx=l.sx||1,sy=l.sy||1,w,h;
  if(l.type==='draw'){w=h=art*k}else if(l.type==='image'){var m=art*.72*k,q=Math.min(m/l.cv.width,m/l.cv.height);w=l.cv.width*q;h=l.cv.height*q}else if(l.type==='shape'){w=h=art*.5*k}
  if(l.type==='image'||l.type==='shape'){w*=sx;h*=sy}
  return{cx:cx,cy:cy,w:w,h:h,k:k,kx:k*sx,ky:k*sy,rot:l.rot||0};
}
function textLay(c,l,fs){var st=l.st||[],pos=0,out=[];
  l.text.split('\n').forEach(function(line){var runs=[],w=0,cu=null;
    for(var k=0;k<line.length;k++){var s=st[pos+k]||{},key=[s.b,s.i,s.u,s.c,s.f,s.bg].join('|');if(!cu||cu.key!==key){cu={key:key,t:'',s:s};runs.push(cu)}cu.t+=line[k]}
    runs.forEach(function(r){var s=r.s;r.font=(s.i?'italic ':'')+(s.b?'bold ':'')+fs+'px '+(s.f||l.font);c.font=r.font;r.w=c.measureText(r.t).width;w+=r.w});
    pos+=line.length+1;out.push({runs:runs,w:w})});
  return out}
function textDraw(c,l,fs){var ls=textLay(c,l,fs),lh=fs*1.15,al=l.align||'center',W=Math.max.apply(0,ls.map(function(x){return x.w}).concat([1]));c.textBaseline='middle';c.textAlign='left';
  ls.forEach(function(ln,i){var y=(i-(ls.length-1)/2)*lh,x=al==='left'?-W/2:al==='right'?W/2-ln.w:-ln.w/2;
    ln.runs.forEach(function(r){var s=r.s;c.font=r.font;if(s.bg){c.fillStyle=s.bg;c.fillRect(x,y-lh/2,r.w,lh)}
      if(l.ow>0){c.lineWidth=l.ow*fs/20;c.lineJoin='round';c.strokeStyle=l.oc||'#000000';c.strokeText(r.t,x,y)}
      c.fillStyle=s.c||gradFill(c,l,{x:-W/2,y:-ls.length*lh/2,w:W,h:ls.length*lh})||l.color;c.fillText(r.t,x,y);if(s.u)c.fillRect(x,y+fs*.4,r.w,Math.max(1,fs/14));x+=r.w})})}
function starPts(){var o=[];for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5,r=i%2?.21:.5;o.push([.5+Math.cos(a)*r,.5+Math.sin(a)*r])}return o}
function rpoly(c,P,r){var n=P.length;for(var i=0;i<n;i++){var a=P[(i+n-1)%n],b=P[i],e=P[(i+1)%n],v1x=a[0]-b[0],v1y=a[1]-b[1],v2x=e[0]-b[0],v2y=e[1]-b[1],l1=Math.hypot(v1x,v1y)||1,l2=Math.hypot(v2x,v2y)||1,ang=Math.acos(Math.max(-1,Math.min(1,(v1x*v2x+v1y*v2y)/(l1*l2)))),t=Math.tan(ang/2)||1e-6,rr=Math.min(r,Math.min(l1,l2)*.5*t),s1=[b[0]+v1x/l1*rr/t,b[1]+v1y/l1*rr/t],s2=[b[0]+v2x/l2*rr/t,b[1]+v2y/l2*rr/t];i?c.lineTo(s1[0],s1[1]):c.moveTo(s1[0],s1[1]);c.arcTo(b[0],b[1],s2[0],s2[1],rr)}c.closePath()}
function shapeDraw(c,l,d){var w=d.w,h=d.h,x=-w/2,y=-h/2,k=l.kind,m=Math.min(w,h);c.beginPath();
 if(k==='ellipse')c.ellipse(0,0,w/2,h/2,0,0,7);
 else if(k==='rect'){var R=l.unlink&&l.rads?l.rads:[l.radius||0,l.radius||0,l.radius||0,l.radius||0],r=R.map(function(v){return Math.min(m/2,m*v/100)});
  c.moveTo(x+r[0],y);c.lineTo(x+w-r[1],y);r[1]?c.arcTo(x+w,y,x+w,y+r[1],r[1]):c.lineTo(x+w,y);c.lineTo(x+w,y+h-r[2]);r[2]?c.arcTo(x+w,y+h,x+w-r[2],y+h,r[2]):c.lineTo(x+w,y+h);c.lineTo(x+r[3],y+h);r[3]?c.arcTo(x,y+h,x,y+h-r[3],r[3]):c.lineTo(x,y+h);c.lineTo(x,y+r[0]);r[0]?c.arcTo(x,y,x+r[0],y,r[0]):c.lineTo(x,y);c.closePath()}
 else{var P=(k==='triangle'?[[.5,0],[1,1],[0,1]]:k==='diamond'?[[.5,0],[1,.5],[.5,1],[0,.5]]:k==='hexagon'?[[.5,0],[1,.25],[1,.75],[.5,1],[0,.75],[0,.25]]:starPts()).map(function(q){return[x+q[0]*w,y+q[1]*h]});rpoly(c,P,m*(l.radius||0)/100)}
 if(l.fillOn!==false){c.fillStyle=gradFill(c,l,{x:x,y:y,w:w,h:h})||l.fill;c.fill()}if(l.width>0){c.lineWidth=l.width*d.k;c.lineJoin='round';c.strokeStyle=l.stroke;c.stroke()}}

function tang(l,i){var p=l.pts,n=p.length,q=p[i],a,b;if(q.c)return{x:0,y:0};if(q.hx!==undefined)return{x:q.hx,y:q.hy};
  if(l.closed){a=p[(i-1+n)%n];b=p[(i+1)%n]}else{a=i?p[i-1]:q;b=i<n-1?p[i+1]:q}
  var k=(l.smooth==null?.5:l.smooth)/3;return{x:(b.x-a.x)*k,y:(b.y-a.y)*k}}
function vecPath(c,l){
  var p=l.pts,n=p.length;if(!n)return false;c.beginPath();c.moveTo(p[0].x,p[0].y);
  if(n===1){c.lineTo(p[0].x+.01,p[0].y);return true}
  var segs=l.closed?n:n-1;
  for(var i=0;i<segs;i++){
    var j=(i+1)%n,a=p[i],b=p[j];
    if(l.smoothLine===false)c.lineTo(b.x,b.y);
    else{var ta=tang(l,i),tb=tang(l,j);c.bezierCurveTo(a.x+ta.x,a.y+ta.y,b.x-tb.x,b.y-tb.y,b.x,b.y)}
  }
  if(l.closed)c.closePath();return true;
}
function gradFill(c,l,b){var g=l.grad;if(!g||!g.on)return null;var cx=b.x+b.w/2,cy=b.y+b.h/2,a=g.ang*Math.PI/180,co=Math.cos(a),si=Math.sin(a),R=Math.abs(b.w/2*co)+Math.abs(b.h/2*si)||1,gr;
  if(g.rad)gr=c.createRadialGradient(cx,cy,0,cx,cy,Math.max(b.w,b.h)/2||1);else gr=c.createLinearGradient(cx-co*R,cy-si*R,cx+co*R,cy+si*R);
  gr.addColorStop(0,l.type==='text'?l.color:l.fill);gr.addColorStop(1,g.c2);return gr}
function vbox(l){var a=1e9,b=1e9,c=-1e9,e=-1e9;l.pts.forEach(function(q){a=Math.min(a,q.x);b=Math.min(b,q.y);c=Math.max(c,q.x);e=Math.max(e,q.y)});return a===1e9?{x:0,y:0,w:1,h:1}:{x:a,y:b,w:Math.max(1,c-a),h:Math.max(1,e-b)}}
function arrowHead(c,l,end){var kind=end?l.arE:l.arS;if(!kind||kind==='none'||l.pts.length<2)return;var p=l.pts,n=p.length,q=end?p[n-1]:p[0],t=tang(l,end?n-1:0),dx,dy;
  if(l.smoothLine!==false&&Math.hypot(t.x,t.y)>1e-3){dx=end?t.x:-t.x;dy=end?t.y:-t.y}else{var o=end?p[n-2]:p[1];dx=q.x-o.x;dy=q.y-o.y}
  var m=Math.hypot(dx,dy)||1;dx/=m;dy/=m;var nx=-dy,ny=dx,S=Math.max(6,l.width*(l.arZ||3));c.save();c.setLineDash([]);c.fillStyle=c.strokeStyle=l.stroke;c.lineJoin='round';c.lineCap='round';
  if(kind==='arrow'){c.beginPath();c.moveTo(q.x+dx*S*.6,q.y+dy*S*.6);c.lineTo(q.x-dx*S*.4+nx*S*.5,q.y-dy*S*.4+ny*S*.5);c.lineTo(q.x-dx*S*.4-nx*S*.5,q.y-dy*S*.4-ny*S*.5);c.closePath();c.fill()}
  else if(kind==='open'){c.beginPath();c.moveTo(q.x-dx*S*.4+nx*S*.5,q.y-dy*S*.4+ny*S*.5);c.lineTo(q.x+dx*S*.2,q.y+dy*S*.2);c.lineTo(q.x-dx*S*.4-nx*S*.5,q.y-dy*S*.4-ny*S*.5);c.stroke()}
  else if(kind==='circle'){c.beginPath();c.arc(q.x,q.y,S*.35,0,7);c.fill()}
  else{c.translate(q.x,q.y);c.rotate(Math.atan2(dy,dx));
    if(kind==='square')c.fillRect(-S*.3,-S*.3,S*.6,S*.6);
    else if(kind==='diamond'){c.beginPath();c.moveTo(S*.5,0);c.lineTo(0,S*.35);c.lineTo(-S*.5,0);c.lineTo(0,-S*.35);c.closePath();c.fill()}
    else if(kind==='bar'){c.beginPath();c.moveTo(0,-S*.5);c.lineTo(0,S*.5);c.stroke()}}
  c.restore()}
function meshMk(nx,ny,old){var P=[];for(var j=0;j<=ny;j++)for(var i=0;i<=nx;i++){var u=i/nx,v=j/ny;P.push(old?meshAt(old,u,v):[u,v])}return{nx:nx,ny:ny,pts:P}}
function meshAt(m,u,v){var fx=u*m.nx,fy=v*m.ny,i=Math.min(m.nx-1,Math.floor(fx)),j=Math.min(m.ny-1,Math.floor(fy)),tx=fx-i,ty=fy-j,W=m.nx+1;function g(a,b){return m.pts[b*W+a]}var A=g(i,j),B=g(i+1,j),C=g(i,j+1),D=g(i+1,j+1);return[(A[0]*(1-tx)+B[0]*tx)*(1-ty)+(C[0]*(1-tx)+D[0]*tx)*ty,(A[1]*(1-tx)+B[1]*tx)*(1-ty)+(C[1]*(1-tx)+D[1]*tx)*ty]}
function tri(c,im,s0,s1,s2,d0,d1,d2){var cx=(d0[0]+d1[0]+d2[0])/3,cy=(d0[1]+d1[1]+d2[1])/3;function ex(q){var vx=q[0]-cx,vy=q[1]-cy,n=Math.hypot(vx,vy)||1;return[q[0]+vx/n*.7,q[1]+vy/n*.7]}
  var e0=ex(d0),e1=ex(d1),e2=ex(d2);c.save();c.beginPath();c.moveTo(e0[0],e0[1]);c.lineTo(e1[0],e1[1]);c.lineTo(e2[0],e2[1]);c.closePath();c.clip();
  var x0=s0[0],y0=s0[1],x1=s1[0],y1=s1[1],x2=s2[0],y2=s2[1],u0=d0[0],v0=d0[1],u1=d1[0],v1=d1[1],u2=d2[0],v2=d2[1],den=x0*(y2-y1)-x1*y2+x2*y1+(x1-x2)*y0;if(!den){c.restore();return}
  c.transform(-(y0*(u2-u1)-y1*u2+y2*u1+(y1-y2)*u0)/den,(y1*v2+y0*(v1-v2)-y2*v1+(y2-y1)*v0)/den,(x0*(u2-u1)-x1*u2+x2*u1+(x1-x2)*u0)/den,-(x1*v2+x0*(v1-v2)-x2*v1+(x2-x1)*v0)/den,(x0*(y2*u1-y1*u2)+y0*(x1*u2-x2*u1)+(x2*y1-x1*y2)*u0)/den,(x0*(y2*v1-y1*v2)+y0*(x1*v2-x2*v1)+(x2*y1-x1*y2)*v0)/den);c.drawImage(im,0,0);c.restore()}
function meshDraw(c,im,m,d){var W=im.width,H=im.height,Q=m.nx+1;function D(i,j){var q=m.pts[j*Q+i];return[(q[0]-.5)*d.w,(q[1]-.5)*d.h]}function S(i,j){return[i/m.nx*W,j/m.ny*H]}
  for(var j=0;j<m.ny;j++)for(var i=0;i<m.nx;i++){tri(c,im,S(i,j),S(i+1,j),S(i,j+1),D(i,j),D(i+1,j),D(i,j+1));tri(c,im,S(i+1,j),S(i+1,j+1),S(i,j+1),D(i+1,j),D(i+1,j+1),D(i,j+1))}}
function mshL(){var l=cur();return l&&l.cv&&tool==='transform'&&$('mshOn').checked?l:null}
function mshArt(l,q){var d=dims(l,400,400),R=d.rot*Math.PI/180,x=(q[0]-.5)*d.w,y=(q[1]-.5)*d.h;return{x:d.cx+x*Math.cos(R)-y*Math.sin(R),y:d.cy+x*Math.sin(R)+y*Math.cos(R)}}
function meshStart(p,l){var m=mshL();if(!m)return false;if(!m.mesh)m.mesh=meshMk(+$('mshX').value,+$('mshY').value);var best=-1,bd=HR*1.3/view.z;m.mesh.pts.forEach(function(q,i){var a=mshArt(m,q),dd=Math.hypot(a.x-p.x,a.y-p.y);if(dd<bd){bd=dd;best=i}});if(best<0)return false;mdrag={l:m,i:best,moved:false};return true}
function meshMove(p){var l=mdrag.l,d=dims(l,400,400),R=-d.rot*Math.PI/180,x=p.x-d.cx,y=p.y-d.cy;l.mesh.pts[mdrag.i]=[(x*Math.cos(R)-y*Math.sin(R))/d.w+.5,(x*Math.sin(R)+y*Math.cos(R))/d.h+.5];l.ver=(l.ver||0)+1;mdrag.moved=true;draw();return true}
function meshOverlay(e,lw,acc){var l=mshL();if(!l||!l.mesh)return;var m=l.mesh,Q=m.nx+1;e.save();e.lineWidth=lw*1.5;e.strokeStyle='#ff5a1f';e.beginPath();for(var j=0;j<=m.ny;j++)for(var i=0;i<=m.nx;i++){var a=mshArt(l,m.pts[j*Q+i]);if(i<m.nx){var b=mshArt(l,m.pts[j*Q+i+1]);e.moveTo(a.x,a.y);e.lineTo(b.x,b.y)}if(j<m.ny){var c2=mshArt(l,m.pts[(j+1)*Q+i]);e.moveTo(a.x,a.y);e.lineTo(c2.x,c2.y)}}e.stroke();e.fillStyle='#fff';e.strokeStyle='#ff5a1f';m.pts.forEach(function(q){var a=mshArt(l,q);e.beginPath();e.arc(a.x,a.y,6/view.z,0,7);e.fill();e.stroke()});e.restore()}
function mshSync(){var l=cur(),ok=!!(l&&l.cv);$('mshHint').textContent=ok?($('mshOn').checked?'Drag the orange points to warp the layer.':''):'Select an image or drawing layer for mesh transform.';if(l&&l.mesh){$('mshX').value=l.mesh.nx;$('mshY').value=l.mesh.ny;$('mshXV').textContent=l.mesh.nx;$('mshYV').textContent=l.mesh.ny}}
function drawL(c,l,s,art){
    var d=dims(l,s,art);c.save();c.globalAlpha=l.op/100;c.translate(d.cx,d.cy);c.rotate(d.rot*Math.PI/180);
    if(l.type==='text'){
      textDraw(c,l,art*.2*d.k);
    }else if(l.type==='shape'){shapeDraw(c,l,d)}else if(l.type==='vec'){
      c.scale(d.kx,d.ky);if(vecPath(c,l)){if(l.fillOn&&l.closed){c.fillStyle=gradFill(c,l,vbox(l))||l.fill;c.fill()}c.lineWidth=l.width;c.lineCap=l.cap||'round';c.lineJoin=l.join||'round';c.strokeStyle=l.stroke;if(l.dashOn){var du=l.width;c.setLineDash([(l.dash||3)*du,(l.gap||2)*du])}c.stroke();c.setLineDash([]);if(!l.closed){arrowHead(c,l,0);arrowHead(c,l,1)}}
    }else{
      var src=l.cv;
      if(l.type==='image'&&l.hue){var q=c.getTransform().a||1,t=mk(Math.max(1,Math.round(d.w*q)),Math.max(1,Math.round(d.h*q)));t.getContext('2d').drawImage(src,0,0,t.width,t.height);src=hueShift(t,l.hue)}
      if(l.mesh&&src)meshDraw(c,src,l.mesh,d);else c.drawImage(src,-d.w/2,-d.h/2,d.w,d.h);
    }
    c.restore();
}
function renderLayers(c,s,art){
  for(var i=0;i<L.length;i++){
    var l=L[i],j=i+1;while(j<L.length&&L[j].clip)j++;
    if(j===i+1){if(l.vis)drawL(c,l,s,art);continue}
    if(!l.vis){i=j-1;continue}
    var tc=mk(c.canvas.width,c.canvas.height),tx=tc.getContext('2d');tx.setTransform(c.getTransform());
    drawL(tx,l,s,art);tx.globalCompositeOperation='source-atop';
    for(var k=i+1;k<j;k++)if(L[k].vis)drawL(tx,L[k],s,art);
    c.save();c.setTransform(1,0,0,1,0,0);c.drawImage(tc,0,0);c.restore();i=j-1;
  }
}
function paintArt(c,s,shape){c.save();maskPath(c,s,shape);c.clip();paintBg(c,s);c.restore();renderLayers(c,s,s)}
function legacy(s,shape){var c=mk(s),x=c.getContext('2d');x.imageSmoothingQuality='high';paintArt(x,s,shape);return c}
function adaptFg(s){var c=mk(s),x=c.getContext('2d');x.imageSmoothingQuality='high';renderLayers(x,s,s*72/108);return c}
function adaptBg(s){var c=mk(s),x=c.getContext('2d');paintBg(x,s);return c}

/* overlay */
var vers=null,vchg=false,tfm=null;var sel=mk(400),hasSel=false,selDrag=null;
var pts={},drag=null,paint=null,pinch=null,vdrag=null,raf=0,rub=null,selMove=null;
function toArt(l,p){var d=dims(l,400,400),r=d.rot*Math.PI/180,x=p.x*d.kx,y=p.y*d.ky;return{x:d.cx+x*Math.cos(r)-y*Math.sin(r),y:d.cy+x*Math.sin(r)+y*Math.cos(r)}}
function toLoc(l,p){var d=dims(l,400,400),r=d.rot*Math.PI/180,x=p.x-d.cx,y=p.y-d.cy;return{x:(x*Math.cos(r)+y*Math.sin(r))/d.kx,y:(-x*Math.sin(r)+y*Math.cos(r))/d.ky}}
function overlay(e){
  var lw=.75/view.z,acc=getComputedStyle(root).getPropertyValue('--acc').trim()||'#1f6feb';
  if(G('gShow')){var n=+$('gDiv').value;e.save();e.lineWidth=lw;e.strokeStyle='rgba(128,136,150,'+gA()+')';e.beginPath();for(var i=1;i<n;i++){var p=i*400/n;e.moveTo(p,0);e.lineTo(p,400);e.moveTo(0,p);e.lineTo(400,p)}e.stroke();e.restore()}
  if($('rulerOn')&&$('rulerOn').checked){var rcx=cur();if(rcx){var rd=dims(rcx,400,400);e.save();e.setLineDash([5/view.z,4/view.z]);e.lineWidth=lw*3.4;e.strokeStyle='rgba(0,0,0,.55)';e.beginPath();e.moveTo(rd.cx,0);e.lineTo(rd.cx,400);e.moveTo(0,rd.cy);e.lineTo(400,rd.cy);e.stroke();e.lineWidth=lw*1.6;e.strokeStyle='#ffb300';e.stroke();e.restore()}}
  if(G('sSafe')){e.save();e.globalAlpha=gA();e.setLineDash([7/view.z,5/view.z]);e.lineWidth=lw*2;e.strokeStyle='#ff8a00';e.beginPath();e.arc(200,200,183,0,Math.PI*2);e.stroke();e.restore()}
  if(tool==='veraser'&&vers){e.save();e.lineWidth=lw*1.5;e.strokeStyle='#ff2d95';e.beginPath();e.arc(vers.last.x,vers.last.y,+$('veSize').value,0,7);e.stroke();e.restore()}
  meshOverlay(e,lw,acc);
  if(hasSel||selDrag){e.save();if(hasSel){var tc=mk(400),tx=tc.getContext('2d');tx.drawImage(sel,0,0);tx.globalCompositeOperation='source-in';tx.fillStyle=selVis?'rgba(255,90,31,.38)':'rgba(255,90,31,0)';tx.fillRect(0,0,400,400);e.drawImage(tc,0,0)}if(selDrag){e.lineWidth=lw*1.5;e.setLineDash([5/view.z,4/view.z]);e.strokeStyle='#ff5a1f';selPath(e,selDrag);e.stroke()}e.restore()}
  if(rul){var rx=rul.b.x-rul.a.x,ry=rul.b.y-rul.a.y,rl=Math.hypot(rx,ry),ux0=rx/(rl||1),uy0=ry/(rl||1);e.save();var rcirc=rul.t==='circle';e.lineCap='round';if(rl>1&&!rcirc&&$('rlFollow').checked){e.setLineDash([6/view.z,6/view.z]);e.lineWidth=lw;e.strokeStyle='rgba(255,45,149,.55)';e.beginPath();e.moveTo(rul.a.x-ux0*900,rul.a.y-uy0*900);e.lineTo(rul.a.x+ux0*900,rul.a.y+uy0*900);e.stroke();e.setLineDash([])}
    e.lineWidth=lw*5;e.strokeStyle='rgba(0,0,0,.5)';e.beginPath();if(rcirc)e.arc(rul.a.x,rul.a.y,rl,0,7);else{e.moveTo(rul.a.x,rul.a.y);e.lineTo(rul.b.x,rul.b.y)}e.stroke();e.lineWidth=lw*2.4;e.strokeStyle='#ff2d95';e.beginPath();if(rcirc){e.arc(rul.a.x,rul.a.y,rl,0,7);e.moveTo(rul.a.x,rul.a.y)}else e.moveTo(rul.a.x,rul.a.y);e.lineTo(rul.b.x,rul.b.y);e.stroke();
    if(rl>1&&!rcirc){var ux=rx/rl,uy=ry/rl;e.lineWidth=lw;e.beginPath();for(var rt=0;rt<=rl;rt+=10){var th=rt%50===0?5:2.5,tx=rul.a.x+ux*rt,ty=rul.a.y+uy*rt;e.moveTo(tx-uy*th/view.z,ty+ux*th/view.z);e.lineTo(tx+uy*th/view.z,ty-ux*th/view.z)}e.stroke()}
    e.fillStyle='#ff2d95';[rul.a,rul.b].forEach(function(q){e.beginPath();e.arc(q.x,q.y,4/view.z,0,7);e.fill()});
    var ang=(Math.atan2(-ry,rx)*180/Math.PI+360)%360,txt=(rcirc?'r '+rl.toFixed(1)+' u · ⌀ '+(rl*2).toFixed(1)+' u':rl.toFixed(1)+' u · '+(rl/400*108).toFixed(1)+' dp · '+ang.toFixed(1)+'°');
    e.translate((rul.a.x+rul.b.x)/2,(rul.a.y+rul.b.y)/2);e.rotate(-(view.r||0));var fs=11/view.z;e.font='600 '+fs+'px sans-serif';var tw=e.measureText(txt).width;e.fillStyle='rgba(20,20,28,.85)';e.fillRect(-tw/2-5/view.z,-fs*2.2,tw+10/view.z,fs*1.7);e.fillStyle='#fff';e.textAlign='center';e.textBaseline='middle';e.fillText(txt,0,-fs*1.35);e.restore()}
  if(tool==='vector'&&pad&&!pad.mv){var pr=Math.min(1,(performance.now()-pad.t0)/400),rr2=15/view.z;e.save();e.lineWidth=lw*3;e.strokeStyle='rgba(128,136,150,.5)';e.beginPath();e.arc(vcur.x,vcur.y,rr2,0,7);e.stroke();e.strokeStyle=acc;e.beginPath();e.arc(vcur.x,vcur.y,rr2,-Math.PI/2,-Math.PI/2+pr*Math.PI*2);e.stroke();e.restore()}
  var l=cur();if(!l)return;
  if(tool!=='transform'&&tool!=='vector'){var bq=bnd(l);if(bq){var d=dims(l,400,400);e.save();e.translate(d.cx,d.cy);e.rotate(d.rot*Math.PI/180);e.setLineDash([5/view.z,4/view.z]);e.fillStyle='rgba(31,111,235,.12)';e.fillRect(bq.x0,bq.y0,bq.x1-bq.x0,bq.y1-bq.y0);e.lineWidth=lw*1.8;e.strokeStyle=acc;e.strokeRect(bq.x0,bq.y0,bq.x1-bq.x0,bq.y1-bq.y0);e.restore()}}
  if(tool==='transform'){var bb=bnd(l);if(bb){var dd=dims(l,400,400),rr=dd.rot*Math.PI/180,cr=Math.cos(rr),sr=Math.sin(rr),W=function(x,y){return[dd.cx+x*cr-y*sr,dd.cy+x*sr+y*cr]},
    cs=[W(bb.x0,bb.y0),W(bb.x1,bb.y0),W(bb.x1,bb.y1),W(bb.x0,bb.y1)],tp=W((bb.x0+bb.x1)/2,bb.y0),rh=W((bb.x0+bb.x1)/2,bb.y0-30/view.z);
    e.save();e.lineWidth=lw*1.5;e.strokeStyle=acc;e.beginPath();cs.forEach(function(q,i){i?e.lineTo(q[0],q[1]):e.moveTo(q[0],q[1])});e.closePath();e.fillStyle='rgba(31,111,235,.18)';e.fill();e.setLineDash([7/view.z,4/view.z]);e.lineWidth=lw*2;e.stroke();e.setLineDash([]);e.beginPath();e.moveTo(tp[0],tp[1]);e.lineTo(rh[0],rh[1]);e.stroke();e.fillStyle='#fff';
    cs.concat([rh],hasEdge(l)?[W(bb.x1,(bb.y0+bb.y1)/2),W((bb.x0+bb.x1)/2,bb.y1)]:[]).forEach(function(q){e.beginPath();e.arc(q[0],q[1],6*HR/14/view.z,0,7);e.fill();e.stroke()});e.restore()}}
  if(drag&&drag.l===l&&!drag.pan){e.save();e.lineWidth=lw*2;e.strokeStyle='#ff2d95';e.beginPath();if(l.x===0){e.moveTo(200,0);e.lineTo(200,400)}if(l.y===0){e.moveTo(0,200);e.lineTo(400,200)}e.stroke();e.restore()}
  if(l.type==='vec'&&tool==='vector'){
    var hs=HR/14,sp=l.pts[selPt];e.save();e.lineWidth=lw*1.4;
    if(sp&&l.smoothLine!==false&&!sp.c){var t=tang(l,selPt),A=toArt(l,sp),O=toArt(l,{x:sp.x+t.x,y:sp.y+t.y}),I=toArt(l,{x:sp.x-t.x,y:sp.y-t.y});
      e.strokeStyle=acc;e.beginPath();e.moveTo(I.x,I.y);e.lineTo(O.x,O.y);e.stroke();
      [O,I].forEach(function(h){e.beginPath();e.arc(h.x,h.y,4.5*hs/view.z,0,7);e.fillStyle=acc;e.fill()})}
    l.pts.forEach(function(p,i){var a=toArt(l,p),r=5.5*hs/view.z;e.beginPath();if(p.c)e.rect(a.x-r,a.y-r,r*2,r*2);else e.arc(a.x,a.y,r,0,7);e.fillStyle=i===selPt?acc:'#fff';e.strokeStyle=acc;e.fill();e.stroke()});
    {var cu=snapPt(vcur,pad&&pad.grab?pad.grab.i:-1,l),rr=9*hs/view.z;e.strokeStyle=acc;e.lineWidth=lw*1.4;
      if(vm==='add'&&l.pts.length&&!l.closed){var lq=toArt(l,l.pts[l.pts.length-1]);e.save();e.setLineDash([4/view.z,4/view.z]);e.beginPath();e.moveTo(lq.x,lq.y);e.lineTo(cu.x,cu.y);e.stroke();e.restore()}
      e.beginPath();e.moveTo(cu.x-rr,cu.y);e.lineTo(cu.x+rr,cu.y);e.moveTo(cu.x,cu.y-rr);e.lineTo(cu.x,cu.y+rr);e.stroke();e.beginPath();e.arc(cu.x,cu.y,rr/2.2,0,7);e.stroke();if(cu.s){e.strokeStyle='#ff2d95';e.beginPath();e.arc(cu.x,cu.y,rr*1.4,0,7);e.stroke()}}
    e.restore();
  }
}
function drawRulers(){
  var on=$('rulerOn').checked;$('edwrap').classList.toggle('rl-on',on);if(!on)return;
  var r=edc.getBoundingClientRect();if(!r.width)return;var dpr=window.devicePixelRatio||1,cs=getComputedStyle(root),ink=cs.getPropertyValue('--ink').trim()||'#222',k=r.width/400,z=view.z,rot=Math.abs(view.r||0)>.02,TH=24;
  [['rlTop',0],['rlLeft',1]].forEach(function(q){
    var c=$(q[0]),v=q[1],len=v?r.height:r.width;c.width=Math.round((v?TH:len)*dpr);c.height=Math.round((v?len:TH)*dpr);var x=c.getContext('2d');x.scale(dpr,dpr);
    if(rot){x.fillStyle=ink;x.font='600 10px sans-serif';x.fillText('view rotated',4,14);return}
    var pan=v?view.y:view.x;function sc(a){return(200+pan+z*(a-200))*k}
    var s0=sc(0),s1=sc(400);x.fillStyle='rgba(255,138,0,.28)';if(v)x.fillRect(0,s0,TH,s1-s0);else x.fillRect(s0,0,s1-s0,TH);
    var step=[5,10,20,25,50,100,200].filter(function(s){return s*z*k>=38})[0]||200,mn=step/5;
    x.strokeStyle=ink;x.fillStyle=ink;x.lineWidth=1;x.font='600 9px sans-serif';
    for(var a=-400;a<=800;a+=mn){var p=sc(a);if(p<0||p>len)continue;var maj=Math.round(a/step)*step===a,tl=maj?13:(mn*z*k>=6?6:0);if(!tl)continue;
      x.beginPath();if(v){x.moveTo(TH,p+.5);x.lineTo(TH-tl,p+.5)}else{x.moveTo(p+.5,TH);x.lineTo(p+.5,TH-tl)}x.stroke();
      if(maj){if(v){x.save();x.translate(9,p-3);x.rotate(-Math.PI/2);x.fillText(a,0,0);x.restore()}else x.fillText(a,p+2,9)}}
    x.fillStyle='#ff8a00';x.strokeStyle='#ff8a00';x.lineWidth=2;[s0,s1].forEach(function(p){x.beginPath();if(v){x.moveTo(0,p);x.lineTo(TH,p)}else{x.moveTo(p,0);x.lineTo(p,TH)}x.stroke()});
    var mid=(Math.max(0,s0)+Math.min(len,s1))/2,lab=(v?'H ':'W ')+'400';x.fillStyle=ink;x.font='700 10px sans-serif';
    if(v){x.save();x.translate(21,mid+16);x.rotate(-Math.PI/2);x.fillText(lab,0,0);x.restore()}else x.fillText(lab,mid-14,22)});
}
function draw(){if(selShown!==hasSel){selShown=hasSel;renderList()}
  placeObjBar();var hl=cur(),hd=$('hud');if(hd){var hm=hl?dims(hl,400,400):null;hd.textContent=(hm?'X '+Math.round(hm.cx)+'  Y '+Math.round(hm.cy)+'  R '+Math.round(hm.rot)+'°  S '+Math.round(hl.scale)+'%\n':'')+(pinchOn?'MOVE · ':'')+'Zoom '+Math.round(view.z*100)+'%  View '+Math.round(((view.r||0)*180/Math.PI+360)%360)+'°'}
  var e=edc.getContext('2d');e.setTransform(1,0,0,1,0,0);e.clearRect(0,0,800,800);
  e.save();e.scale(2,2);e.translate(200+view.x,200+view.y);e.scale(view.z,view.z);e.rotate(view.r||0);e.translate(-200,-200);
  e.imageSmoothingQuality='high';paintArt(e,400,st.shape);overlay(e);e.restore();
  drawRulers();
  if(!$('ov').classList.contains('hide')){
    var x=$('pv1').getContext('2d');x.clearRect(0,0,192,192);x.drawImage(legacy(192,st.shape),0,0);
    x=$('pv2').getContext('2d');x.clearRect(0,0,192,192);x.drawImage(legacy(192,'circle'),0,0);
    x=$('pv3').getContext('2d');x.clearRect(0,0,192,192);x.save();maskPath(x,192,'circle');x.clip();x.drawImage(adaptBg(192),0,0);x.drawImage(adaptFg(192),0,0);x.restore();
  }
}
function ov(o){$('ov').classList.toggle('hide',!o);if(o)draw()}
$('showPrev').onclick=function(){bakeFloat();ov(true)};$('closePrev').onclick=function(){ov(false)};
$('ov').onclick=function(e){if(e.target===this)ov(false)};
document.addEventListener('keydown',function(e){if(e.key==='Escape'){if(typeof edPop==='function')edPop(false);ov(false);$('exDlg').classList.add('hide');menu.classList.add('hide')}});

/* brushes */
function stroke(a,b){
  var l=cur();if(!l||!l.cv)return;var d=dims(l,400,400),cv=l.cv,c=cv.getContext('2d'),er=tool==='eraser';
  var sx=cv.width/d.w,sy=cv.height/d.h,R=-d.rot*Math.PI/180,co=Math.cos(R),sn=Math.sin(R);
  function m(p){var x=p.x-d.cx,y=p.y-d.cy;return[(x*co-y*sn+d.w/2)*sx,(x*sn+y*co+d.h/2)*sy]}
  var A=m(a),B=m(b),sz=(+$(er?'eSize':'bSize').value)*sx,ty=er?($('eType').value==='soft'?'airbrush':'pen'):$('bType').value;
  var col=$('bCol').value,op=er?1:(+$('bOp').value/100),rc=rgb(col);
  var dx=B[0]-A[0],dy=B[1]-A[1],n=Math.max(1,Math.ceil(Math.hypot(dx,dy)/Math.max(1,sz/4)));
  function each(f){for(var i=0;i<=n;i++){var t=i/n;f(A[0]+dx*t,A[1]+dy*t)}}
  l.ver=(l.ver||0)+1;
  c.save();c.globalCompositeOperation=er?'destination-out':'source-over';c.strokeStyle=c.fillStyle=col;c.lineCap=c.lineJoin='round';c.globalAlpha=op;
  function line(w,al,cap){c.globalAlpha=op*al;c.lineWidth=w;if(cap)c.lineCap=cap;c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(B[0]+.01,B[1]);c.stroke()}
  if(ty==='pen')line(sz,1);
  else if(ty==='marker')line(sz*1.2,.8);
  else if(ty==='highlighter')line(sz*2,.35,'square');
  else if(ty==='pencil'){line(sz*.4,.7);c.globalAlpha=op*.5;each(function(x,y){c.fillRect(x+(Math.random()-.5)*sz*.5,y+(Math.random()-.5)*sz*.5,1.2*sx,1.2*sx)})}
  else if(ty==='airbrush'){c.globalAlpha=op*.22;var r=sz*.6;each(function(x,y){var g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba('+rc+',1)');g.addColorStop(1,'rgba('+rc+',0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2)})}
  else if(ty==='calligraphy'){each(function(x,y){c.save();c.translate(x,y);c.rotate(-Math.PI/4);c.beginPath();c.ellipse(0,0,sz/2,sz/7,0,0,7);c.fill();c.restore()})}
  else if(ty==='spray'){each(function(x,y){for(var i=0;i<6;i++){var a2=Math.random()*7,r2=Math.sqrt(Math.random())*sz*.6;c.fillRect(x+Math.cos(a2)*r2,y+Math.sin(a2)*r2,Math.max(1,sz*.05),Math.max(1,sz*.05))}})}
  c.restore();
}

function selPath(c,d){c.beginPath();if(d.mode==='rect')c.rect(Math.min(d.p0.x,d.p1.x),Math.min(d.p0.y,d.p1.y),Math.abs(d.p1.x-d.p0.x),Math.abs(d.p1.y-d.p0.y));else{d.pts.forEach(function(q,i){i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y)});c.closePath()}}
function selFinish(){var d=selDrag;selDrag=null;var big=d.mode==='rect'?Math.hypot(d.p1.x-d.p0.x,d.p1.y-d.p0.y)>3:d.pts.length>3,c=sel.getContext('2d');c.clearRect(0,0,400,400);hasSel=false;if(big){c.fillStyle='#fff';selPath(c,d);c.fill();hasSel=true}draw()}
function selOp(kind){var l=cur();if(!hasSel)return;if(kind==='fill'&&(!l||!l.cv))l=addDraw();if(!l||!l.cv)return;
  var d=dims(l,400,400),cv=l.cv,c=cv.getContext('2d'),R=-d.rot*Math.PI/180,co=Math.cos(R),sn2=Math.sin(R),sx=cv.width/d.w,sy=cv.height/d.h;
  c.save();c.setTransform(sx*co,sy*sn2,-sx*sn2,sy*co,sx*(d.w/2-d.cx*co+d.cy*sn2),sy*(d.h/2-d.cx*sn2-d.cy*co));
  if(kind==='del'){c.globalCompositeOperation='destination-out';c.drawImage(sel,0,0)}
  else{var t=mk(400),x=t.getContext('2d');x.drawImage(sel,0,0);x.globalCompositeOperation='source-in';x.fillStyle=$('slCol').value;x.fillRect(0,0,400,400);c.drawImage(t,0,0)}
  c.restore();l.ver=(l.ver||0)+1;commit();draw()}
$('slInv').onclick=function(){if(!hasSel)return;var c=sel.getContext('2d');c.globalCompositeOperation='xor';c.fillStyle='#fff';c.fillRect(0,0,400,400);c.globalCompositeOperation='source-over';draw()};
$('slClr').onclick=function(){sel.getContext('2d').clearRect(0,0,400,400);hasSel=false;draw()};
$('slDel').onclick=function(){selOp('del')};$('slFill').onclick=function(){selOp('fill')};
[].forEach.call($('slMode').children,function(b){b.onclick=function(){[].forEach.call($('slMode').children,function(x){x.setAttribute('aria-pressed',x===b)})}});
function segv(id,a){var b=$(id).querySelector('[aria-pressed=true]');return b?b.getAttribute(a):''}
function lpx(l,p){var d=dims(l,400,400),cv=l.cv,R=-d.rot*Math.PI/180,x=p.x-d.cx,y=p.y-d.cy;return[Math.floor((x*Math.cos(R)-y*Math.sin(R)+d.w/2)*cv.width/d.w),Math.floor((x*Math.sin(R)+y*Math.cos(R)+d.h/2)*cv.height/d.h)]}
function lq(l,p){var d=dims(l,400,400),r=-d.rot*Math.PI/180,x=p.x-d.cx,y=p.y-d.cy;return[x*Math.cos(r)-y*Math.sin(r),x*Math.sin(r)+y*Math.cos(r)]}
function bnd(l){var d=dims(l,400,400),k=d.k;
 if(l.type==='draw'||l.type==='image'||l.type==='shape')return{x0:-d.w/2,y0:-d.h/2,x1:d.w/2,y1:d.h/2};
 if(l.type==='text'){var fs=400*.2*k,cx=edc.getContext('2d');cx.save();var ls=textLay(cx,l,fs),w=Math.max.apply(0,ls.map(function(x){return x.w}).concat([1])),h=ls.length*fs*1.15;cx.restore();return{x0:-w/2,y0:-h/2,x1:w/2,y1:h/2}}
 var a=1e9,b=1e9,c=-1e9,e=-1e9;l.pts.forEach(function(q){a=Math.min(a,q.x);b=Math.min(b,q.y);c=Math.max(c,q.x);e=Math.max(e,q.y)});if(a===1e9)return null;var m=l.width/2;return{x0:(a-m)*d.kx,y0:(b-m)*d.ky,x1:(c+m)*d.kx,y1:(e+m)*d.ky}}
function hasEdge(l){return l.type==='image'||l.type==='shape'||l.type==='vec'}
function tfh(l,p){var bb=bnd(l);if(!bb)return null;var q=lq(l,p),h=HR/view.z;
 if(Math.hypot(q[0]-(bb.x0+bb.x1)/2,q[1]-(bb.y0-30/view.z))<h)return'rot';
 var cs=[[bb.x0,bb.y0],[bb.x1,bb.y0],[bb.x1,bb.y1],[bb.x0,bb.y1]];for(var i=0;i<4;i++)if(Math.hypot(q[0]-cs[i][0],q[1]-cs[i][1])<h)return'sc';
 if(hasEdge(l)){if(Math.hypot(q[0]-bb.x1,q[1]-(bb.y0+bb.y1)/2)<h)return'ex';if(Math.hypot(q[0]-(bb.x0+bb.x1)/2,q[1]-bb.y1)<h)return'ey'}
 return q[0]>=bb.x0&&q[0]<=bb.x1&&q[1]>=bb.y0&&q[1]<=bb.y1?'mv':null}
function pick(p){for(var i=L.length-1;i>=0;i--){var l=L[i];if(!l.vis)continue;
 if(l.type==='draw'){var q=lpx(l,p),c=l.cv;if(q[0]>=0&&q[1]>=0&&q[0]<c.width&&q[1]<c.height&&c.getContext('2d').getImageData(q[0],q[1],1,1).data[3]>10)return i;continue}
 var bb=bnd(l);if(!bb)continue;var q2=lq(l,p),m=l.type==='vec'?8/view.z:0;if(q2[0]>=bb.x0-m&&q2[0]<=bb.x1+m&&q2[1]>=bb.y0-m&&q2[1]<=bb.y1+m)return i}return -1}
function bucket(l,p){var base0=hasSel?cc(l.cv):null,cv=l.cv,w=cv.width,h=cv.height,q=lpx(l,p),sx=q[0],sy=q[1];if(sx<0||sy<0||sx>=w||sy>=h)return;
 var c=cv.getContext('2d'),im=c.getImageData(0,0,w,h),D=im.data,er=segv('bkMode','data-bk')==='erase',tol=+$('bkTol').value*10.2,col=er?[0,0,0,0]:rgb($('bkCol').value).concat(255),i0=(sy*w+sx)*4,t=[D[i0],D[i0+1],D[i0+2],D[i0+3]],seen=new Uint8Array(w*h),st=[sx,sy];
 function ok(i){return Math.abs(D[i]-t[0])+Math.abs(D[i+1]-t[1])+Math.abs(D[i+2]-t[2])+Math.abs(D[i+3]-t[3])<=tol}
 while(st.length){var y=st.pop(),x=st.pop();if(x<0||y<0||x>=w||y>=h)continue;var k=y*w+x;if(seen[k]||!ok(k*4))continue;seen[k]=1;var o=k*4;D[o]=col[0];D[o+1]=col[1];D[o+2]=col[2];D[o+3]=col[3];st.push(x+1,y,x-1,y,x,y+1,x,y-1)}
 var gg=bkH.grad;if(!er&&gg.on){var X0=1e9,Y0=1e9,X1=-1,Y1=-1,k2,yy,xx;for(k2=0;k2<seen.length;k2++)if(seen[k2]){yy=(k2/w)|0;xx=k2-yy*w;if(xx<X0)X0=xx;if(xx>X1)X1=xx;if(yy<Y0)Y0=yy;if(yy>Y1)Y1=yy}
  var bw=X1-X0+1,bh=Y1-Y0+1,cx=X0+bw/2,cy=Y0+bh/2,an=gg.ang*Math.PI/180,co=Math.cos(an),si=Math.sin(an),RR=Math.abs(bw/2*co)+Math.abs(bh/2*si)||1,c2=rgb(gg.c2);
  for(k2=0;k2<seen.length;k2++)if(seen[k2]){yy=(k2/w)|0;xx=k2-yy*w;var tt=gg.rad?Math.hypot(xx-cx,yy-cy)/(Math.max(bw,bh)/2||1):((xx-cx)*co+(yy-cy)*si)/(2*RR)+.5;tt=Math.max(0,Math.min(1,tt));var o2=k2*4;D[o2]=col[0]+(c2[0]-col[0])*tt;D[o2+1]=col[1]+(c2[1]-col[1])*tt;D[o2+2]=col[2]+(c2[2]-col[2])*tt}}
 c.putImageData(im,0,0);if(base0)maskRestore(l,base0);l.ver=(l.ver||0)+1;commit();draw()}
function flat(l){var p=l.pts,n=p.length,o=[];if(n<2)return p.map(function(q){return{x:q.x,y:q.y}});var sm=l.smoothLine!==false,sg=l.closed?n:n-1;
 for(var i=0;i<sg;i++){var j=(i+1)%n,a=p[i],b=p[j],ta=sm?tang(l,i):0,tb=sm?tang(l,j):0;var NS=Math.max(4,Math.min(80,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)*l.scale/100*(l.sx||1)/3)));for(var k=0;k<NS;k++){var t=k/NS,u=1-t;
  if(sm)o.push({x:u*u*u*a.x+3*u*u*t*(a.x+ta.x)+3*u*t*t*(b.x-tb.x)+t*t*t*b.x,y:u*u*u*a.y+3*u*u*t*(a.y+ta.y)+3*u*t*t*(b.y-tb.y)+t*t*t*b.y});
  else o.push({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t})}}
 if(!l.closed)o.push({x:p[n-1].x,y:p[n-1].y});return o}
function veraseAt(p){var R=+$('veSize').value,whole=segv('veMode','data-ve')==='line',ch=false;
 for(var i=L.length-1;i>=0;i--){var l=L[i];if(l.type!=='vec'||!l.vis||!l.pts.length)continue;
  var f=flat(l),hit=f.map(function(q){var a=toArt(l,q);return Math.hypot(a.x-p.x,a.y-p.y)<R});if(hit.indexOf(true)<0)continue;ch=true;
  if(whole)L.splice(i,1);
  else{var runs=[],cu=[];f.forEach(function(q,k){if(hit[k]){if(cu.length>1)runs.push(cu);cu=[]}else cu.push(q)});if(cu.length>1)runs.push(cu);
   var nl=runs.map(function(r){var o=Object.assign({},l);o.id=++uid;o.pts=r;o.closed=false;o.smoothLine=false;return o});L.splice.apply(L,[i,1].concat(nl))}}
 if(ch){vchg=true;act=Math.min(act,L.length-1);selPt=-1;refresh()}}
[['bkMode'],['veMode']].forEach(function(a){[].forEach.call($(a[0]).children,function(b){b.onclick=function(){[].forEach.call($(a[0]).children,function(x){x.setAttribute('aria-pressed',x===b)})}})});

/* pointer */
function pos(e){var r=edc.getBoundingClientRect(),px=(e.clientX-r.left)/r.width*400,py=(e.clientY-r.top)/r.height*400,dx=(px-200-view.x)/view.z,dy=(py-200-view.y)/view.z,a=view.r||0,c=Math.cos(a),s=Math.sin(a);return{cx:e.clientX,cy:e.clientY,sx:px,sy:py,x:dx*c+dy*s+200,y:-dx*s+dy*c+200}}
function vhit(l,p){for(var i=l.pts.length-1;i>=0;i--){var a=toArt(l,l.pts[i]);if(Math.hypot(a.x-p.x,a.y-p.y)<HR/view.z)return i}return -1}
function hhit(l,p){var sp=l.pts[selPt];if(!sp||sp.c||l.smoothLine===false)return '';var t=tang(l,selPt),A=toArt(l,sp),O=toArt(l,{x:sp.x+t.x,y:sp.y+t.y}),I=toArt(l,{x:sp.x-t.x,y:sp.y-t.y});
  if(Math.hypot(O.x-A.x,O.y-A.y)<8/view.z)return '';
  if(Math.hypot(O.x-p.x,O.y-p.y)<HR/view.z)return 'o';if(Math.hypot(I.x-p.x,I.y-p.y)<HR/view.z)return 'i';return ''}
edc.addEventListener('pointerdown',function(e){
  HR=e.pointerType==='touch'?26:14;hudOn(0);pts[e.pointerId]=pos(e);edc.setPointerCapture(e.pointerId);var ids=Object.keys(pts),p=pts[e.pointerId];
  if(ids.length===2){tfm=null;vers=null;selDrag=null;if(vdrag&&vdrag.added){vdrag.l.pts.splice(vdrag.i,1);selPt=-1;sync()}if(paint||mdrag){var hs=hist[hp];paint=mdrag=null;if(hs)restore(hs)}pinchOn=true;drag=paint=vdrag=null;rub=null;var a=pts[ids[0]],b=pts[ids[1]],l=cur();
    pinch={d:Math.hypot(a.cx-b.cx,a.cy-b.cy)||1,ang:Math.atan2(b.cy-a.cy,b.cx-a.cx),z:view.z,vr:view.r||0,vx:view.x,vy:view.y,mx:(a.cx+b.cx)/2,my:(a.cy+b.cy)/2,s:l?l.scale:100,r:l?l.rot:0};return}
  if(e.shiftKey||e.button===1){drag={pan:true,x:e.clientX,y:e.clientY,vx:view.x,vy:view.y};return}
  var l=cur();
  if(meshStart(p,l))return;
  if(tool==='move'){if(l&&G('aMove'))drag={l:l,x:e.clientX,y:e.clientY,px:l.x,py:l.y,moved:false}}
  else if(tool==='brush'||tool==='eraser'){
    if(!l||!l.cv||(tool==='brush'&&false))l=tool==='brush'?addDraw():null;
    if(!l)return;var pp=rproj(p);paint={x:pp.x,y:pp.y,sx:p.x,sy:p.y,l:l};if(hasSel)paint.base=cc(l.cv);stroke(paint,paint);if(paint.base)maskRestore(l,paint.base);draw()}
  else if(tool==='vector'){
    if(!l||l.type!=='vec'){l=addVec();}
    vcur={x:p.x,y:p.y};padXY();
    if(vm==='select'){var vi=vhit(l,p);if(vi>=0){selPt=vi;vdrag={l:l,i:vi,cx:e.clientX,cy:e.clientY,added:false};sync();draw()}else{selPt=-1;sync();draw()}}
    else {var vq=toLoc(l,snapPt(p,-1,l));vq.c=true;l.pts.push(vq);selPt=l.pts.length-1;sync();draw();commit()}
    return;
  }
  else if(tool==='bucket'){if(!l||!l.cv)l=addDraw();bucket(l,p)}
  else if(tool==='ruler'){rul={a:rsn(p),b:rsn(p),t:rtype};rdrag=true;draw()}
  else if(tool==='select'){
    var smode=segv('slMode','data-sl');if(smode==='move'&&hasSel&&l&&l.cv&&sel.getContext('2d').getImageData(clamp(Math.floor(p.x),0,399),clamp(Math.floor(p.y),0,399),1,1).data[3]>0){
      selMove={l:l,start:p,last:p,original:cc(l.cv),mask:cc(sel),moved:false};return;
    }
    if(smode==='move')return;selDrag={mode:smode,p0:p,p1:p,pts:[p]};draw()
  }
  else if(tool==='veraser'){vers={last:p};veraseAt(p);draw()}
  else if(tool==='transform'&&hasSel&&l&&l.cv&&sel.getContext('2d').getImageData(clamp(Math.floor(p.x),0,399),clamp(Math.floor(p.y),0,399),1,1).data[3]>0){selMove={l:l,start:p,last:p,original:cc(l.cv),mask:cc(sel),moved:false};return}
  else if(tool==='transform'){var m=l&&tfh(l,p);if(m==='mv'&&l.type==='draw'){var pi0=pick(p);if(pi0>=0&&pi0!==act)m=null}if(!m){var pi=pick(p);if(pi>=0&&pi!==act){selectLayer(pi);refresh()}else if(pi<0){drag={pan:true,x:e.clientX,y:e.clientY,vx:view.x,vy:view.y}}}else{var d=dims(l,400,400),b0=bnd(l);tfm={l:l,mode:m,bx:b0.x1,by:b0.y1,s0x:l.sx||1,s0y:l.sy||1,sx:l.scale,px:l.x,py:l.y,ox:p.x,oy:p.y,d0:Math.hypot(p.x-d.cx,p.y-d.cy)||1,moved:false}}}
  else if(tool==='text'){var ti=pick(p),tl=ti>=0&&L[ti].type==='text'?L[ti]:null;
    if(!tl)tl=addText((p.x-200)/4,(p.y-200)/4);else if(L[act]!==tl){act=L.indexOf(tl);refresh()}
    drag={l:tl,x:e.clientX,y:e.clientY,px:tl.x,py:tl.y,moved:false,edit:true}}
});
edc.addEventListener('pointermove',function(e){
  if(!pts[e.pointerId])return;var p=pos(e);pts[e.pointerId]=p;if(mdrag&&!pinchOn){meshMove(p);return}var ids=Object.keys(pts),l=cur(),r=edc.getBoundingClientRect();
  if(pinch&&ids.length>=2){
    var a=pts[ids[0]],b=pts[ids[1]],dd=Math.hypot(a.cx-b.cx,a.cy-b.cy)/pinch.d;
    if(pm==='view'){view.r=pinch.vr+(Math.atan2(b.cy-a.cy,b.cx-a.cx)-pinch.ang);view.z=clamp(pinch.z*dd,.5,8);if(Math.abs(view.z-1)<.06)view.z=1;if(Math.abs(view.r||0)<.07)view.r=0;view.x=pinch.vx+((a.cx+b.cx)/2-pinch.mx)/r.width*400;view.y=pinch.vy+((a.cy+b.cy)/2-pinch.my)/r.height*400;$('zV').textContent=Math.round(view.z*100)+'%';draw()}
    else if(l){if(G('aScale'))l.scale=clamp(Math.round(pinch.s*dd),10,300);if(G('rOn')){var an=Math.atan2(b.cy-a.cy,b.cx-a.cx);l.rot=snapRot(pinch.r+(an-pinch.ang)*180/Math.PI)}sync();draw()}
    return}
  if(selMove){
    var sm=selMove,ly=sm.l,cv=ly.cv,base=sm.original,mask=sm.mask,dx=p.x-sm.start.x,dy=p.y-sm.start.y,dv=dims(ly,400,400),ang=-(dv.rot||0)*Math.PI/180,co=Math.cos(ang),sn=Math.sin(ang),sx=cv.width/dv.w,sy=cv.height/dv.h;
    cv.width=base.width;cv.height=base.height;cv.getContext('2d').drawImage(base,0,0);
    var cut=cv.getContext('2d');cut.save();cut.setTransform(sx*co,sy*sn,-sx*sn,sy*co,sx*(dv.w/2-dv.cx*co+dv.cy*sn),sy*(dv.h/2-dv.cx*sn-dv.cy*co));cut.globalCompositeOperation='destination-out';cut.drawImage(mask,0,0);cut.restore();
    var ex=cc(base),ec=ex.getContext('2d');ec.save();ec.setTransform(sx*co,sy*sn,-sx*sn,sy*co,sx*(dv.w/2-dv.cx*co+dv.cy*sn),sy*(dv.h/2-dv.cx*sn-dv.cy*co));ec.globalCompositeOperation='destination-in';ec.drawImage(mask,0,0);ec.restore();
    var lx=dx*Math.cos((dv.rot||0)*Math.PI/180)+dy*Math.sin((dv.rot||0)*Math.PI/180),lyy=-dx*Math.sin((dv.rot||0)*Math.PI/180)+dy*Math.cos((dv.rot||0)*Math.PI/180);
    cut=cv.getContext('2d');cut.drawImage(ex,lx*cv.width/dv.w,lyy*cv.height/dv.h);ly.ver=(ly.ver||0)+1;sm.last=p;sm.moved=Math.hypot(dx,dy)>0.5;draw();return;
  }
  if(rdrag&&rul){rul.b=rsn(p,rul.a);draw();return}
  if(selDrag){selDrag.p1=p;if(selDrag.mode==='lasso')selDrag.pts.push(p);draw();return}
  if(vers){var a0=vers.last,R0=+$('veSize').value,n0=Math.max(1,Math.ceil(Math.hypot(p.x-a0.x,p.y-a0.y)/Math.max(2,R0/2)));for(var u=1;u<=n0;u++)veraseAt({x:a0.x+(p.x-a0.x)*u/n0,y:a0.y+(p.y-a0.y)*u/n0});vers.last=p;draw();return}
  if(tfm){var tl=tfm.l,td=dims(tl,400,400);if(tfm.mode==='rot')tl.rot=snapRot(Math.atan2(p.y-td.cy,p.x-td.cx)*180/Math.PI+90);else if(tfm.mode==='ex')tl.sx=clamp(tfm.s0x*Math.max(.05,lq(tl,p)[0]/tfm.bx),.05,8);else if(tfm.mode==='ey')tl.sy=clamp(tfm.s0y*Math.max(.05,lq(tl,p)[1]/tfm.by),.05,8);else if(tfm.mode==='sc')tl.scale=clamp(Math.round(tfm.sx*Math.hypot(p.x-td.cx,p.y-td.cy)/tfm.d0),10,300);else{var tq=snapPos(tfm.px+(p.x-tfm.ox)/4,tfm.py+(p.y-tfm.oy)/4);tl.x=tq[0];tl.y=tq[1]}tfm.moved=true;sync();draw();return}
  if(drag&&drag.pan){view.x=drag.vx+(e.clientX-drag.x)/r.width*400;view.y=drag.vy+(e.clientY-drag.y)/r.height*400;draw();return}
  if(drag&&drag.l){var vx=(e.clientX-drag.x)/r.width/view.z,vy=(e.clientY-drag.y)/r.height/view.z,ca=Math.cos(view.r||0),sa=Math.sin(view.r||0),q=snapPos(drag.px+(vx*ca+vy*sa)*100,drag.py+(-vx*sa+vy*ca)*100);drag.l.x=q[0];drag.l.y=q[1];drag.moved=true;sync();draw()}
  else if(paint){var s=(tool==='brush'?+$('bSm').value:0)/100*.9,nx=paint.sx+(p.x-paint.sx)*(1-s),ny=paint.sy+(p.y-paint.sy)*(1-s);var pq=rproj({x:nx,y:ny});stroke({x:paint.x,y:paint.y},pq);if(paint.base)maskRestore(paint.l,paint.base);paint.x=pq.x;paint.y=pq.y;paint.sx=nx;paint.sy=ny;draw()}
  else if(vdrag){var lv=vdrag.l,vp=lv.pts[vdrag.i],lc=toLoc(lv,snapPt(p,vdrag.i,lv));
    if(vdrag.h){var sg=vdrag.h==='o'?1:-1;vp.hx=(lc.x-vp.x)*sg;vp.hy=(lc.y-vp.y)*sg}
    else if(vdrag.added){if(Math.hypot(p.cx-vdrag.cx,p.cy-vdrag.cy)>6){vp.hx=lc.x-vp.x;vp.hy=lc.y-vp.y}}
    else{vp.x=lc.x;vp.y=lc.y}
    vdrag.moved=true;draw()}
});
['pointerup','pointercancel'].forEach(function(n){edc.addEventListener(n,function(e){
  delete pts[e.pointerId];if(e.type==='pointercancel'&&selMove){selMove.l.cv=cc(selMove.original);selMove=null;draw()}if(Object.keys(pts).length<2){if(pinch&&pm==='layer')commit();pinch=null}
  if(!Object.keys(pts).length){hudOn(900);if(paint&&e.type==='pointerup'){var pe=pos(e);stroke({x:paint.x,y:paint.y},{x:pe.x,y:pe.y});if(paint.base)maskRestore(paint.l,paint.base)}var smDone=selMove;if(smDone){var dx=smDone.last.x-smDone.start.x,dy=smDone.last.y-smDone.start.y;if(smDone.moved){var movedMask=mk(400),mm=movedMask.getContext('2d');mm.drawImage(smDone.mask,dx,dy);sel=movedMask;smDone.l.ver=(smDone.l.ver||0)+1;commit()}selMove=null;}
    var ch=(drag&&drag.moved)||paint||(vdrag&&vdrag.moved)||vchg||(tfm&&tfm.moved)||(smDone&&smDone.moved),te=null;
    if(drag&&drag.edit&&!drag.moved)te=drag.l;
    if(tfm&&!tfm.moved&&tfm.mode==='mv'&&tfm.l.type==='text'){var nw=Date.now();if(nw-ltT<380&&ltL===tfm.l)te=tfm.l;ltT=nw;ltL=tfm.l}
    if(mdrag&&mdrag.moved)commit();mdrag=null;pinchOn=false;drag=paint=vdrag=tfm=null;vers=null;vchg=false;rdrag=false;if(selDrag)selFinish();rub=null;draw();if(ch)commit();if(te)openTE(te)}})});
edc.addEventListener('wheel',function(e){e.preventDefault();hudOn(900);var l=cur();
  if(e.ctrlKey||pm==='view'||!l){zoomTo(view.z*Math.exp(-e.deltaY*(e.ctrlKey?.01:.002)))}
  else if(G('aScale')){l.scale=clamp(Math.round(l.scale-e.deltaY*.2),10,300);sync();draw()}},{passive:false});
edc.addEventListener('keydown',function(e){
  if(!L.length){if(e.key==='Enter'||e.key===' '){e.preventDefault();$('fg').click()}return}
  var d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key],l=cur();
  if(d&&l&&G('aMove')){e.preventDefault();setPos(cl(l.x+d[0]),cl(l.y+d[1]))}
});
/* in-canvas text editing */
function closeTE(){if(teEl){var t=teEl;teEl=null;t.remove();commit()}}
function openTE(l){
  closeTE();var t=document.createElement('textarea');teEl=t;t.setAttribute('aria-label','Edit text');t.value=l.text;
  function fit(){var r=edc.getBoundingClientRect(),k=r.width/400,z=view.z,a=view.r||0,c=Math.cos(a),sn=Math.sin(a),d=dims(l,400,400),bb=bnd(l),
    ax=d.cx-200,ay=d.cy-200,sx=200+view.x+z*(ax*c-ay*sn),sy=200+view.y+z*(ax*sn+ay*c),fs=400*.2*d.k*z*k,n=l.text.split('\n').length,h=Math.max(36,n*fs*1.15+14),w=Math.max(90,(bb.x1-bb.x0)*z*k+30);
    t.style.cssText='position:absolute;box-sizing:border-box;left:'+sx/4+'%;top:'+sy/4+'%;width:'+w+'px;height:'+h+'px;transform:translate(-50%,-50%) rotate('+(l.rot+a*180/Math.PI)+'deg);margin:0;padding:'+(h-n*fs*1.15)/2+'px 0 0;border:1.5px dashed var(--acc);background:transparent;color:transparent;-webkit-text-fill-color:transparent;caret-color:var(--acc);resize:none;overflow:hidden;white-space:pre;text-align:center;outline:none;z-index:5;font:'+fs+'px/1.15 '+l.font}
  fit();edc.parentNode.appendChild(t);
  t.oninput=function(){l.text=t.value;l.name=(t.value.split('\n')[0]||'Text').slice(0,18);$('tText').value=t.value;renderList();fit();draw()};
  t.onblur=function(){if(teEl===t)closeTE()};t.onkeydown=function(e){if(e.key==='Escape')t.blur()};
  t.focus();t.select()}
/* export */
function list(){
  var adapt=$('oAdapt').checked,round=$('oRound').checked,img=st.mode==='image',out=[];
  DENS.forEach(function(d){var f=['ic_launcher.png'];if(round)f.push('ic_launcher_round.png');if(adapt){f.push('ic_launcher_foreground.png');if(img)f.push('ic_launcher_background.png')}out.push(['mipmap-'+d[0],f])});
  if(adapt){var x=['ic_launcher.xml'];if(round)x.push('ic_launcher_round.xml');out.push(['mipmap-anydpi-v26',x]);if(!img)out.push(['values',['ic_launcher_background.xml']])}
  return out;
}
function tree(){
  var base=$('path').value.trim().replace(/^\/+|\/+$/g,'').replace(/\\/g,'/'),s='',ind=base?'  ':'';
  if(base)s+='<b>'+esc(base)+'/</b>\n';
  list().forEach(function(g){s+=ind+'<b>'+g[0]+'/</b>\n';g[1].forEach(function(f){s+=ind+'    '+f+'\n'})});
  if($('oStore').checked)s+='ic_launcher-playstore.png\n';
  $('tree').innerHTML=s;
}
function blob(c){return new Promise(function(res){c.toBlob(res,'image/png')})}
var XML='<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">\n    <background android:drawable="@BG@"/>\n    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>\n</adaptive-icon>\n';
async function build(){
  var base=$('path').value.trim().replace(/^\/+|\/+$/g,'').replace(/\\/g,'/');
  var pre=base?base+'/':'',files=[],add=function(p,d){files.push([pre+p,d])};
  var adapt=$('oAdapt').checked,round=$('oRound').checked,useImg=st.mode==='image'||st.mode==='dots';
  for(var i=0;i<DENS.length;i++){
    var d=DENS[i],n='mipmap-'+d[0]+'/';
    add(n+'ic_launcher.png',await blob(legacy(d[1],st.shape)));
    if(round)add(n+'ic_launcher_round.png',await blob(legacy(d[1],'circle')));
    if(adapt){add(n+'ic_launcher_foreground.png',await blob(adaptFg(d[2])));if(useImg)add(n+'ic_launcher_background.png',await blob(adaptBg(d[2])))}
  }
  if(adapt){
    var xml=XML.replace('@BG@',useImg?'@mipmap/ic_launcher_background':'@color/ic_launcher_background');
    add('mipmap-anydpi-v26/ic_launcher.xml',xml);if(round)add('mipmap-anydpi-v26/ic_launcher_round.xml',xml);
    if(!useImg)add('values/ic_launcher_background.xml','<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">'+(st.mode==='none'?'#00000000':$('bgColor').value.toUpperCase())+'</color>\n</resources>\n');
  }
  if($('oStore').checked)files.push(['ic_launcher-playstore.png',await blob(legacy(512,'square'))]);
  return files;
}
function say(t){$('msg').textContent=t}
async function runExport(fn){bakeFloat();fn=typeof fn==='string'?fn:'android-icons.zip';
  if(!L.length)return;
  if(typeof JSZip==='undefined'){say('JSZip did not load. Check your connection and reload.');return}
  say('Building…');
  try{
    var files=await build(),zp=new JSZip();files.forEach(function(f){zp.file(f[0],f[1])});
    var out=await zp.generateAsync({type:'blob'}),dl=null;
    try{dl=window.claude&&await window.claude.use('downloads')}catch(e){}
    if(dl){await dl.save({filename:fn,data:out})}
    else{var a=document.createElement('a');a.href=URL.createObjectURL(out);a.download=fn;document.body.appendChild(a);a.click();a.remove()}
    say('Saved '+fn+' ('+files.length+' files).');
  }catch(e){say(e&&e.code==='declined'?'Save cancelled.':'Could not save the zip: '+(e&&e.message||e))}
}
var xd=$('exDlg');
$('exportBtn').onclick=function(){if(!L.length){say('Add a layer in the Editor first.');return}xd.classList.remove('hide');$('exName').focus()};
$('exCancel').onclick=function(){xd.classList.add('hide')};
xd.onclick=function(e){if(e.target===xd)xd.classList.add('hide')};
$('exGo').onclick=function(){var bad=/[\\/:*?"<>|]+/g,n=$('exName').value.replace(bad,'').trim()||'android-icons',x=$('exExt').value.replace(bad,'').replace(/^\.+/,'').trim()||'zip';xd.classList.add('hide');runExport(n+'.'+x)};
if(window.showDirectoryPicker){
  
  $('folder').onclick=async function(){
    try{
      var dir=await window.showDirectoryPicker({mode:'readwrite'});say('Writing…');var files=await build();
      for(var i=0;i<files.length;i++){var parts=files[i][0].split('/'),h=dir;for(var j=0;j<parts.length-1;j++)h=await h.getDirectoryHandle(parts[j],{create:true});var fh=await h.getFileHandle(parts[parts.length-1],{create:true}),w=await fh.createWritable();await w.write(files[i][1]);await w.close()}
      say('Saved '+files.length+' files to “'+dir.name+'”.');
    }catch(e){say(e&&e.name==='AbortError'?'Folder not chosen.':'Folder access is blocked here. Use Create ZIP instead.')}
  };
}
function vhint(){var a=vm==='add';$('vMid').textContent=lastMv?'Tap again to cancel move':'Swipe to move cursor';$('vTH').innerHTML=a?'<span>Tap <b>Add corner</b></span><span>Hold <b>Add curve</b></span>':'<span>Tap <b>Select point</b></span><span>Hold <b>Grab and move</b></span>'}
[].forEach.call($('vTabs').children,function(b){b.onclick=function(){[].forEach.call($('vTabs').children,function(x){x.setAttribute('aria-selected',x===b)});['draw','stroke','fill','shapes'].forEach(function(k){$('vp-'+k).classList.toggle('hide',k!==b.dataset.vt)})}});
var vpd=$('vPad');
vpd.addEventListener('pointerdown',function(e){vpd.setPointerCapture(e.pointerId);pad={x:e.clientX,y:e.clientY,mv:false,held:false,px:0,py:0,t0:performance.now()};vraw.x=vsmo.x=vcur.x;vraw.y=vsmo.y=vcur.y;requestAnimationFrame(ringLoop);var rg=$('vRing');vpd.classList.add('press');rg.style.transition='none';rg.style.strokeDashoffset=100;void rg.getBoundingClientRect();rg.style.transition='stroke-dashoffset 400ms linear';rg.style.strokeDashoffset=0;pad.tm=setTimeout(function(){if(pad&&!pad.mv){pad.held=true;vpd.classList.add('hold');if(vm==='add'&&!pad.added){pad.added=true;lastMv=null;addPt('smooth');if(navigator.vibrate)navigator.vibrate(14)}if(vm==='select'){pad.grab=grabAt();var gl=vl();if(pad.grab&&gl&&gl.pts[pad.grab.i])pad.orig=JSON.parse(JSON.stringify(gl.pts[pad.grab.i]))}}},400)});
vpd.addEventListener('pointermove',function(e){if(!pad)return;if(!pad.mv&&Math.hypot(e.clientX-pad.x,e.clientY-pad.y)<6)return;pad.mv=true;clearTimeout(pad.tm);vpd.classList.remove('hold','press');
  var r=edc.getBoundingClientRect(),k=400/r.width/view.z*1.3,dx=(e.clientX-pad.x)*k,dy=(e.clientY-pad.y)*k,mx=dx-pad.px,my=dy-pad.py,l=vl();pad.px=dx;pad.py=dy;
  vraw.x=clamp(vraw.x+mx,0,400);vraw.y=clamp(vraw.y+my,0,400);var sm=+$('vpSm').value/100*.88;vsmo.x+=(vraw.x-vsmo.x)*(1-sm);vsmo.y+=(vraw.y-vsmo.y)*(1-sm);var sq=snapPt(vsmo,pad.grab?pad.grab.i:-1,l);vcur.x=sq.x;vcur.y=sq.y;
  if(pad.grab&&l){var g=pad.grab,sp=l.pts[g.i],lc=toLoc(l,snapPt(vcur,g.i,l));if(sp){if(g.h){var sg=g.h==='o'?1:-1;sp.hx=(lc.x-sp.x)*sg;sp.hy=(lc.y-sp.y)*sg}else{sp.x=lc.x;sp.y=lc.y}pad.gm=true}}
  padXY();draw()});
function padEnd(e){if(!pad)return;clearTimeout(pad.tm);var q=pad;pad=null;vpd.classList.remove('hold','press');vraw.x=vsmo.x;vraw.y=vsmo.y;
  if(e.type==='pointerup'&&!q.mv&&vm==='add'){lastMv=null;if(!q.added)addPt('corner')}
  else if(e.type==='pointerup'&&!q.mv&&!q.held&&vm==='select'){if(lastMv&&lastMv.l===vl()&&lastMv.l.pts[lastMv.i]){lastMv.l.pts[lastMv.i]=lastMv.o;selPt=lastMv.i;lastMv=null;sync();draw();commit()}else{lastMv=null;pickCur()}vhint()}
  else if(q.gm){lastMv=q.orig?{l:vl(),i:q.grab.i,o:q.orig}:null;commit();vhint()}}
vpd.addEventListener('pointerup',padEnd);vpd.addEventListener('pointercancel',padEnd);
$('vPrev').onclick=function(){var l=vl();if(l&&l.pts.length){selPt=selPt<=0?l.pts.length-1:selPt-1;sync();draw()}};
$('vNext').onclick=function(){var l=vl();if(l&&l.pts.length){selPt=(selPt+1)%l.pts.length;sync();draw()}};
[].forEach.call($('vPT').children,function(b){b.onclick=function(){var l=vl(),q=l&&l.pts[selPt];if(!q)return;var t=b.dataset.pt;
  if(t==='corner'){q.c=true;delete q.hx;delete q.hy}
  else{delete q.c;l.smoothLine=true;if(t==='smooth'){delete q.hx;delete q.hy}else{var g=tang(l,selPt);if(Math.hypot(g.x,g.y)<1)g={x:20,y:0};q.hx=g.x;q.hy=g.y}}
  sync();draw();commit()}});
[].forEach.call($('vCap').children,function(b){b.onclick=function(){var l=vl();if(l){l.cap=b.dataset.cap;sync();draw();commit()}}});
var vmn=$('vMenu');
$('vMore').onclick=function(e){e.stopPropagation();vmn.classList.toggle('hide')};
vmn.onclick=function(e){e.stopPropagation()};
document.addEventListener('click',function(){vmn.classList.add('hide')});
$('vNew').onclick=function(){vmn.classList.add('hide');addVec();selPt=-1;setTool('vector');sync();draw()};
$('vClr').onclick=function(){var l=vl();vmn.classList.add('hide');if(l&&l.pts.length){l.pts=[];selPt=-1;sync();draw();commit()}};
$('vFit').onclick=function(){vmn.classList.add('hide');$('zFit').click()};

if(window.ResizeObserver){var rs=document.documentElement.style,nv=document.querySelector('nav');
  new ResizeObserver(function(){rs.setProperty('--dockh',(matchMedia('(min-width:1000px)').matches?0:$('sheet').offsetHeight)+'px')}).observe($('sheet'));var bar0=document.querySelector('.bar');new ResizeObserver(function(){rs.setProperty('--barh',bar0.offsetHeight+'px')}).observe(bar0);
  new ResizeObserver(function(){rs.setProperty('--navh',(matchMedia('(max-width:820px)').matches?nv.offsetHeight:0)+'px')}).observe(nv)}
vhint();
function showTab(t,soft){[].forEach.call($('stabs').children,function(b){b.setAttribute('aria-selected',b.dataset.st===t)});['tool','layers'].forEach(function(k){$('sp-'+k).classList.toggle('hide',k!==t)});if(!soft)openSheet()}
function openSheet(){$('sheet').classList.remove('closed');$('sheetOpen').hidden=true}
function selectLayer(i){lastMv=null;var lid=L[i].id;if(!L[i].float)bakeFloat();i=idxById(lid);act=i;var ty=L[i].type;if(ty==='vec')setTool('vector');else{if(tool==='text'||tool==='vector')setTool('transform');}selPt=-1}
[].forEach.call($('stabs').children,function(b){b.onclick=function(){showTab(b.dataset.st)}});
$('sheetX').onclick=function(){$('sheet').classList.add('closed');$('sheetOpen').hidden=false};
$('sheetOpen').onclick=openSheet;
$('lchips').onclick=function(e){var b=e.target.closest('.chip');if(b){selectLayer(+b.dataset.i);refresh()}};
var sg0=null;$('grab').addEventListener('pointerdown',function(e){sg0={y:e.clientY,h:$('sheet').offsetHeight};this.setPointerCapture(e.pointerId)});
$('grab').addEventListener('pointermove',function(e){if(!sg0)return;$('sheet').style.setProperty('--sheeth',clamp(sg0.h+(sg0.y-e.clientY),120,innerHeight*.85)+'px')});
['pointerup','pointercancel'].forEach(function(n){$('grab').addEventListener(n,function(){sg0=null})});
var SVGI={transform:['Transform','<path d="M12 3v18M3 12h18M12 3l-3 3M12 3l3 3M12 21l-3-3M12 21l3-3M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3"/>'],
brush:['Brush','<path d="M18.5 3.5l2 2-9.5 9.5-3-3z"/><path d="M8 12c-2.5 0-3.5 1.8-3.5 3.5 0 1.5-1 2.5-2 3 3 1.2 7-.2 7-3.5"/>'],
eraser:['Eraser','<path d="M7 21h12"/><path d="M5 15l9-9 5 5-6 6H8z"/>'],
bucket:['Fill bucket','<path d="M5 11l6-7 8 8-7 7z"/><path d="M20 16c1.2 1.8 1.5 3 0 3.5-1.5-.5-1.2-1.7 0-3.5z"/>'],
select:['Selection','<rect x="4" y="4" width="16" height="16" rx="1.5" stroke-dasharray="3 3"/>'],
vector:['Vector pen','<path d="M12 3l6 7-3 8H9l-3-8z"/><path d="M12 14v-4"/><circle cx="12" cy="9" r="1"/>'],
veraser:['Vector eraser','<path d="M4 15l7-8 6 6-5 6H8z"/><path d="M14 20h6"/>'],
text:['Text','<path d="M5 7V4h14v3M12 4v16M9 20h6"/>'],
ruler:['Ruler','<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>']};
function icoBtn(b,t,p){b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>';b.title=t;b.setAttribute('aria-label',t);b.classList.add('icon')}
[].forEach.call(document.querySelectorAll('.tools [data-t]'),function(b){var d=SVGI[b.dataset.t];if(d)icoBtn(b,d[0],d[1])});
icoBtn($('addBtn'),'Add layer','<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/><path d="M19 2v5M16.5 4.5h5"/>');

icoBtn($('addShapeBtn'),'Add shape','<rect x="3" y="3" width="11" height="11" rx="1.5"/><circle cx="15.5" cy="15.5" r="5.5"/>');
icoBtn($('editBtn'),'Layer properties (pop-up)','<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>');
icoBtn($('fitBtn'),'Fit canvas','<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>');
$('fitBtn').onclick=function(){view={z:1,x:0,y:0,r:0};$('zV').textContent='100%';draw()};
$('addShapeBtn').onclick=function(){addShape();setTool('transform');openSheet()};
var ab=$('addBtn');ab.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/><path d="M19 2v5M16.5 4.5h5"/></svg> Add layer';ab.classList.remove('icon');ab.style.cssText='display:flex;gap:8px;align-items:center;margin-bottom:8px';
$('sp-layers').insertBefore(ab,$('sp-layers').firstChild);
var ep=$('sp-edit');document.body.appendChild(ep);
function edPop(o){$('epBack').hidden=!o;ep.classList.toggle('epop',o);$('editBtn').setAttribute('aria-pressed',o);if(o)sync()}
$('editBtn').onclick=function(){edPop(!ep.classList.contains('epop'))};$('epX').onclick=function(){edPop(false)};
var ic=$('sp-icon');ic.classList.remove('hide','spane');ic.classList.add('card');ic.insertAdjacentHTML('afterbegin','<h2>Guides & Canvas</h2>');ep.appendChild(ic);
function gA(){return +$('gOp').value/100}
$('gOp').addEventListener('input',function(){$('gOpV').textContent=this.value;draw()});
['bgDotC','bgDotS','bgDotN'].forEach(function(i){$(i).addEventListener('input',draw)});
$('vpSm').oninput=function(){$('vpSmV').textContent=this.value};
function ringLoop(){if(!pad||pad.mv)return;draw();if(performance.now()-pad.t0<450)requestAnimationFrame(ringLoop)}
function opOpen(){var l=cur();if(!l)return;$('opName').textContent=l.name;$('opD').value=l.op;$('opDV').textContent=l.op;$('opDlg').hidden=false}
$('opD').oninput=function(){var l=cur();if(!l)return;l.op=+this.value;$('op').value=this.value;$('opDV').textContent=this.value;draw()};
$('opD').onchange=function(){commit()};$('opX').onclick=function(){$('opDlg').hidden=true};
function toast(m){var t=$('toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(function(){t.hidden=true},3400)}
function maskRestore(l,base){var d=dims(l,400,400),cv=l.cv,R=-d.rot*Math.PI/180,co=Math.cos(R),sn=Math.sin(R),sx=cv.width/d.w,sy=cv.height/d.h,M=[sx*co,sy*sn,-sx*sn,sy*co,sx*(d.w/2-d.cx*co+d.cy*sn),sy*(d.h/2-d.cx*sn-d.cy*co)];
  var cu=cc(cv),a=cu.getContext('2d');a.save();a.setTransform.apply(a,M);a.globalCompositeOperation='destination-in';a.drawImage(sel,0,0);a.restore();
  var b=cc(base),bx=b.getContext('2d');bx.save();bx.setTransform.apply(bx,M);bx.globalCompositeOperation='destination-out';bx.drawImage(sel,0,0);bx.restore();
  var c=cv.getContext('2d');c.save();c.setTransform(1,0,0,1,0,0);c.globalCompositeOperation='source-over';c.clearRect(0,0,cv.width,cv.height);c.drawImage(b,0,0);c.drawImage(cu,0,0);c.restore()}
function idxById(id){for(var i=0;i<L.length;i++)if(L[i].id===id)return i;return -1}
function fl(o){bakeFloat();var t=cur();if(t&&t.type==='vec'&&o.type==='shape')return shapeVec(o);if(t&&t.type==='vec')toast('Text cannot live inside a vector layer, so it went on a new raster layer.');if(!t||!t.cv)t=addDraw();o.float=true;o.target=t.id;return newLayer(o)}
function roundAt(l,i,r){var p=l.pts,n=p.length,q=p[i];if(q.hx!==undefined&&!q.c)return false;if(!l.closed&&(i===0||i===n-1))return false;
  var a=p[(i-1+n)%n],b=p[(i+1)%n],ux=a.x-q.x,uy=a.y-q.y,vx=b.x-q.x,vy=b.y-q.y,l1=Math.hypot(ux,uy),l2=Math.hypot(vx,vy);if(l1<1||l2<1)return false;
  var rr=Math.min(r,l1/2,l2/2),K=.5523;ux/=l1;uy/=l1;vx/=l2;vy/=l2;
  p.splice(i,1,{x:q.x+ux*rr,y:q.y+uy*rr,hx:-ux*rr*K,hy:-uy*rr*K},{x:q.x+vx*rr,y:q.y+vy*rr,hx:vx*rr*K,hy:vy*rr*K});return true}
function shapeVec(o){var H=100,pts,sm=false,closed=true,k=o.kind,extra={};
  if(k==='ellipse'){var K=55.23;pts=[{x:0,y:-H,hx:K,hy:0},{x:H,y:0,hx:0,hy:K},{x:0,y:H,hx:-K,hy:0},{x:-H,y:0,hx:0,hy:-K}];sm=true}
  else if(k==='line'){pts=[{x:-H,y:0,c:true},{x:H,y:0,c:true}];closed=false;extra={arE:'arrow',arZ:3}}
  else{var P=k==='triangle'?[[.5,0],[1,1],[0,1]]:k==='diamond'?[[.5,0],[1,.5],[.5,1],[0,.5]]:k==='hexagon'?[[.5,0],[1,.25],[1,.75],[.5,1],[0,.75],[0,.25]]:k==='star'?starPts():[[0,0],[1,0],[1,1],[0,1]];pts=P.map(function(q){return{x:(q[0]-.5)*2*H,y:(q[1]-.5)*2*H,c:true}})}
  var lay=newLayer(Object.assign({type:'vec',name:k==='line'?'Line':'Shape',pts:pts,closed:closed,smooth:.5,smoothLine:sm,stroke:o.stroke,width:o.width||6,fillOn:closed,fill:o.fill},extra));
  if(k==='rrect'){for(var i=lay.pts.length-1;i>=0;i--)roundAt(lay,i,35);lay.smoothLine=true;draw()}return lay}
function bakeFloat(){var fi=-1;for(var i=0;i<L.length;i++)if(L[i].float){fi=i;break}if(fi<0)return;var f=L[fi],ti=idxById(f.target),t=ti>=0?L[ti]:null;
  if(!t||!t.cv){f.float=false;delete f.target;refresh();return}
  var d=dims(t,400,400),cv=t.cv,c=cv.getContext('2d'),R=-d.rot*Math.PI/180,co=Math.cos(R),sn=Math.sin(R),sx=cv.width/d.w,sy=cv.height/d.h;
  c.save();c.setTransform(sx*co,sy*sn,-sx*sn,sy*co,sx*(d.w/2-d.cx*co+d.cy*sn),sy*(d.h/2-d.cx*sn-d.cy*co));drawL(c,f,400,400);c.restore();
  t.ver=(t.ver||0)+1;L.splice(fi,1);act=idxById(t.id);selPt=-1;refresh();commit()}
function rsn(p,a){var q={x:p.x,y:p.y};if(G('gShow')){var gs=400/+$('gDiv').value;q.x=Math.round(q.x/gs)*gs;q.y=Math.round(q.y/gs)*gs}else if($('rlSnap').checked&&a){var dx=q.x-a.x,dy=q.y-a.y,ln=Math.hypot(dx,dy),an=Math.round(Math.atan2(dy,dx)/(Math.PI/12))*(Math.PI/12);q={x:a.x+Math.cos(an)*ln,y:a.y+Math.sin(an)*ln}}return q}
$('rlClr').onclick=function(){rul=null;draw()};
[].forEach.call($('rlType').children,function(b){b.onclick=function(){rtype=b.dataset.rt;[].forEach.call($('rlType').children,function(x){x.setAttribute('aria-pressed',x===b)});if(rul){rul.t=rtype;draw()}}});
function mshOpts(){return[+$('mshX').value,+$('mshY').value]}
$('mshOn').onchange=function(){var l=cur();if(this.checked&&l&&l.cv&&!l.mesh){var o=mshOpts();l.mesh=meshMk(o[0],o[1])}mshSync();draw()};
['mshX','mshY'].forEach(function(id){$(id).oninput=function(){$(id+'V').textContent=this.value;var l=cur();if(l&&l.cv){var o=mshOpts();l.mesh=meshMk(o[0],o[1],l.mesh);l.ver=(l.ver||0)+1;draw()}};$(id).onchange=commit});
$('mshReset').onclick=function(){var l=cur();if(!l||!l.cv)return;delete l.mesh;if($('mshOn').checked){var o=mshOpts();l.mesh=meshMk(o[0],o[1])}l.ver=(l.ver||0)+1;draw();commit()};
function rproj(p){
  if(!rul||!$('rlFollow').checked||(tool!=='brush'&&tool!=='eraser'))return p;
  var ax=rul.a.x,ay=rul.a.y,dx=rul.b.x-ax,dy=rul.b.y-ay,L2=dx*dx+dy*dy,R=Math.sqrt(L2),th=40/view.z;if(R<2)return p;
  if(rul.t==='circle'){var vx=p.x-ax,vy=p.y-ay,dd=Math.hypot(vx,vy)||1;if(Math.abs(dd-R)>th)return p;return{x:ax+vx/dd*R,y:ay+vy/dd*R}}
  var t=((p.x-ax)*dx+(p.y-ay)*dy)/L2,qx=ax+dx*t,qy=ay+dy*t;if(Math.hypot(p.x-qx,p.y-qy)>th)return p;return{x:qx,y:qy}}
function mkGrad(host,get,after){host.innerHTML='<label class="opt"><input type="checkbox" class="gOn"> Gradient</label><div class="gbox hide"><label class="mini">Color 2 <input type="color" class="g2" value="#ffffff"></label><label class="mini">Angle <span class="gAV">90</span>°<input type="range" class="gA" min="0" max="360" value="90"></label><label class="opt"><input type="checkbox" class="gR"> Radial</label></div>';
  var q=function(c){return host.querySelector(c)};function g(){var l=get();return l?(l.grad||(l.grad={on:false,c2:'#ffffff',ang:90,rad:false})):null}
  q('.gOn').onchange=function(){var o=g();if(o){o.on=this.checked;q('.gbox').classList.toggle('hide',!o.on);after()}};
  q('.g2').oninput=function(){var o=g();if(o){o.c2=this.value;after()}};
  q('.gA').oninput=function(){var o=g();if(o){o.ang=+this.value;q('.gAV').textContent=this.value;after()}};
  q('.gR').onchange=function(){var o=g();if(o){o.rad=this.checked;after()}};
  ['.gOn','.g2','.gA','.gR'].forEach(function(c){q(c).addEventListener('change',function(){if(get()&&get()!==bkH)commit()})});
  return{sync:function(){var o=get(),gg=(o&&o.grad)||{on:false,c2:'#ffffff',ang:90,rad:false};q('.gOn').checked=gg.on;q('.gbox').classList.toggle('hide',!gg.on);q('.g2').value=gg.c2;q('.gA').value=gg.ang;q('.gAV').textContent=gg.ang;q('.gR').checked=gg.rad}}}
function addHost(id,into){var h=document.createElement('div');h.id=id;h.className='gradh';into.appendChild(h);return h}
gradS=mkGrad(addHost('gradS',$('tfProps').querySelector('.pb')),tfl,draw);
gradT=mkGrad(addHost('gradT',$('edText').querySelector('.pb')),tl2,draw);
gradV=mkGrad(addHost('gradV',$('vp-fill')),vl,draw);
gradB=mkGrad(addHost('gradB',$('g-bucket')),function(){return bkH},function(){});
$('vDashOn').onchange=function(){var l=vl();if(l){l.dashOn=this.checked;draw();commit()}};
[['vDash','dash','vDashV'],['vGap','gap','vGapV'],['vArZ','arZ','vArZV']].forEach(function(a){$(a[0]).oninput=function(){var l=vl();if(l){l[a[1]]=+this.value;$(a[2]).textContent=this.value;draw()}};$(a[0]).addEventListener('change',commit)});
['vArS','vArE'].forEach(function(id){$(id).onchange=function(){var l=vl();if(l){l[id==='vArS'?'arS':'arE']=this.value;draw();commit()}}});
[].forEach.call($('vJoin').children,function(b){b.onclick=function(){var l=vl();if(l){l.join=b.dataset.join;sync();draw();commit()}}});
$('vRad').oninput=function(){$('vRadV').textContent=this.value};
$('vRoundSel').onclick=function(){var l=vl();if(l&&selPt>=0&&roundAt(l,selPt,+$('vRad').value)){l.smoothLine=true;sync();draw();commit()}};
$('vRoundAll').onclick=function(){var l=vl();if(!l)return;var ch=false;for(var i=l.pts.length-1;i>=0;i--)if(l.pts[i].c&&roundAt(l,i,+$('vRad').value))ch=true;if(ch){l.smoothLine=true;selPt=-1;sync();draw();commit()}};
[].forEach.call($('vShapes').children,function(b){b.onclick=function(){var l=vl();shapeVec({kind:b.dataset.vs,stroke:l?l.stroke:'#ffffff',width:l?l.width:6,fill:l?l.fill:'#ff8a00'})}});
$('mRad').addEventListener('input',function(){$('mRadV').textContent=this.value;draw()});
$('epBack').onclick=function(){edPop(false)};
function cloneLayer(l){var o=Object.assign({},l);if(l.cv)o.cv=cc(l.cv);['pts','st','rads','grad'].forEach(function(k){if(l[k])o[k]=JSON.parse(JSON.stringify(l[k]))});return o}
function insertLayer(o,d){o.id=++uid;o.name=(o.name||'Layer').replace(/ copy$/,'')+' copy';o.x=(o.x||0)+d;o.y=(o.y||0)+d;var at=act>=0&&act<L.length?act+1:L.length;L.splice(at,0,o);act=at;selPt=-1;refresh();commit();return o}
function objDup(){var l=cur();if(!l)return;var c=cloneLayer(l);if(l.float){bakeFloat();var ti=idxById(c.target);if(ti>=0)act=ti}insertLayer(c,4)}
function objCopy(){var l=cur();if(!l)return;clipObj=cloneLayer(l);toast('Copied');placeObjBar()}
function objPaste(){if(!clipObj)return;bakeFloat();var c=cloneLayer(clipObj);if(c.float){var t=cur();if(t&&t.cv&&!t.float)c.target=t.id;else{c.float=false;delete c.target}}insertLayer(c,4)}
function objDel(){var i=act;if(i<0||i>=L.length)return;var l=L[i];L.splice(i,1);act=l.float?idxById(l.target):Math.min(i,L.length-1);selPt=-1;refresh();commit()}
$('obDup').onclick=objDup;$('obCopy').onclick=objCopy;$('obPaste').onclick=objPaste;$('obDel').onclick=objDel;
function placeObjBar(){var b=$('objBar');if(!b)return;var l=cur(),show=tool==='transform'&&l&&!tfm&&!selMove&&!rdrag;if(!show){b.hidden=true;return}var bb=aabb(l);if(!bb){b.hidden=true;return}
  var a=view.r||0,co=Math.cos(a),si=Math.sin(a),minY=1e9,maxY=-1e9,sx=0;
  [[bb.x0,bb.y0],[bb.x1,bb.y0],[bb.x1,bb.y1],[bb.x0,bb.y1]].forEach(function(q){var dx=q[0]-200,dy=q[1]-200,X=(dx*co-dy*si)*view.z+200+view.x,Y=(dx*si+dy*co)*view.z+200+view.y;sx+=X/4;if(Y<minY)minY=Y;if(Y>maxY)maxY=Y});
  var top=minY-10,below=false;if(top<60){top=maxY+10;below=true}top=Math.max(8,Math.min(392,top));sx=Math.max(80,Math.min(320,sx));
  b.style.left=sx/4+'%';b.style.top=top/4+'%';b.style.transform=below?'translate(-50%,0)':'translate(-50%,-100%)';b.hidden=false;$('obPaste').disabled=!clipObj}
document.addEventListener('keydown',function(e){if(e.key==='Escape')$('opDlg').hidden=true;var t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable))return;if($('p-editor').hidden)return;
  var m=e.ctrlKey||e.metaKey,k=(e.key||'').toLowerCase();
  if(k==='delete'||k==='backspace'){if(cur()){objDel();e.preventDefault()}}
  else if(m&&k==='d'){objDup();e.preventDefault()}else if(m&&k==='c'){objCopy()}else if(m&&k==='v'){objPaste()}
  else if(m&&k==='z'){e.shiftKey?$('redo').click():$('undo').click();e.preventDefault()}else if(m&&k==='y'){$('redo').click();e.preventDefault()}});
$('rulerOn').addEventListener('change',draw);
$('dock').appendChild($('tfProps'));$('dock').appendChild($('edText'));
setTool('transform');
renderList();sync();tree();draw();stepUI();commit();
})();