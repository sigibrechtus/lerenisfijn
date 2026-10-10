/* Pixel budgets depend on viewport and measured performance, never on touch input. */
(function(root){'use strict';
const tiers=['low','balanced','high'];
function profile(tier,width,height,dpr=1){
  const config={low:{ratio:.85,pixels:1100000,shadow:512,glow:false},balanced:{ratio:1.5,pixels:2400000,shadow:1024,glow:true},high:{ratio:2,pixels:4200000,shadow:2048,glow:true}}[tier]||null;
  if(!config)throw Error('Unknown graphics tier');
  const ratio=Math.min(config.ratio,Math.max(1,Number(dpr)||1),Math.sqrt(config.pixels/Math.max(1,width*height)));
  return {...config,tier,ratio,scaling:1/ratio,fxaa:tier!=='low'};
}
function adaptive(){let tier=1,warmup=0,windowTime=0,frames=0,goodTime=0,cooldown=0,gapGuard=0;
  function reset(){tier=1;warmup=0;windowTime=0;frames=0;goodTime=0;cooldown=0;gapGuard=0;}
  function sample(dt){
    if(!Number.isFinite(dt)||dt<=0){windowTime=0;frames=0;goodTime=0;gapGuard=0;return null;}
    // Ignore a single resume gap, but retain repeated stalls as performance evidence.
    if(dt>1){
      if(gapGuard<=0){gapGuard=6;windowTime=0;frames=0;goodTime=0;return null;}
      gapGuard=6;
      dt=Math.min(dt,2);
    }else gapGuard=Math.max(0,gapGuard-dt);
    warmup+=dt;if(warmup<3)return null;cooldown=Math.max(0,cooldown-dt);windowTime+=dt;frames++;
    if(windowTime<2)return null;const fps=frames/windowTime,span=windowTime;windowTime=0;frames=0;
    if(cooldown)return null;
    if(fps<34&&tier>0){tier--;goodTime=0;cooldown=6;return tiers[tier];}
    if(fps>55){goodTime+=span;if(goodTime>=12&&tier<2){tier++;goodTime=0;cooldown=8;return tiers[tier];}}
    else goodTime=0;return null;
  }
  return {sample,reset,tier:()=>tiers[tier]};
}
const api={profile,adaptive};root.MoonGraphics=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
