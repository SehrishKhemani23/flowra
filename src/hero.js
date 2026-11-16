// FLOWRA AI hero: glass sphere, plasma core, particles, orbital rings, light trails.
import {WebGLRenderer,Scene,PerspectiveCamera,Group,Mesh,SphereGeometry,TorusGeometry,ShaderMaterial,MeshBasicMaterial,
 PointsMaterial,Points,BufferGeometry,BufferAttribute,Line,LineBasicMaterial,CanvasTexture,AdditiveBlending,BackSide,Color,Vector3} from 'three';

const noise=`float h(vec3 p){p=fract(p*.3183+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}`;
const vs=`varying vec3 vN,vP,vV;void main(){vec4 m=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vP=position;vV=normalize(-m.xyz);gl_Position=projectionMatrix*m;}`;
const glassFS=`varying vec3 vN,vV;void main(){float f=pow(1.-max(dot(normalize(vN),normalize(vV)),0.),2.6);
vec3 L1=normalize(vec3(-.6,.8,.7)),L2=normalize(vec3(.7,-.3,.5));vec3 N=normalize(vN);
float s=pow(max(dot(reflect(-L1,N),normalize(vV)),0.),90.)*.9+pow(max(dot(reflect(-L2,N),normalize(vV)),0.),50.)*.35;
vec3 c=mix(vec3(.33,.13,.54),vec3(.73,.6,.94),f)+s;gl_FragColor=vec4(c,.05+f*.7+s);}`;
const coreFS=`uniform float t;varying vec3 vN,vP,vV;${noise}
void main(){vec3 p=vP*1.6;float a=n(p+vec3(t*.25,t*.18,-t*.2))*.6+n(p*2.1-vec3(t*.3,0,t*.22))*.4;
float f=pow(1.-max(dot(normalize(vN),normalize(vV)),0.),1.6);
vec3 c=mix(vec3(.2,.06,.36),vec3(.73,.6,.94),smoothstep(.3,.85,a));c=mix(c,vec3(.9,.85,1.),smoothstep(.75,1.,a)*.6);
gl_FragColor=vec4(c,.55+.3*(1.-f)+.15*a);}`;

function sprite(){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);
r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.4,'rgba(230,217,255,.5)');r.addColorStop(1,'rgba(185,154,239,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return new CanvasTexture(c)}
function cloud(n,rMin,rMax,size,op,tex){const a=new Float32Array(n*3),v=new Vector3();
for(let i=0;i<n;i++){v.randomDirection().multiplyScalar(rMin+Math.cbrt(Math.random())*(rMax-rMin));a.set([v.x,v.y,v.z],i*3)}
const g=new BufferGeometry();g.setAttribute('position',new BufferAttribute(a,3));
return new Points(g,new PointsMaterial({map:tex,size,transparent:true,opacity:op,depthWrite:false,blending:AdditiveBlending,color:0xe6d9ff}))}

export function startHero(box){
 const small=matchMedia('(max-width:820px)').matches,still=matchMedia('(prefers-reduced-motion:reduce)').matches;
 let R;try{R=new WebGLRenderer({alpha:true,antialias:!small,powerPreference:'high-performance'})}catch(e){return}
 const cam=new PerspectiveCamera(35,1,.1,50);cam.position.z=7.4;const sc=new Scene(),root=new Group();sc.add(root);
 const U={t:{value:0}},tex=sprite();
 root.add(new Mesh(new SphereGeometry(1.55,48,48),new MeshBasicMaterial({color:0x190b2d,transparent:true,opacity:.35,side:BackSide,depthWrite:false})));
 root.add(new Mesh(new SphereGeometry(1.05,48,48),new ShaderMaterial({uniforms:U,vertexShader:vs,fragmentShader:coreFS,transparent:true,depthWrite:false})));
 root.add(cloud(small?90:220,.2,1.35,.07,.9,tex));
 root.add(new Mesh(new SphereGeometry(1.55,64,64),new ShaderMaterial({vertexShader:vs,fragmentShader:glassFS,transparent:true,depthWrite:false})));
 const far=cloud(small?70:200,1.9,3.6,.06,.7,tex);sc.add(far);
 const rings=[[1.85,.012,[1.2,0,.3],.25],[2.05,.008,[.5,0,-.6],-.17],[2.25,.006,[1.45,0,.9],.12]].map(([r,w,tilt,sp],i)=>{
  const g=new Group();g.rotation.set(...tilt);g.add(new Mesh(new TorusGeometry(r,w,8,180),new MeshBasicMaterial({color:i?0xb99aef:0xe6d9ff,transparent:true,opacity:.45,depthWrite:false})));
  const N=46,pos=new Float32Array(N*3),col=new Float32Array(N*3),geo=new BufferGeometry(),c=new Color(0xb99aef);
  for(let k=0;k<N;k++){const f=1-k/N;col.set([c.r*f,c.g*f,c.b*f],k*3)}
  geo.setAttribute('position',new BufferAttribute(pos,3));geo.setAttribute('color',new BufferAttribute(col,3));
  g.add(new Line(geo,new LineBasicMaterial({vertexColors:true,transparent:true,blending:AdditiveBlending,depthWrite:false})));root.add(g);return{g,r,sp,pos,geo,N,o:i*2.1}});
 box.append(R.domElement);R.domElement.setAttribute('aria-hidden','true');
 let W=0,t=0,last=0,vis=true,mx=0,my=0,raf=0;
 const size=()=>{const w=box.clientWidth,h=box.clientHeight;if(!w||!h)return;W=w;R.setPixelRatio(Math.min(devicePixelRatio||1,small?1.5:1.75));R.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix();draw()};
 const draw=()=>{U.t.value=t;root.position.y=Math.sin(t*.8)*.14;root.rotation.y=t*.15+mx*.25;root.rotation.x=my*.12;far.rotation.y=-t*.03;
  rings.forEach(q=>{q.g.rotation.y=t*q.sp;const hd=t*.9+q.o;for(let k=0;k<q.N;k++){const a=hd-k*.022;q.pos.set([Math.cos(a)*q.r,0,Math.sin(a)*q.r],k*3)}q.geo.attributes.position.needsUpdate=true});
  R.render(sc,cam)};
 const loop=n=>{raf=0;if(!vis||document.hidden)return;t+=Math.min((n-last)/1000,.05);last=n;draw();raf=requestAnimationFrame(loop)};
 const go=()=>{if(!raf&&!still){last=performance.now();raf=requestAnimationFrame(loop)}};
 new IntersectionObserver(e=>{vis=e[0].isIntersecting;vis?go():0}).observe(box);
 document.addEventListener('visibilitychange',go);new ResizeObserver(size).observe(box);
 if(!small&&!still)addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5},{passive:true});
 size();t=still?2.5:0;draw();box.classList.add('on');go();
}
