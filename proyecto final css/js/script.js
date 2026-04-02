
class TouchTexture{
  constructor(){
    this.size=64;this.width=this.height=this.size;
    this.maxAge=64;this.radius=.25*this.size;
    this.speed=1/this.maxAge;this.trail=[];this.last=null;
    this.initTexture();
  }
  initTexture(){
    this.canvas=document.createElement('canvas');
    this.canvas.width=this.width;this.canvas.height=this.height;
    this.ctx=this.canvas.getContext('2d');
    this.ctx.fillStyle='black';this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);
    this.texture=new THREE.Texture(this.canvas);
  }
  update(){
    this.clear();
    for(let i=this.trail.length-1;i>=0;i--){
      const p=this.trail[i];
      let f=p.force*this.speed*(1-p.age/this.maxAge);
      p.x+=p.vx*f;p.y+=p.vy*f;p.age++;
      if(p.age>this.maxAge)this.trail.splice(i,1);else this.drawPoint(p);
    }
    this.texture.needsUpdate=true;
  }
  clear(){this.ctx.fillStyle='black';this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);}
  addTouch(pt){
    let force=0,vx=0,vy=0;
    if(this.last){
      const dx=pt.x-this.last.x,dy=pt.y-this.last.y;
      if(!dx&&!dy)return;
      const d=Math.sqrt(dx*dx+dy*dy);vx=dx/d;vy=dy/d;
      force=Math.min((dx*dx+dy*dy)*20000,2);
    }
    this.last={x:pt.x,y:pt.y};
    this.trail.push({x:pt.x,y:pt.y,age:0,force,vx,vy});
  }
  drawPoint(p){
    const pos={x:p.x*this.width,y:(1-p.y)*this.height};
    let i=1;
    if(p.age<this.maxAge*.3)i=Math.sin((p.age/(this.maxAge*.3))*(Math.PI/2));
    else{const t=1-(p.age-this.maxAge*.3)/(this.maxAge*.7);i=-t*(t-2);}
    i*=p.force;
    const r=this.radius,c=`${((p.vx+1)/2)*255},${((p.vy+1)/2)*255},${i*255}`;
    const off=this.size*5;
    this.ctx.shadowOffsetX=off;this.ctx.shadowOffsetY=off;
    this.ctx.shadowBlur=r;this.ctx.shadowColor=`rgba(${c},${.2*i})`;
    this.ctx.beginPath();this.ctx.fillStyle='rgba(255,0,0,1)';
    this.ctx.arc(pos.x-off,pos.y-off,r,0,Math.PI*2);this.ctx.fill();
  }
}

/* ───────── GradientBackground ───────── */
class GradientBackground{
  constructor(sm){
    this.sm=sm;this.mesh=null;
    this.u={
      uTime:{value:0},
      uResolution:{value:new THREE.Vector2(window.innerWidth,window.innerHeight)},
      uColor1:{value:new THREE.Vector3(.945,.353,.133)},
      uColor2:{value:new THREE.Vector3(.039,.055,.153)},
      uColor3:{value:new THREE.Vector3(.945,.353,.133)},
      uColor4:{value:new THREE.Vector3(.039,.055,.153)},
      uColor5:{value:new THREE.Vector3(.945,.353,.133)},
      uColor6:{value:new THREE.Vector3(.039,.055,.153)},
      uSpeed:{value:1.2},uIntensity:{value:1.8},
      uTouchTexture:{value:null},uGrainIntensity:{value:.08},
      uDarkNavy:{value:new THREE.Vector3(.039,.055,.153)},
      uGradientSize:{value:1},uGradientCount:{value:6},
      uColor1Weight:{value:1},uColor2Weight:{value:1}
    };
  }
  init(){
    const vs=this.sm.getViewSize();
    const geo=new THREE.PlaneGeometry(vs.width,vs.height,1,1);
    const mat=new THREE.ShaderMaterial({
      uniforms:this.u,
      vertexShader:`varying vec2 vUv;void main(){gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);vUv=uv;}`,
      fragmentShader:`
        uniform float uTime;uniform vec2 uResolution;
        uniform vec3 uColor1,uColor2,uColor3,uColor4,uColor5,uColor6;
        uniform float uSpeed,uIntensity;uniform sampler2D uTouchTexture;
        uniform float uGrainIntensity;uniform vec3 uDarkNavy;
        uniform float uGradientSize,uGradientCount,uColor1Weight,uColor2Weight;
        varying vec2 vUv;
        float grain(vec2 uv,float t){vec2 g=uv*uResolution*.5;return fract(sin(dot(g+t,vec2(12.9898,78.233)))*43758.5453)*2.-1.;}
        vec3 gc(vec2 uv,float time){
          float gr=uGradientSize;
          vec2 c1=vec2(.5+sin(time*uSpeed*.4)*.4,.5+cos(time*uSpeed*.5)*.4);
          vec2 c2=vec2(.5+cos(time*uSpeed*.6)*.5,.5+sin(time*uSpeed*.45)*.5);
          vec2 c3=vec2(.5+sin(time*uSpeed*.35)*.45,.5+cos(time*uSpeed*.55)*.45);
          vec2 c4=vec2(.5+cos(time*uSpeed*.5)*.4,.5+sin(time*uSpeed*.4)*.4);
          vec2 c5=vec2(.5+sin(time*uSpeed*.7)*.35,.5+cos(time*uSpeed*.6)*.35);
          vec2 c6=vec2(.5+cos(time*uSpeed*.45)*.5,.5+sin(time*uSpeed*.65)*.5);
          vec2 c7=vec2(.5+sin(time*uSpeed*.55)*.38,.5+cos(time*uSpeed*.48)*.42);
          vec2 c8=vec2(.5+cos(time*uSpeed*.65)*.36,.5+sin(time*uSpeed*.52)*.44);
          vec2 c9=vec2(.5+sin(time*uSpeed*.42)*.41,.5+cos(time*uSpeed*.58)*.39);
          vec2 c10=vec2(.5+cos(time*uSpeed*.48)*.37,.5+sin(time*uSpeed*.62)*.43);
          float i1=1.-smoothstep(0.,gr,length(uv-c1));float i2=1.-smoothstep(0.,gr,length(uv-c2));
          float i3=1.-smoothstep(0.,gr,length(uv-c3));float i4=1.-smoothstep(0.,gr,length(uv-c4));
          float i5=1.-smoothstep(0.,gr,length(uv-c5));float i6=1.-smoothstep(0.,gr,length(uv-c6));
          float i7=1.-smoothstep(0.,gr,length(uv-c7));float i8=1.-smoothstep(0.,gr,length(uv-c8));
          float i9=1.-smoothstep(0.,gr,length(uv-c9));float i10=1.-smoothstep(0.,gr,length(uv-c10));
          vec2 ru1=uv-.5;float a1=time*uSpeed*.15;
          ru1=vec2(ru1.x*cos(a1)-ru1.y*sin(a1),ru1.x*sin(a1)+ru1.y*cos(a1));ru1+=.5;
          vec2 ru2=uv-.5;float a2=-time*uSpeed*.12;
          ru2=vec2(ru2.x*cos(a2)-ru2.y*sin(a2),ru2.x*sin(a2)+ru2.y*cos(a2));ru2+=.5;
          float ri1=1.-smoothstep(0.,.8,length(ru1-.5));
          float ri2=1.-smoothstep(0.,.8,length(ru2-.5));
          vec3 col=vec3(0.);
          col+=uColor1*i1*(.55+.45*sin(time*uSpeed))*uColor1Weight;
          col+=uColor2*i2*(.55+.45*cos(time*uSpeed*1.2))*uColor2Weight;
          col+=uColor3*i3*(.55+.45*sin(time*uSpeed*.8))*uColor1Weight;
          col+=uColor4*i4*(.55+.45*cos(time*uSpeed*1.3))*uColor2Weight;
          col+=uColor5*i5*(.55+.45*sin(time*uSpeed*1.1))*uColor1Weight;
          col+=uColor6*i6*(.55+.45*cos(time*uSpeed*.9))*uColor2Weight;
          if(uGradientCount>6.){
            col+=uColor1*i7*(.55+.45*sin(time*uSpeed*1.4))*uColor1Weight;
            col+=uColor2*i8*(.55+.45*cos(time*uSpeed*1.5))*uColor2Weight;
            col+=uColor3*i9*(.55+.45*sin(time*uSpeed*1.6))*uColor1Weight;
            col+=uColor4*i10*(.55+.45*cos(time*uSpeed*1.7))*uColor2Weight;
          }
          col+=mix(uColor1,uColor3,ri1)*.45*uColor1Weight;
          col+=mix(uColor2,uColor4,ri2)*.4*uColor2Weight;
          col=clamp(col,vec3(0.),vec3(1.))*uIntensity;
          float lum=dot(col,vec3(.299,.587,.114));col=mix(vec3(lum),col,1.35);
          col=pow(col,vec3(.92));
          float b=length(col);col=mix(uDarkNavy,col,max(b*1.2,.15));
          float br=length(col);if(br>1.)col*=1./br;
          return col;
        }
        void main(){
          vec2 uv=vUv;
          vec4 t=texture2D(uTouchTexture,uv);
          float vx=-(t.r*2.-1.),vy=-(t.g*2.-1.),iv=t.b;
          uv.x+=vx*.8*iv;uv.y+=vy*.8*iv;
          float d=length(uv-.5);
          uv+=vec2(sin(d*20.-uTime*3.)*.04*iv+sin(d*15.-uTime*2.)*.03*iv);
          vec3 col=gc(uv,uTime);
          col+=grain(uv,uTime)*uGrainIntensity;
          float ts=uTime*.5;
          col.r+=sin(ts)*.02;col.g+=cos(ts*1.4)*.02;col.b+=sin(ts*1.2)*.02;
          float b=length(col);col=mix(uDarkNavy,col,max(b*1.2,.15));
          col=clamp(col,vec3(0.),vec3(1.));
          float br=length(col);if(br>1.)col*=1./br;
          gl_FragColor=vec4(col,1.);
        }`
    });
    this.mesh=new THREE.Mesh(geo,mat);
    this.sm.scene.add(this.mesh);
  }
  update(d){if(this.u.uTime)this.u.uTime.value+=d;}
  onResize(w,h){
    const vs=this.sm.getViewSize();
    if(this.mesh){this.mesh.geometry.dispose();this.mesh.geometry=new THREE.PlaneGeometry(vs.width,vs.height,1,1);}
    if(this.u.uResolution)this.u.uResolution.value.set(w,h);
  }
}

/* ───────── App ───────── */
class App{
  constructor(){
    this.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance',alpha:false,stencil:false,depth:false});
    this.renderer.setSize(window.innerWidth,window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    document.getElementById('webGLApp').appendChild(this.renderer.domElement);
    this.camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,.1,10000);
    this.camera.position.z=50;
    this.scene=new THREE.Scene();
    this.scene.background=new THREE.Color(0x0a0e27);
    this.clock=new THREE.Clock();
    this.tt=new TouchTexture();
    this.gb=new GradientBackground(this);
    this.gb.u.uTouchTexture.value=this.tt.texture;
    this.schemes={
      1:{c1:new THREE.Vector3(.945,.353,.133),c2:new THREE.Vector3(.039,.055,.153)},
      2:{c1:new THREE.Vector3(1,.424,.314),c2:new THREE.Vector3(.251,.878,.816)},
      3:{c1:new THREE.Vector3(.945,.353,.133),c2:new THREE.Vector3(.039,.055,.153),c3:new THREE.Vector3(.251,.878,.816)},
      4:{c1:new THREE.Vector3(.949,.4,.2),c2:new THREE.Vector3(.176,.42,.427),c3:new THREE.Vector3(.82,.686,.612)},
      5:{c1:new THREE.Vector3(.945,.353,.133),c2:new THREE.Vector3(0,.259,.22),c3:new THREE.Vector3(.945,.353,.133),c4:new THREE.Vector3(0,0,0),c5:new THREE.Vector3(.945,.353,.133),c6:new THREE.Vector3(0,0,0)}
    };
    this.init();
  }
  setScheme(s){
    const c=this.schemes[s];if(!c)return;
    const u=this.gb.u;
    if(s===3||s===4){
      u.uColor1.value.copy(c.c1);u.uColor2.value.copy(c.c2);u.uColor3.value.copy(c.c3);
      u.uColor4.value.copy(c.c1);u.uColor5.value.copy(c.c2);u.uColor6.value.copy(c.c3);
    }else if(s===5){
      u.uColor1.value.copy(c.c1);u.uColor2.value.copy(c.c2);u.uColor3.value.copy(c.c3);
      u.uColor4.value.copy(c.c4);u.uColor5.value.copy(c.c5);u.uColor6.value.copy(c.c6);
    }else{
      u.uColor1.value.copy(c.c1);u.uColor2.value.copy(c.c2);
      u.uColor3.value.copy(c.c1);u.uColor4.value.copy(c.c2);
      u.uColor5.value.copy(c.c1);u.uColor6.value.copy(c.c2);
    }
    const tight=()=>{u.uGradientSize.value=.45;u.uGradientCount.value=12;u.uSpeed.value=1.5;u.uColor1Weight.value=.5;u.uColor2Weight.value=1.8;};
    const def=()=>{u.uGradientSize.value=1;u.uGradientCount.value=6;u.uSpeed.value=1.2;u.uColor1Weight.value=1;u.uColor2Weight.value=1;};
    if(s===2){this.scene.background=new THREE.Color(0x0a0e27);u.uDarkNavy.value.set(.039,.055,.153);def();}
    else if(s===4){this.scene.background=new THREE.Color(0xffffff);u.uDarkNavy.value.set(0,0,0);def();}
    else{this.scene.background=new THREE.Color(0x0a0e27);u.uDarkNavy.value.set(.039,.055,.153);tight();}
  }
  init(){
    this.gb.init();this.setScheme(1);this.render();this.tick();
    window.addEventListener('resize',()=>this.onResize());
    window.addEventListener('mousemove',e=>this.onMouseMove(e));
    window.addEventListener('touchmove',e=>this.onTouchMove(e));
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)this.render();});
  }
  onTouchMove(e){const t=e.touches[0];this.onMouseMove({clientX:t.clientX,clientY:t.clientY});}
  onMouseMove(e){this.tt.addTouch({x:e.clientX/window.innerWidth,y:1-e.clientY/window.innerHeight});}
  getViewSize(){const f=(this.camera.fov*Math.PI)/180;const h=Math.abs(this.camera.position.z*Math.tan(f/2)*2);return{width:h*this.camera.aspect,height:h};}
  update(d){this.tt.update();this.gb.update(d);}
  render(){const d=this.clock.getDelta();this.renderer.render(this.scene,this.camera);this.update(Math.min(d,.1));}
  tick(){this.render();requestAnimationFrame(()=>this.tick());}
  onResize(){this.camera.aspect=window.innerWidth/window.innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(window.innerWidth,window.innerHeight);this.gb.onResize(window.innerWidth,window.innerHeight);}
}

const app=new App();

/* ─── Color scheme buttons ─── */
document.querySelectorAll('.s-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    app.setScheme(parseInt(btn.dataset.scheme));
    document.querySelectorAll('.s-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  });
});

/* ─── Section transitions ─── */
function showSection(id){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  const target=document.getElementById(id);
  if(!target)return;
  target.classList.add('active');
  // replay skill fills
  target.querySelectorAll('.skill__fill').forEach(f=>{
    f.classList.remove('animate');
    void f.offsetWidth;
    f.classList.add('animate');
  });
  // update nav highlights (desktop + mobile)
  document.querySelectorAll('.nav__btn').forEach(a=>{
    a.classList.toggle('active', a.dataset.section===id);
  });
  // close mobile menu
  mobileMenu.classList.remove('open');
  hamburger.classList.remove('open');
}

// nav links (all contexts)
document.querySelectorAll('[data-section]').forEach(el=>{
  el.addEventListener('click',e=>{
    e.preventDefault();
    showSection(el.dataset.section);
  });
});

// init skill fills on startup (habilidades not active yet so just wait)
document.querySelectorAll('.skill__fill').forEach(f=>f.classList.remove('animate'));

/* ─── Hamburger ─── */
const hamburger=document.getElementById('hamburger');
const mobileMenu=document.getElementById('mobileMenu');

hamburger.addEventListener('click',()=>{
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

/* ─── Custom cursor ─── */
const cursor=document.getElementById('cursor');
let mx=0,my=0,going=false;

document.addEventListener('mousemove',e=>{
  mx=e.clientX;my=e.clientY;
  if(!going){going=true;moveCursor();}
});

function moveCursor(){
  cursor.style.left=mx+'px';
  cursor.style.top=my+'px';
  requestAnimationFrame(moveCursor);
}

const interactiveEls=document.querySelectorAll(
  '.nav__btn,.s-btn,.btn,.proj__link,.c-card__link,.footer__nav a,.value-card,.learn-item,.quote,.proj'
);
interactiveEls.forEach(el=>{
  el.addEventListener('mouseenter',()=>cursor.classList.add('big'));
  el.addEventListener('mouseleave',()=>cursor.classList.remove('big'));
});

/* ─── hide cursor on mobile ─── */
if('ontouchstart' in window) cursor.style.display='none';
