// The water rules. Pure functions with no screen, sound or save, so the solver tests can use them too.
// Direction bits: N=1, E=2, S=4, W=8
export const DIRS=[[1,-1,0],[2,0,1],[4,1,0],[8,0,-1]];
export const OPP={1:4,2:8,4:1,8:2};
export const TOK={'─':10,'│':5,'└':3,'┌':6,'┐':12,'┘':9,'├':7,'┤':13,'┬':14,'┴':11,'┼':15};
export function rotMask(m,k){k=((k%4)+4)%4;for(let i=0;i<k;i++)m=((m<<1)|(m>>3))&15;return m;}
export function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export function parse(L){
  const grid=L.rows.map(r=>r.trim().split(/\s+/));
  const H=grid.length,W=grid[0].length,tiles=[];
  for(let r=0;r<H;r++)for(let c=0;c<W;c++){
    const tok=grid[r][c]||'.';const ch=tok[0],mods=tok.slice(1);
    const t={i:r*W+c,r,c,type:'grass',base:0,rot:0,locked:false,hot:false,pump:false,h:0};
    for(const m of mods){if(m==='*')t.locked=true;else if(m==='!')t.hot=true;else if(m==='p')t.pump=true;else if(/[0-9]/.test(m))t.h=+m;}
    if(ch==='S')t.type='src';else if(ch==='P')t.type='plant';else if(ch==='#')t.type='rock';else if(ch==='C')t.type='cow';
    else if(TOK[ch]){t.type='pipe';t.base=TOK[ch];}
    tiles.push(t);
  }
  return {H,W,tiles,cap:L.cap||Infinity,plants:tiles.filter(t=>t.type==='plant').length};
}

// Water spreads out from the barrels one tile at a time. Each channel tile uses 1 drop
// (3 if sun-baked), each leak wastes 2, and each cow next to wet channel drinks 2.
// Water only flows downhill or level, except into a windmill pump, which lifts it 1 level.
// If the barrel has a limit (cap) and runs dry, the water simply stops.
export function flow(s){
  const {tiles,W,H}=s,cap=s.cap||Infinity;
  const wet=new Set(),watered=new Set(),drank=new Set(),q=[],order=[],leaks=[],blocked=[];
  let left=cap,used=0,ranOut=false;
  const at=(r,c)=>(r<0||c<0||r>=H||c>=W)?null:tiles[r*W+c];
  const mask=t=>t&&t.type==='pipe'?rotMask(t.base,t.rot):0;
  const can=(a,b)=>b.h<=a.h||(b.pump&&b.h<=a.h+1);
  const spend=n=>{const x=Math.min(left,n);left-=x;used+=x;};
  const entry={};   // tile index → the side water came in from (N=1,E=2,S=4,W=8)
  const push=(n,b)=>{
    const cost=n.hot?3:1;
    // Thirsty cows next to this channel drink first.
    for(const [b,dr,dc] of DIRS){const x=at(n.r+dr,n.c+dc);
      if(x&&x.type==='cow'&&!drank.has(x.i)&&left>0){drank.add(x.i);spend(2);}}
    if(left<cost){ranOut=true;return;}
    spend(cost);entry[n.i]=OPP[b];wet.add(n.i);order.push(n.i);q.push(n);
    const m=mask(n);
    for(const [b,dr,dc] of DIRS){if(!(m&b))continue;const x=at(n.r+dr,n.c+dc);
      const ok=x&&((x.type==='pipe'&&(mask(x)&OPP[b]))||x.type==='src'||x.type==='plant');if(!ok){leaks.push([n.i,b]);spend(2);}}
  };
  tiles.forEach(t=>{if(t.type!=='src')return;
    for(const [b,dr,dc] of DIRS){const n=at(t.r+dr,t.c+dc);if(n&&n.type==='pipe'&&(mask(n)&OPP[b])&&!wet.has(n.i)&&can(t,n))push(n,b);}});
  while(q.length){const t=q.shift(),m=mask(t);
    for(const [b,dr,dc] of DIRS){if(!(m&b))continue;const n=at(t.r+dr,t.c+dc);if(!n)continue;
      if(n.type==='pipe'&&(mask(n)&OPP[b])&&!wet.has(n.i)&&can(t,n))push(n,b);
      else if(n.type==='plant'&&can(t,n))watered.add(n.i);
      else if((n.type==='plant'||(n.type==='pipe'&&(mask(n)&OPP[b])))&&!can(t,n))blocked.push([t.i,b]);}}
  return {wet,watered,leaks,water:used,left,order,drank,ranOut,blocked,entry};
}
export function needed(t){for(let k=0;k<4;k++)if(rotMask(t.base,t.rot+k)===t.base)return k;return 0;}

