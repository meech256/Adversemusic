/* data.js — All static data for Adverse Music */

const TRACKS = [
  { name:'Essence (Remix)', artist:'Wizkid ft. Justin Bieber', emoji:'🌙', bg:'c-purple', col1:'#5a2acc', col2:'#9a3acc', duration:231, source:'preview', streamUrl:null, lyricsKey:'es' },
  { name:'Last Last',        artist:'Burna Boy',               emoji:'🔥', bg:'c-rose',   col1:'#8a0a28', col2:'#cc2a50', duration:213, source:'preview', streamUrl:null, lyricsKey:'ll' },
  { name:'Calm Down',        artist:'Rema ft. Selena Gomez',   emoji:'💎', bg:'c-teal',   col1:'#0a5a5a', col2:'#0a9a6a', duration:239, source:'preview', streamUrl:null, lyricsKey:'cd' },
  { name:'Come Closer',      artist:'Mr Eazi',                 emoji:'🌊', bg:'c-gold',   col1:'#5a3a00', col2:'#aa7a00', duration:205, source:'preview', streamUrl:null, lyricsKey:'cc' },
  { name:'Soso',             artist:'Omah Lay',                emoji:'🌿', bg:'c-green',  col1:'#0a4a18', col2:'#0a8a38', duration:198, source:'preview', streamUrl:null, lyricsKey:'so' },
  { name:'Rush',             artist:'Ayra Starr',              emoji:'✨', bg:'c-pink',   col1:'#5a0a4a', col2:'#9a1a7a', duration:174, source:'preview', streamUrl:null, lyricsKey:'rs' },
  { name:'Terminator',       artist:'Asake',                   emoji:'⚡', bg:'c-blue',   col1:'#0a1a6a', col2:'#1a4aaa', duration:188, source:'preview', streamUrl:null, lyricsKey:'tm' },
];

const SEARCH_EXTRAS = [
  { name:'Ojuelegba',      artist:'Wizkid',       emoji:'🎵', bg:'c-purple', duration:252, lyricsKey:null },
  { name:'Ye',             artist:'Burna Boy',    emoji:'🔮', bg:'c-rose',   duration:198, lyricsKey:null },
  { name:'Overdue',        artist:'Tems',         emoji:'🌸', bg:'c-pink',   duration:210, lyricsKey:null },
  { name:'Amapiano Mix',   artist:'DJ Maphorisa', emoji:'🎹', bg:'c-teal',   duration:320, lyricsKey:null },
  { name:'Bandana',        artist:'Fireboy DML',  emoji:'🎀', bg:'c-gold',   duration:196, lyricsKey:null },
];

const ALL_SEARCH_TRACKS = [...TRACKS, ...SEARCH_EXTRAS];

const LYRICS_DB = {
  es: [
    {t:0,  l:"Baby girl, you already know"},
    {t:8,  l:"Your love is written in my soul"},
    {t:16, l:"The way you move, I lose control"},
    {t:24, l:"Every night feels like gold"},
    {t:32, l:"Essence of you fills the room"},
    {t:40, l:"Like moonlight breaking through"},
    {t:48, l:"Can't imagine life without you"},
    {t:56, l:"Every moment feels brand new"},
    {t:64, l:"Your love is my everything"},
    {t:72, l:"My heart just wants to sing"},
    {t:80, l:"Dancing in the night with you"},
    {t:88, l:"Nothing else will ever do"},
    {t:100,l:"Essence… essence…"},
    {t:110,l:"You are my essence"},
    {t:120,l:"The reason I exist"},
    {t:130,l:"Every breath, every kiss"},
    {t:140,l:"Pure essence of bliss"},
  ],
  ll: [
    {t:0,  l:"I don't want to see you cry"},
    {t:8,  l:"Even though I made you cry"},
    {t:16, l:"Last last na everybody go chop breakfast"},
    {t:24, l:"No cap, this love was magic"},
    {t:32, l:"But the ending was tragic"},
    {t:40, l:"Still, last last we move"},
    {t:48, l:"Heartbreak is part of the groove"},
    {t:56, l:"Every tear becomes proof"},
    {t:64, l:"That love was on the loose"},
    {t:72, l:"Last last, last last"},
    {t:80, l:"Na everybody go chop breakfast"},
    {t:90, l:"Me sef I dey feel am"},
    {t:100,l:"But we gotta keep moving"},
    {t:110,l:"Last last, we gon be alright"},
  ],
  cd: [
    {t:0,  l:"Baby calm down, calm down"},
    {t:8,  l:"I no go make you feel no way"},
    {t:16, l:"Girl you know say I love you"},
    {t:24, l:"Every single night and day"},
    {t:32, l:"Calm down, oh"},
    {t:40, l:"Let me love you right"},
    {t:48, l:"Won't give up without a fight"},
    {t:56, l:"Your smile, it lights my night"},
    {t:64, l:"Everything about you right"},
    {t:72, l:"Calm down baby, calm down"},
    {t:82, l:"No stress, just love around"},
    {t:92, l:"Our love, the sweetest sound"},
    {t:102,l:"Baby girl you know you've found"},
    {t:112,l:"The realest love in town"},
  ],
  cc: [
    {t:0,  l:"Come closer, come closer"},
    {t:10, l:"Don't be afraid of what you feel"},
    {t:20, l:"I promise this is real"},
    {t:30, l:"Every touch, a gentle seal"},
    {t:40, l:"On the promise we reveal"},
    {t:50, l:"Come closer to me girl"},
    {t:60, l:"You're my entire world"},
    {t:70, l:"Every curl, every pearl"},
    {t:80, l:"My heart starts to unfurl"},
    {t:95, l:"Come closer, stay close"},
    {t:105,l:"You matter the most"},
  ],
  so: [
    {t:0,  l:"So, so, soso"},
    {t:8,  l:"Your love got me feeling soso"},
    {t:16, l:"Can't tell if I'm up or down"},
    {t:24, l:"But with you I'm homeward bound"},
    {t:32, l:"Every smile, every frown"},
    {t:40, l:"Girl you're wearing the crown"},
    {t:50, l:"Soso, soso"},
    {t:60, l:"I just can't let go"},
    {t:70, l:"This feeling, this glow"},
    {t:80, l:"Watch our love grow and grow"},
  ],
  rs: [
    {t:0,  l:"Rush, rush, come give me a rush"},
    {t:8,  l:"Every second with you is a must"},
    {t:16, l:"In your love I put my trust"},
    {t:24, l:"Turned all my worries to dust"},
    {t:32, l:"Rush, I feel the rush"},
    {t:40, l:"Your touch is enough"},
    {t:50, l:"Even when things get tough"},
    {t:60, l:"Love so pure, never rough"},
    {t:70, l:"Rush rush rush"},
  ],
  tm: [
    {t:0,  l:"Terminator, I dey come for you"},
    {t:8,  l:"My love, it cannot be subdued"},
    {t:16, l:"Every move I make is cued"},
    {t:24, l:"By the way you set the mood"},
    {t:32, l:"I'm a terminator"},
    {t:42, l:"Coming for your heart later"},
    {t:52, l:"Nothing but love, nothing greater"},
    {t:62, l:"My feelings, a skyscraper"},
    {t:72, l:"Terminator terminator"},
  ],
};

// Audius track store (populated at runtime)
let audiusTracks = [];

function fmt(s) {
  s = Math.floor(s || 0);
  return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
}
