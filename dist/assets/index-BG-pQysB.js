(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&s(o)}).observe(document,{childList:!0,subtree:!0});function a(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function s(i){if(i.ep)return;i.ep=!0;const n=a(i);fetch(i.href,n)}})();class _t{constructor(){this.ctx=null,this.analyser=null,this.inputAnalyser=null,this.masterGain=null,this.ambientGain=null,this.musicGain=null,this.fftSize=1024,this.frequencyData=null,this.timeDomainData=null,this.audioData={subBass:0,bass:0,lowMid:0,mid:0,highMid:0,treble:0,air:0,energy:0,peak:0},this.sourceMode="synth",this.isPlaying=!1,this.currentTrackIndex=0,this.syncStream=null,this.syncSourceNode=null,this.syncGainNode=null,this.syncSensitivity=1.6,this.syncTrackInfo={title:"Spotify / Apple Music Stream",artist:"Live Desktop & Tab Audio",tag:"Real-time Music Sync",artwork:null,source:"sync",isLive:!0},this.onSyncEnded=null,this.fileAudioElement=new Audio,this.fileAudioElement.crossOrigin="anonymous",this.fileSourceNode=null,this.fileTrackTitle="",this.micStream=null,this.micSourceNode=null,this.synthSequencerTimer=null,this.currentStep=0,this.currentChordIndex=0,this.rainNode=null,this.vinylNode=null,this.tracks=[{id:"midnight-rain",title:"Midnight Rain & Warm Tea",artist:"Komorebi Soundscapes",bpm:72,key:"Eb Major",tag:"Cozy Chillhop • Tape 01",chords:[{name:"Ebmaj9",root:39,notes:[51,55,58,62,65]},{name:"Gm7",root:43,notes:[46,50,53,58,62]},{name:"Fm9",root:41,notes:[44,48,51,55,58]},{name:"Bb13",root:46,notes:[44,48,50,55,62]}],drumPattern:"chill",melodyScale:[51,53,55,58,60,62,65,67,70,72]},{id:"autumn-mist",title:"Autumn Window Mist",artist:"Sleepless Lantern",bpm:66,key:"Ab Major",tag:"Warm Lo-Fi Sanctuary • Tape 02",chords:[{name:"Dbmaj9",root:37,notes:[49,53,56,60,63]},{name:"Cm7",root:36,notes:[48,51,55,58,63]},{name:"Bbm9",root:34,notes:[46,49,53,56,60]},{name:"Eb7sus4",root:39,notes:[46,51,54,58,61]}],drumPattern:"slowSwing",melodyScale:[49,51,53,56,58,60,63,65,68]},{id:"lanterns-breeze",title:"Lanterns in the Breeze",artist:"Gentle Reverie",bpm:78,key:"F Major",tag:"Analog Evening • Tape 03",chords:[{name:"Fmaj9",root:41,notes:[53,57,60,64,67]},{name:"Am7",root:45,notes:[52,57,60,64,69]},{name:"Dm9",root:38,notes:[50,53,57,60,64]},{name:"Gm7/C",root:43,notes:[48,53,55,58,62]}],drumPattern:"bossaLofi",melodyScale:[53,55,57,60,62,64,67,69,72]},{id:"dawn-coffee",title:"Dawn Coffee Sanctuary",artist:"Aura of Serenity",bpm:70,key:"Db Major",tag:"Cozy Morning Glow • Tape 04",chords:[{name:"Gbmaj7",root:42,notes:[54,58,61,65,68]},{name:"Fm7",root:41,notes:[53,56,60,63,68]},{name:"Ebm9",root:39,notes:[51,54,58,61,65]},{name:"Ab9sus",root:44,notes:[51,56,58,61,66]}],drumPattern:"heartbeat",melodyScale:[54,56,58,61,63,65,68,70,73]}],this.ambientSettings={vinyl:!0,rain:!0,vinylVolume:.22,rainVolume:.18},this.synthTrackElapsed=0,this.synthTrackDuration=180,this.onTrackChange=null,this.onPlayStateChange=null,this.onTimeUpdate=null}async initContext(){if(this.ctx&&this.ctx.state!=="closed"){this.ctx.state==="suspended"&&await this.ctx.resume();return}const t=window.AudioContext||window.webkitAudioContext;this.ctx=new t,this.masterGain=this.ctx.createGain(),this.masterGain.gain.setValueAtTime(.85,this.ctx.currentTime),this.musicGain=this.ctx.createGain(),this.musicGain.gain.setValueAtTime(.9,this.ctx.currentTime),this.musicGain.connect(this.masterGain),this.ambientGain=this.ctx.createGain(),this.ambientGain.gain.setValueAtTime(.4,this.ctx.currentTime),this.ambientGain.connect(this.masterGain),this.compressor=this.ctx.createDynamicsCompressor(),this.compressor.threshold.setValueAtTime(-18,this.ctx.currentTime),this.compressor.knee.setValueAtTime(24,this.ctx.currentTime),this.compressor.ratio.setValueAtTime(4,this.ctx.currentTime),this.compressor.attack.setValueAtTime(.015,this.ctx.currentTime),this.compressor.release.setValueAtTime(.25,this.ctx.currentTime),this.masterFilter=this.ctx.createBiquadFilter(),this.masterFilter.type="lowpass",this.masterFilter.frequency.setValueAtTime(14e3,this.ctx.currentTime),this.masterFilter.Q.setValueAtTime(.7,this.ctx.currentTime),this.analyser=this.ctx.createAnalyser(),this.analyser.fftSize=this.fftSize,this.analyser.smoothingTimeConstant=.82,this.analyser.minDecibels=-90,this.analyser.maxDecibels=-10,this.inputAnalyser=this.ctx.createAnalyser(),this.inputAnalyser.fftSize=this.fftSize,this.inputAnalyser.smoothingTimeConstant=.82,this.inputAnalyser.minDecibels=-90,this.inputAnalyser.maxDecibels=-10,this.masterGain.connect(this.compressor),this.compressor.connect(this.masterFilter),this.masterFilter.connect(this.analyser),this.analyser.connect(this.ctx.destination),this.frequencyData=new Uint8Array(this.analyser.frequencyBinCount),this.timeDomainData=new Uint8Array(this.analyser.frequencyBinCount),this.fileSourceNode=this.ctx.createMediaElementSource(this.fileAudioElement),this.fileSourceNode.connect(this.musicGain),this.fileAudioElement.addEventListener("timeupdate",()=>{this.sourceMode==="file"&&this.onTimeUpdate&&this.onTimeUpdate(this.fileAudioElement.currentTime,this.fileAudioElement.duration||1)}),this.fileAudioElement.addEventListener("ended",()=>{this.sourceMode==="file"&&this.pause()}),this.startAmbientGenerators()}startAmbientGenerators(){if(!this.ctx)return;const t=this.ctx.sampleRate*3,a=this.ctx.createBuffer(1,t,this.ctx.sampleRate),s=a.getChannelData(0);let i=0;for(let f=0;f<t;f++){const b=Math.random()*2-1;i=(i+.02*b)/1.02;let g=0;Math.random()<.0018&&(g=(Math.random()*2-1)*.45),Math.random()<3e-4&&(g=(Math.random()*2-1)*.8),s[f]=i*.15+g}const n=this.ctx.createBufferSource();n.buffer=a,n.loop=!0;const o=this.ctx.createBiquadFilter();o.type="bandpass",o.frequency.setValueAtTime(1800,this.ctx.currentTime),o.Q.setValueAtTime(1.2,this.ctx.currentTime),this.vinylGain=this.ctx.createGain(),this.vinylGain.gain.setValueAtTime(this.ambientSettings.vinyl?this.ambientSettings.vinylVolume:0,this.ctx.currentTime),n.connect(o),o.connect(this.vinylGain),this.vinylGain.connect(this.ambientGain),n.start();const c=this.ctx.createBuffer(2,t,this.ctx.sampleRate),u=c.getChannelData(0),h=c.getChannelData(1);let m=0,d=0,v=0,r=0,E=0,x=0;for(let f=0;f<t;f++){const b=Math.random()*2-1,g=Math.random()*2-1;m=.99886*m+b*.0555179,d=.99332*d+b*.0750759,v=.969*v+b*.153852,u[f]=(m+d+v+b*.5362)*.08,r=.99886*r+g*.0555179,E=.99332*E+g*.0750759,x=.969*x+g*.153852,h[f]=(r+E+x+g*.5362)*.08}const T=this.ctx.createBufferSource();T.buffer=c,T.loop=!0;const y=this.ctx.createBiquadFilter();y.type="lowpass",y.frequency.setValueAtTime(1400,this.ctx.currentTime),y.Q.setValueAtTime(.5,this.ctx.currentTime),this.rainGain=this.ctx.createGain(),this.rainGain.gain.setValueAtTime(this.ambientSettings.rain?this.ambientSettings.rainVolume:0,this.ctx.currentTime),T.connect(y),y.connect(this.rainGain),this.rainGain.connect(this.ambientGain),T.start()}toggleVinyl(t){this.ambientSettings.vinyl=t,this.vinylGain&&this.ctx&&this.vinylGain.gain.setTargetAtTime(t?this.ambientSettings.vinylVolume:0,this.ctx.currentTime,.2)}toggleRain(t){this.ambientSettings.rain=t,this.rainGain&&this.ctx&&this.rainGain.gain.setTargetAtTime(t?this.ambientSettings.rainVolume:0,this.ctx.currentTime,.2)}midiToFreq(t){return 440*Math.pow(2,(t-69)/12)}playRhodesChord(t,a=3.2,s=0){if(!this.ctx)return;const i=s||this.ctx.currentTime;t.forEach((n,o)=>{const c=this.midiToFreq(n),u=this.ctx.createOscillator();u.type="sine",u.frequency.setValueAtTime(c,i);const h=this.ctx.createOscillator();h.type="triangle",h.frequency.setValueAtTime(c*2,i),h.detune.setValueAtTime((Math.random()-.5)*8,i);const m=this.ctx.createBiquadFilter();m.type="lowpass",m.frequency.setValueAtTime(c*3.5,i),m.frequency.exponentialRampToValueAtTime(c*1.8,i+a),m.Q.setValueAtTime(1.5,i);const d=this.ctx.createGain(),v=.16+Math.random()*.04-o*.015;d.gain.setValueAtTime(1e-4,i),d.gain.exponentialRampToValueAtTime(Math.max(.001,v),i+.04+o*.012),d.gain.exponentialRampToValueAtTime(1e-5,i+a);const r=this.ctx.createStereoPanner?this.ctx.createStereoPanner():null;r?(r.pan.setValueAtTime((o/t.length-.5)*.6,i),u.connect(m),h.connect(m),m.connect(d),d.connect(r),r.connect(this.musicGain)):(u.connect(m),h.connect(m),m.connect(d),d.connect(this.musicGain)),u.start(i+o*.012),h.start(i+o*.012),u.stop(i+a+.1),h.stop(i+a+.1)})}playBassNote(t,a=1.8,s=0){if(!this.ctx)return;const i=s||this.ctx.currentTime,n=this.midiToFreq(t),o=this.ctx.createOscillator();o.type="sine",o.frequency.setValueAtTime(n,i);const c=this.ctx.createOscillator();c.type="triangle",c.frequency.setValueAtTime(n,i);const u=this.ctx.createBiquadFilter();u.type="lowpass",u.frequency.setValueAtTime(220,i),u.frequency.exponentialRampToValueAtTime(110,i+a);const h=this.ctx.createGain();h.gain.setValueAtTime(1e-4,i),h.gain.linearRampToValueAtTime(.42,i+.06),h.gain.exponentialRampToValueAtTime(1e-4,i+a),o.connect(u),c.connect(u),u.connect(h),h.connect(this.musicGain),o.start(i),c.start(i),o.stop(i+a+.05),c.stop(i+a+.05)}playChimeNote(t,a=0){if(!this.ctx)return;const s=a||this.ctx.currentTime,i=this.midiToFreq(t),n=this.ctx.createOscillator();n.type="sine",n.frequency.setValueAtTime(i,s);const o=this.ctx.createOscillator();o.type="sine",o.frequency.setValueAtTime(i*2.76,s);const c=this.ctx.createGain();c.gain.setValueAtTime(1e-4,s),c.gain.exponentialRampToValueAtTime(.08,s+.02),c.gain.exponentialRampToValueAtTime(1e-5,s+2.2);const u=this.ctx.createStereoPanner?this.ctx.createStereoPanner():null;u?(u.pan.setValueAtTime(.35+Math.random()*.45,s),n.connect(c),o.connect(c),c.connect(u),u.connect(this.musicGain)):(n.connect(c),o.connect(c),c.connect(this.musicGain)),n.start(s),o.start(s),n.stop(s+2.4),o.stop(s+2.4)}playDrumElement(t,a=0){if(!this.ctx)return;const s=a||this.ctx.currentTime;if(t==="kick"){const i=this.ctx.createOscillator(),n=this.ctx.createGain();i.frequency.setValueAtTime(115,s),i.frequency.exponentialRampToValueAtTime(36,s+.12),n.gain.setValueAtTime(.38,s),n.gain.exponentialRampToValueAtTime(1e-4,s+.28),i.connect(n),n.connect(this.musicGain),i.start(s),i.stop(s+.3)}else if(t==="snare"){const i=this.ctx.createOscillator();i.type="triangle",i.frequency.setValueAtTime(180,s),i.frequency.exponentialRampToValueAtTime(90,s+.08);const n=this.ctx.createGain();n.gain.setValueAtTime(.14,s),n.gain.exponentialRampToValueAtTime(1e-4,s+.12),i.connect(n),n.connect(this.musicGain);const o=this.ctx.createBufferSource(),c=this.ctx.createBuffer(1,this.ctx.sampleRate*.2,this.ctx.sampleRate),u=c.getChannelData(0);for(let d=0;d<u.length;d++)u[d]=Math.random()*2-1;o.buffer=c;const h=this.ctx.createBiquadFilter();h.type="bandpass",h.frequency.setValueAtTime(2800,s),h.Q.setValueAtTime(1.2,s);const m=this.ctx.createGain();m.gain.setValueAtTime(.12,s),m.gain.exponentialRampToValueAtTime(1e-4,s+.18),o.connect(h),h.connect(m),m.connect(this.musicGain),i.start(s),i.stop(s+.15),o.start(s),o.stop(s+.2)}else if(t==="hihat"){const i=this.ctx.createBufferSource(),n=this.ctx.createBuffer(1,this.ctx.sampleRate*.06,this.ctx.sampleRate),o=n.getChannelData(0);for(let h=0;h<o.length;h++)o[h]=Math.random()*2-1;i.buffer=n;const c=this.ctx.createBiquadFilter();c.type="highpass",c.frequency.setValueAtTime(7500,s);const u=this.ctx.createGain();u.gain.setValueAtTime(.065,s),u.gain.exponentialRampToValueAtTime(1e-4,s+.05),i.connect(c),c.connect(u),u.connect(this.musicGain),i.start(s),i.stop(s+.06)}}scheduleSynthStep(){if(!this.isPlaying||this.sourceMode!=="synth")return;const t=this.tracks[this.currentTrackIndex],s=60/t.bpm/2,i=this.ctx.currentTime,n=this.currentStep%16;if(this.synthTrackElapsed=(this.synthTrackElapsed+s)%this.synthTrackDuration,this.onTimeUpdate&&this.onTimeUpdate(this.synthTrackElapsed,this.synthTrackDuration),n===0||n===8){const o=Math.floor(this.currentStep/8)%t.chords.length,c=t.chords[o];this.playRhodesChord(c.notes,s*7.5,i),this.playBassNote(c.root,s*3.8,i),this.currentChordIndex=o}if(n===5||n===12){const o=t.chords[this.currentChordIndex];Math.random()>.3&&this.playBassNote(o.root+(Math.random()>.6?7:0),s*2.5,i)}if((n===0||n===6||n===10&&Math.random()>.3)&&this.playDrumElement("kick",i),(n===4||n===12)&&this.playDrumElement("snare",i),n%2===0||Math.random()>.4){const o=n%2!==0?s*.15:0;this.playDrumElement("hihat",i+o)}if(Math.random()<.38){const o=t.melodyScale[Math.floor(Math.random()*t.melodyScale.length)],c=Math.random()>.4?12:0;this.playChimeNote(o+c,i+Math.random()*.1)}this.currentStep++,this.synthSequencerTimer=setTimeout(()=>{this.scheduleSynthStep()},s*1e3)}async play(){if(await this.initContext(),this.ctx.state==="suspended"&&await this.ctx.resume(),this.isPlaying=!0,this.sourceMode==="synth")this.synthSequencerTimer||this.scheduleSynthStep();else if(this.sourceMode==="file")try{await this.fileAudioElement.play()}catch(t){console.warn("Playback resume issue:",t)}else this.sourceMode==="sync"&&this.syncGainNode&&this.ctx&&this.syncGainNode.gain.setTargetAtTime(this.syncSensitivity,this.ctx.currentTime,.05);this.onPlayStateChange&&this.onPlayStateChange(!0)}pause(){this.isPlaying=!1,this.synthSequencerTimer&&(clearTimeout(this.synthSequencerTimer),this.synthSequencerTimer=null),this.fileAudioElement&&this.fileAudioElement.pause(),this.sourceMode==="sync"&&this.syncGainNode&&this.ctx&&this.syncGainNode.gain.setTargetAtTime(0,this.ctx.currentTime,.05),this.onPlayStateChange&&this.onPlayStateChange(!1)}async togglePlay(){this.isPlaying?this.pause():await this.play()}nextTrack(){this.sourceMode==="synth"&&(this.currentTrackIndex=(this.currentTrackIndex+1)%this.tracks.length,this.currentStep=0,this.synthTrackElapsed=0,this.onTrackChange&&this.onTrackChange(this.getCurrentTrackInfo()))}prevTrack(){this.sourceMode==="synth"&&(this.currentTrackIndex=(this.currentTrackIndex-1+this.tracks.length)%this.tracks.length,this.currentStep=0,this.synthTrackElapsed=0,this.onTrackChange&&this.onTrackChange(this.getCurrentTrackInfo()))}seek(t){if(this.sourceMode==="file")this.fileAudioElement.duration&&(this.fileAudioElement.currentTime=t*this.fileAudioElement.duration);else if(this.sourceMode==="synth"){this.synthTrackElapsed=t*this.synthTrackDuration;const i=60/this.tracks[this.currentTrackIndex].bpm/2;this.currentStep=Math.floor(this.synthTrackElapsed/i)}}setVolume(t){this.masterGain&&this.ctx&&this.masterGain.gain.setTargetAtTime(t,this.ctx.currentTime,.05)}async loadLocalFile(t){await this.initContext(),this.stopStreamSync(),this.stopMicrophone();const a=URL.createObjectURL(t);this.fileAudioElement.src=a,this.fileTrackTitle=t.name.replace(/\.[^/.]+$/,""),this.sourceMode="file",this.synthSequencerTimer&&(clearTimeout(this.synthSequencerTimer),this.synthSequencerTimer=null),this.onTrackChange&&this.onTrackChange(this.getCurrentTrackInfo()),await this.play()}async enableMicrophone(){if(await this.initContext(),this.stopStreamSync(),this.micStream)return this.stopMicrophone(),this.sourceMode="synth",this.onTrackChange&&this.onTrackChange(this.getCurrentTrackInfo()),!1;try{return this.micStream=await navigator.mediaDevices.getUserMedia({audio:!0,video:!1}),this.micSourceNode=this.ctx.createMediaStreamSource(this.micStream),this.micGain=this.ctx.createGain(),this.micGain.gain.setValueAtTime(1.5,this.ctx.currentTime),this.micSourceNode.connect(this.micGain),this.micGain.connect(this.inputAnalyser),this.sourceMode="mic",this.pause(),this.onTrackChange&&this.onTrackChange({title:"Live Audio Input",artist:"Microphone / Ambient Feed",tag:"Real-time Sound Reactive Mode",isLive:!0}),!0}catch(t){return console.error("Microphone access denied or error:",t),alert("Microphone access was denied or is unavailable. Please check your browser permissions."),!1}}stopMicrophone(){this.micStream&&(this.micStream.getTracks().forEach(t=>t.stop()),this.micStream=null),this.micSourceNode&&(this.micSourceNode.disconnect(),this.micSourceNode=null)}async enableStreamSync(){if(await this.initContext(),!navigator.mediaDevices||!navigator.mediaDevices.getDisplayMedia)throw new Error("Screen, window, and tab audio capture is not supported by this browser. Please use Chrome, Edge, Brave, or Opera on desktop.");this.stopStreamSync(),this.stopMicrophone(),this.fileAudioElement&&this.fileAudioElement.pause(),this.synthSequencerTimer&&(clearTimeout(this.synthSequencerTimer),this.synthSequencerTimer=null);let t=null;try{t=await navigator.mediaDevices.getDisplayMedia({video:{width:{max:320},height:{max:240},frameRate:{max:5}},audio:{echoCancellation:!1,noiseSuppression:!1,autoGainControl:!1,channelCount:2},systemAudio:"include",surfaceSwitching:"include",selfBrowserSurface:"exclude"})}catch(i){throw i.name==="NotAllowedError"?new Error("Audio sync sharing was cancelled."):i}const a=t.getAudioTracks();if(!a||a.length===0)throw t.getTracks().forEach(i=>i.stop()),new Error("No audio track was shared. Select a browser tab and enable its audio, or choose a supported system-audio source.");t.getVideoTracks().forEach(i=>i.stop()),this.syncStream=t,this.syncSourceNode=this.ctx.createMediaStreamSource(this.syncStream),this.syncGainNode=this.ctx.createGain(),this.syncGainNode.gain.setValueAtTime(this.syncSensitivity,this.ctx.currentTime),this.syncSourceNode.connect(this.syncGainNode),this.syncGainNode.connect(this.inputAnalyser),this.sourceMode="sync",this.isPlaying=!0;const s=a[0];return s.onended=()=>{this.stopStreamSync(),this.onSyncEnded&&this.onSyncEnded()},this.onTrackChange&&this.onTrackChange(this.getCurrentTrackInfo()),this.onPlayStateChange&&this.onPlayStateChange(!0),!0}stopStreamSync(){if(this.syncStream&&(this.syncStream.getTracks().forEach(t=>t.stop()),this.syncStream=null),this.syncSourceNode){try{this.syncSourceNode.disconnect()}catch{}this.syncSourceNode=null}if(this.syncGainNode){try{this.syncGainNode.disconnect()}catch{}this.syncGainNode=null}}setSyncSensitivity(t){this.syncSensitivity=Math.max(.2,Math.min(4,t)),this.syncGainNode&&this.ctx&&this.syncGainNode.gain.setTargetAtTime(this.syncSensitivity,this.ctx.currentTime,.05)}setSyncTrackMetadata(t){this.syncTrackInfo={...this.syncTrackInfo,...t,isLive:!0},this.sourceMode==="sync"&&this.onTrackChange&&this.onTrackChange(this.getCurrentTrackInfo())}switchToSynth(){this.stopStreamSync(),this.stopMicrophone(),this.fileAudioElement&&this.fileAudioElement.pause(),this.sourceMode="synth",this.onTrackChange&&this.onTrackChange(this.getCurrentTrackInfo()),this.play()}getCurrentTrackInfo(){if(this.sourceMode==="sync")return{title:this.syncTrackInfo.title||"Spotify / Apple Music Stream",artist:this.syncTrackInfo.artist||"Live Audio Feed",tag:this.syncTrackInfo.tag||"HD Real-Time Stream Sync",artwork:this.syncTrackInfo.artwork||null,paletteHint:this.syncTrackInfo.paletteHint||null,source:"sync",isLive:!0};if(this.sourceMode==="mic")return{title:"Live Audio Input",artist:"Microphone / Room Feed",tag:"Real-time Sound Reactive",artwork:null,source:"mic",isLive:!0};if(this.sourceMode==="file")return{title:this.fileTrackTitle||"Uploaded Track",artist:"Local Audio Library",tag:"Custom Audio Stream",artwork:null,source:"file",isLive:!1};const t=this.tracks[this.currentTrackIndex];return{title:t.title,artist:t.artist,tag:`${t.tag} • ${t.bpm} BPM`,key:t.key,artwork:null,source:"synth",isLive:!1}}updateAnalysis(){const t=this.sourceMode==="sync"||this.sourceMode==="mic"?this.inputAnalyser:this.analyser;if(!t||!this.frequencyData)return this.audioData;t.getByteFrequencyData(this.frequencyData);const a=t.frequencyBinCount,i=(this.ctx?this.ctx.sampleRate:48e3)/2/a,n=(x,T)=>{const y=Math.max(0,Math.floor(x/i)),f=Math.min(a-1,Math.ceil(T/i));if(y>=f)return(this.frequencyData[y]||0)/255;let b=0;for(let g=y;g<=f;g++)b+=this.frequencyData[g];return b/(f-y+1)/255},o=n(20,90),c=n(90,220),u=n(220,700),h=n(700,2400),m=n(2400,5500),d=n(5500,1e4),v=n(1e4,18e3),r=(x,T,y=.35,f=.08)=>{const b=T>x?y:f;return x+(T-x)*b};this.audioData.subBass=r(this.audioData.subBass,o,.45,.06),this.audioData.bass=r(this.audioData.bass,c,.42,.07),this.audioData.lowMid=r(this.audioData.lowMid,u,.35,.09),this.audioData.mid=r(this.audioData.mid,h,.35,.09),this.audioData.highMid=r(this.audioData.highMid,m,.38,.1),this.audioData.treble=r(this.audioData.treble,d,.45,.12),this.audioData.air=r(this.audioData.air,v,.5,.14);const E=(this.audioData.subBass*1.5+this.audioData.bass*1.2+this.audioData.mid+this.audioData.treble)/4.7;return this.audioData.energy=r(this.audioData.energy,E,.3,.08),this.audioData}}const Dt=`
  attribute vec2 a_position;
  varying vec2 v_uv;

  void main() {
    v_uv = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`,Rt=`
  precision highp float;

  varying vec2 v_uv;

  uniform vec2 u_resolution;
  uniform float u_time;

  // Audio frequency bands (0.0 to 1.0)
  uniform float u_subBass;
  uniform float u_bass;
  uniform float u_lowMid;
  uniform float u_mid;
  uniform float u_highMid;
  uniform float u_treble;
  uniform float u_energy;

  // Custom visualizer settings
  uniform float u_emberIntensity;
  uniform float u_ribbonSpeed;
  uniform float u_grainAmount;
  uniform float u_visualMode;

  // Active color palette
  uniform vec3 u_colBg;
  uniform vec3 u_colEmberCore;
  uniform vec3 u_colEmberGlow;
  uniform vec3 u_colRibbonPrimary;
  uniform vec3 u_colRibbonSecondary;
  uniform vec3 u_colSunbeam;

  // --- Fast 2D Simplex / Perlin Noise helpers ---
  vec3 permute(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
  }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                   + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                            dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // Fractional Brownian Motion for organic liquid turbulence
  float fbm(vec2 p) {
    float total = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 4; i++) {
      total += snoise(p * freq) * amp;
      freq *= 2.02;
      amp *= 0.48;
    }
    return total;
  }

  // Rotate UV by angle
  vec2 rotate(vec2 p, float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
  }

  // Random hash for film grain
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  void main() {
    // Aspect ratio corrected coordinate
    vec2 uv = v_uv;
    vec2 aspectUv = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0) + 0.5;

    // Alternate visual styles share the active palette and live audio analysis.
    if (u_visualMode > 0.5 && u_visualMode < 1.5) {
      vec2 auroraUv = aspectUv;
      float drift = u_time * 0.12 * u_ribbonSpeed;
      float warp = fbm(vec2(auroraUv.x * 2.1, auroraUv.y * 1.7 - drift));
      float curtainA = sin(auroraUv.x * 7.0 + warp * 2.4 - drift * 2.0);
      float curtainB = sin(auroraUv.x * 11.0 - warp * 1.8 + drift * 1.4);
      float aurora = exp(-abs(auroraUv.y - 0.56 - curtainA * 0.16) * 5.0);
      aurora += exp(-abs(auroraUv.y - 0.66 - curtainB * 0.12) * 7.0) * 0.7;
      float shimmer = 0.72 + 0.28 * sin(auroraUv.x * 18.0 + u_time * 0.8 + warp * 4.0);
      vec3 color = u_colBg + mix(u_colRibbonSecondary, u_colRibbonPrimary, clamp(auroraUv.x + warp * 0.25, 0.0, 1.0))
        * aurora * shimmer * (0.28 + u_energy * 0.9);
      color += u_colSunbeam * pow(max(0.0, auroraUv.y - 0.78), 2.0) * 0.35;
      gl_FragColor = vec4(color, 1.0);
      return;
    }

    if (u_visualMode > 1.5 && u_visualMode < 2.5) {
      vec2 pulseUv = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
      float radius = length(pulseUv);
      float beat = u_time * (1.3 + u_bass * 2.0);
      float ring = pow(0.5 + 0.5 * cos(radius * 42.0 - beat * 2.0), 12.0);
      float halo = exp(-radius * (4.0 - u_energy * 1.2));
      vec3 color = u_colBg + u_colEmberGlow * halo * (0.35 + u_energy * 0.8);
      color += u_colRibbonPrimary * ring * (0.18 + u_energy * 0.9);
      color += u_colEmberCore * exp(-abs(radius - (0.16 + u_bass * 0.12)) * 28.0) * (0.25 + u_bass);
      gl_FragColor = vec4(color, 1.0);
      return;
    }

    if (u_visualMode > 2.5) {
      float bandIndex = min(floor(uv.x * 7.0), 6.0);
      float bandLevel = u_subBass;
      if (bandIndex > 0.5) bandLevel = u_bass;
      if (bandIndex > 1.5) bandLevel = u_lowMid;
      if (bandIndex > 2.5) bandLevel = u_mid;
      if (bandIndex > 3.5) bandLevel = u_highMid;
      if (bandIndex > 4.5) bandLevel = u_treble;
      if (bandIndex > 5.5) bandLevel = u_energy;
      float localX = fract(uv.x * 7.0);
      float barHeight = 0.08 + bandLevel * 0.82;
      float bar = smoothstep(0.0, 0.035, localX) * (1.0 - smoothstep(0.86, 0.9, localX));
      float lit = (1.0 - smoothstep(barHeight - 0.008, barHeight + 0.008, uv.y)) * bar;
      float cap = exp(-abs(uv.y - barHeight) * 28.0) * bar * (0.15 + bandLevel * 0.75);
      vec3 bandColor = mix(u_colRibbonSecondary, u_colRibbonPrimary, bandIndex / 6.0);
      vec3 color = u_colBg + bandColor * (lit * (0.35 + bandLevel * 1.5) + cap);
      color += u_colSunbeam * exp(-uv.y * 5.0) * 0.025;
      gl_FragColor = vec4(color, 1.0);
      return;
    }

    // Time scaling with user flow speed
    float t = u_time * 0.35 * u_ribbonSpeed;

    // 1. Dark, warm graphite base with subtle chromatic depth
    vec3 color = u_colBg;

    // Warm ambient foundation
    float baseVignette = length(uv - vec2(0.5, 0.5));
    color += vec3(0.015, 0.012, 0.010) * (1.0 - baseVignette);

    // =========================================================================
    // 2. LOWER-LEFT CORNER: Deep Bass Ember-like Ambient Glow
    // =========================================================================
    // Anchor in lower-left corner
    vec2 emberAnchor = vec2(0.08, 0.10);
    vec2 emberDiff = uv - emberAnchor;
    // Slight oval aspect for organic hearth shape
    emberDiff.x *= 0.85;

    // Bass frequency modulation
    float bassDrive = (u_subBass * 0.65 + u_bass * 0.45) * u_emberIntensity;
    
    // Liquid noise distortion of the ember boundary
    float emberNoise = fbm(uv * 2.8 - vec2(t * 0.15, t * 0.22));
    float distToEmber = length(emberDiff) - (emberNoise * 0.14);

    // Organic breathing radius: expands smoothly on bass hits
    float emberBaseRadius = 0.48 + (bassDrive * 0.42);
    float emberInnerRadius = 0.18 + (bassDrive * 0.26);

    // Outer soft warm haze
    float emberHaze = smoothstep(emberBaseRadius + 0.35, 0.0, distToEmber);
    emberHaze = pow(emberHaze, 1.4);

    // Inner incandescent core
    float emberCore = smoothstep(emberInnerRadius + 0.15, 0.0, distToEmber);
    emberCore = pow(emberCore, 2.2);

    // Thermal pulsation ripples that radiate outward from the lower-left corner
    float thermalRipple = sin(distToEmber * 14.0 - u_time * 2.2) * 0.5 + 0.5;
    thermalRipple *= smoothstep(0.7, 0.1, distToEmber) * bassDrive * 0.18;

    // Blend ember layers: deep burnt glow outer + radiant incandescent core
    vec3 emberContribution = u_colEmberGlow * (emberHaze + thermalRipple) * 0.95;
    emberContribution += u_colEmberCore * emberCore * (1.1 + bassDrive * 0.6);

    // Additive blend ember onto graphite canvas
    color += emberContribution;

    // =========================================================================
    // 3. DIAGONAL FIELD: Delicate, Translucent Ribbon Waves (Mid-Range)
    // =========================================================================
    // Rotate coordinates ~36 degrees to flow diagonally from bottom-left to top-right
    vec2 diagUv = rotate(aspectUv - vec2(0.45, 0.45), -0.62) + vec2(0.45, 0.45);

    // Mid-range frequency modulation
    float midDrive = (u_mid * 0.7 + u_lowMid * 0.4 + u_highMid * 0.3);

    // Liquid domain warping for silky fluid caustics
    vec2 warp = vec2(
      fbm(diagUv * 1.8 + vec2(t * 0.25, -t * 0.15)),
      fbm(diagUv * 1.8 + vec2(-t * 0.18, t * 0.20))
    );

    vec2 warpedDiag = diagUv + warp * (0.16 + midDrive * 0.14);

    // Multiple translucent wavy ribbon bands slanting diagonally
    // Ribbon 1: Golden peach main body
    float ribbon1Y = warpedDiag.y - 0.48;
    float wave1 = sin(warpedDiag.x * 3.8 + t * 0.8 + midDrive * 1.5) * 0.08;
    float distRibbon1 = abs(ribbon1Y - wave1);
    float ribbon1Intensity = exp(-distRibbon1 * (12.0 - midDrive * 4.0));

    // Ribbon 2: Delicate harmonic translucent veil
    float ribbon2Y = warpedDiag.y - 0.58;
    float wave2 = cos(warpedDiag.x * 5.2 - t * 0.6 + midDrive * 2.0) * 0.06;
    float distRibbon2 = abs(ribbon2Y - wave2);
    float ribbon2Intensity = exp(-distRibbon2 * (16.0 - midDrive * 5.0));

    // Ribbon 3: Higher undulating caustic ripple
    float ribbon3Y = warpedDiag.y - 0.38;
    float wave3 = sin(warpedDiag.x * 6.5 + t * 1.2) * 0.05;
    float distRibbon3 = abs(ribbon3Y - wave3);
    float ribbon3Intensity = exp(-distRibbon3 * 22.0);

    // Blend ribbons with translucent, silky gradients
    vec3 ribbons = vec3(0.0);
    ribbons += u_colRibbonPrimary * ribbon1Intensity * (0.55 + midDrive * 0.65);
    ribbons += u_colRibbonSecondary * ribbon2Intensity * (0.42 + midDrive * 0.55);
    ribbons += (u_colRibbonPrimary * 0.5 + u_colSunbeam * 0.5) * ribbon3Intensity * (0.28 + midDrive * 0.4);

    // Attenuate ribbons softly near the extreme borders for seamless edge drift
    float edgeMask = smoothstep(0.0, 0.15, uv.x) * smoothstep(1.0, 0.85, uv.x)
                   * smoothstep(0.0, 0.15, uv.y) * smoothstep(1.0, 0.85, uv.y);
    ribbons *= (0.4 + edgeMask * 0.6);

    color += ribbons;

    // =========================================================================
    // 4. TOP-RIGHT CORNER: Soft Window Sunbeam & Atmosphere
    // =========================================================================
    // Diagonal soft solar light shaft angling from top-right towards center
    vec2 sunOrigin = vec2(1.02, 0.98);
    vec2 sunDir = normalize(vec2(-0.85, -0.6)); // angling down and to the left
    vec2 toPixel = uv - sunOrigin;
    
    // Projection along sunbeam axis
    float beamProj = dot(toPixel, sunDir);
    float beamDist = length(toPixel - sunDir * max(0.0, beamProj));

    // Soft volumetric light shaft
    float sunbeamShaft = smoothstep(0.55, 0.0, beamDist) * smoothstep(1.4, 0.0, length(uv - sunOrigin));
    sunbeamShaft = pow(sunbeamShaft, 1.8);

    // Treble notes create gentle atmospheric solar flaring in the window ray
    float trebleFlare = u_treble * 0.35;
    vec3 sunbeamColor = u_colSunbeam * sunbeamShaft * (0.35 + trebleFlare);

    color += sunbeamColor;

    // =========================================================================
    // 5. CINEMATIC POST-PROCESSING: Soft Vignette & Organic Film Grain
    // =========================================================================
    // Soft depth-of-field vignette
    float vig = smoothstep(1.2, 0.3, length(uv - vec2(0.5, 0.5)));
    color = mix(color * 0.72, color, vig);

    // Procedural analog film grain
    vec2 grainUv = uv * u_resolution + vec2(hash(vec2(u_time * 43.12, u_time * 19.34)) * 100.0);
    float grain = (hash(grainUv) - 0.5) * 0.065 * u_grainAmount;
    color += vec3(grain);

    // Tone curve: warm, soft black floor (never pure crushed black)
    color = max(color, u_colBg * 0.85);

    // Soft highlight knee to preserve dreamy lo-fi look
    color = color / (color + vec3(0.85)) * 1.35;

    gl_FragColor = vec4(color, 1.0);
  }
`;class Gt{constructor(t){this.canvas=t,this.ctx=t.getContext("2d"),this.particles=[],this.particleCount=280,this.width=0,this.height=0,this.moteColorRGB=[255,240,215],this.sparkleSensitivity=1,this.densityMultiplier=1,this.initParticles()}resize(t,a){this.width=t,this.height=a,this.canvas.width=t,this.canvas.height=a;for(const s of this.particles)(s.x>t+50||s.y>a+50)&&this.resetParticle(s,!0)}setPalette(t){t&&t.moteColor&&(this.moteColorRGB=[Math.round(t.moteColor[0]*255),Math.round(t.moteColor[1]*255),Math.round(t.moteColor[2]*255)])}initParticles(){this.particles=[];for(let t=0;t<this.particleCount;t++){const a={x:0,y:0,z:0,radius:0,baseAlpha:0,currentAlpha:0,vx:0,vy:0,swirlPhase:Math.random()*Math.PI*2,swirlSpeed:.4+Math.random()*.8,twinklePhase:Math.random()*Math.PI*2,twinkleSpeed:1.5+Math.random()*3,flareIntensity:0,flareDecay:.92};this.resetParticle(a,!0),this.particles.push(a)}}resetParticle(t,a=!1){const s=this.width||window.innerWidth,i=this.height||window.innerHeight;if(t.z=.15+Math.random()*.85,a){const n=Math.random(),o=Math.random();t.x=s*(.35+.7*Math.sqrt(n)),t.y=i*(o*o*.85)}else Math.random()>.4?(t.x=s*(.45+Math.random()*.6),t.y=-10-Math.random()*20):(t.x=s+10+Math.random()*20,t.y=i*(Math.random()*.55));t.radius=.7+t.z*3.2,t.baseAlpha=(.15+t.z*.35)*(.7+Math.random()*.5),t.currentAlpha=t.baseAlpha,t.vx=-(.12+Math.random()*.22)*(.5+t.z*.8),t.vy=(.08+Math.random()*.18)*(.5+t.z*.8),t.swirlPhase=Math.random()*Math.PI*2,t.flareIntensity=0}updateAndRender(t,a){if(!this.ctx||this.width===0)return;this.ctx.clearRect(0,0,this.width,this.height),this.ctx.save(),this.ctx.globalCompositeOperation="lighter";const s=(t?t.treble*.7+t.air*.8:0)*this.sparkleSensitivity,i=t?t.energy:0,n=Math.min(a,.05),[o,c,u]=this.moteColorRGB,h=Math.floor(this.particleCount*this.densityMultiplier),m=this.width*.92,d=this.height*.06;for(let v=0;v<h;v++){const r=this.particles[v];r.swirlPhase+=r.swirlSpeed*n;const E=Math.sin(r.swirlPhase)*.35*(.5+r.z),x=Math.cos(r.swirlPhase*.8)*.25*(.5+r.z),T=s*.4*r.z;r.x+=(r.vx+E)*(1+i*.5),r.y+=(r.vy+x-T)*(1+i*.5),r.twinklePhase+=r.twinkleSpeed*(1+s*3)*n;const y=Math.sin(r.twinklePhase)*.35+.65,f=Math.hypot(r.x-m,r.y-d),b=Math.max(.2,1-f/(this.width*.85)),g=s*2.2*Math.max(0,Math.sin(r.twinklePhase*1.5));if(r.currentAlpha=r.baseAlpha*y*b+g*r.z*.8,s>.55&&r.z>.65&&Math.random()<.035&&(r.flareIntensity=Math.min(1,r.flareIntensity+s*.9)),r.flareIntensity*=r.flareDecay,r.x<-40||r.y>this.height+40||r.y<-50||r.x>this.width+50){this.resetParticle(r,!1);continue}const R=Math.min(1,Math.max(0,r.currentAlpha));if(R<=.01)continue;const G=r.radius*(1+r.flareIntensity*.8),V=this.ctx.createRadialGradient(r.x,r.y,0,r.x,r.y,G*2.8);if(V.addColorStop(0,`rgba(${o}, ${c}, ${u}, ${R*.95})`),V.addColorStop(.35,`rgba(${o}, ${c}, ${u}, ${R*.45})`),V.addColorStop(1,`rgba(${o}, ${c}, ${u}, 0.0)`),this.ctx.beginPath(),this.ctx.arc(r.x,r.y,G*2.8,0,Math.PI*2),this.ctx.fillStyle=V,this.ctx.fill(),this.ctx.beginPath(),this.ctx.arc(r.x,r.y,Math.max(.7,G*.35),0,Math.PI*2),this.ctx.fillStyle=`rgba(255, 255, 255, ${Math.min(1,R*1.4)})`,this.ctx.fill(),r.flareIntensity>.15){const B=G*(3.5+r.flareIntensity*5),Pt=r.flareIntensity*.75;if(this.ctx.strokeStyle=`rgba(255, 255, 255, ${Pt})`,this.ctx.lineWidth=1,this.ctx.beginPath(),this.ctx.moveTo(r.x-B,r.y),this.ctx.lineTo(r.x+B,r.y),this.ctx.stroke(),this.ctx.beginPath(),this.ctx.moveTo(r.x,r.y-B),this.ctx.lineTo(r.x,r.y+B),this.ctx.stroke(),r.flareIntensity>.45){const w=B*.55;this.ctx.beginPath(),this.ctx.moveTo(r.x-w,r.y-w),this.ctx.lineTo(r.x+w,r.y+w),this.ctx.moveTo(r.x+w,r.y-w),this.ctx.lineTo(r.x-w,r.y+w),this.ctx.stroke()}}}this.ctx.restore()}}const W={hearth:{id:"hearth",name:"Warm Hearth",description:"Ember amber, burnt caramel, golden peach, graphite",bg:[.043,.045,.048],emberCore:[1,.48,.16],emberGlow:[.82,.28,.08],ribbonPrimary:[.92,.62,.38],ribbonSecondary:[.72,.38,.22],sunbeam:[.98,.88,.72],moteColor:[1,.94,.82],accent:"#f39c56"},ochre:{id:"ochre",name:"Midnight Ochre",description:"Deep indigo graphite, saffron embers, honey ribbons",bg:[.038,.042,.052],emberCore:[1,.62,.12],emberGlow:[.85,.38,.05],ribbonPrimary:[.88,.72,.42],ribbonSecondary:[.55,.42,.25],sunbeam:[.96,.9,.75],moteColor:[1,.95,.84],accent:"#f7b731"},sakura:{id:"sakura",name:"Sakura Reverie",description:"Charcoal plum, dusky rose embers, lilac-champagne ribbons",bg:[.045,.039,.048],emberCore:[.98,.42,.52],emberGlow:[.75,.22,.35],ribbonPrimary:[.86,.65,.78],ribbonSecondary:[.58,.35,.52],sunbeam:[.96,.88,.92],moteColor:[.98,.92,.95],accent:"#e07a9e"},nordic:{id:"nordic",name:"Nordic Pine",description:"Deep dark spruce, bronze embers, misty emerald ribbons",bg:[.036,.044,.042],emberCore:[.95,.58,.22],emberGlow:[.65,.32,.12],ribbonPrimary:[.48,.76,.68],ribbonSecondary:[.28,.52,.46],sunbeam:[.88,.96,.92],moteColor:[.9,.98,.94],accent:"#4ecdc4"}};class Vt{constructor(t,a){this.glCanvas=t,this.particleCanvas=a,this.gl=null,this.program=null,this.uniforms={},this.dustEngine=null,this.currentPalette=W.hearth,this.currentMode="sanctuary",this.modeValues={sanctuary:0,aurora:1,pulse:2,spectrum:3},this.config={emberIntensity:1,ribbonSpeed:1,grainAmount:1,sparkleSensitivity:1,moteDensity:1},this.startTime=performance.now(),this.lastFrameTime=performance.now(),this.animationId=null,this.initWebGL(),this.initDustMotes(),this.handleResize(),window.addEventListener("resize",()=>this.handleResize())}initWebGL(){if(this.gl=this.glCanvas.getContext("webgl",{alpha:!1,depth:!1,stencil:!1,antialias:!0,powerPreference:"high-performance"}),!this.gl){console.error("WebGL not supported on this browser.");return}const t=this.gl,a=(h,m)=>{const d=t.createShader(h);return t.shaderSource(d,m),t.compileShader(d),t.getShaderParameter(d,t.COMPILE_STATUS)?d:(console.error("Shader compile error:",t.getShaderInfoLog(d)),t.deleteShader(d),null)},s=a(t.VERTEX_SHADER,Dt),i=a(t.FRAGMENT_SHADER,Rt);if(this.program=t.createProgram(),t.attachShader(this.program,s),t.attachShader(this.program,i),t.linkProgram(this.program),!t.getProgramParameter(this.program,t.LINK_STATUS)){console.error("Program link error:",t.getProgramInfoLog(this.program));return}t.useProgram(this.program);const n=new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),o=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,o),t.bufferData(t.ARRAY_BUFFER,n,t.STATIC_DRAW);const c=t.getAttribLocation(this.program,"a_position");t.enableVertexAttribArray(c),t.vertexAttribPointer(c,2,t.FLOAT,!1,0,0);const u=["u_resolution","u_time","u_subBass","u_bass","u_lowMid","u_mid","u_highMid","u_treble","u_energy","u_emberIntensity","u_ribbonSpeed","u_grainAmount","u_visualMode","u_colBg","u_colEmberCore","u_colEmberGlow","u_colRibbonPrimary","u_colRibbonSecondary","u_colSunbeam"];for(const h of u)this.uniforms[h]=t.getUniformLocation(this.program,h);this.updatePaletteUniforms()}initDustMotes(){this.dustEngine=new Gt(this.particleCanvas),this.dustEngine.setPalette(this.currentPalette)}handleResize(){const t=window.innerWidth,a=window.innerHeight,s=Math.min(window.devicePixelRatio||1,2),i=Math.floor(t*s),n=Math.floor(a*s);(this.glCanvas.width!==i||this.glCanvas.height!==n)&&(this.glCanvas.width=i,this.glCanvas.height=n,this.glCanvas.style.width=`${t}px`,this.glCanvas.style.height=`${a}px`,this.gl&&this.gl.viewport(0,0,i,n)),this.dustEngine&&this.dustEngine.resize(t,a)}setPalette(t){return W[t]?(this.currentPalette=W[t],this.updatePaletteUniforms(),this.dustEngine&&this.dustEngine.setPalette(this.currentPalette),this.currentPalette):null}setMode(t){Object.prototype.hasOwnProperty.call(this.modeValues,t)&&(this.currentMode=t)}updatePaletteUniforms(){if(!this.gl||!this.program)return;const t=this.gl,a=this.currentPalette;t.useProgram(this.program),t.uniform3fv(this.uniforms.u_colBg,a.bg),t.uniform3fv(this.uniforms.u_colEmberCore,a.emberCore),t.uniform3fv(this.uniforms.u_colEmberGlow,a.emberGlow),t.uniform3fv(this.uniforms.u_colRibbonPrimary,a.ribbonPrimary),t.uniform3fv(this.uniforms.u_colRibbonSecondary,a.ribbonSecondary),t.uniform3fv(this.uniforms.u_colSunbeam,a.sunbeam)}setConfig(t,a){this.config[t]=a,t==="sparkleSensitivity"&&this.dustEngine&&(this.dustEngine.sparkleSensitivity=a),t==="moteDensity"&&this.dustEngine&&(this.dustEngine.densityMultiplier=a)}render(t){const a=performance.now(),s=(a-this.startTime)*.001,i=(a-this.lastFrameTime)*.001;if(this.lastFrameTime=a,this.gl&&this.program){const n=this.gl;n.useProgram(this.program),n.uniform2f(this.uniforms.u_resolution,this.glCanvas.width,this.glCanvas.height),n.uniform1f(this.uniforms.u_time,s),t?(n.uniform1f(this.uniforms.u_subBass,t.subBass),n.uniform1f(this.uniforms.u_bass,t.bass),n.uniform1f(this.uniforms.u_lowMid,t.lowMid),n.uniform1f(this.uniforms.u_mid,t.mid),n.uniform1f(this.uniforms.u_highMid,t.highMid),n.uniform1f(this.uniforms.u_treble,t.treble),n.uniform1f(this.uniforms.u_energy,t.energy)):(n.uniform1f(this.uniforms.u_subBass,0),n.uniform1f(this.uniforms.u_bass,0),n.uniform1f(this.uniforms.u_lowMid,0),n.uniform1f(this.uniforms.u_mid,0),n.uniform1f(this.uniforms.u_highMid,0),n.uniform1f(this.uniforms.u_treble,0),n.uniform1f(this.uniforms.u_energy,0)),n.uniform1f(this.uniforms.u_emberIntensity,this.config.emberIntensity),n.uniform1f(this.uniforms.u_ribbonSpeed,this.config.ribbonSpeed),n.uniform1f(this.uniforms.u_grainAmount,this.config.grainAmount),n.uniform1f(this.uniforms.u_visualMode,this.modeValues[this.currentMode]),n.drawArrays(n.TRIANGLES,0,6)}this.dustEngine&&this.dustEngine.updateAndRender(t,i)}}const Ft=document.getElementById("glCanvas"),Nt=document.getElementById("particleCanvas"),Y=document.getElementById("uiOverlay"),st=document.getElementById("welcomeOverlay"),X=document.getElementById("settingsDrawer"),at=document.getElementById("dropZone"),M=document.getElementById("pulseIndicator"),P=document.getElementById("trackBadge"),qt=document.getElementById("trackTitle"),Ut=document.getElementById("trackMeta"),lt=document.getElementById("trackArtworkThumb"),zt=document.getElementById("trackArtworkImg"),Ot=document.getElementById("trackArtworkGlow"),rt=document.getElementById("sourceSynthBtn"),xt=document.getElementById("sourceSyncBtn"),ot=document.getElementById("sourceFileBtn"),ct=document.getElementById("sourceMicBtn"),Tt=document.getElementById("audioFileInput"),Q=document.getElementById("syncModal"),$t=document.getElementById("btnOpenSync"),Ht=document.getElementById("btnCloseSyncModal"),D=document.getElementById("btnStartAudioSync"),K=document.getElementById("btnStartAudioSyncText"),ut=document.getElementById("syncStatusCard"),Wt=document.getElementById("btnDisconnectSync"),jt=document.getElementById("sliderSyncGain"),Yt=document.getElementById("labelSyncGainVal"),Xt=document.getElementById("syncGainMeterFill"),St=document.getElementById("syncSearchInput"),Z=document.getElementById("btnClearSyncSearch"),k=document.getElementById("syncSearchResults"),ht=document.querySelectorAll(".station-chip"),Qt=document.getElementById("btnPlayPause"),dt=document.getElementById("playPauseIcon"),Kt=document.getElementById("btnPrev"),Zt=document.getElementById("btnNext"),J=document.getElementById("timeCurrent"),tt=document.getElementById("timeDuration"),wt=document.getElementById("progressTrack"),U=document.getElementById("progressFill"),Mt=document.getElementById("progressThumb"),mt=document.getElementById("btnToggleRain"),ft=document.getElementById("btnToggleVinyl"),Et=document.getElementById("btnMute"),N=document.getElementById("volumeSlider"),j=document.getElementById("volumeIcon"),kt=document.getElementById("btnSettings"),Jt=document.getElementById("btnCloseSettings"),At=document.getElementById("btnCinemaMode"),et=document.getElementById("btnFullscreen"),yt=document.getElementById("fullscreenIcon"),it=document.querySelectorAll(".palette-chip"),gt=document.querySelectorAll(".visual-mode-chip"),te=document.getElementById("sliderEmber"),ee=document.getElementById("sliderRibbon"),ie=document.getElementById("sliderSparkle"),ne=document.getElementById("sliderMoteDensity"),se=document.getElementById("sliderGrain"),ae=document.getElementById("labelEmberVal"),re=document.getElementById("labelRibbonVal"),oe=document.getElementById("labelSparkleVal"),ce=document.getElementById("labelMoteDensity"),le=document.getElementById("labelGrainVal"),l=new _t,p=new Vt(Ft,Nt);let A=!1,q=!1,F=.85,z=!1,pt=null,C=!1;function bt(e){if(isNaN(e)||e<0)return"00:00";const t=Math.floor(e/60),a=Math.floor(e%60);return`${t.toString().padStart(2,"0")}:${a.toString().padStart(2,"0")}`}function ue(e){e?(M.classList.remove("paused"),P.textContent="PLAYING",dt.innerHTML=`
      <rect x="6" y="4" width="4" height="16"></rect>
      <rect x="14" y="4" width="4" height="16"></rect>
    `):(M.classList.add("paused"),P.textContent="PAUSED",dt.innerHTML='<polygon points="5 3 19 12 5 21 5 3"></polygon>')}function O(e){e&&(qt.textContent=e.title,Ut.textContent=e.tag?`${e.artist} • ${e.tag}`:e.artist,e.artwork?(lt.style.display="block",zt.src=e.artwork,p&&p.currentPalette&&p.currentPalette.accent&&(Ot.style.background=`radial-gradient(circle, ${p.currentPalette.accent} 0%, transparent 70%)`)):lt.style.display="none",l.sourceMode==="sync"?(M.classList.remove("paused"),M.classList.add("synced"),P.textContent="AUDIO CAPTURE",J.textContent="LIVE",tt.textContent="INPUT",U.style.width="100%"):e.isLive?(M.classList.remove("synced"),P.textContent="MICROPHONE",J.textContent="LIVE",tt.textContent="REALTIME",U.style.width="100%"):(M.classList.remove("synced"),P.textContent=l.isPlaying?"PLAYING":"PAUSED"))}l.onPlayStateChange=e=>{ue(e)};l.onTrackChange=e=>{O(e)};l.onTimeUpdate=(e,t)=>{if(z||l.sourceMode==="mic"||l.sourceMode==="sync")return;J.textContent=bt(e),tt.textContent=bt(t);const a=Math.min(100,Math.max(0,e/t*100));U.style.width=`${a}%`,Mt.style.left=`${a}%`};async function $(){A||(A=!0,st.classList.add("dissolved"),await l.play(),H())}st.addEventListener("click",$);Qt.addEventListener("click",async()=>{if(!A){await $();return}await l.togglePlay()});Zt.addEventListener("click",()=>{l.nextTrack()});Kt.addEventListener("click",()=>{l.prevTrack()});function Ct(e){const t=wt.getBoundingClientRect(),a=e.clientX-t.left,s=Math.min(1,Math.max(0,a/t.width));U.style.width=`${s*100}%`,Mt.style.left=`${s*100}%`,l.seek(s)}wt.addEventListener("mousedown",e=>{z=!0,Ct(e)});window.addEventListener("mousemove",e=>{z&&Ct(e)});window.addEventListener("mouseup",()=>{z=!1});function S(e){rt.classList.toggle("active",e==="synth"),xt.classList.toggle("active",e==="sync"),ot.classList.toggle("active",e==="file"),ct.classList.toggle("active",e==="mic")}function I(e){const t=e!==void 0?e:!Q.classList.contains("open");Q.classList.toggle("open",t),t&&L(!1)}function _(e){e?(ut.style.display="flex",D.classList.add("active"),K.textContent="Stop Capture",M.classList.add("synced")):(ut.style.display="none",D.classList.remove("active"),K.textContent="Capture Audio",M.classList.remove("synced"))}async function he(){if(l.sourceMode==="sync"&&l.syncStream){l.stopStreamSync(),l.switchToSynth(),S("synth"),_(!1);return}try{D.disabled=!0,K.textContent="Select Window / Tab...",A||(st.classList.add("dissolved"),A=!0),await l.enableStreamSync()&&(S("sync"),_(!0),setTimeout(()=>{I(!1)},700))}catch(e){console.warn("Sync failed or cancelled:",e),alert(e.message||"Audio sync failed."),S(l.sourceMode),_(!1)}finally{D.disabled=!1}}l.onSyncEnded=()=>{_(!1),S("synth"),l.switchToSynth()};rt.addEventListener("click",()=>{S("synth"),l.switchToSynth()});xt.addEventListener("click",()=>{I(!0)});$t.addEventListener("click",()=>{I()});Ht.addEventListener("click",()=>{I(!1)});D.addEventListener("click",()=>{he()});Wt.addEventListener("click",()=>{l.stopStreamSync(),l.switchToSynth(),S("synth"),_(!1)});ot.addEventListener("click",()=>{Tt.click()});Tt.addEventListener("change",e=>{const t=e.target.files[0];t&&(S("file"),l.loadLocalFile(t))});ct.addEventListener("click",async()=>{const e=await l.enableMicrophone();S(e?"mic":"synth")});jt.addEventListener("input",e=>{const t=parseFloat(e.target.value);l.setSyncSensitivity(t),Yt.textContent=`${Math.round(t*100)}%`});let vt=null;St.addEventListener("input",e=>{const t=e.target.value.trim();if(Z.style.display=t?"block":"none",clearTimeout(vt),!t){k.innerHTML="";return}vt=setTimeout(async()=>{try{k.innerHTML='<div style="font-size:0.75rem; color: var(--text-tertiary); padding: 0.5rem;">Searching Apple Music catalog...</div>';const a=await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(t)}&limit=5&entity=song`);if(!a.ok)throw new Error("Search failed");const s=await a.json();if(!s.results||s.results.length===0){k.innerHTML=`<div style="font-size:0.75rem; color: var(--text-tertiary); padding: 0.5rem;">No tracks found for "${t}"</div>`;return}k.innerHTML="",s.results.forEach(i=>{const n=document.createElement("div");n.className="search-result-card";const o=i.artworkUrl100?i.artworkUrl100.replace("100x100bb","300x300bb"):"";n.innerHTML=`
          <img class="result-art" src="${o||""}" alt="Cover" />
          <div class="result-info">
            <div class="result-title">${i.trackName||"Unknown Title"}</div>
            <div class="result-artist">${i.artistName||"Unknown Artist"} • ${i.collectionName||""}</div>
          </div>
          <span class="result-badge">Apply</span>
        `,n.addEventListener("click",()=>{l.setSyncTrackMetadata({title:i.trackName,artist:i.artistName,tag:i.collectionName||"Apple Music catalog",artwork:o}),O(l.getCurrentTrackInfo())}),k.appendChild(n)})}catch(a){console.warn("Metadata search error:",a),k.innerHTML='<div style="font-size:0.75rem; color: var(--text-tertiary); padding: 0.5rem;">Could not load search results. You can still stream directly!</div>'}},350)});Z.addEventListener("click",()=>{St.value="",Z.style.display="none",k.innerHTML=""});ht.forEach(e=>{e.addEventListener("click",()=>{ht.forEach(n=>n.classList.remove("active")),e.classList.add("active");const t=e.getAttribute("data-title"),a=e.getAttribute("data-artist"),s=e.getAttribute("data-art"),i=e.getAttribute("data-palette");i&&p&&(p.setPalette(i),it.forEach(n=>{n.classList.toggle("active",n.getAttribute("data-palette")===i)})),l.setSyncTrackMetadata({title:t,artist:a,tag:"Curated Sync Stream",artwork:s,paletteHint:i}),O(l.getCurrentTrackInfo())})});mt.addEventListener("click",()=>{const e=!l.ambientSettings.rain;l.toggleRain(e),mt.classList.toggle("active",e)});ft.addEventListener("click",()=>{const e=!l.ambientSettings.vinyl;l.toggleVinyl(e),ft.classList.toggle("active",e)});N.addEventListener("input",e=>{const t=parseFloat(e.target.value);l.setVolume(t),q=t===0,nt(t)});Et.addEventListener("click",()=>{q?(l.setVolume(F),N.value=F,q=!1,nt(F)):(F=parseFloat(N.value)||.85,l.setVolume(0),N.value=0,q=!0,nt(0))});function nt(e){e<=.01?j.innerHTML=`
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <line x1="23" y1="9" x2="17" y2="15"></line>
      <line x1="17" y1="9" x2="23" y2="15"></line>
    `:e<.5?j.innerHTML=`
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    `:j.innerHTML=`
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
    `}function L(e){const t=e!==void 0?e:!X.classList.contains("open");X.classList.toggle("open",t),kt.classList.toggle("active",t)}kt.addEventListener("click",e=>{e.stopPropagation(),L()});Jt.addEventListener("click",()=>{L(!1)});it.forEach(e=>{e.addEventListener("click",()=>{it.forEach(a=>a.classList.remove("active")),e.classList.add("active");const t=e.getAttribute("data-palette");p.setPalette(t)})});gt.forEach(e=>{e.addEventListener("click",()=>{const t=e.getAttribute("data-mode");p.setMode(t),gt.forEach(a=>{const s=a===e;a.classList.toggle("active",s),a.setAttribute("aria-pressed",String(s))})})});te.addEventListener("input",e=>{const t=parseFloat(e.target.value);p.setConfig("emberIntensity",t),ae.textContent=`${Math.round(t*100)}%`});ee.addEventListener("input",e=>{const t=parseFloat(e.target.value);p.setConfig("ribbonSpeed",t),re.textContent=`${Math.round(t*100)}%`});ie.addEventListener("input",e=>{const t=parseFloat(e.target.value);p.setConfig("sparkleSensitivity",t),oe.textContent=`${Math.round(t*100)}%`});ne.addEventListener("input",e=>{const t=parseFloat(e.target.value);p.setConfig("moteDensity",t),ce.textContent=`${Math.round(t*100)}%`});se.addEventListener("input",e=>{const t=parseFloat(e.target.value);p.setConfig("grainAmount",t),le.textContent=`${Math.round(t*100)}%`});function It(){C=!C,Y.classList.toggle("cinema-mode",C),At.classList.toggle("active",C),C&&L(!1)}At.addEventListener("click",It);function Lt(){document.fullscreenElement?document.exitFullscreen().catch(e=>{console.warn("Exit fullscreen error:",e)}):document.documentElement.requestFullscreen().catch(e=>{console.warn("Fullscreen error:",e)})}et.addEventListener("click",Lt);document.addEventListener("fullscreenchange",()=>{document.fullscreenElement?(et.classList.add("active"),yt.innerHTML=`
      <polyline points="4 14 10 14 10 20"></polyline>
      <polyline points="20 10 14 10 14 4"></polyline>
      <line x1="14" y1="10" x2="21" y2="3"></line>
      <line x1="3" y1="21" x2="10" y2="14"></line>
    `):(et.classList.remove("active"),yt.innerHTML=`
      <polyline points="15 3 21 3 21 9"></polyline>
      <polyline points="9 21 3 21 3 15"></polyline>
      <line x1="21" y1="3" x2="14" y2="10"></line>
      <line x1="3" y1="21" x2="10" y2="14"></line>
    `)});function H(){Y.classList.remove("idle-hidden"),clearTimeout(pt),l.isPlaying&&!X.classList.contains("open")&&!C&&(pt=setTimeout(()=>{Y.classList.add("idle-hidden")},4e3))}window.addEventListener("mousemove",H);window.addEventListener("mousedown",H);window.addEventListener("keydown",H);window.addEventListener("keydown",e=>{e.target.tagName!=="INPUT"&&(e.code==="Space"?(e.preventDefault(),A?l.togglePlay():$()):e.key==="f"||e.key==="F"?Lt():e.key==="h"||e.key==="H"?It():e.key==="s"||e.key==="S"?L():e.key==="y"||e.key==="Y"?I():e.key==="Escape"?(I(!1),L(!1)):e.key==="m"||e.key==="M"?Et.click():(e.key==="n"||e.key==="N")&&l.nextTrack())});window.addEventListener("dragover",e=>{e.preventDefault(),at.classList.add("active")});window.addEventListener("dragleave",e=>{e.relatedTarget===null&&at.classList.remove("active")});window.addEventListener("drop",e=>{if(e.preventDefault(),at.classList.remove("active"),e.dataTransfer&&e.dataTransfer.files&&e.dataTransfer.files[0]){const t=e.dataTransfer.files[0];(t.type.startsWith("audio/")||/\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(t.name))&&(A||$(),rt.classList.remove("active"),ot.classList.add("active"),ct.classList.remove("active"),l.loadLocalFile(t))}});function Bt(){const e=l.updateAnalysis();if(p.render(e),Q.classList.contains("open")||l.sourceMode==="sync"){const t=Math.min(100,Math.round(e.energy*100*l.syncSensitivity*1.5));Xt.style.width=`${t}%`}requestAnimationFrame(Bt)}requestAnimationFrame(Bt);O(l.getCurrentTrackInfo());
