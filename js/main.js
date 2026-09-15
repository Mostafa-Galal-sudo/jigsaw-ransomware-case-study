/* ==========================================================================
   JIGSAW CASE STUDY — Horror Experience & Scroll Storytelling Engine
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------ *
   * 0. Audio Manager & Sound System
   * ------------------------------------------------------------------ */
  var audioEnabled = false;
  var entranceAudio = new Audio("assets/audio/enterence.m4a");
  var gameAudio = new Audio("assets/audio/iwanttoplayagame.m4a");
  entranceAudio.loop = false;
  gameAudio.loop = false;

  var audioToggleBtn = document.getElementById("audioToggleBtn");
  var audioBtnLabel = document.getElementById("audioBtnLabel");

  function initAudioSystem() {
    if (audioEnabled) return;
    audioEnabled = true;
    if (audioToggleBtn) audioToggleBtn.classList.add("is-active");
    if (audioBtnLabel) audioBtnLabel.textContent = "AUDIO ACTIVE";

    // Play subtle ambient sound onset
    try {
      entranceAudio.volume = 0.35;
      entranceAudio.play().catch(function(){});
    } catch(e){}

    scheduleRandomAudio();
  }

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener("click", function () {
      if (!audioEnabled) {
        initAudioSystem();
      } else {
        audioEnabled = false;
        audioToggleBtn.classList.remove("is-active");
        if (audioBtnLabel) audioBtnLabel.textContent = "ENABLE AUDIO";
        entranceAudio.pause();
        gameAudio.pause();
      }
    });
  }

  function scheduleRandomAudio() {
    if (!audioEnabled) return;
    var delay = 20000 + Math.random() * 35000;
    setTimeout(function () {
      if (!audioEnabled) return;
      if (Math.random() > 0.6) {
        triggerJigsawVoiceEvent();
      } else {
        try {
          entranceAudio.currentTime = Math.random() * 10;
          entranceAudio.volume = 0.2 + Math.random() * 0.2;
          entranceAudio.play().catch(function(){});
        } catch(e){}
      }
      scheduleRandomAudio();
    }, delay);
  }

  function triggerJigsawVoiceEvent() {
    if (!audioEnabled) return;
    try {
      gameAudio.currentTime = 0;
      gameAudio.volume = 0.6;
      gameAudio.play().catch(function(){});
      triggerVisualHorrorSpike();
    } catch(e){}
  }

  /* ------------------------------------------------------------------ *
   * 1. Screen Tear & Red Flash Visual Horror Effects
   * ------------------------------------------------------------------ */
  var screenTear = document.getElementById("screenTear");
  var redFlashOverlay = document.getElementById("redFlashOverlay");

  function triggerVisualHorrorSpike() {
    if (reduceMotion) return;
    if (screenTear) {
      screenTear.style.top = (15 + Math.random() * 70) + "%";
      screenTear.classList.remove("is-active");
      void screenTear.offsetWidth; // trigger reflow
      screenTear.classList.add("is-active");
    }
    if (redFlashOverlay) {
      redFlashOverlay.classList.add("is-flashing");
      setTimeout(function () {
        redFlashOverlay.classList.remove("is-flashing");
      }, 150 + Math.random() * 150);
    }
  }

  /* ------------------------------------------------------------------ *
   * 2. Evidence image loading & Lightbox
   * ------------------------------------------------------------------ */
  document.querySelectorAll(".evidence__frame img[data-src]").forEach(function (img) {
    var frame = img.closest(".evidence__frame");
    img.addEventListener("load", function () {
      if (frame) frame.classList.remove("is-missing");
    });
    img.addEventListener("error", function () {
      if (frame) frame.classList.add("is-missing");
    });
    img.src = img.getAttribute("data-src");
  });

  (function () {
    var lightbox = document.getElementById("lightbox");
    if (!lightbox) return;
    var lbImg = document.getElementById("lightboxImg");
    var lbCaption = document.getElementById("lightboxCaption");
    var lbClose = document.getElementById("lightboxClose");

    function open(src, caption) {
      lbImg.src = src;
      lbCaption.textContent = caption || "";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
    }
    function close() {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      lbImg.src = "";
    }

    document.querySelectorAll(".evidence__frame img[data-src]").forEach(function (img) {
      img.addEventListener("click", function () {
        var frame = img.closest(".evidence__frame");
        if (frame && frame.classList.contains("is-missing")) return;
        var label = img.closest(".evidence");
        var caption = label ? label.querySelector(".evidence__label span") : null;
        open(img.currentSrc || img.src, img.getAttribute("alt") || (caption ? caption.textContent : ""));
      });
    });

    lightbox.addEventListener("click", close);
    lbClose.addEventListener("click", function (e) { e.stopPropagation(); close(); });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  })();

  /* ------------------------------------------------------------------ *
   * 3. ENTRANCE SEQUENCE — 3 stages:
   *    Stage 1: enterence.gif fullscreen (first thing on load)
   *    Stage 2: Boot terminal + JIGSAW RANSOMWARE title
   *    Stage 3: Main site revealed
   * ------------------------------------------------------------------ */
  (function () {
    var gifOverlay    = document.getElementById("gifIntroOverlay");
    var bootOverlay   = document.getElementById("entranceOverlay");
    var muteWidget    = document.getElementById("audioMuteWidget");
    var muteBtn       = document.getElementById("muteBtn");
    var muteBtnIcon   = document.getElementById("muteBtnIcon");

    // Lock scroll during any intro stage
    document.body.classList.add("entrance-active");

    /* ---- STAGE 2: Boot Terminal ------------------------------------ */
    function showBootSequence() {
      // Show the boot overlay (was hidden)
      if (bootOverlay) {
        bootOverlay.style.display = "flex";
        bootOverlay.removeAttribute("aria-hidden");
      }

      // Type out terminal boot lines
      var bootLines = document.querySelectorAll(".boot-line");
      bootLines.forEach(function (line, idx) {
        setTimeout(function () {
          line.style.opacity = "1";
          line.style.transform = "none";
        }, 200 + idx * 420);
      });

      var bootDismissed = false;
      function dismissBoot() {
        if (bootDismissed) return;
        bootDismissed = true;
        if (bootOverlay) bootOverlay.classList.add("is-leaving");
        document.body.classList.remove("entrance-active");
        window.removeEventListener("keydown", dismissBoot);
        window.removeEventListener("wheel",   dismissBoot);
        window.removeEventListener("touchstart", dismissBoot);
        setTimeout(function () {
          if (bootOverlay) bootOverlay.style.display = "none";
          window.dispatchEvent(new CustomEvent("entrance:dismissed"));
        }, 650);
      }

      if (bootOverlay) bootOverlay.addEventListener("click", dismissBoot);
      window.addEventListener("keydown",     dismissBoot);
      window.addEventListener("wheel",       dismissBoot, { passive: true });
      window.addEventListener("touchstart",  dismissBoot, { passive: true });
      // Auto-dismiss boot after 5s
      setTimeout(dismissBoot, reduceMotion ? 800 : 5000);
    }

    /* ---- MUTE TOGGLE ----------------------------------------------- */
    if (muteBtn) {
      muteBtn.addEventListener("click", function () {
        if (audioEnabled) {
          audioEnabled = false;
          entranceAudio.pause();
          gameAudio.pause();
          if (muteBtnIcon) muteBtnIcon.textContent = "🔇";
        } else {
          audioEnabled = true;
          scheduleRandomAudio();
          if (muteBtnIcon) muteBtnIcon.textContent = "🔊";
        }
      });
    }

    /* ---- STAGE 1: enterence.gif Fullscreen ------------------------- */
    if (!gifOverlay) {
      // Fallback: no gif overlay, go straight to boot
      showBootSequence();
      return;
    }

    var gifDismissed = false;
    function dismissGif() {
      if (gifDismissed) return;
      gifDismissed = true;

      // Auto-start audio on first user interaction (browser allows it now)
      initAudioSystem();
      if (muteWidget) muteWidget.style.display = "block";

      gifOverlay.classList.add("is-leaving");
      setTimeout(function () {
        gifOverlay.style.display = "none";
        // Go to Stage 2
        showBootSequence();
      }, 520);
    }

    gifOverlay.addEventListener("click", dismissGif);
    window.addEventListener("keydown", function gifKeyDismiss(e) {
      dismissGif();
      window.removeEventListener("keydown", gifKeyDismiss);
    });

    // Auto-dismiss gif after 4.5s if user doesn't click
    setTimeout(dismissGif, reduceMotion ? 500 : 4500);
  })();


  /* ------------------------------------------------------------------ *
   * 4. Meme GIF Intrusion System
   * ------------------------------------------------------------------ */
  var gifList = [
    "assets/gif/afterfinalsectionby9seconds.gif",
    "assets/gif/encryption.gif",
    "assets/gif/enterence.gif",
    "assets/gif/final.gif",
    "assets/gif/iwanttoplaygame.gif",
    "assets/gif/midanalysisgif.gif"
  ];
  var lastGifIndex = -1;

  function spawnGifIntrusion() {
    if (reduceMotion) return;
    var idx;
    do {
      idx = Math.floor(Math.random() * gifList.length);
    } while (idx === lastGifIndex && gifList.length > 1);
    lastGifIndex = idx;

    var positions = ["right", "left", "top"];
    var pos = positions[Math.floor(Math.random() * positions.length)];

    var img = document.createElement("img");
    img.src = gifList[idx];
    img.className = "gif-intrusion gif-intrusion--" + pos;
    document.body.appendChild(img);

    setTimeout(function () {
      img.classList.add("is-visible");
      triggerVisualHorrorSpike();
    }, 50);

    var stayTime = 2500 + Math.random() * 2000;
    setTimeout(function () {
      img.classList.remove("is-visible");
      setTimeout(function () {
        if (img.parentNode) img.parentNode.removeChild(img);
      }, 500);
    }, stayTime);
  }

  function scheduleGifIntrusions() {
    var nextDelay = 18000 + Math.random() * 30000;
    setTimeout(function () {
      spawnGifIntrusion();
      scheduleGifIntrusions();
    }, nextDelay);
  }
  scheduleGifIntrusions();

  /* ------------------------------------------------------------------ *
   * 5. GSAP & ScrollTrigger Horror progression
   * ------------------------------------------------------------------ */
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.style.opacity = 1; el.style.transform = "none";
    });
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // Case thread pin indicator
  var thread = document.getElementById("caseThread");
  var sections = Array.prototype.slice.call(document.querySelectorAll(".exhibit, .closing"));
  if (thread) {
    sections.forEach(function (sec, i) {
      var pin = document.createElement("div");
      pin.className = "case-thread__pin";
      pin.style.top = (6 + (i / (sections.length - 1)) * 88) + "vh";
      thread.appendChild(pin);
      ScrollTrigger.create({
        trigger: sec,
        start: "top center",
        end: "bottom center",
        onToggle: function (self) {
          pin.classList.toggle("is-active", self.isActive);
        }
      });
    });
  }

  // Generic reveal
  gsap.utils.toArray(".reveal").forEach(function (el) {
    gsap.fromTo(el, { opacity: 0, y: 18 }, {
      opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%" }
    });
  });

  // Hero Intro — wire data-text for CSS chromatic aberration glitch
  function playHeroIntro() {
    // Ensure the glitch element has its data-text attribute for CSS pseudo-element magic
    var glitchEl = document.getElementById("heroTitle");
    if (glitchEl && !glitchEl.getAttribute("data-text")) {
      glitchEl.setAttribute("data-text", glitchEl.textContent);
    }

    var heroTl = gsap.timeline();
    heroTl
      .from(".hero__eyebrow", { opacity: 0, y: -8, duration: 0.5 })
      .from(".hero__title", { opacity: 0, y: 22, duration: 0.8, ease: "power3.out" }, "-=0.2")
      .from(".hero__subtitle", { opacity: 0, y: 14, duration: 0.6 }, "-=0.35")
      .from(".hero__lead", { opacity: 0, y: 10, duration: 0.6 }, "-=0.3")
      .from(".hero__scroll", { opacity: 0, duration: 0.6 }, "-=0.2")
      .from("#heroMask", { opacity: 0, scale: 1.08, duration: 1.1, ease: "power2.out" }, 0);
  }

  if (document.getElementById("entranceOverlay")) {
    window.addEventListener("entrance:dismissed", playHeroIntro, { once: true });
  } else {
    playHeroIntro();
  }

  // Lurking Jigsaw Entity & Visual Corruption Scroll Scaling
  var jigsawContainer = document.getElementById("jigsawEntityContainer");
  var jigsawFace = document.getElementById("jigsawEntityFace");
  var bgCountdown = document.getElementById("bgCountdownMotif");

  ScrollTrigger.create({
    trigger: "#exhibit-01",
    endTrigger: "#closing",
    start: "top top",
    end: "bottom bottom",
    onUpdate: function (self) {
      var p = self.progress; // 0 to 1
      if (p < 0.7) {
        // Infection increases
        var opacity = 0.1 + p * 0.35;
        if (jigsawContainer) jigsawContainer.style.opacity = opacity.toFixed(2);
        if (jigsawFace) jigsawFace.style.filter = "grayscale(100%) contrast(" + (180 + p * 120) + "%) brightness(" + (15 + p * 15) + "%)";
        if (p > 0.25 && p < 0.75) {
          if (bgCountdown) bgCountdown.classList.add("is-revealed");
        } else {
          if (bgCountdown) bgCountdown.classList.remove("is-revealed");
        }
      } else {
        // Recovery unwinds corruption
        var rev = (1 - p) / 0.3;
        var op = Math.max(0.02, 0.25 * rev);
        if (jigsawContainer) jigsawContainer.style.opacity = op.toFixed(2);
        if (bgCountdown) bgCountdown.classList.remove("is-revealed");
      }
    }
  });

  // Exhibit 02 Terminal Strings
  var stringLines = gsap.utils.toArray("#stringsTerminal .terminal__line");
  ScrollTrigger.create({
    trigger: "#stringsTerminal",
    start: "top 75%",
    once: true,
    onEnter: function () {
      var tl = gsap.timeline();
      stringLines.forEach(function (line, i) {
        tl.to(line, { opacity: 1, duration: 0.05 }, i * 0.28);
      });
      triggerVisualHorrorSpike();
    }
  });

  // Exhibit 03 Ransom Clock
  ScrollTrigger.create({
    trigger: "#ransomClock",
    start: "top 80%",
    once: true,
    onEnter: function () {
      var s = 59 * 60 + 59;
      var el = document.getElementById("ransomClock");
      var iv = setInterval(function () {
        s -= 37;
        if (s <= 0) { s = 0; clearInterval(iv); }
        var m = Math.floor(s / 60), sec = s % 60;
        el.textContent = (m < 10 ? "0" + m : m) + ":" + (sec < 10 ? "0" + sec : sec);
      }, 90);
      triggerJigsawVoiceEvent();
    }
  });

  // Exhibit 04 Protection Sweep
  ScrollTrigger.create({
    trigger: ".lock-compare",
    start: "top 75%",
    once: true,
    onEnter: function () {
      gsap.fromTo(".lock-compare__panel.is-locked", { x: -12, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6 });
      gsap.fromTo(".lock-compare__panel.is-clear", { x: 12, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, delay: 0.25 });
      gsap.fromTo(".lock-compare__arrow", { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.4, delay: 0.5 });
    }
  });

  // Exhibit 05 Execution Trail
  ScrollTrigger.create({
    trigger: "#executionTrail",
    start: "top 75%",
    once: true,
    onEnter: function () {
      gsap.to("#executionTrail [data-step]", {
        opacity: 1, x: 0, duration: 0.5, stagger: 0.35, ease: "power2.out"
      });
    }
  });

  // Exhibit 06 Cinematic Key Reveal Moment
  function typeOutKey(node) {
    var full = node.getAttribute("data-full");
    node.textContent = "";
    full.split("").forEach(function (ch) {
      var span = document.createElement("span");
      span.className = "ch";
      span.textContent = ch;
      node.appendChild(span);
    });
    gsap.to(node.querySelectorAll(".ch"), {
      opacity: 1, duration: 0.02, stagger: 0.035, ease: "none"
    });
  }

  ScrollTrigger.create({
    trigger: "#keyReveal",
    start: "top 70%",
    once: true,
    onEnter: function () {
      // Add cinematic darkout class for CSS brightness animation
      var keySection = document.getElementById("exhibit-06");
      var keyRevealEl = document.getElementById("keyReveal");
      if (keySection) keySection.classList.add("is-revealing");
      if (keyRevealEl) keyRevealEl.classList.add("is-revealing");
      setTimeout(function () {
        if (keySection) keySection.classList.remove("is-revealing");
        if (keyRevealEl) keyRevealEl.classList.remove("is-revealing");
      }, 2200);

      triggerVisualHorrorSpike();
      var key = document.getElementById("keyValue");
      var iv = document.getElementById("ivValue");
      typeOutKey(key);
      gsap.delayedCall(1.1, function () { typeOutKey(iv); });
      gsap.fromTo("#keyReveal", { filter: "brightness(1)" }, {
        filter: "brightness(1.6)", duration: 0.2, delay: 1.0, yoyo: true, repeat: 1
      });
    }
  });

  // Exhibit 07 Single Interactive File Demo
  (function () {
    var row = document.getElementById("demoFileRow");
    var name = document.getElementById("demoFileName");
    var state = document.getElementById("demoFileState");
    var encrypted = false;
    function toggle() {
      encrypted = !encrypted;
      triggerVisualHorrorSpike();
      gsap.to(row, {
        duration: 0.12, x: encrypted ? 6 : -6, onComplete: function () {
          gsap.to(row, { duration: 0.12, x: 0 });
        }
      });
      row.classList.toggle("is-encrypted", encrypted);
      row.setAttribute("aria-pressed", String(encrypted));
      name.textContent = encrypted ? "document.txt.fun" : "document.txt";
      state.textContent = encrypted ? "encrypted — original deleted" : "click to encrypt";
    }
    if (row) {
      row.addEventListener("click", toggle);
      row.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      });
    }
  })();

  // Exhibit 08 Fleet Sample Run — Encryption Terror Sequence
  (function () {
    var btn = document.getElementById("runSampleBtn");
    if (!btn) return;
    var rows = gsap.utils.toArray("#fleetDemo .file-row");
    btn.addEventListener("click", function () {
      btn.disabled = true;
      btn.textContent = "▶ ENCRYPTING FILESYSTEM...";
      triggerVisualHorrorSpike();

      var tl = gsap.timeline({
        onComplete: function () {
          btn.textContent = "⚠ SYSTEM COMPROMISED — 5 FILES ENCRYPTED";
          btn.style.color = "var(--alert-glow)";
          btn.style.borderColor = "var(--alert-glow)";
        }
      });
      rows.forEach(function (row, i) {
        var base = row.getAttribute("data-fname");
        // Step 1: flash encrypting state
        tl.call(function () {
          triggerVisualHorrorSpike();
          var nameEl = row.querySelector(".file-row__name");
          var stateEl = row.querySelector(".file-row__state");
          // Brief encrypting flash
          row.classList.add("is-encrypting");
          nameEl.textContent = "ENCRYPTING...";
          stateEl.textContent = "⚠";
        }, null, i * 0.45);
        // Step 2: rename to .fun after brief flash
        tl.call(function () {
          var nameEl = row.querySelector(".file-row__name");
          var stateEl = row.querySelector(".file-row__state");
          row.classList.remove("is-encrypting");
          row.classList.add("is-encrypted");
          nameEl.textContent = base + ".fun";
          stateEl.textContent = "encrypted";
        }, null, i * 0.45 + 0.3);
      });
    });
  })();

  // Exhibit 10 Recovery
  ScrollTrigger.create({
    trigger: "#recoveryDemo",
    start: "top 75%",
    once: true,
    onEnter: function () {
      var rows = gsap.utils.toArray("#recoveryDemo .file-row");
      var counter = document.getElementById("recoveryCount");
      var tl = gsap.timeline();
      rows.forEach(function (row, i) {
        tl.call(function () {
          row.classList.add("is-recovered");
          counter.textContent = String(i + 1);
        }, null, i * 0.3);
      });
    }
  });

  // Closing Stamp & Final Horror Unwind
  ScrollTrigger.create({
    trigger: "#closingStamp",
    start: "top 80%",
    once: true,
    onEnter: function () {
      gsap.fromTo("#closingStamp",
        { opacity: 0, scale: 1.6, rotate: -3 },
        { opacity: 1, scale: 1, rotate: -3, duration: 0.4, ease: "back.out(2.2)" }
      );
      gsap.to("#closingSubstamp", { opacity: 1, duration: 1, delay: 0.6 });
    }
  });

})();
