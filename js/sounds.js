// Rain Barrel's own sounds, registered with the kit's audio engine.
// The kit already provides: tap, chime, sparkle, win, lose, denied.
import { Audio, tone, noise } from '../kit/js/audio.js';

Audio.register({
  // a piece turning: a soft wooden click
  turn:   [.04, ()=>{ noise(.04,{freq:1800,q:1.5,vol:.07}); tone(520,.06,{type:'triangle',vol:.07,to:640}); }],
  // water running into new channel: a little gurgle
  flow:   [.12, ()=>{ noise(.3,{freq:700,q:.7,vol:.07,type:'lowpass'}); tone(420,.12,{vol:.06,to:760,at:.03}); tone(560,.1,{vol:.05,to:900,at:.12}); }],
  bloom:  [.2,  ()=>{ [523,659,784,1047].forEach((f,i)=>tone(f,.18,{type:'triangle',vol:.11,at:i*.06})); }],
  moo:    [.6,  ()=>{ tone(190,.55,{type:'sawtooth',vol:.045,to:150,attack:.08}); tone(95,.55,{type:'triangle',vol:.05,to:80,attack:.08}); }],
  leak:   [.15, ()=>{ tone(1300,.07,{vol:.07,to:520}); tone(900,.06,{vol:.05,to:400,at:.1}); }],
  dry:    [.6,  ()=>tone(440,.45,{type:'triangle',vol:.07,to:220,attack:.02})],
  uphill: [.6,  ()=>{ tone(330,.12,{type:'triangle',vol:.07}); tone(262,.18,{type:'triangle',vol:.07,at:.1}); }],
});

// A gentle music box, a little slower and more watery than Carrot Patch's.
export const MUSIC = { bpm:76, chords:[[196,247,294],[220,262,330],[175,220,262],[196,247,294]], scale:[392,440,494,587,659,784,880] };
