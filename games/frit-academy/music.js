/* Original Frit’Academy soundtrack. All playback begins after a user gesture. */
(() => {
  'use strict';
  window.FritMusic = {
    create({ getPrefs, onState = () => {}, url = './audio/frituur-swing.mp3' }) {
      let track, context, gain, activated = false, hidden = document.hidden;
      let ducked = false, exercise = false, pending = false, state = 'ready';
      const level = () => Math.max(0, Math.min(100, Number(getPrefs().musicVolume) || 0)) / 100;
      const wanted = () => activated && getPrefs().music && level() > 0 && !hidden;
      function report(next) { state = next; onState(next); }
      function getContext() {
        const Context = window.AudioContext || window.webkitAudioContext;
        if (!context && Context) context = new Context();
        return context;
      }
      function volume() {
        const value = wanted() ? level() * (ducked ? .15 : exercise ? .7 : 1) : 0;
        if (gain) {
          gain.gain.cancelScheduledValues(context.currentTime);
          gain.gain.setTargetAtTime(value, context.currentTime, .06);
        } else if (track) track.volume = value;
      }
      function prepare() {
        if (track) return;
        track = new Audio(url);
        track.loop = true;
        track.preload = 'none';
        track.setAttribute('playsinline', '');
        const ctx = getContext();
        if (ctx) {
          gain = ctx.createGain();
          gain.gain.value = 0;
          ctx.createMediaElementSource(track).connect(gain);
          gain.connect(ctx.destination);
          ctx.addEventListener('statechange', () => {
            if (wanted() && ctx.state !== 'running') report('blocked');
            else if (wanted() && !track.paused) report('playing');
          });
        }
        track.addEventListener('error', () => report('error'));
        track.addEventListener('pause', () => { if (wanted()) report('blocked'); });
      }
      function update() {
        volume();
        if (!wanted()) {
          if (track) track.pause();
          report(!getPrefs().music ? 'off' : level() === 0 ? 'silent' : 'ready');
          return;
        }
        try {
          prepare();
          // Resume and play are invoked synchronously inside the gesture handler.
          if (context && context.state !== 'running') context.resume().catch(() => report('blocked'));
          volume();
          if (pending) return;
          if (!track.paused && (!context || context.state === 'running')) { report('playing'); return; }
          pending = true;
          report('loading');
          Promise.resolve(track.play()).then(() => {
            pending = false;
            if (!wanted()) { track.pause(); update(); return; }
            report(context && context.state !== 'running' ? 'blocked' : 'playing');
          }).catch(error => {
            pending = false;
            if (!wanted()) { update(); return; }
            report(error?.name === 'NotAllowedError' || error?.name === 'AbortError' ? 'blocked' : 'error');
          });
        } catch (_) { pending = false; if (track) track.pause(); report('error'); }
      }
      function gesture(event) {
        // The toggle handles its own activation; a pointer press must not start
        // music just before its click handler decides whether to turn it off.
        if (event?.target?.closest?.('#music-toggle')) return;
        activated = true;
        update();
      }
      document.addEventListener('pointerdown', gesture, { passive: true });
      document.addEventListener('keydown', gesture);
      // Click covers assistive technology and browsers requiring pointer release.
      document.addEventListener('click', gesture);
      document.addEventListener('visibilitychange', () => { hidden = document.hidden; update(); });
      window.addEventListener('pagehide', () => { hidden = true; update(); });
      window.addEventListener('pageshow', () => { hidden = document.hidden; update(); });
      return {
        getContext, update, gesture, getState: () => state,
        setDucked(value) { ducked = value; volume(); },
        setExercise(value) { exercise = value; volume(); }
      };
    }
  };
})();
