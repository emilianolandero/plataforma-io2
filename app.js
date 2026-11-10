const $=id=>document.getElementById(id);
const fm=v=>Number.isFinite(v)?(+v.toFixed(4)).toLocaleString('es-MX',{maximumFractionDigits:4}):'no definido';
const cards=a=>'<div class="cards">'+a.map(([l,v,b])=>'<div class="cd'+(b?' big':'')+'"><b>'+v+'</b><span>'+l+'</span></div>').join('')+'</div>';
function nav(){const h=(location.hash||'#inicio').slice(1);const id=['inicio','simplex','pnl','inventarios','colas'].includes(h)?h:'inicio';
document.querySelectorAll('section').forEach(s=>s.classList.toggle('on',s.id===id));document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.dataset.s===id));}
addEventListener('hashchange',nav);
function vis(sel,pre){const v=$(sel).value;document.querySelectorAll('[data-'+pre+']').forEach(e=>e.classList.toggle('hide',!e.dataset[pre].split(' ').includes(v)));}

/* ---------- SIMPLEX ---------- */
const EX={c:[3,5],A:[[1,0],[0,2],[3,2]],b:[4,12,18]};
function grid(){const n=+$('sn').value,m=+$('sm').value;let h='<table class="in"><tr><th></th>';
for(let j=0;j<n;j++)h+='<th>x'+(j+1)+'</th>';h+='<th>Tipo</th><th>b</th></tr><tr><th>Z</th>';
for(let j=0;j<n;j++)h+='<td><input id="c'+j+'" type="number" step="any" value="'+(EX.c[j]??0)+'" aria-label="Coeficiente de x'+(j+1)+' en Z"></td>';
h+='<td></td><td></td></tr>';
for(let i=0;i<m;i++){h+='<tr><th>R'+(i+1)+'</th>';for(let j=0;j<n;j++)h+='<td><input id="a'+i+'_'+j+'" type="number" step="any" value="'+(EX.A[i]?.[j]??0)+'" aria-label="Restricción '+(i+1)+', x'+(j+1)+'"></td>';
h+='<td><select id="t'+i+'" style="width:4.5rem"><option>&lt;=</option><option>&gt;=</option><option>=</option></select></td><td><input id="b'+i+'" type="number" step="any" value="'+(EX.b[i]??0)+'" aria-label="Lado derecho '+(i+1)+'"></td></tr>';}
$('sg').innerHTML=h+'</table>';}
function solveSimplex(){
const n=+$('sn').value,m=+$('sm').value,mx=$('sobj').value==='max',M=1e7;
const c=[],R=[];for(let j=0;j<n;j++)c.push((+$('c'+j).value||0)*(mx?1:-1));
for(let i=0;i<m;i++){let a=[],t=$('t'+i).value,b=+$('b'+i).value||0;for(let j=0;j<n;j++)a.push(+$('a'+i+'_'+j).value||0);
if(b<0){a=a.map(v=>-v);b=-b;t=t==='<='?'>=':t==='>='?'<=':'='}R.push({a,t,b});}
const T=R.map(r=>r.a.slice()),rhs=R.map(r=>r.b),names=[],cost=[],isA=[],basis=[];
for(let j=0;j<n;j++){names.push('x'+(j+1));cost.push(c[j]);isA.push(false);}
const add=(i,v,nm,art)=>{names.push(nm);cost.push(0);isA.push(art);T.forEach((r,k)=>r.push(k===i?v:0));return names.length-1};
R.forEach((r,i)=>{if(r.t==='<=')basis[i]=add(i,1,'s'+(i+1),false);else{if(r.t==='>=')add(i,-1,'e'+(i+1),false);basis[i]=add(i,1,'a'+(i+1),true);}});
const N=names.length,z0=names.map((_,j)=>-cost[j]).concat(0),zM=names.map((_,j)=>isA[j]?1:0).concat(0);
basis.forEach((b,i)=>{if(isA[b]){for(let j=0;j<N;j++)zM[j]-=T[i][j];zM[N]-=rhs[i];}});
const snaps=[];let status='ok',it=0;
const snap=p=>snaps.push({T:T.map(r=>r.slice()),rhs:rhs.slice(),z0:z0.slice(),zM:zM.slice(),basis:basis.slice(),p});
while(true){let e=-1,mv=-1e-9;for(let j=0;j<N;j++){const v=z0[j]+zM[j]*M;if(v<mv){mv=v;e=j}}
if(e<0){snap(null);break}
let l=-1,best=Infinity;for(let i=0;i<m;i++)if(T[i][e]>1e-9){const q=rhs[i]/T[i][e];if(q<best-1e-12){best=q;l=i}}
if(l<0){status='unb';snap(null);break}
snap([l,e]);const pv=T[l][e];for(let j=0;j<N;j++)T[l][j]/=pv;rhs[l]/=pv;
for(let i=0;i<m;i++)if(i!==l){const f=T[i][e];if(f){for(let j=0;j<N;j++)T[i][j]-=f*T[l][j];rhs[i]-=f*rhs[l];}}
const f0=z0[e],fM=zM[e];for(let j=0;j<N;j++){z0[j]-=f0*T[l][j];zM[j]-=fM*T[l][j];}z0[N]-=f0*rhs[l];zM[N]-=fM*rhs[l];
basis[l]=e;if(++it>60){status='lim';break}}
const z=(a,b)=>Math.abs(b)<1e-9?fm(a):fm(b)+'M'+(Math.abs(a)<1e-9?'':(a>0?'+':'-')+fm(Math.abs(a)));
let h='';
snaps.forEach((s,k)=>{h+='<h3>'+(k===snaps.length-1?'Tabla final':'Iteración '+k)+(s.p?' <span class="note">(entra '+names[s.p[1]]+', sale '+names[s.basis[s.p[0]]]+')</span>':'')+'</h3><div class="sc"><table><tr><th>Base</th>'+names.map(x=>'<th>'+x+'</th>').join('')+'<th>LD</th></tr>';
s.T.forEach((r,i)=>{h+='<tr><th>'+names[s.basis[i]]+'</th>'+r.map((v,j)=>'<td'+(s.p&&s.p[0]===i&&s.p[1]===j?' class="p"':'')+'>'+fm(v)+'</td>').join('')+'<td>'+fm(s.rhs[i])+'</td></tr>';});
h+='<tr><th>Z</th>'+s.z0.map((v,j)=>'<td>'+z(v,s.zM[j])+'</td>').join('')+'</tr></table></div>';});
let head;
if(status==='unb')head='<p class="err">El problema no está acotado: la variable que entra no tiene fila pivote.</p>';
else if(status==='lim')head='<p class="err">Se alcanzó el límite de 60 iteraciones. Puede haber ciclado.</p>';
else if(basis.some((b,i)=>isA[b]&&rhs[i]>1e-7))head='<p class="err">El problema no tiene solución factible: una variable artificial quedó en la base con valor positivo.</p>';
else{const x=Array(n).fill(0);basis.forEach((b,i)=>{if(b<n)x[b]=rhs[i]});const Z=z0[N]*(mx?1:-1);
const alt=names.some((_,j)=>!isA[j]&&!basis.includes(j)&&Math.abs(z0[j]+zM[j]*M)<1e-9);
head=cards([['Valor óptimo Z',fm(Z),1]].concat(x.map((v,j)=>['x'+(j+1),fm(v)])))+(alt?'<p class="note">Hay una variable no básica con costo reducido 0: existen soluciones óptimas alternativas.</p>':'');}
$('so').innerHTML='<div class="box">'+head+'</div><h3>Procedimiento</h3>'+h;}

/* ---------- PROGRAMACIÓN NO LINEAL ---------- */
const mkf=s=>new Function('x','y','z','with(Math){return ('+s.replace(/\^/g,'**')+')}');
function nm(f,x0,it=3000){const n=x0.length;let S=[x0.slice()];
for(let i=0;i<n;i++){const p=x0.slice();p[i]+=Math.abs(p[i])>1e-8?0.1*Math.abs(p[i])+0.05:0.1;S.push(p);}
let F=S.map(f);
for(let k=0;k<it;k++){const o=F.map((_,i)=>i).sort((a,b)=>F[a]-F[b]);S=o.map(i=>S[i]);F=o.map(i=>F[i]);
if(k>50&&Math.abs(F[n]-F[0])<1e-14*(1+Math.abs(F[0])))break;
const c=S[0].map((_,j)=>S.slice(0,n).reduce((a,p)=>a+p[j],0)/n),pt=t=>c.map((v,j)=>v+t*(S[n][j]-v)),xr=pt(-1),fr=f(xr);
if(fr<F[0]){const xe=pt(-2),fe=f(xe);if(fe<fr){S[n]=xe;F[n]=fe}else{S[n]=xr;F[n]=fr}}
else if(fr<F[n-1]){S[n]=xr;F[n]=fr}
else{const xc=fr<F[n]?pt(-.5):pt(.5),fc=f(xc);if(fc<Math.min(fr,F[n])){S[n]=xc;F[n]=fc}else for(let i=1;i<=n;i++){S[i]=S[i].map((v,j)=>S[0][j]+.5*(v-S[0][j]));F[i]=f(S[i]);}}}
const b=F.indexOf(Math.min(...F));return{x:S[b],f:F[b]}}
function det(A){const n=A.length;if(n===1)return A[0][0];let d=0;for(let j=0;j<n;j++)d+=(j%2?-1:1)*A[0][j]*det(A.slice(1).map(r=>r.filter((_,k)=>k!==j)));return d}
function pex(){$('pf').value='x*y';$('pg').value='x + 2*y = 10';$('pobj').value='max';$('px0').value='1, 1';$('pn').value=2;}
function solvePNL(){const o=$('po');
try{const n=Math.min(3,Math.max(1,+$('pn').value)),sg=$('pobj').value==='max'?-1:1,fn=mkf($('pf').value);
const F=v=>fn(v[0],v[1]||0,v[2]||0);
let x0=$('px0').value.split(/[,\s]+/).filter(Boolean).map(Number);while(x0.length<n)x0.push(0);x0=x0.slice(0,n);
const G=$('pg').value.split('\n').map(s=>s.trim()).filter(Boolean).map(s=>{const m=s.match(/(<=|>=|=)/);if(!m)throw Error('Restricción sin operador: '+s);
const [a,b]=s.split(m[0]);const ga=mkf(a),gb=mkf(b);return{t:m[0],txt:s,g:v=>ga(v[0],v[1]||0,v[2]||0)-gb(v[0],v[1]||0,v[2]||0)}});
const viol=v=>G.map(r=>r.t==='='?Math.abs(r.g(v)):r.t==='<='?Math.max(0,r.g(v)):Math.max(0,-r.g(v)));
let x=x0,rows='';const mus=G.length?[10,100,1e3,1e4,1e5,1e6]:[0];
mus.forEach(mu=>{const P=v=>sg*F(v)+mu*viol(v).reduce((a,b)=>a+b*b,0);let r;for(let k=0;k<4;k++){r=nm(P,x);x=r.x;}
rows+='<tr><td>'+(mu||'-')+'</td><td>'+x.map(fm).join(', ')+'</td><td>'+fm(F(x))+'</td><td>'+(G.length?Math.max(...viol(x)).toExponential(2):'-')+'</td></tr>';});
const fx=F(x);let cls='';
if(!G.length){const h=1e-3,H=x.map((_,i)=>x.map((_,j)=>{const e=(a,b)=>{const p=x.slice();p[i]+=a*h;p[j]+=b*h;return F(p)};return(e(1,1)-e(1,-1)-e(-1,1)+e(-1,-1))/(4*h*h)}));
const mn=H.map((_,k)=>det(H.slice(0,k+1).map(r=>r.slice(0,k+1))));
const pd=mn.every(d=>d>1e-6),nd=mn.every((d,k)=>(k%2?-d:d)>1e-6);
cls=pd?'La matriz Hessiana es definida positiva: mínimo local.':nd?'La matriz Hessiana es definida negativa: máximo local.':'La Hessiana no es definida: el punto puede ser de silla o la prueba no es concluyente.';
cls+='<br>Menores principales de la Hessiana: '+mn.map(fm).join(', ')+'.';}
const ok=!G.length||Math.max(...viol(x))<1e-4;
o.innerHTML='<div class="box">'+cards([['f en el '+(sg>0?'mínimo':'máximo'),fm(fx),1]].concat(x.map((v,i)=>['xyz'[i],fm(v)])))+(cls?'<p>'+cls+'</p>':'')+(ok?'':'<p class="err">Las restricciones no se cumplen del todo. Prueba otro punto inicial.</p>')+
'<p class="note">Método: búsqueda directa Nelder-Mead'+(G.length?' con penalización cuadrática creciente (μ)':'')+'. El resultado es un óptimo local cercano al punto inicial.</p></div><h3>Procedimiento</h3><div class="sc"><table><tr><th>μ</th><th>Punto</th><th>f</th><th>Violación máx.</th></tr>'+rows+'</table></div>';
}catch(e){o.innerHTML='<p class="err">No se pudo evaluar: '+e.message+'</p>'}}

/* ---------- INVENTARIOS ---------- */
function solveInv(){const v=id=>+$(id).value,m=$('im').value,D=v('iD'),K=v('iK'),h=v('ih'),c=v('ic'),L=v('iL'),N=v('iN'),d=D/N;
let Q,TC,ex=[],st;
if(m==='eoq'){Q=Math.sqrt(2*D*K/h);TC=D*K/Q+h*Q/2;ex=[['Inventario máximo',fm(Q)]];st=['Q* = √(2·D·Co/Ch)','CT = D·Co/Q + Ch·Q/2'];}
else if(m==='fal'){const p=v('ip');Q=Math.sqrt(2*D*K/h)*Math.sqrt((h+p)/p);const S=Q*p/(h+p);TC=D*K/Q+h*S*S/(2*Q)+p*(Q-S)**2/(2*Q);ex=[['Inventario máximo S*',fm(S)],['Faltante máximo',fm(Q-S)]];st=['Q* = √(2·D·Co/Ch)·√((Ch+p)/p)','S* = Q*·p/(Ch+p)','CT = D·Co/Q + Ch·S²/(2Q) + p·(Q-S)²/(2Q)'];}
else{const P=v('iP');if(P<=D){$('io').innerHTML='<p class="err">La tasa de producción P debe ser mayor que la demanda D.</p>';return}
Q=Math.sqrt(2*D*K/(h*(1-D/P)));const I=Q*(1-D/P);TC=D*K/Q+h*I/2;ex=[['Inventario máximo',fm(I)],['Tiempo de producción',fm(Q/P)+' años']];st=['Q* = √(2·D·Co/(Ch·(1-D/P)))','Imáx = Q*·(1-D/P)','CT = D·Co/Q + Ch·Imáx/2'];}
$('io').innerHTML='<div class="box">'+cards([['Lote óptimo Q*',fm(Q),1],['Costo total anual',fm(TC+c*D)],['Pedidos por año',fm(D/Q)],['Tiempo entre pedidos',fm(Q/D)+' años'],['Punto de reorden',fm(d*L)]].concat(ex))+
'<p class="note">Punto de reorden = (D / periodos por año) · tiempo de entrega'+(c?'. El costo total incluye c·D.':'.')+'</p></div><h3>Fórmulas</h3><p>'+st.join('<br>')+'</p>';}

/* ---------- LÍNEAS DE ESPERA ---------- */
function solveQ(){const m=$('qm').value,l=+$('ql').value,u=+$('qu').value;let r=[],P=[],t='',h='';const o=$('qo');
const fact=n=>n<2?1:n*fact(n-1);
if(!(l>0&&u>0)){o.innerHTML='<p class="err">λ y μ deben ser positivos.</p>';return}
const out=(P0,L,Lq,W,Wq,extra)=>{r=[['Utilización ρ',fm(extra.rho)],['P0 (sistema vacío)',fm(P0)],['L, clientes en el sistema',fm(L),1],['Lq, clientes en la cola',fm(Lq)],['W, tiempo en el sistema',fm(W),1],['Wq, tiempo en la cola',fm(Wq)]].concat(extra.more||[]);};
if(m==='mm1'){const p=l/u;if(p>=1){o.innerHTML='<p class="err">Sistema inestable: λ debe ser menor que μ.</p>';return}
out(1-p,p/(1-p),p*p/(1-p),1/(u-l),p/(u-l),{rho:p,more:[['P(n > 5)',fm(p**6)]]});for(let n=0;n<=6;n++)P.push((1-p)*p**n);t='L = ρ/(1-ρ), Lq = ρ²/(1-ρ), W = 1/(μ-λ), Wq = ρ/(μ-λ)';}
else if(m==='mms'){const s=+$('qs').value,a=l/u,p=a/s;if(p>=1){o.innerHTML='<p class="err">Sistema inestable: λ debe ser menor que s·μ.</p>';return}
let sum=0;for(let n=0;n<s;n++)sum+=a**n/fact(n);const P0=1/(sum+a**s/(fact(s)*(1-p))),Lq=P0*a**s*p/(fact(s)*(1-p)**2),Wq=Lq/l,W=Wq+1/u;
out(P0,l*W,Lq,W,Wq,{rho:p,more:[['Probabilidad de esperar',fm(P0*a**s/(fact(s)*(1-p)))]]});for(let n=0;n<=s+5;n++)P.push(n<=s?a**n/fact(n)*P0:a**n/(fact(s)*s**(n-s))*P0);t='P0 = [Σ(n<s) rⁿ/n! + rˢ/(s!(1-ρ))]⁻¹, Lq = P0·rˢ·ρ/(s!(1-ρ)²), W = Lq/λ + 1/μ, L = λW';}
else if(m==='mm1k'){const K=+$('qk').value,p=l/u,eq=Math.abs(p-1)<1e-9;const P0=eq?1/(K+1):(1-p)/(1-p**(K+1));
const L=eq?K/2:p/(1-p)-(K+1)*p**(K+1)/(1-p**(K+1)),Pk=P0*p**K,le=l*(1-Pk),Lq=L-(1-P0);
out(P0,L,Lq,L/le,Lq/le,{rho:p,more:[['P(sistema lleno)',fm(Pk)],['λ efectiva',fm(le)]]});for(let n=0;n<=K;n++)P.push(P0*p**n);t='Pn = P0·ρⁿ, λe = λ(1-PK), W = L/λe, Wq = Lq/λe';}
else{const s2=+$('qd').value,p=l/u;if(p>=1){o.innerHTML='<p class="err">Sistema inestable: λ debe ser menor que μ.</p>';return}
const Lq=(l*l*s2*s2+p*p)/(2*(1-p)),Wq=Lq/l,W=Wq+1/u;out(1-p,l*W,Lq,W,Wq,{rho:p});t='Lq = (λ²σ² + ρ²)/(2(1-ρ)) (Pollaczek-Khinchine), Wq = Lq/λ, W = Wq + 1/μ, L = λW';}
if(P.length)h='<h3>Probabilidad de n clientes</h3><div class="sc"><table><tr><th>n</th>'+P.map((_,n)=>'<th>'+n+'</th>').join('')+'</tr><tr><th>Pn</th>'+P.map(v=>'<td>'+fm(v)+'</td>').join('')+'</tr></table></div>';
o.innerHTML='<div class="box">'+cards(r)+'</div>'+h+'<h3>Fórmulas</h3><p>'+t+'</p>';}

grid();vis('im','i');vis('qm','q');nav();
