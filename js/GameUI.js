// GameUI.js — интерфейс в стиле Roblox-симулятора: HUD (деньги, скорость, кристаллы, хотбар, Auto Swing,
// задание сверху, кнопки слева/справа, таймер Titanic Egg), метки над объектами мира (яйца с HP,
// питомцы с $/с, ники, стражи, магазины), подсказки взаимодействия, всплывашки, окна.
// Окна магазина косметики, подарка дня и колеса — GameUIShop.js (тот же каркас UI.window).

const UI_ICONS = {
    chest: '<img class="ic" src="assets/ui/chest.webp" alt="">',
    question: '<img class="ic" src="assets/ui/question.webp" alt="">',
    bolt: '<img class="ic" src="assets/ui/lightning.webp" alt="">',
    boostcash: '<img class="ic" src="assets/ui/cash-bonus.webp" alt="">',
    cart: '<img class="ic" src="assets/ui/shop.webp" alt="">',
    book: '<img class="ic" src="assets/ui/book.webp" alt="">',
    egg: '<img class="ic" src="assets/ui/egg.webp" alt="">',
    paw: '<img class="ic" src="assets/ui/paw.webp" alt="">',
    gift: '<img class="ic" src="assets/ui/gift.webp" alt="">',
    wheel: '<img class="ic" src="assets/ui/prize-wheel.webp" alt="">',
    gear: '<img class="ic" src="assets/ui/gear.webp" alt="">',
    menu: '<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
    shoe: '<img class="ic" src="assets/ui/shoe.webp" alt="">',
    cash: '<img class="ic" src="assets/ui/banknotes.webp" alt="">',
    gem: '<svg viewBox="0 0 24 24"><path d="M6 3h12l4 6-10 12L2 9z" fill="#c45cff" stroke="#4a1a7a" stroke-width="1.4"/><path d="M2 9h20M9 3l3 18 3-18" stroke="#ecc8ff" stroke-width="1.1" fill="none"/></svg>',
    pick: '<svg viewBox="0 0 24 24"><path d="M3 6c5-4 13-4 18 0-4-1-7-1-9 1-2-2-5-2-9-1z" fill="#bfc6cf" stroke="#333" stroke-width="1.2"/><path d="M12 7l-1 15h2z" fill="#8a5a32" stroke="#3a2414" stroke-width="1"/></svg>',
    bat: '<svg viewBox="0 0 24 24"><path d="M19 3c1.5 1.5 1 3-1 5L8 18l-2-2L16 6c2-2 1.5-4.5 3-3z" fill="#e0a860" stroke="#5a3414" stroke-width="1.2"/><path d="M6 16l2 2-3 3-2-2z" fill="#5a3414"/></svg>',
    trophy: '<img class="ic" src="assets/ui/trophy.webp" alt="">',
    trash: '<svg viewBox="0 0 24 24"><path d="M5 7h14l-1.2 13a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" fill="#fff"/><path d="M3 5h18M9 5V3h6v2" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M10 10v8M14 10v8" stroke="#e8343a" stroke-width="2"/></svg>',
    trident: '<img class="ic" src="assets/ui/timer.webp" alt="">',
    house: '<svg viewBox="0 0 24 24"><path d="M3 11L12 3l9 8v10h-6v-6H9v6H3z" fill="#3b8bff" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    luck: '<img class="ic" src="assets/ui/clover.webp" alt="">',
    star: '<img class="ic" src="assets/ui/star.webp" alt="">',
    lock: '<img class="ic" src="assets/ui/lock.webp" alt="">',
    ad: '<img class="ic" src="assets/ui/watch-video.webp" alt="">',
    jump: '<img class="ic" src="assets/ui/jump-arrow.webp" alt="">',
};

const UI_CSS = `

#b-super { position: relative; } #b-super .badge { position: absolute; right: -.35em; bottom: -.35em; background: #e8343a; color: #fff; border: .12em solid #111; border-radius: .6em; font-size: .7em; padding: .05em .35em; font-weight: 900; }
#b-super.ready { animation: pulse .6s infinite alternate; }
#hud-offer { position: fixed; z-index: 21; left: calc(var(--hl-bottom-x, 50vw) + var(--hl-bottom-w, 0px) / 2); top: calc(var(--hl-bottom-y, 80vh) - 3.6em * var(--hl-k, 1)); transform: translateX(-50%); display: flex; gap: .4em; font-size: calc(15px * var(--hl-k, 1)); pointer-events: none; }
#hud-offer .rb { font-size: 1em; padding: .35em .7em; white-space: nowrap; }
#hud-offer .rb img.ic { width: 1.5em; height: 1.5em; }
.boost.gift { border-color: #7dff4d; background: rgba(20,90,30,.78); animation: pulse .7s infinite alternate; }
.sup-prize { display: flex; align-items: center; gap: 14px; padding: 12px; border-radius: 12px; background: linear-gradient(135deg, rgba(255,210,58,.25), rgba(196,92,255,.25)); border: 3px solid #ffd23a; margin-bottom: 12px; }
.sup-prize .pic { width: 110px; height: 110px; flex: none; display: flex; align-items: center; justify-content: center; }
.sup-prize .pic img { width: 110px; height: 110px; object-fit: contain; }
.sup-steps { display: flex; gap: 8px; margin: 10px 0; } .sup-steps i { flex: 1; height: 18px; border-radius: 6px; background: rgba(0,0,0,.45); border: 2px solid #111; }
.sup-steps i.on { background: linear-gradient(#fff07a, #ffbf1f); }

img.ic { width: 1.5em; height: 1.5em; object-fit: contain; flex: none; pointer-events: none; -webkit-user-drag: none; filter: drop-shadow(0 .08em 0 rgba(0,0,0,.35)); }
.rb img.ic { width: 1.7em; height: 1.7em; margin: -.2em 0; } .sq img.ic { width: 2.6em; height: 2.6em; } #hud-left .rb img.ic { width: 1.55em; height: 1.55em; }
.stat img.ic { width: 2em; height: 2em; } .slot img.ic { width: 1.9em; height: 1.9em; } .boost img.ic { width: 1.5em; height: 1.5em; }
#hud-timer img.ic { width: 1.6em; height: 1.6em; } #jump-btn img.ic { width: 2.6em; height: 2.6em; } #hud-menu .rb img.ic { width: 1.6em; height: 1.6em; }
:root { --ui-font: Montserrat, 'Arial Black', system-ui, sans-serif; --ink: #121212; }
#ui { position: fixed; inset: 0; pointer-events: none; z-index: 20; font-family: var(--ui-font); color: #fff; user-select: none; -webkit-tap-highlight-color: transparent; }
#ui * { box-sizing: border-box; }
.ui-o { text-shadow: 0 2px 0 var(--ink), 2px 0 0 var(--ink), -2px 0 0 var(--ink), 0 -2px 0 var(--ink), 1.5px 1.5px 0 var(--ink), -1.5px 1.5px 0 var(--ink), 1.5px -1.5px 0 var(--ink), -1.5px -1.5px 0 var(--ink), 0 4px 2px rgba(0,0,0,.35); }
.ui-o1 { text-shadow: 0 1px 0 var(--ink), 1px 0 0 var(--ink), -1px 0 0 var(--ink), 0 -1px 0 var(--ink), 1px 1px 0 var(--ink), -1px 1px 0 var(--ink), 1px -1px 0 var(--ink), -1px -1px 0 var(--ink); }
.hl-blk { font-size: calc(16px * var(--hl-k, 1)); pointer-events: none; }
.rb { pointer-events: auto; cursor: pointer; border: 0.19em solid rgba(0,0,0,.72); border-radius: .55em; color: #fff; font: 900 1em/1 var(--ui-font);
      display: inline-flex; align-items: center; justify-content: center; gap: .35em; padding: .45em .8em; position: relative;
      box-shadow: inset 0 -.32em 0 rgba(0,0,0,.25), inset 0 .22em 0 rgba(255,255,255,.35), 0 .18em 0 rgba(0,0,0,.35); transition: transform .08s; }
.rb:active, .rb.press { transform: translateY(.12em) scale(.97); box-shadow: inset 0 -.15em 0 rgba(0,0,0,.25), 0 .05em 0 rgba(0,0,0,.35); }
.rb[disabled], .rb.off { filter: grayscale(.85) brightness(.85); cursor: default; }
.rb svg { width: 1.45em; height: 1.45em; flex: none; }
.c-green { background: linear-gradient(#7dff4d, #2fc72a 55%, #1fa31e); } .c-blue { background: linear-gradient(#63e3ff, #1ea7f2 55%, #1182d0); }
.c-red { background: linear-gradient(#ff6a5c, #e8261e 55%, #c01a14); } .c-orange { background: linear-gradient(#ffc069, #ff8a1f 55%, #e06a0a); }
.c-yellow { background: linear-gradient(#ffe45c, #ffbf1f 55%, #e89a0a); color: #fff; } .c-purple { background: linear-gradient(#e08cff, #a54dff 55%, #7a2ee0); }
.c-gray { background: linear-gradient(#c8ced6, #8f99a3 55%, #6b737b); } .c-pink { background: linear-gradient(#ffa0d8, #ff5fa2 55%, #e03c84); }
.c-dark { background: linear-gradient(#4a5568, #2d3748 55%, #1a202c); }
#hud-left { display: flex; flex-direction: column; gap: .5em; align-items: flex-start; }
#hud-left .rb { width: 8.8em; justify-content: flex-start; font-size: 1em; white-space: nowrap; padding-left: .55em; padding-right: .55em; }
#hud-right { display: flex; flex-direction: column; gap: .5em; align-items: flex-end; }
.sq { width: 3.3em; height: 3.3em; padding: 0; border-radius: .45em; }
.sq svg { width: 2.2em; height: 2.2em; }
#hud-stats { display: flex; flex-direction: column; justify-content: flex-end; gap: .1em; align-items: flex-start; }
.stat { display: flex; align-items: center; gap: .3em; font-weight: 900; white-space: nowrap; }
.stat svg { width: 1.9em; height: 1.9em; filter: drop-shadow(0 2px 0 rgba(0,0,0,.6)); }
#st-money { font-size: 1.85em; color: #4dff5a; } #st-money small { font-size: .62em; color: #a8ffb0; margin-left: .25em; }
#st-speed { font-size: 1.35em; } #st-gems { font-size: 1.2em; color: #f2b8ff; }
.plus { pointer-events: auto; cursor: pointer; width: 1.25em; height: 1.25em; border-radius: .35em; background: linear-gradient(#7dff4d, #1fa31e); color: #fff; border: .12em solid #0d0e12; display: inline-flex; align-items: center; justify-content: center; font-size: .8em; line-height: 1; margin-left: .35em; box-shadow: inset 0 -.15em 0 rgba(0,0,0,.25); }
#hud-bottom { display: flex; flex-direction: column; align-items: center; gap: .35em; }
#btn-auto { font-size: 1.35em; padding: .45em 1.1em; min-width: 8.6em; }
#btn-auto.on { background: linear-gradient(#7dff4d, #2fc72a 55%, #1fa31e); }
#hotbar { display: flex; gap: .3em; }
.slot { pointer-events: auto; cursor: pointer; width: 3em; height: 3em; border-radius: .3em; background: rgba(20,22,28,.62); border: .14em solid rgba(255,255,255,.18); position: relative; display: flex; align-items: center; justify-content: center; flex-direction: column; }
.slot.sel { border-color: #fff; background: rgba(60,70,90,.75); }
/* Playables: автоудар всегда включён — кнопки нет; хотбар компактнее, слот 3 (ноша) бросает питомца */
.pl-ui #btn-auto { display: none; } .pl-ui .slot { width: 2.8em; height: 2.8em; }
.slot .drop { display: none; position: absolute; right: -.4em; top: -.4em; width: 1.3em; height: 1.3em; border-radius: 50%; background: #e5383b; border: .1em solid #fff; align-items: center; justify-content: center; }
.pl-ui .slot .drop { display: flex; } .slot .drop svg { width: .85em; height: .85em; }
.slot b { position: absolute; left: .2em; top: .1em; font-size: .62em; }
.slot svg { width: 1.8em; height: 1.8em; } .slot span { font-size: .5em; font-weight: 800; text-align: center; line-height: 1; max-width: 5.2em; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
#hud-quest { display: flex; justify-content: center; }
#quest { background: linear-gradient(rgba(30,32,40,.72), rgba(30,32,40,.58)); border-radius: .35em; padding: .35em 1.2em; font-size: 1.25em; font-weight: 900; text-align: center; max-width: 100%; }
#hud-timer { display: flex; align-items: center; justify-content: flex-end; white-space: nowrap; gap: .25em; font-size: 1.05em; font-weight: 900; background: rgba(20,22,28,.5); padding: .3em .6em; border-radius: .4em; }
#hud-timer svg { width: 1.5em; height: 1.5em; }
#hud-menu { display: flex; gap: .35em; }
#hud-menu .rb { width: 2.6em; height: 2.6em; padding: 0; border-radius: 50%; }
#hud-menu .rb svg { width: 1.5em; height: 1.5em; }
#hud-boosts { display: flex; flex-direction: column; gap: .3em; align-items: flex-end; }
.boost { display: flex; align-items: center; gap: .3em; background: rgba(20,22,28,.6); border-radius: .45em; padding: .25em .5em; font-weight: 900; font-size: .95em; pointer-events: auto; cursor: pointer; border: .12em solid rgba(255,255,255,.2); }
.boost svg { width: 1.4em; height: 1.4em; } .boost.act { border-color: #ffd23a; background: rgba(90,70,10,.7); }
#jump-btn { pointer-events: auto; position: fixed; width: 4.6em; height: 4.6em; border-radius: 50%; background: rgba(255,255,255,.22); border: .2em solid rgba(255,255,255,.55); display: none; align-items: center; justify-content: center; font-size: calc(16px * var(--hl-k, 1)); }
#jump-btn svg { width: 2.4em; height: 2.4em; }
.hl-touch #jump-btn { display: flex; }
/* Метки мира */
#labels { position: fixed; inset: 0; pointer-events: none; overflow: hidden; z-index: 15; font-family: var(--ui-font); }
.lb { position: absolute; left: 0; top: 0; transform: translate(-50%, -100%); text-align: center; white-space: nowrap; font-weight: 900; color: #fff; will-change: transform; line-height: 1.05; }
.lb .nm { font-size: 15px; } .lb .rr { font-size: 14px; } .lb .inc { font-size: 17px; color: #5dff4a; }
.lb .hp { width: 120px; height: 14px; margin: 3px auto 0; background: rgba(0,0,0,.6); border: 2px solid #111; border-radius: 4px; position: relative; overflow: hidden; }
.lb .hp i { position: absolute; inset: 0; background: linear-gradient(#9dff6a, #33c21f); transform-origin: left center; }
.lb .hp em { position: absolute; inset: 0; font-style: normal; font-size: 10px; line-height: 10px; color: #fff; }
.lb .tm { font-size: 16px; color: #ff6a6a; } .lb .face { font-size: 34px; line-height: 1; } .lb .diff { font-size: 20px; }
.lb.name .nm { font-size: 13px; opacity: .95; } .lb.shop .nm { font-size: 18px; color: #4fd6ff; }
.lb.base .nm { font-size: 18px; } .lb.base svg { width: 34px; height: 34px; }
.lb .mut { font-size: 12px; color: #ffd23a; }
.lb.say { z-index: 3; }
.lb.say .bub { background: #fff; color: #1b1b1b; border: 3px solid #1b1b1b; border-radius: 14px; padding: 5px 12px; font-size: 15px; font-weight: 800; text-shadow: none; max-width: 230px; white-space: normal; line-height: 1.15; position: relative; animation: toastIn .2s ease-out; }
.lb.say .bub::after { content: ''; position: absolute; left: 50%; bottom: -12px; transform: translateX(-50%); border: 9px solid transparent; border-top-color: #1b1b1b; }
.rbw { background: linear-gradient(90deg, #ff3b3b, #ff8a1f, #ffe14a, #3bdc5a, #3b8bff, #a54dff, #ff3b3b); background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent !important; text-shadow: none !important;
  filter: drop-shadow(1.5px 0 0 #111) drop-shadow(-1.5px 0 0 #111) drop-shadow(0 1.5px 0 #111) drop-shadow(0 -1.5px 0 #111); animation: rbwMove 2.4s linear infinite; }
@keyframes rbwMove { from { background-position: 0% 0 } to { background-position: 200% 0 } }
/* Подсказка взаимодействия (как ProximityPrompt) */
#prompt { position: fixed; left: 0; top: 0; transform: translate(-50%, -50%); display: none; pointer-events: auto; z-index: 18; font-family: var(--ui-font); cursor: pointer; }
#prompt .pk { display: flex; align-items: center; gap: 8px; background: rgba(20,22,28,.78); border-radius: 10px; padding: 6px 12px 6px 6px; border: 2px solid rgba(255,255,255,.25); }
#prompt .key { width: 34px; height: 34px; border-radius: 8px; background: #fff; color: #111; font-weight: 900; font-size: 18px; display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
#prompt .key i { position: absolute; left: 0; bottom: 0; height: 100%; background: rgba(60,200,80,.55); width: 0; }
#prompt .t1 { font-size: 15px; font-weight: 900; color: #fff; } #prompt .t2 { font-size: 11px; font-weight: 700; color: #cfd6e0; }
/* Всплывающие */
#toasts { position: fixed; left: 50%; top: 17%; transform: translateX(-50%); width: min(90vw, 640px); display: flex; flex-direction: column; align-items: center; gap: 6px; z-index: 30; pointer-events: none; font-family: var(--ui-font); }
.toast { font-weight: 900; font-size: clamp(14px, 2.4vw, 21px); line-height: 1.15; text-align: center; max-width: 100%; animation: toastIn .25s ease-out, toastOut .4s ease-in forwards; animation-delay: 0s, var(--d, 2.2s); }
@keyframes toastIn { from { transform: scale(.4); opacity: 0 } to { transform: scale(1); opacity: 1 } }
@keyframes toastOut { to { transform: translateY(-14px); opacity: 0 } }
#big { position: fixed; left: 50%; top: 9%; transform: translateX(-50%); z-index: 29; pointer-events: none; font-family: var(--ui-font); }
#big .run { font-size: 56px; font-weight: 900; color: #fff; background: linear-gradient(#ff4a3d, #c8160c); border: 5px solid #fff; border-radius: 10px; padding: 0 22px; box-shadow: 0 0 0 4px #b00, 0 6px 0 rgba(0,0,0,.4); animation: pulse .5s infinite alternate; }
@keyframes pulse { from { transform: scale(1) } to { transform: scale(1.08) } }
.floater { position: fixed; z-index: 16; font-family: var(--ui-font); font-weight: 900; pointer-events: none; transform: translate(-50%, -50%); animation: floatUp 1.1s ease-out forwards; white-space: nowrap; }
@keyframes floatUp { 0% { opacity: 0; transform: translate(-50%, -30%) scale(.5) } 15% { opacity: 1; transform: translate(-50%, -60%) scale(1.15) } 100% { opacity: 0; transform: translate(-50%, -180%) scale(1) } }
.bubble { background: #fff; color: #111; border-radius: 14px; padding: 4px 12px; font-size: 22px; border: 3px solid #111; }
/* Окна */
#modal { position: fixed; inset: 0; display: none; align-items: center; justify-content: center; z-index: 40; background: rgba(0,0,0,.28); pointer-events: auto; font-family: var(--ui-font); color: #fff; }
#modal.open { display: flex; }
.win { width: min(92vw, 860px); max-height: 88vh; display: flex; flex-direction: column; background: #20232b; border: 5px solid #0d0e12; border-radius: 14px; box-shadow: 0 10px 0 rgba(0,0,0,.35); overflow: hidden; animation: winIn .2s ease-out; }
@keyframes winIn { from { transform: scale(.85); opacity: 0 } to { transform: scale(1); opacity: 1 } }
.win-h { display: flex; align-items: center; justify-content: space-between; padding: 8px 10px 8px 18px; background: repeating-linear-gradient(115deg, rgba(255,255,255,.12) 0 34px, rgba(255,255,255,0) 34px 68px), var(--wc, linear-gradient(#ffb03a, #ff7a10)); border-bottom: 5px solid #0d0e12; }
.win-h h2 { margin: 0; font-size: clamp(22px, 4.4vw, 40px); font-weight: 900; color: #fff; }
.win-x { width: 52px; height: 52px; font-size: 30px; padding: 0; }
.win-b { padding: 14px; overflow: auto; flex: 1; color: #fff; -webkit-overflow-scrolling: touch; }
.win-b::-webkit-scrollbar { height: 10px; width: 10px; } .win-b::-webkit-scrollbar-thumb { background: #555c6b; border-radius: 6px; }
.row { display: flex; gap: 12px; } .cards { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 6px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px; }
.card { background: linear-gradient(#5b5f6b, #3c3f48); border: 4px solid #121318; border-radius: 10px; padding: 8px; display: flex; flex-direction: column; align-items: center; gap: 6px; position: relative; color: #fff; font-weight: 900; }
.card.rare-epic { background: linear-gradient(#7a4aa8, #4a2a6a); } .card.rare-legendary { background: linear-gradient(#a84a4a, #6a2a2a); } .card.gold { background: linear-gradient(#c8a050, #7a5a20); }
.card .ttl { font-size: 18px; text-align: center; } .card .sub { font-size: 13px; color: #ffd23a; }
.card .acts { display: flex; flex-direction: column; gap: 6px; width: 100%; } .card .acts .rb { width: 100%; font-size: 15px; padding: .4em .5em; }
.grid.pets { grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); }
.card .buff { display: flex; align-items: center; gap: .3em; font-size: 14px; color: #ffe27a; } .card .buff img.ic, .card .buff svg { width: 1.4em; height: 1.4em; }
.card.eq { border-color: #ffd23a; box-shadow: 0 0 0 3px #ffd23a inset; padding-top: 26px; } .card .tag { position: absolute; left: 50%; transform: translateX(-50%); top: 6px; white-space: nowrap; font-size: 11px; padding: 2px 6px; border-radius: 6px; background: #ffd23a; color: #3a2a00; text-shadow: none; }
.pill.bf { display: inline-flex; align-items: center; gap: .3em; color: #ffe27a; } .pill.bf img.ic, .pill.bf svg { width: 1.3em; height: 1.3em; }
.card img, .card canvas { width: 120px; height: 120px; object-fit: contain; }
.pill { background: rgba(0,0,0,.35); border: 3px solid #121318; border-radius: 8px; padding: 4px 10px; font-weight: 900; font-size: 18px; text-align: center; }
.tabs { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; } .tabs .rb { font-size: 15px; padding: 6px 12px; } .tabs .rb.sel { outline: 3px solid #fff; }
.note { color: #cfd6e0; font-weight: 700; font-size: 14px; }
.menu-screen { color: #fff; position: fixed; inset: 0; z-index: 35; display: none; flex-direction: column; align-items: center; justify-content: center; gap: 2.2vh; pointer-events: auto; font-family: var(--ui-font);
   background: radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(0,20,60,.45) 100%); }
.menu-screen.open { display: flex; }
.logo { font-weight: 900; text-align: center; line-height: .92; transform: rotate(-3deg); }
.logo .l1 { font-size: clamp(26px, 6vw, 58px); color: #fff; } .logo .l2 { font-size: clamp(40px, 10vw, 104px); color: #ffd23a; letter-spacing: .02em; }
.logo .l3 { font-size: clamp(28px, 7vw, 74px); color: #6fe3ff; }
.menu-btns { display: flex; flex-direction: column; gap: 1.4vh; align-items: center; }
.menu-btns .rb { font-size: clamp(18px, 3vw, 26px); min-width: 11em; padding: .5em 1em; }
.menu-btns .play { font-size: clamp(26px, 5vw, 44px); min-width: 7em; }
.menu-row { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
.menu-row .rb { min-width: 0; font-size: clamp(15px, 2.4vw, 21px); }
.lb-list { display: flex; flex-direction: column; gap: 6px; } .lb-row { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,.07); border-radius: 8px; padding: 6px 10px; font-weight: 800; }
.lb-row.me { background: rgba(255,210,58,.25); } .lb-row img { width: 34px; height: 34px; border-radius: 50%; } .lb-row .v { margin-left: auto; color: #5dff4a; }
.set-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px 12px; padding: 10px; background: rgba(255,255,255,.06); border-radius: 10px; margin-bottom: 8px; font-weight: 800; font-size: 18px; }
.set-row .rb { font-size: 16px; padding: .4em .75em; }
.set-opts { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; }
.prog { height: 12px; background: rgba(0,0,0,.4); border-radius: 6px; overflow: hidden; } .prog i { display: block; height: 100%; background: linear-gradient(90deg, #ffd23a, #ff8a1f); }
@media (max-height: 520px) and (orientation: landscape) { .menu-screen { flex-direction: row; gap: 4vw; } .logo .l1 { font-size: 7vh; } .logo .l2 { font-size: 15vh; } .logo .l3 { font-size: 10vh; } .menu-btns { gap: 1.6vh; } .menu-btns .play { font-size: 8vh; } .menu-row .rb { font-size: 4.2vh; } .menu-btns .rb { min-width: 0; } }
@media (max-height: 460px) { .win { max-height: 96vh; } .win-h { padding: 4px 8px 4px 14px; } .win-x { width: 40px; height: 40px; font-size: 22px; } .card img, .card canvas { width: 84px; height: 84px; } .card .ttl { font-size: 14px; } }
`;

/** @satisfies {Record<string, any>} */
const UI = {
    /** @type {HTMLElement | null} */
    root: null,
    _els: {},
    _modalStack: [],
    open: '',
    autoOn: false,

    el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return /** @type {HTMLElement} */ (d.firstElementChild); },
    $(sel) { return /** @type {HTMLElement} */ (document.querySelector(sel)); },
    esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]); },
    // Подпись редкости: цвет редкости, «Секретный» — радужный перелив.
    rar(r, text, cls, style) {
        const c = GameData.RARITY[r] ? GameData.RARITY[r].color : '#fff';
        return r === 'secret' ? `<span class="rbw ${cls || ''}" style="${style || ''}">${this.esc(text)}</span>` : `<span class="${cls || ''}" style="color:${c};${style || ''}">${this.esc(text)}</span>`;
    },
    clip(s, n) { s = String(s); return s.length > n ? s.slice(0, n - 1) + '…' : s; },
    mmss(sec) { sec = Math.max(0, Math.ceil(sec)); return Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); },
    clock(sec) {
        sec = Math.max(0, Math.floor(sec));
        const h = Math.floor(sec / 3600), m = Math.floor(sec / 60) % 60, s = sec % 60;
        return h ? h + Lang.t('t.h') + ' ' + m + Lang.t('t.m') : m + Lang.t('t.m') + ' ' + String(s).padStart(2, '0') + Lang.t('t.s');
    },

    init() {
        const st = document.createElement('style'); st.textContent = UI_CSS; document.head.appendChild(st);
        if (Game.playablesUi()) document.documentElement.classList.add('pl-ui');
        const root = this.el('<div id="ui"></div>');
        document.body.appendChild(root);
        this.root = root;
        const lab = this.el('<div id="labels"></div>'); document.body.appendChild(lab);
        this.labels.root = lab;
        document.body.appendChild(this.el('<div id="toasts"></div>'));
        document.body.appendChild(this.el('<div id="big"></div>'));
        document.body.appendChild(this.el('<div id="prompt"><div class="pk"><div class="key"><i></i><span>E</span></div><div><div class="t1"></div><div class="t2"></div></div></div></div>'));
        document.body.appendChild(this.el('<div id="modal"></div>'));
        // HUD-блоки (раскладка — HudLayout).
        root.insertAdjacentHTML('beforeend', `
<div id="hud-menu" class="hl-blk"><button class="rb c-dark" id="b-menu">${UI_ICONS.menu}</button><button class="rb c-dark" id="b-set">${UI_ICONS.gear}</button></div>
<div id="hud-quest" class="hl-blk"><div id="quest" class="ui-o"></div></div>
<div id="hud-boosts" class="hl-blk"></div>
<div id="hud-left" class="hl-blk">
  <button class="rb c-green ui-o" id="b-shop">${UI_ICONS.cart}<span data-t="hud.shop"></span></button>
  <button class="rb c-blue ui-o" id="b-index">${UI_ICONS.book}<span data-t="hud.index"></span></button>
  <button class="rb c-pink ui-o" id="b-daily">${UI_ICONS.gift}<span data-t="hud.daily"></span></button>
  <button class="rb c-yellow ui-o" id="b-wheel">${UI_ICONS.wheel}<span data-t="hud.wheel"></span></button>
</div>
<div id="hud-right" class="hl-blk">
  <button class="rb c-red sq" id="b-eggs">${UI_ICONS.egg}</button>
  <button class="rb c-orange sq" id="b-pets">${UI_ICONS.paw}</button>
  <button class="rb c-purple sq" id="b-lb">${UI_ICONS.trophy}</button>
  <button class="rb c-yellow sq" id="b-super">${UI_ICONS.chest}<b class="badge">0/5</b></button>
</div>
<div id="hud-offer"></div>
<div id="hud-stats" class="hl-blk">
  <div class="stat ui-o" id="st-gems">${UI_ICONS.gem}<span></span><b class="plus" id="b-gemsplus">+</b></div>
  <div class="stat ui-o" id="st-speed">${UI_ICONS.shoe}<span></span><b class="plus" id="b-speedplus">+</b></div>
  <div class="stat ui-o" id="st-money">${UI_ICONS.cash}<span></span><small></small></div>
</div>
<div id="hud-bottom" class="hl-blk">
  <button class="rb c-red ui-o" id="btn-auto">${UI_ICONS.pick}<span data-t="hud.auto"></span></button>
  <div id="hotbar">
    <div class="slot ui-o1" data-k="1"><b>1</b>${UI_ICONS.pick}<span id="hb-pick"></span></div>
    <div class="slot ui-o1" data-k="2"><b>2</b>${UI_ICONS.bat}<span data-t="hud.bat"></span></div>
    <div class="slot ui-o1" data-k="3" id="hb-3" style="display:none"><b>3</b>${UI_ICONS.paw}<span id="hb-pet"></span><i class="drop">${UI_ICONS.trash}</i></div>
  </div>
</div>
<div id="hud-timer" class="hl-blk ui-o">${UI_ICONS.trident}<span></span></div>
<button id="jump-btn">${UI_ICONS.jump}</button>`);
        Lang.apply(root);
        HudLayout.block('menu', { dock: 'tl', w: 96, h: 44, el: '#hud-menu', order: 0 });
        HudLayout.block('quest', { dock: 'tc', w: 420, h: 44, el: '#hud-quest', fill: true, maxW: 560 });
        HudLayout.block('boosts', { dock: 'tr', w: 130, h: 80, el: '#hud-boosts' });
        HudLayout.block('left', { dock: 'ml', w: 146, h: 232, el: '#hud-left' });
        HudLayout.block('right', { dock: 'mr', w: 60, h: 246, el: '#hud-right' });
        HudLayout.block('stats', { dock: 'bl', w: 210, h: 140, el: '#hud-stats' });
        // Playables: внизу только хотбар (кнопки «Автоудар» нет) — по факту размера, встаёт у края между стиком и кнопкой.
        HudLayout.block('bottom', Game.playablesUi() ? { dock: 'bc', w: 'auto', h: 'auto', el: '#hud-bottom' } : { dock: 'bc', w: 300, h: 112, el: '#hud-bottom' });
        HudLayout.block('timer', { dock: 'br', w: 200, h: 40, el: '#hud-timer' });
        HudLayout.block('jump', { dock: 'br', w: 80, h: 80, el: '#jump-btn', touchOnly: true, order: 1, min: 64 });
        this._bind();
        this.labels.init();
    },

    _bind() {
        const on = (id, fn) => { const e = document.getElementById(id); if (e) e.addEventListener('pointerdown', (ev) => { ev.stopPropagation(); ev.preventDefault(); Sfx.play('click', 0.5); fn(ev); }); };
        on('b-shop', () => Game.openWithAd(() => Shops.openShop()));
        on('b-index', () => Game.openWithAd(() => this.openIndex()));
        on('b-daily', () => Game.openWithAd(() => Shops.openDaily()));
        on('b-wheel', () => Game.openWithAd(() => Shops.openWheel()));
        on('b-eggs', () => Game.openWithAd(() => this.openEggs()));
        on('b-pets', () => Game.openWithAd(() => this.openPets()));
        on('b-lb', () => Game.openWithAd(() => this.openLeaderboard()));
        on('b-menu', () => Game.openWithAd(() => this.openPause()));
        on('b-set', () => this.openSettings());
        on('b-speedplus', () => this.openBoosts());
        on('b-gemsplus', () => Game.openWithAd(() => this.openConverter()));
        on('b-super', () => Game.openWithAd(() => this.openSuper()));
        on('hud-timer', () => Game.openWithAd(() => this.openEggs()));
        on('btn-auto', () => Game.toggleAuto());
        for (const s of /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('#hotbar .slot'))) {
            s.addEventListener('pointerdown', (ev) => { ev.stopPropagation(); ev.preventDefault(); Game.selectSlot(Number(s.dataset.k)); });
        }
        const jb = document.getElementById('jump-btn');
        jb.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); Input.setVirtual('jump', true); });
        const up = () => Input.setVirtual('jump', false);
        jb.addEventListener('pointerup', up); jb.addEventListener('pointercancel', up); jb.addEventListener('pointerleave', up);
        const pr = document.getElementById('prompt');
        pr.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); Game.promptPress(true); });
        pr.addEventListener('pointerup', () => Game.promptPress(false));
        pr.addEventListener('pointercancel', () => Game.promptPress(false));
        document.getElementById('modal').addEventListener('pointerdown', (e) => { if (e.target === e.currentTarget) this.closeWindow(); });
        window.addEventListener('keydown', (e) => { if (e.code === 'Escape' && this.open) { this.closeWindow(); e.preventDefault(); } });
    },

    // --- HUD ---
    _last: {},
    setText(id, v) { if (this._last[id] === v) return; this._last[id] = v; const e = document.querySelector(id); if (e) e.textContent = v; },
    update(dt) {
        const g = Game, s = g.save;
        if (!s) return;
        this.setText('#st-money span', GameData.money(s.money));
        this.setText('#st-money small', '+' + GameData.money(g.incomeNow()));
        this.setText('#st-speed span', String(Math.floor(g.player ? g.player.speedStat : s.speed)));
        this.setText('#st-gems span', GameData.fmt(Shops.gems()));
        this.setText('#hud-timer span', World.titanic ? Lang.t('titanic.now') : Lang.t('titanic.short', { t: this.mmss(World.titanicTimer) }));
        this.setText('#hb-pick', Lang.t('pick.' + GameData.pickaxe(s.pick).id));
        const carrying = g.player && g.player.carry;
        const hb3 = document.getElementById('hb-3');
        if (hb3) { hb3.style.display = carrying ? '' : 'none'; if (carrying) this.setText('#hb-pet', Lang.t('pet.' + carrying.pet.sp) + ' (' + carrying.pet.kg + Lang.t('kg') + ')'); }
        const auto = document.getElementById('btn-auto');
        if (auto) {
            const mode = carrying ? 'drop' : (g.autoSwing ? 'on' : 'off');
            if (this._autoMode !== mode) {
                this._autoMode = mode;
                auto.classList.toggle('on', mode === 'on');
                auto.innerHTML = (mode === 'drop' ? UI_ICONS.trash : UI_ICONS.pick) + '<span>' + Lang.t(mode === 'drop' ? 'hud.drop' : 'hud.auto') + '</span>';
            }
        }
        const sel = g.player ? (g.player.carry ? 3 : g.player.tool === 'bat' ? 2 : 1) : 1;
        for (const sl of /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('#hotbar .slot'))) sl.classList.toggle('sel', Number(sl.dataset.k) === sel);
        this.setText('#quest', g.questText());
        const st = s.superAd;
        if (st) {
            this.setText('#b-super .badge', st.views + '/' + g.SUPER_VIEWS);
            const ready = st.views >= g.SUPER_VIEWS || (Platform.rewardedSupported() && g.adCooldown('super') <= 0 && st.views > 0);
            const bs = document.getElementById('b-super');
            if (bs && bs.classList.contains('ready') !== ready) bs.classList.toggle('ready', ready);
        }
        const qv = !Tutorial.active;
        if (this._questVis !== qv) { this._questVis = qv; document.getElementById('hud-quest').style.visibility = qv ? '' : 'hidden'; }
        this.updateBoosts();
        this.updateOffers();
        this.labels.update();
        this.updatePrompt();
    },

    updateBoosts() {
        const s = Game.save, now = Date.now();
        const items = [
            ['money', UI_ICONS.boostcash, 'boost.money'],
            ['luck', UI_ICONS.luck, 'boost.luck'],
            ['speed', UI_ICONS.bolt, 'boost.speed'],
        ];
        const gift = Game.giftOffer;
        const key = items.map(([k]) => Math.max(0, Math.ceil(((s.boosts[k] || 0) - now) / 1000))).join(',') + (Platform.rewardedSupported() ? 1 : 0) + (gift ? 'g' + Math.ceil((gift.until - now) / 1000) : '');
        if (this._boostKey === key) return;
        this._boostKey = key;
        const box = document.getElementById('hud-boosts');
        box.innerHTML = '';
        if (gift) {
            const g = this.el(`<div class="boost gift ui-o1">${UI_ICONS.gift}<span>+${GameData.money(gift.amount)} · ${this.esc(Lang.t('ad.short'))}</span></div>`);
            g.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); Game.claimGift(); });
            box.appendChild(g);
        }
        for (const [k, icon, label] of items) {
            const left = Math.max(0, Math.ceil(((s.boosts[k] || 0) - now) / 1000));
            if (!left && !Platform.rewardedSupported()) continue;
            const b = this.el(`<div class="boost ui-o1 ${left ? 'act' : ''}">${icon}<span>${left ? 'x2 ' + this.clock(left) : Lang.t(label)}</span></div>`);
            b.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); if (!left) this.openBoosts(); });
            box.appendChild(b);
        }
    },

    // --- Подсказка взаимодействия ---
    prompt: null,
    updatePrompt() {
        const el = document.getElementById('prompt');
        const p = this.prompt;
        if (!p || this.open || Game.state !== 'play') { el.style.display = 'none'; return; }
        const v = World.app.location.view.projectToScreen(p.x, p.y, p.h || 120);
        if (!v.visible) { el.style.display = 'none'; return; }
        el.style.display = 'block';
        el.style.transform = `translate(${v.x}px, ${v.y}px) translate(-50%, -50%)`;
        const key = Input.device === 'touch' ? '👆' : (Input.labelOf('interact') || 'E');
        const sig = p.t1 + '|' + p.t2 + '|' + key;
        if (this._promptSig !== sig) {
            this._promptSig = sig;
            el.querySelector('.t1').textContent = p.t1;
            el.querySelector('.t2').textContent = p.t2 || '';
            el.querySelector('.key span').textContent = key;
        }
        /** @type {HTMLElement} */ (el.querySelector('.key i')).style.width = Math.round((p.progress || 0) * 100) + '%';
    },

    // --- Всплывающие ---
    toast(text, color, dur) {
        const box = document.getElementById('toasts');
        if (this._lastToast === text && Date.now() - (this._lastToastAt || 0) < 1500) return;   // без повторов подряд
        this._lastToast = text; this._lastToastAt = Date.now();
        const t = this.el(`<div class="toast ui-o" style="color:${color || '#fff'};--d:${dur || 2.2}s">${this.esc(text)}</div>`);
        box.appendChild(t);
        while (box.children.length > 3) box.firstElementChild.remove();
        setTimeout(() => t.remove(), ((dur || 2.2) + 0.5) * 1000);
    },
    bigRun(on) {
        const b = document.getElementById('big');
        const want = on ? 'run' : '';
        if (b.dataset.s === want) return;
        b.dataset.s = want;
        b.innerHTML = on ? `<div class="run ui-o">${this.esc(Lang.t('hud.run'))}</div>` : '';
    },
    // Всплывашка над точкой мира.
    floater(x, y, h, html, cls, color, size) {
        const v = World.app.location.view.projectToScreen(x, y, h);
        if (!v.visible) return;
        const inner = color === 'rainbow' ? `<span class="rbw">${html}</span>` : html;
        const f = this.el(`<div class="floater ${cls || 'ui-o'}" style="left:${v.x}px;top:${v.y}px;color:${color === 'rainbow' ? '#fff' : (color || '#fff')};font-size:${size || 24}px">${inner}</div>`);
        document.body.appendChild(f);
        setTimeout(() => f.remove(), 1200);
    },

    // --- Метки над объектами мира ---
    labels: {
        root: null,
        /** @type {any[]} */
        list: [],
        init() {},
        add(o) {
            const el = document.createElement('div');
            el.className = 'lb ui-o1 ' + (o.kind || '');
            el.style.display = 'none';
            this.root.appendChild(el);
            const rec = Object.assign({ el, sig: '', vis: false }, o);
            this.list.push(rec);
            return rec;
        },
        remove(rec) {
            if (!rec) return;
            const i = this.list.indexOf(rec);
            if (i >= 0) this.list.splice(i, 1);
            rec.el.remove();
        },
        update() {
            const app = World.app, view = app.location.view, cam = app.camera;
            const tx = cam.target.x, ty = cam.target.y;
            for (const r of this.list) {
                let x = r.x, y = r.y, h = r.h || 100, max = 1800;
                if (r.actor) { x = r.actor.x; y = r.actor.y; h = (r.actor.gh || 0) + r.actor.h + (r.actor.carry ? 330 : 236); max = 1600; }
                else if (r.guard) { x = r.guard.x; y = r.guard.y; max = 3200; }
                else if (r.npc) { if (!(r.npc.sayT > 0)) { if (r.vis) { r.el.style.display = 'none'; r.vis = false; } continue; } max = 1400; }
                else if (r.view) { x = r.view.x; y = r.view.y; h = r.view.h + r.view.height + 30; max = 1300; }
                else if (r.egg) { max = r.egg.titanic ? 4000 : 1150; }
                else if (r.kind === 'shop' || r.kind === 'base') max = 3600;
                const d = Math.hypot(x - tx, y - ty);
                let show = d < max && !UI.open;
                let v = null;
                if (show) { v = view.projectToScreen(x, y, h); show = v.visible; }
                if (!show) { if (r.vis) { r.el.style.display = 'none'; r.vis = false; } continue; }
                if (!r.vis) { r.el.style.display = ''; r.vis = true; }
                const screenK = Math.max(0.62, Math.min(1, Math.min(window.innerWidth, window.innerHeight) / 680));
                const sc = screenK * Math.max(0.55, Math.min(r.kind === 'shop' || r.kind === 'base' ? 1 : 1.2, 900 / Math.max(300, d)));
                r.el.style.transform = `translate(${v.x}px, ${v.y}px) translate(-50%, -100%) scale(${sc.toFixed(2)})`;
                this.render(r);
            }
        },
        render(r) {
            let sig = '', html = '';
            if (r.kind === 'egg') {
                const e = r.egg, rarity = GameData.zoneOf(e.type.zone || 0);
                const hurt = e.hp < e.max;
                const hp = hurt ? Math.max(0, e.hp) : e.max;
                sig = e.type.id + '|' + (hurt ? Math.ceil(hp) : '');
                if (sig === r.sig) return;
                const er = GameData.eggRarity(e.type);
                html = `<div class="nm">${UI.esc(Lang.t('egg.' + e.type.id))}</div><div class="rr">${UI.rar(er, Lang.t('rar.' + er))}</div>` +
                    (hurt ? `<div class="hp"><i style="transform:scaleX(${(hp / e.max).toFixed(3)})"></i><em>${GameData.fmt(hp)}/${GameData.fmt(e.max)} HP</em></div>` : '');
            } else if (r.kind === 'pet' || r.kind === 'dropped') {
                const p = r.pet, rc = GameData.RARITY[p.r].color;
                const t = r.drop ? Math.ceil(r.drop.t) : 0;
                sig = p.uid + '|' + p.mut + '|' + t;
                if (sig === r.sig) return;
                html = (r.drop ? `<div class="tm">⏱ ${t}${Lang.t('t.s')}</div>` : '') +
                    `<div class="inc">${GameData.money(GameData.incomeOf(p))}/${Lang.t('t.s')}</div>` +
                    (p.mut !== 'normal' ? `<div class="mut">${UI.esc(Lang.t('mut.' + p.mut))}</div>` : '') +
                    `<div class="rr">${UI.rar(p.r, Lang.t('rar.' + p.r))}</div>`;
            } else if (r.kind === 'name') {
                const a = r.actor;
                sig = a.name + (a.carry ? '|c' : '') + (a.isPlayer ? '|p' : '');
                if (sig === r.sig) return;
                html = `<div class="nm">${UI.esc(a.name)}</div>`;
            } else if (r.kind === 'guard') {
                const z = GameData.zoneOf(r.guard.zone);
                sig = 'g' + r.guard.zone;
                if (sig === r.sig) return;
                html = `<div class="face">${z.face}</div><div class="diff ui-o" style="color:${z.color}">${UI.esc(Lang.t('zone.' + z.id))}</div>`;
            } else if (r.kind === 'say') {
                sig = r.npc.text;
                if (sig === r.sig) return;
                html = `<div class="bub">${UI.esc(r.npc.text)}</div>`;
            } else if (r.kind === 'shop') {
                sig = r.text;
                if (sig === r.sig) return;
                html = `<div class="nm ui-o" style="color:${r.color || '#4fd6ff'}">${UI.esc(r.text)}</div>`;
            } else if (r.kind === 'base') {
                const b = r.base;
                sig = (b.owner ? b.owner.name : '') + '|' + (b.owner && b.owner.isPlayer ? 1 : 0);
                if (sig === r.sig) return;
                html = b.owner && b.owner.isPlayer ? `${UI_ICONS.house}<div class="nm ui-o">${UI.esc(Lang.t('hud.yourBase'))}</div>` : `<div class="nm ui-o" style="color:#ffe14a">${UI.esc(b.owner ? Lang.t('hud.baseOf', { n: b.owner.name }) : '')}</div>`;
            }
            r.sig = sig;
            r.el.innerHTML = html;
        },
    },

    // --- Окна ---
    window(opts) {
        const m = document.getElementById('modal');
        const w = this.el(`<div class="win" style="${opts.width ? 'width:min(94vw,' + opts.width + 'px)' : ''}">
            <div class="win-h" style="--wc:${opts.color || 'linear-gradient(#ffb03a,#ff7a10)'}"><h2 class="ui-o">${this.esc(opts.title)}</h2><button class="rb c-red win-x ui-o">X</button></div>
            <div class="win-b"></div></div>`);
        m.innerHTML = '';
        m.appendChild(w);
        m.classList.add('open');
        this.open = opts.id || 'win';
        w.querySelector('.win-x').addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); Sfx.play('close', 0.5); this.closeWindow(); });
        Sfx.play('open', 0.45);
        Game.onWindow(true);
        this._onClose = opts.onClose || null;
        return /** @type {HTMLElement} */ (w.querySelector('.win-b'));
    },
    closeWindow() {
        const m = document.getElementById('modal');
        if (!this.open) return;
        m.classList.remove('open');
        m.innerHTML = '';
        const was = this.open;
        this.open = '';
        const cb = this._onClose; this._onClose = null;
        if (cb) cb();
        Game.onWindow(false, was);
    },
    btn(html, cls, fn) {
        const b = this.el(`<button class="rb ${cls || 'c-green'} ui-o">${html}</button>`);
        b.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); if (b.hasAttribute('disabled')) { Sfx.play('error', 0.4); return; } Sfx.play('click', 0.5); fn(e, b); });
        return b;
    },

    // Превью питомца (рендер модели в картинку, кэш по виду и мутации).
    petIcon(sp, mut) { return Thumbs.get('pet', sp, mut || 'normal'); },

    // --- Магазин кирок (как в видео: карточки в ряд) ---
    openPickaxes() {
        const b = this.window({ id: 'pickaxes', title: Lang.t('win.pickaxes'), color: 'linear-gradient(#ffb03a,#ff7a10)', width: 920 });
        const render = () => {
            b.innerHTML = '';
            const row = this.el('<div class="cards"></div>');
            const s = Game.save;
            GameData.PICKAXES.forEach((px, i) => {
                const owned = i <= s.pick;
                const next = i === s.pick + 1;
                const c = this.el(`<div class="card ${i >= 8 ? 'rare-epic' : ''} ${i >= 11 ? 'gold' : ''}" style="min-width:190px">
                    <div class="ttl ui-o">${this.esc(Lang.t('pick.' + px.id))}</div>
                    <div class="pkimg"></div>
                    <div class="pill ui-o"><span style="color:#47c8ff">${GameData.fmt(px.power)}</span> ${this.esc(Lang.t('win.power'))}</div></div>`);
                const img = Thumbs.get('pick', i);
                if (img) c.querySelector('.pkimg').appendChild(img);
                if (owned) c.appendChild(this.el(`<div class="pill ui-o" style="color:#7dff6a">${this.esc(i === s.pick ? Lang.t('win.equipped') : Lang.t('win.owned'))}</div>`));
                else {
                    const can = next && s.money >= px.price;
                    const bt = this.btn(GameData.money(px.price), can ? 'c-green' : 'c-gray', () => { if (Game.buyPickaxe(i)) render(); });
                    if (!next) { bt.setAttribute('disabled', ''); bt.innerHTML = UI_ICONS.lock + GameData.money(px.price); }
                    else if (!can) bt.classList.add('off');
                    c.appendChild(bt);
                }
                row.appendChild(c);
            });
            b.appendChild(row);
            b.appendChild(this.el(`<div class="note" style="margin-top:8px">${this.esc(Lang.t('win.pickNote'))}</div>`));
            const cur = /** @type {HTMLElement} */ (row.children[Math.min(row.children.length - 1, s.pick + 1)]);
            if (cur) setTimeout(() => cur.scrollIntoView({ inline: 'center', block: 'nearest' }), 30);
        };
        render();
    },

    // --- Питомцы (инвентарь): места в загоне, хранилище, продажа ---
    openPets() {
        const b = this.window({ id: 'pets', title: Lang.t('win.pets'), color: 'linear-gradient(#ffc069,#ff8a1f)', width: 900 });
        const render = () => {
            b.innerHTML = '';
            const s = Game.save, base = Game.player.base;
            const head = this.el('<div class="row" style="align-items:center;flex-wrap:wrap;margin-bottom:10px"></div>');
            head.appendChild(this.el(`<div class="pill ui-o">${this.esc(Lang.t('win.active', { n: base.pets().length, m: base.slotCount }))}</div>`));
            head.appendChild(this.el(`<div class="pill ui-o" style="color:#5dff4a">${GameData.money(base.income())}/${Lang.t('t.s')}</div>`));
            head.appendChild(this.btn(Lang.t('win.equipBest'), 'c-green', () => { Game.equipBest(); render(); }));
            b.appendChild(head);
            // С собой: до FOLLOW_MAX питомцев идут следом и дают бонусы.
            const fol = this.el('<div class="row" style="align-items:center;flex-wrap:wrap;margin-bottom:6px"></div>');
            fol.appendChild(this.el(`<div class="pill ui-o" style="color:#ffd23a">${this.esc(Lang.t('pets.following', { n: Game.followCount(), m: GameData.FOLLOW_MAX }))}</div>`));
            const bf = Game.buffs();
            for (const k of ['power', 'speed', 'cash', 'luck']) if (bf[k] > 0) fol.appendChild(this.el(`<div class="pill bf ui-o">${this.buffIcon(k)}+${Math.round(bf[k] * 100)}%</div>`));
            fol.appendChild(this.btn(Lang.t('pets.followBest'), 'c-yellow', () => { Game.followBest(); render(); }));
            b.appendChild(fol);
            b.appendChild(this.el(`<div class="note" style="margin:0 0 10px">${this.esc(Lang.t('pets.note'))}</div>`));
            const grid = this.el('<div class="grid pets"></div>');
            const pets = s.pets.slice().sort((u, v) => (v.eq ? 1 : 0) - (u.eq ? 1 : 0) || GameData.incomeOf(v) - GameData.incomeOf(u));
            if (!pets.length) b.appendChild(this.el(`<div class="note">${this.esc(Lang.t('win.noPets'))}</div>`));
            for (const p of pets) {
                const placed = p.slot >= 0;
                const bu = GameData.petBuff(p);
                const c = this.el(`<div class="card ${p.r === 'epic' ? 'rare-epic' : ''} ${p.r === 'legendary' || p.r === 'mythic' ? 'rare-legendary' : ''} ${p.mut !== 'normal' ? 'gold' : ''} ${p.eq ? 'eq' : ''}">
                    ${p.eq ? `<div class="tag">${this.esc(Lang.t('pets.withYou'))}</div>` : ''}
                    <div class="ttl ui-o">${this.esc(Lang.t('pet.' + p.sp))}</div><div class="ic"></div>
                    <div class="sub ui-o1">${this.rar(p.r, Lang.t('rar.' + p.r))}${p.mut !== 'normal' ? ' · ' + this.esc(Lang.t('mut.' + p.mut)) : ''}</div>
                    <div class="ui-o1" style="color:#5dff4a">${GameData.money(GameData.incomeOf(p))}/${Lang.t('t.s')} · ${p.kg}${Lang.t('kg')}</div>
                    <div class="buff ui-o1">${this.buffIcon(bu.type)}${this.esc(Lang.t('buff.' + bu.type))} +${Math.round(bu.v * 100)}%</div></div>`);
                const ic = this.petIcon(p.sp, p.mut); if (ic) c.querySelector('.ic').appendChild(ic);
                const r = this.el('<div class="acts"></div>');
                r.appendChild(this.btn(placed ? Lang.t('win.unequip') : Lang.t('win.equip'), placed ? 'c-red' : 'c-blue', () => { Game.togglePet(p.uid); render(); }));
                r.appendChild(this.btn(p.eq ? Lang.t('pets.unfollow') : Lang.t('pets.follow'), p.eq ? 'c-red' : 'c-yellow', () => { Game.toggleFollow(p.uid); render(); }));
                r.appendChild(this.btn(Lang.t('win.sell') + ' ' + GameData.money(GameData.incomeOf(p) * GameData.SELL_SECONDS), 'c-gray', () => { Game.sellPet(p.uid); render(); }));
                c.appendChild(r);
                grid.appendChild(c);
            }
            b.appendChild(grid);
        };
        render();
    },

    buffIcon(type) { return type === 'speed' ? UI_ICONS.shoe : type === 'cash' ? UI_ICONS.cash : type === 'luck' ? UI_ICONS.luck : UI_ICONS.pick; },

    // --- Индекс питомцев по яйцам ---
    openIndex() {
        const b = this.window({ id: 'index', title: Lang.t('win.index'), color: 'linear-gradient(#63e3ff,#1182d0)', width: 900 });
        const s = Game.save;
        const total = Object.keys(GameData.PETS).length, have = Object.keys(s.index).length;
        b.appendChild(this.el(`<div class="pill ui-o" style="margin-bottom:10px">${this.esc(Lang.t('win.found', { n: have, m: total }))}</div>`));
        const eggs = GameData.EGGS.concat([/** @type {any} */ (GameData.TITANIC)]);
        for (const e of eggs) {
            const z = e.id === 'titanic' ? null : GameData.zoneOf(e.zone);
            b.appendChild(this.el(`<div class="ui-o" style="font-size:18px;margin:10px 0 6px;color:${z ? z.color : '#ffd23a'}">${this.esc(Lang.t('egg.' + e.id))} · ${this.esc(z ? Lang.t('zone.' + z.id) : Lang.t('titanic.name'))}</div>`));
            const g = this.el('<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(120px,1fr))"></div>');
            const sum = e.rolls.reduce((a, r) => a + r.w, 0);
            for (const r of e.rolls) {
                const known = !!s.index[r.pet];
                const c = this.el(`<div class="card" style="padding:6px"><div class="ic" style="${known ? '' : 'filter:brightness(0) opacity(.55)'}"></div>
                    <div class="ui-o1" style="font-size:14px">${known ? this.esc(Lang.t('pet.' + r.pet)) : '???'}</div>
                    <div class="ui-o1" style="font-size:12px">${this.rar(r.r, Lang.t('rar.' + r.r) + ' · ' + (r.w / sum * 100).toFixed(r.w / sum < 0.01 ? 1 : 0) + '%')}</div></div>`);
                const ic = this.petIcon(r.pet, 'normal'); if (ic) c.querySelector('.ic').appendChild(ic);
                g.appendChild(c);
            }
            b.appendChild(g);
        }
    },

    // --- Яйца и зоны: шансы, HP, страж ---
    openEggs() {
        const b = this.window({ id: 'eggs', title: Lang.t('win.eggs'), color: 'linear-gradient(#ff6a5c,#c01a14)', width: 900 });
        const power = GameData.pickaxe(Game.save.pick).power;
        b.appendChild(this.el(`<div class="note" style="margin-bottom:8px">${this.esc(Lang.t('win.eggsNote', { p: GameData.fmt(power), s: Math.floor(Game.player.speedStat) }))}</div>`));
        GameData.ZONES.forEach((z, i) => {
            const row = this.el(`<div class="set-row" style="flex-wrap:wrap"><div style="min-width:160px"><span style="font-size:26px">${z.face}</span> <span class="ui-o" style="color:${z.color}">${this.esc(Lang.t('zone.' + z.id))}</span><div class="note">${this.esc(Lang.t('win.guardSpeed', { n: z.guard }))}</div></div></div>`);
            for (const e of GameData.eggsOfZone(i)) {
                const hits = Math.ceil(e.hp / power);
                row.appendChild(this.el(`<div class="pill" style="font-size:14px"><div class="ui-o1">${this.esc(Lang.t('egg.' + e.id))}</div><div style="color:${hits > 60 ? '#ff6a6a' : '#7dff6a'}">${GameData.fmt(e.hp)} HP · ${hits > 999 ? '999+' : hits} ${this.esc(Lang.t('win.hits'))}</div></div>`));
            }
            b.appendChild(row);
        });
        b.appendChild(this.el(`<div class="note">${this.esc(Lang.t('win.titanicNote'))}</div>`));
    },

    // --- Слияние (Animal Merging) ---
    openMerge() {
        const b = this.window({ id: 'merge', title: Lang.t('win.merge'), color: 'linear-gradient(#63e3ff,#1ea7f2)', width: 900 });
        const render = () => {
            b.innerHTML = '';
            b.appendChild(this.el(`<div class="note" style="margin-bottom:10px">${this.esc(Lang.t('win.mergeNote'))}</div>`));
            const groups = Game.mergeGroups();
            if (!groups.length) b.appendChild(this.el(`<div class="pill ui-o">${this.esc(Lang.t('win.mergeNone'))}</div>`));
            const grid = this.el('<div class="grid"></div>');
            for (const g of groups) {
                const next = GameData.MUTATIONS[GameData.MUTATIONS.findIndex(m => m.id === g.mut) + 1];
                const c = this.el(`<div class="card gold"><div class="ttl ui-o">${this.esc(Lang.t('pet.' + g.sp))}</div><div class="ic"></div>
                    <div class="ui-o1">${g.count} × ${this.esc(Lang.t('mut.' + g.mut))} → <span style="color:#ffd23a">${this.esc(Lang.t('mut.' + next.id))}</span></div>
                    <div class="ui-o1" style="color:#5dff4a">x${next.mult / GameData.mutation(g.mut).mult}</div></div>`);
                const ic = this.petIcon(g.sp, next.id); if (ic) c.querySelector('.ic').appendChild(ic);
                c.appendChild(this.btn(Lang.t('win.mergeBtn'), 'c-blue', () => { Game.merge(g.sp, g.mut); render(); }));
                grid.appendChild(c);
            }
            b.appendChild(grid);
        };
        render();
    },

    // --- Бусты за рекламу ---
    openBoosts() {
        const b = this.window({ id: 'boosts', title: Lang.t('win.boosts'), color: 'linear-gradient(#fff07a,#e8a80a)', width: 640 });
        const s = Game.save;
        const items = [['money', UI_ICONS.boostcash], ['luck', UI_ICONS.luck], ['speed', UI_ICONS.bolt]];
        const ok = Platform.rewardedSupported();
        for (const [k, icon] of items) {
            const left = Math.max(0, Math.ceil(((s.boosts[k] || 0) - Date.now()) / 1000));
            const row = this.el(`<div class="set-row"><div style="display:flex;align-items:center;gap:10px"><span style="width:44px;height:44px;display:inline-block">${icon}</span><div><div class="ui-o">${this.esc(Lang.t('boost.' + k + '.t'))}</div><div class="note">${this.esc(Lang.t('boost.' + k + '.d'))}</div></div></div></div>`);
            const bt = this.btn(UI_ICONS.ad + (left ? this.clock(left) + ' +5' + Lang.t('t.m') : Lang.t('ad.watch')), 'c-yellow', async (e, btn) => {
                btn.setAttribute('disabled', '');
                if (await Game.rewardBoost(k)) this.openBoosts(); else btn.removeAttribute('disabled');
            });
            if (!ok) { bt.setAttribute('disabled', ''); bt.title = Lang.t('ad.none'); }
            row.appendChild(bt);
            b.appendChild(row);
        }
        /** @type {[string, string, string, string, () => Promise<boolean>][]} */
        const extra = [
            ['speed', UI_ICONS.shoe, 'ad.speedUp.t', 'ad.speedUp.d', () => Game.speedUp()],
            ['titanic', UI_ICONS.egg, 'ad.titanic.t', 'ad.titanic.d', () => Game.titanicNow()],
        ];
        for (const [id, icon, t, d, fn] of extra) {
            const cd = Math.ceil(Game.adCooldown(id));
            const blocked = id === 'titanic' && !!World.titanic;
            const row = this.el(`<div class="set-row"><div style="display:flex;align-items:center;gap:10px"><span style="width:44px;height:44px;display:inline-flex">${icon}</span><div><div class="ui-o">${this.esc(Lang.t(t))}</div><div class="note">${this.esc(Lang.t(d))}</div></div></div></div>`);
            const bt = this.btn(UI_ICONS.ad + (cd > 0 ? this.mmss(cd) : Lang.t('ad.watch')), 'c-yellow', async (e, btn) => {
                btn.setAttribute('disabled', '');
                if (await fn()) this.openBoosts(); else btn.removeAttribute('disabled');
            });
            if (!ok || cd > 0 || blocked) bt.setAttribute('disabled', '');
            row.appendChild(bt);
            b.appendChild(row);
        }
        if (!ok) b.appendChild(this.el(`<div class="note">${this.esc(Lang.t('ad.none'))}</div>`));
    },

    // Предложения над нижним блоком: «Спасти питомца» и «Разбить сразу» (за рекламу).
    updateOffers() {
        const g = Game, box = document.getElementById('hud-offer');
        if (!box) return;
        const r = g.rescueOffer, e = g.breakOffer;
        const sig = (r ? 'r' + Math.ceil((r.until - Date.now()) / 1000) : '') + (e ? 'e' : '') + (UI.open ? 'o' : '');
        if (sig === this._offerSig) return;
        this._offerSig = sig;
        box.innerHTML = '';
        if (UI.open || g.state !== 'play') return;
        if (r) {
            const left = Math.max(0, Math.ceil((r.until - Date.now()) / 1000));
            box.appendChild(this.btn(UI_ICONS.ad + Lang.t('ad.rescue', { n: Lang.t('pet.' + r.drop.pet.sp) }) + ' ' + left, 'c-green', () => g.rescuePet()));
        } else if (e) {
            box.appendChild(this.btn(UI_ICONS.ad + Lang.t('ad.break'), 'c-yellow', () => g.instantBreak()));
        }
        box.style.pointerEvents = 'none';
        for (const c of box.children) /** @type {HTMLElement} */ (c).style.pointerEvents = 'auto';
    },

    // Супер-награда: 5 реклам с перерывом -> крупный приз.
    openSuper() {
        const b = this.window({ id: 'super', title: Lang.t('super.title'), color: 'linear-gradient(#fff07a,#ff9a1f)', width: 620 });
        const render = () => {
            if (this.open !== 'super') return;
            b.innerHTML = '';
            const st = Game.save.superAd, prize = Game.superPrize(st.cycle);
            const pz = this.el(`<div class="sup-prize"><div class="pic"></div><div><div class="ui-o" style="font-size:22px">${this.esc(prize.kind === 'pet' ? Lang.t('pet.' + prize.sp) : Lang.t('super.chest', { n: prize.gems }))}</div>
                <div class="ui-o1" style="margin-top:4px">${prize.kind === 'pet' ? this.rar('secret', Lang.t('rar.secret')) + ' · +' + prize.gems + ' 💎' : this.esc(Lang.t('super.chestBoost', { m: prize.boost }))}</div>
                <div class="note" style="margin-top:6px">${this.esc(Lang.t('super.note', { n: Game.SUPER_VIEWS }))}</div></div></div>`);
            const pic = prize.kind === 'pet' ? this.petIcon(prize.sp, 'normal') : this.el('<img src="assets/ui/chest.webp" alt="">');
            if (pic) pz.querySelector('.pic').appendChild(pic);
            b.appendChild(pz);
            const steps = this.el('<div class="sup-steps"></div>');
            for (let i = 0; i < Game.SUPER_VIEWS; i++) steps.appendChild(this.el(`<i class="${i < st.views ? 'on' : ''}"></i>`));
            b.appendChild(steps);
            const row = this.el('<div class="menu-btns"></div>');
            if (st.views >= Game.SUPER_VIEWS) {
                row.appendChild(this.btn(UI_ICONS.star + Lang.t('super.claim'), 'c-green', () => {
                    const got = Game.superClaim();
                    if (got) UI.toast(Lang.t('super.got', { n: got.kind === 'pet' ? Lang.t('pet.' + got.sp) : Lang.t('super.chest', { n: got.gems }) }), '#ffd23a', 3);
                    render();
                }));
            } else {
                const cd = Math.ceil(Game.adCooldown('super'));
                const bt = this.btn(UI_ICONS.ad + (cd > 0 ? Lang.t('super.wait', { t: this.mmss(cd) }) : Lang.t('super.watch', { n: st.views + 1, m: Game.SUPER_VIEWS })), 'c-yellow', async (e, btn) => {
                    btn.setAttribute('disabled', '');
                    await Game.superWatch();
                    render();
                });
                if (cd > 0 || !Platform.rewardedSupported()) bt.setAttribute('disabled', '');
                row.appendChild(bt);
                if (!Platform.rewardedSupported()) row.appendChild(this.el(`<div class="note">${this.esc(Lang.t('ad.none'))}</div>`));
            }
            b.appendChild(row);
        };
        render();
        clearInterval(this._superIv);
        this._superIv = setInterval(() => { if (this.open !== 'super') { clearInterval(this._superIv); return; } if (Game.adCooldown('super') > 0 || this._superWas) render(); this._superWas = Game.adCooldown('super') > 0; }, 1000);
    },

    // --- Рекорды (лидерборд площадки + локальная таблица) ---
    async openLeaderboard() {
        const b = this.window({ id: 'lb', title: Lang.t('win.lb'), color: 'linear-gradient(#e08cff,#7a2ee0)', width: 640 });
        b.innerHTML = `<div class="note">${this.esc(Lang.t('loading'))}</div>`;
        let rows = null;
        try { rows = await Platform.leaderboard({ avatarSize: 'small' }); } catch (e) { rows = null; }
        if (this.open !== 'lb') return;
        b.innerHTML = '';
        b.appendChild(this.el(`<div class="note" style="margin-bottom:8px">${this.esc(Lang.t('win.lbNote'))}</div>`));
        const list = this.el('<div class="lb-list"></div>');
        const data = rows && rows.length ? rows.map(r => ({ rank: r.rank, name: r.name, score: r.score, me: r.me, avatar: r.avatar })) : Game.localBoard();
        if (!data.length) list.appendChild(this.el(`<div class="pill">${this.esc(Lang.t('win.lbEmpty'))}</div>`));
        for (const r of data.slice(0, 20)) {
            const row = this.el(`<div class="lb-row ui-o1 ${r.me ? 'me' : ''}"><b>#${r.rank}</b>${r.avatar ? `<img src="${this.esc(r.avatar)}" alt="">` : ''}<span>${this.esc(r.name || '—')}</span><span class="v">${GameData.money(r.score)}/${Lang.t('t.s')}</span></div>`);
            list.appendChild(row);
        }
        b.appendChild(list);
        if (Platform.canLogin && Platform.canLogin() && !Platform.authorized()) {
            b.appendChild(this.btn(Lang.t('win.login'), 'c-blue', async () => { if (await Platform.login()) Game.reloadSave(); }));
        }
    },

    // --- Пауза / меню и настройки ---
    openPause() {
        const b = this.window({ id: 'pause', title: Lang.t('win.pause'), color: 'linear-gradient(#4a5568,#1a202c)', width: 520 });
        const col = this.el('<div class="menu-btns"></div>');
        col.appendChild(this.btn(Lang.t('menu.continue'), 'c-green', () => this.closeWindow()));
        col.appendChild(this.btn(Lang.t('menu.howto'), 'c-blue', () => { this.closeWindow(); Game.replayTutorial(); }));
        col.appendChild(this.btn(Lang.t('menu.settings'), 'c-gray', () => this.openSettings()));
        col.appendChild(this.btn(Lang.t('menu.toMenu'), 'c-orange', () => { this.closeWindow(); Game.toMenu(); }));
        b.appendChild(col);
    },
    openSettings() {
        const b = this.window({ id: 'settings', title: Lang.t('menu.settings'), color: 'linear-gradient(#c8ced6,#6b737b)', width: 560 });
        const s = Game.save.settings;
        const toggle = (label, get, set) => {
            const row = this.el(`<div class="set-row"><span class="ui-o1">${this.esc(label)}</span></div>`);
            const bt = this.btn(get() ? Lang.t('set.on') : Lang.t('set.off'), get() ? 'c-green' : 'c-gray', () => { set(!get()); bt.className = 'rb ui-o ' + (get() ? 'c-green' : 'c-gray'); bt.textContent = get() ? Lang.t('set.on') : Lang.t('set.off'); Game.persist(); });
            row.appendChild(bt); b.appendChild(row);
        };
        toggle(Lang.t('set.sound'), () => !Sound.muted, (v) => { if (Sound.muted === v) Sound.toggleMuted(); });
        toggle(Lang.t('set.music'), () => s.music, (v) => { s.music = v; Game.applyMusic(); });
        toggle(Lang.t('set.steal'), () => s.steal !== false, (v) => { s.steal = v; });
        const q = this.el(`<div class="set-row"><span class="ui-o1">${this.esc(Lang.t('set.quality'))}</span><div class="set-opts"></div></div>`);
        for (const lv of ['auto', 'low', 'medium', 'high']) {
            const cur = (typeof Quality !== 'undefined' && Quality.choice) || 'auto';
            q.querySelector('.set-opts').appendChild(this.btn(Lang.t('set.q.' + lv), cur === lv ? 'c-green' : 'c-gray', () => { if (typeof Quality !== 'undefined') Quality.set(lv); this.openSettings(); }));
        }
        b.appendChild(q);
        const sr = this.el(`<div class="set-row"><span class="ui-o1">${this.esc(Lang.t('set.sens'))}</span><div class="set-opts"></div></div>`);
        /** @type {[string, number][]} */
        const sensLevels = [['low', 0.6], ['mid', 1], ['high', 1.6]];
        for (const [lv, k] of sensLevels) {
            const cur = s.sens || 1;
            sr.querySelector('.set-opts').appendChild(this.btn(Lang.t('set.sens.' + lv), Math.abs(cur - k) < 0.01 ? 'c-green' : 'c-gray', () => { s.sens = k; Game.persist(); this.openSettings(); }));
        }
        b.appendChild(sr);
    },

    // Обменник денег на кристаллы.
    openConverter() {
        const b = this.window({ id: 'converter', title: Lang.t('conv.title'), color: 'linear-gradient(#e08cff,#7a2ee0)', width: 640 });
        const render = () => {
            b.innerHTML = '';
            const s = Game.save;
            b.appendChild(this.el(`<div class="set-row"><span class="ui-o1">${this.esc(Lang.t('conv.rate'))}</span><span class="pill ui-o"><span style="color:#f2b8ff">1 💎</span> = <span style="color:#5dff4a">${GameData.money(Game.gemPrice())}</span></span></div>`));
            b.appendChild(this.el(`<div class="note" style="margin:0 0 10px">${this.esc(Lang.t('conv.note'))}</div>`));
            const grid = this.el('<div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(170px,1fr))"></div>');
            Game.GEM_PACKS.forEach((pack, i) => {
                const price = Game.packPrice(pack);
                const c = this.el(`<div class="card rare-epic"><div class="ttl ui-o" style="font-size:26px">${pack.n} 💎</div>
                    <div class="sub ui-o1">${pack.k < 1 ? this.esc(Lang.t('conv.discount', { n: Math.round((1 - pack.k) * 100) })) : '&nbsp;'}</div></div>`);
                const bt = this.btn(GameData.money(price), s.money >= price ? 'c-green' : 'c-gray', () => { if (Game.buyGems(i)) render(); });
                if (s.money < price) bt.classList.add('off');
                c.appendChild(bt);
                grid.appendChild(c);
            });
            b.appendChild(grid);
            b.appendChild(this.el(`<div class="note" style="margin-top:10px">${this.esc(Lang.t('conv.balance', { m: GameData.money(s.money), g: GameData.fmt(Shops.gems()) }))}</div>`));
        };
        render();
    },

    // Пока вас не было.
    openOffline(amount) {
        const b = this.window({ id: 'offline', title: Lang.t('win.offline'), color: 'linear-gradient(#7dff4d,#1fa31e)', width: 520 });
        b.appendChild(this.el(`<div class="pill ui-o" style="font-size:30px;color:#5dff4a;margin:10px 0">+${GameData.money(amount)}</div>`));
        const row = this.el('<div class="menu-btns"></div>');
        row.appendChild(this.btn(Lang.t('win.claim'), 'c-green', () => { Game.claimOffline(1); this.closeWindow(); }));
        if (Platform.rewardedSupported()) {
            row.appendChild(this.btn(UI_ICONS.ad + Lang.t('win.claimX2'), 'c-yellow', async (e, bt) => { bt.setAttribute('disabled', ''); const ok = await Game.claimOfflineX2(); if (ok) this.closeWindow(); else bt.removeAttribute('disabled'); }));
        }
        b.appendChild(row);
        this._onClose = () => Game.claimOffline(1);
    },

    // --- Главное меню (мир крутится фоном) ---
    showMenu(on) {
        let m = document.getElementById('menu');
        if (!m) {
            m = this.el(`<div id="menu" class="menu-screen">
                <div class="logo ui-o"><div class="l1">${this.esc(Lang.t('logo.1'))}</div><div class="l2">${this.esc(Lang.t('logo.2'))}</div><div class="l3">${this.esc(Lang.t('logo.3'))}</div></div>
                <div class="menu-btns"></div></div>`);
            document.body.appendChild(m);
            const col = m.querySelector('.menu-btns');
            col.appendChild(this.btn(Lang.t('menu.play'), 'c-green play', () => Game.play()));
            const row = this.el('<div class="menu-row"></div>');
            row.appendChild(this.btn(UI_ICONS.cart + Lang.t('hud.shop'), 'c-blue', () => Game.openWithAd(() => Shops.openShop())));
            row.appendChild(this.btn(UI_ICONS.gift + Lang.t('hud.daily'), 'c-pink', () => Game.openWithAd(() => Shops.openDaily())));
            row.appendChild(this.btn(UI_ICONS.wheel + Lang.t('hud.wheel'), 'c-yellow', () => Game.openWithAd(() => Shops.openWheel())));
            row.appendChild(this.btn(UI_ICONS.trophy + Lang.t('win.lb'), 'c-purple', () => Game.openWithAd(() => this.openLeaderboard())));
            col.appendChild(row);
            const row2 = this.el('<div class="menu-row"></div>');
            row2.appendChild(this.btn(Lang.t('menu.howto'), 'c-gray', () => Game.play(true)));
            row2.appendChild(this.btn(UI_ICONS.gear + Lang.t('menu.settings'), 'c-gray', () => this.openSettings()));
            col.appendChild(row2);
        }
        m.classList.toggle('open', !!on);
        this.root.style.display = on ? 'none' : '';
        document.getElementById('labels').style.display = on ? 'none' : '';
    },
};

// Звуки по именам (файлы — docs/SOUNDS.md). Пути — литералами: сборщик берёт только их.
/** @satisfies {Record<string, any>} */
const Sfx = {
    FILES: {
        hit1: 'assets/sounds/hit-egg-1.ogg', hit2: 'assets/sounds/hit-egg-2.ogg', hit3: 'assets/sounds/hit-egg-3.ogg',
        crack: 'assets/sounds/egg-crack.ogg', hatch: 'assets/sounds/hatch.ogg', pickup: 'assets/sounds/pickup.ogg',
        drop: 'assets/sounds/drop.ogg', deliver: 'assets/sounds/deliver.ogg', coin: 'assets/sounds/coin.ogg',
        click: 'assets/sounds/click.ogg', open: 'assets/sounds/open.ogg', close: 'assets/sounds/close.ogg',
        buy: 'assets/sounds/buy.ogg', error: 'assets/sounds/error.ogg', upgrade: 'assets/sounds/upgrade.ogg',
        swing: 'assets/sounds/swing.ogg', bonk: 'assets/sounds/bonk.ogg', jump: 'assets/sounds/jump.ogg',
        step: 'assets/sounds/step.ogg', roar: 'assets/sounds/roar.ogg', stomp: 'assets/sounds/stomp.ogg',
        alarm: 'assets/sounds/alarm.ogg', titanic: 'assets/sounds/titanic.ogg', tick: 'assets/sounds/tick.ogg',
        win: 'assets/sounds/win.ogg', gift: 'assets/sounds/gift.ogg', merge: 'assets/sounds/merge.ogg',
        treadmill: 'assets/sounds/treadmill.ogg', splash: 'assets/sounds/splash.ogg',
    },
    MUSIC_MAIN: 'assets/sounds/music-main.ogg',
    MUSIC_MENU: 'assets/sounds/music-menu.mp3',
    MUSIC_TITANIC: 'assets/sounds/music-titanic.ogg',
    play(name, vol, rate) {
        const f = this.FILES[name];
        if (!f) return null;
        return Sound.play(f, { volume: vol == null ? 0.7 : vol, rate: rate || 1 });
    },
};

// Превью моделей в картинки (иконки окон): offscreen-рендер одной сцены, кэш dataURL.
/** @satisfies {Record<string, any>} */
const Thumbs = {
    _cache: new Map(),
    _queue: [],
    _busy: false,
    // Своя модель: builder(scene) -> меш (центр низа в 0), height — высота кадра в px. key — уникальный.
    mesh(key, height, builder) { return this.get('mesh', key, height, builder); },
    get(kind, id, mut, builder) {
        const key = kind + '|' + id + '|' + (mut || '');
        let rec = this._cache.get(key);
        if (!rec) {
            rec = { url: null, waiters: [] };
            this._cache.set(key, rec);
            this._queue.push({ kind, id, mut, rec, builder });
            this._pump();
        }
        const img = document.createElement('img');
        img.alt = '';
        if (rec.url) img.src = rec.url; else rec.waiters.push(img);
        return img;
    },
    async _pump() {
        if (this._busy) return;
        this._busy = true;
        try {
            while (this._queue.length) {
                const job = this._queue.shift();
                try { job.rec.url = await this._render(job); } catch (e) { job.rec.url = ''; }
                for (const w of job.rec.waiters) if (job.rec.url) w.src = job.rec.url;
                job.rec.waiters = [];
            }
        } finally { this._busy = false; }
    },
    async _render(job) {
        if (!this.scene) {
            const eng = World3D.engine;
            const sc = new BABYLON.Scene(eng);
            sc.useRightHandedSystem = true;
            sc.clearColor = new BABYLON.Color4(0, 0, 0, 0);
            sc.autoClear = true;
            const cam = new BABYLON.ArcRotateCamera('tc', 0.62, 1.2, 400, BABYLON.Vector3.Zero(), sc);
            cam.fov = 0.5; cam.minZ = 1; cam.maxZ = 5000;
            // Превью квадратное, а движок отдаёт пропорции экрана игры: проекция камеры — с aspect = 1.
            const camAny = /** @type {any} */ (cam);
            const origProj = cam.getProjectionMatrix.bind(cam);
            camAny._sxSquare = true;
            camAny.getProjectionMatrix = () => {
                const e = cam.getEngine(), saved = e.getAspectRatio;
                e.getAspectRatio = () => 1;
                try { return origProj(true); } finally { e.getAspectRatio = saved; }
            };
            const hl = new BABYLON.HemisphericLight('th', new BABYLON.Vector3(0.3, 1, 0.4), sc); hl.intensity = 1.0; hl.groundColor = new BABYLON.Color3(0.45, 0.45, 0.5);
            const dl = new BABYLON.DirectionalLight('td', new BABYLON.Vector3(-0.5, -1, -0.8), sc); dl.intensity = 0.55;
            this.scene = sc; this.cam = cam;
            this.rt = new BABYLON.RenderTargetTexture('thumb-rt', 192, sc, false);
            this.rt.clearColor = new BABYLON.Color4(0, 0, 0, 0);
            sc.customRenderTargets.push(this.rt);
            this.rt.activeCamera = cam;
        }
        const sc = this.scene;
        let mesh = null, h = 100;
        if (job.kind === 'pet') {
            const sp = GameData.PETS[job.id];
            const model = await Model3D.load(sp.model).catch(() => null);
            if (!model) return '';
            const root = Model3D.build(model, sc, { name: 'th' });
            const prevView = Models.view;
            Models.view = /** @type {any} */ ({ scene: sc });
            const t = Models._normalize(root, 100, sp.yaw || 0, 'th');
            Models.view = prevView;
            mesh = t.mesh;
            if (job.mut && job.mut !== 'normal') {
                const mu = GameData.mutation(job.mut);
                const m = /** @type {BABYLON.StandardMaterial} */ (mesh.material);
                if (m && Array.isArray(mu.tint)) { const c = m.clone('thm'); c.diffuseColor = new BABYLON.Color3(mu.tint[0], mu.tint[1], mu.tint[2]); mesh.material = c; }
                else if (m) { const c = m.clone('thm'); c.diffuseColor = new BABYLON.Color3(1, 0.5, 1); c.emissiveColor = new BABYLON.Color3(0.2, 0.1, 0.3); mesh.material = c; }
            }
            h = 100;
        } else if (job.kind === 'pick') {
            // Кирка плашмя к камере (вид 3/4 спереди), рукоять по диагонали.
            const root = new BABYLON.Mesh('thp', sc);
            const inner = new BABYLON.Mesh('thpi', sc);
            inner.parent = root;
            Noob.buildPickaxe(sc, GameData.pickaxe(job.id), inner, 'thp');
            inner.rotation.z = 0.85;
            inner.position.set(-40, 10, 0);
            root.rotation.y = 0.95;
            mesh = root; h = 150;
        } else if (job.kind === 'mesh' && job.builder) {
            mesh = job.builder(sc); h = job.mut || 120;
        }
        if (!mesh) return '';
        this.rt.renderList = [mesh].concat(mesh.getChildMeshes(false));
        this.cam.setTarget(new BABYLON.Vector3(0, h * 0.45, 0));
        this.cam.radius = h * 2.9;
        await new Promise(r => sc.executeWhenReady(() => r(null)));
        this.rt.render(true);
        const px = await this.rt.readPixels();
        const size = this.rt.getSize();
        const cv = document.createElement('canvas'); cv.width = size.width; cv.height = size.height;
        const ctx = cv.getContext('2d');
        const id = ctx.createImageData(size.width, size.height);
        const src = new Uint8Array(/** @type {ArrayBuffer} */ (px.buffer || px));
        // Перевернуть по вертикали (WebGL читает снизу вверх).
        for (let y = 0; y < size.height; y++) id.data.set(src.subarray((size.height - 1 - y) * size.width * 4, (size.height - y) * size.width * 4), y * size.width * 4);
        ctx.putImageData(id, 0, 0);
        mesh.dispose(false, true);
        return cv.toDataURL('image/png');
    },
};
