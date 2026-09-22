import {C} from './maths_visual_renderer.mjs';
const colors=[C.blue,C.green,'#875BB2','#D18A23'];
function dots(b,n,x,y,cols=10,size=25,gap=36,color=C.blue){return Array.from({length:n},(_,i)=>({s:b.dot(x+i%cols*gap,y+Math.floor(i/cols)*gap,color,size),x:x+i%cols*gap,y:y+Math.floor(i/cols)*gap}));}
function base(b,n,x,y,onesX=x+380){
 const ts=[],os=[];
 for(let t=0;t<Math.floor(n/10);t++){const cells=[];for(let j=0;j<10;j++)cells.push(b.rect(x+t*36,y+j*13,25,13,C.blue,C.white,.7));ts.push(cells);}
 for(let i=0;i<n%10;i++)os.push({s:b.dot(onesX+i%5*41,y+Math.floor(i/5)*41,C.green,28),x:onesX+i%5*41,y:y+Math.floor(i/5)*41});
 return {ts,os};
}
function lineModel(b,lo,hi,step=1,y=410){const x=120,w=1030; b.line(x,y,w);for(let n=lo;n<=hi;n+=step){const xx=x+(n-lo)/(hi-lo)*w;b.lineTo(xx,y-8,xx,y+10);b.text(n,xx-40,y+20,80,48,hi-lo>30?18:23,C.ink,false,'center');}return n=>x+(n-lo)/(hi-lo)*w;}
function flat(b,name,x,y,s=140,color=C.blue){
 if(name==='circle')return b.dot(x,y,color,s);
 if(['triangle','pentagon','hexagon'].includes(name)){const n=name==='triangle'?3:name==='pentagon'?5:6;return b.poly(Array.from({length:n},(_,i)=>[x+s/2+s/2*Math.cos(-Math.PI/2+i*2*Math.PI/n),y+s/2+s/2*Math.sin(-Math.PI/2+i*2*Math.PI/n)]),color);}
 return b.rect(x,y,name==='rectangle'?s*1.5:s,s,color,C.ink,2);
}
function solid(b,name,x,y,s=160){
 if(name==='cylinder'){return [b.rect(x,y+25,s,s,'#BFDBFE',C.blue,2),b.rect(x,y+s,s,50,'#BFDBFE',C.blue,2,'ellipse'),b.rect(x,y,s,50,C.pale,C.blue,2,'ellipse')];}
 if(name==='square based pyramid'){return [b.poly([[x+s*.5,y],[x,y+s*.8],[x+s*.58,y+s]],'#BFDBFE'),b.poly([[x+s*.5,y],[x+s*.58,y+s],[x+s,y+s*.8]],'#93C5FD')];}
 if(name==='triangular prism'){return [b.poly([[x,y+s],[x+s,y+s],[x+s/2,y]],'#BFDBFE'),b.poly([[x+s,y+s],[x+s+55,y+s-45],[x+s/2+55,y-45],[x+s/2,y]],'#93C5FD')];}
 const w=name==='cuboid'?s*1.5:s;return [b.rect(x,y+40,w,s,'#BFDBFE',C.blue,2),b.poly([[x,y+40],[x+40,y],[x+w+40,y],[x+w,y+40]],C.pale),b.poly([[x+w,y+40],[x+w+40,y],[x+w+40,y+s],[x+w,y+s+40]],'#93C5FD')];
}
function pointer(b,cx,cy,len,color){return b.poly([[cx-5,cy],[cx,cy-len],[cx+5,cy]],color,color);}
// The symmetrical invisible bounds place the rotation centre on the clock hub.
function hand(b,cx,cy,len,color,initial=0){
 const pts=[[cx-5,cy],[cx,cy-len],[cx+5,cy]];const a=initial*Math.PI/180;
 const rotate=([x,y])=>[cx+(x-cx)*Math.cos(a)-(y-cy)*Math.sin(a),cy+(x-cx)*Math.sin(a)+(y-cy)*Math.cos(a)];
 const p=pts.map(rotate),s=b.s.shapes.add({name:'object-'+(++b.id),geometry:'custom',position:{left:(cx-len)*1.25,top:(cy-len)*1.25,width:len*2*1.25,height:len*2*1.25},fill:color,line:{fill:color,width:1},customPaths:[{width:len*2*1.25,height:len*2*1.25,commands:[...p.map(([x,y],i)=>({[i?'lineTo':'moveTo']:{x:(x-cx+len)*1.25,y:(y-cy+len)*1.25}})),{close:{}}]}]});return s;
}
const spin=(b,s,angle,t=1)=>b.ev.push({name:s.name,type:'rotate',angle,trigger:t,duration:1});
function clock(b,h,m,cx=450,cy=400,r=175,animate=true){
 b.dot(cx-r,cy-r,C.white,r*2);
 for(let n=1;n<=12;n++){const a=(n*30-90)*Math.PI/180;b.text(n,cx+(r-30)*Math.cos(a)-23,cy+(r-30)*Math.sin(a)-23,46,46,25,C.ink,true,'center');}
 const hr=hand(b,cx,cy,r*.55,C.blue,animate?0:h%12*30+m*.5),min=hand(b,cx,cy,r*.77,C.green,animate?0:m*6);
 if(animate){spin(b,hr,h%12*30+m*.5);spin(b,min,m*6,2);}b.dot(cx-8,cy-8,C.ink,16);return {hr,min};
}

export {dots,flat,solid,hand,spin,clock};
