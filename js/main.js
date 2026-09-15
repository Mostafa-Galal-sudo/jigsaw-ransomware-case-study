/* ==========================================================================
   JIGSAW case study — interactions & scroll storytelling
   Every animation here is either:
     (a) one deliberate orchestrated moment per section, or
     (b) a direct response to a user action (click / hover).
   No blanket "fade everything up" defaults.
   ========================================================================== */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  gsap.registerPlugin(ScrollTrigger);

  /* ------------------------------------------------------------------ *
   * -1. Entrance sequence — plays once, dismissed by timeout or by the
   *     user clicking / pressing a key / scrolling / touching.
   * ------------------------------------------------------------------ */
  (function () {
    var overlay = document.getElementById("entranceOverlay");
    if (!overlay) return;
    document.body.classList.add("entrance-active");
    var dismissed = false;
    function dismiss() {
      if (dismissed) return;
      dismissed = true;
      overlay.classList.add("is-leaving");
      document.body.classList.remove("entrance-active");
      window.removeEventListener("keydown", dismiss);
      window.removeEventListener("wheel", dismiss);
      window.removeEventListener("touchstart", dismiss);
      setTimeout(function () {
        overlay.style.display = "none";
        window.dispatchEvent(new CustomEvent("entrance:dismissed"));
      }, 550);
    }
    overlay.addEventListener("click", dismiss);
    window.addEventListener("keydown", dismiss);
    window.addEventListener("wheel", dismiss, { passive: true });
    window.addEventListener("touchstart", dismiss, { passive: true });
    setTimeout(dismiss, reduceMotion ? 900 : 3400);
  })();

  /* ------------------------------------------------------------------ *
   * 0. Evidence image loading — swap in the fallback slot if the
   *    screenshot hasn't been dropped into /assets/images/ yet.
   * ------------------------------------------------------------------ */
  document.querySelectorAll(".evidence__frame img[data-src]").forEach(function (img) {
    var real = img.getAttribute("data-src");
    var probe = new Image();
    probe.onload = function () {
      img.src = real;
      img.style.display = "block";
    };
    probe.onerror = function () {
      img.style.display = "none";
    };
    probe.src = real;
  });

  /* ------------------------------------------------------------------ *
   * 1. Case thread — one pin per exhibit, lights up as its section
   *    crosses the viewport centre.
   * ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------ *
   * 2. Generic reveal — used sparingly, once per element, not stacked
   *    with hover effects.
   * ------------------------------------------------------------------ */
  gsap.utils.toArray(".reveal").forEach(function (el) {
    gsap.fromTo(el, { opacity: 0, y: 18 }, {
      opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
      scrollTrigger: { trigger: el, start: "top 88%" }
    });
  });

  /* ------------------------------------------------------------------ *
   * 3. Hero — one orchestrated load-in sequence + ambient glitch flicker
   *    Held until the entrance sequence has been dismissed, so the two
   *    don't play on top of each other.
   * ------------------------------------------------------------------ */
  function playHeroIntro() {
    var heroTl = gsap.timeline();
    heroTl
      .from(".hero__eyebrow", { opacity: 0, y: -8, duration: 0.5 })
      .from(".hero__title", { opacity: 0, y: 22, duration: 0.8, ease: "power3.out" }, "-=0.2")
      .from(".hero__subtitle", { opacity: 0, y: 14, duration: 0.6 }, "-=0.35")
      .from(".hero__lead", { opacity: 0, y: 10, duration: 0.6 }, "-=0.3")
      .from(".hero__scroll", { opacity: 0, duration: 0.6 }, "-=0.2")
      .from("#heroMask", { opacity: 0, scale: 1.08, duration: 1.1, ease: "power2.out" }, 0);

    if (!reduceMotion) {
      gsap.to("#heroMask", { rotate: 6, duration: 18, repeat: -1, yoyo: true, ease: "sine.inOut" });
      var title = document.getElementById("heroTitle");
      function glitchPulse() {
        gsap.to(title, {
          duration: 0.09, skewX: 6, textShadow: "3px 0 #a8182f, -3px 0 #49e0c9",
          onComplete: function () {
            gsap.to(title, { duration: 0.12, skewX: 0, textShadow: "none" });
          }
        });
        gsap.delayedCall(4 + Math.random() * 5, glitchPulse);
      }
      gsap.delayedCall(3, glitchPulse);
    }
  }

  if (document.getElementById("entranceOverlay")) {
    window.addEventListener("entrance:dismissed", playHeroIntro, { once: true });
  } else {
    playHeroIntro();
  }

  /* ------------------------------------------------------------------ *
   * 4. Exhibit 02 — terminal strings type/appear in sequence
   * ------------------------------------------------------------------ */
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
    }
  });

  /* ------------------------------------------------------------------ *
   * 5. Exhibit 03 — ransom countdown, ticks down once when in view
   * ------------------------------------------------------------------ */
  ScrollTrigger.create({
    trigger: "#ransomClock",
    start: "top 80%",
    once: true,
    onEnter: function () {
      var s = 59 * 60 + 59;
      var el = document.getElementById("ransomClock");
      var iv = setInterval(function () {
        s -= 37; // dramatic skip, not a literal hour-long timer
        if (s <= 0) { s = 0; clearInterval(iv); }
        var m = Math.floor(s / 60), sec = s % 60;
        el.textContent = (m < 10 ? "0" + m : m) + ":" + (sec < 10 ? "0" + sec : sec);
      }, 90);
    }
  });

  /* ------------------------------------------------------------------ *
   * 6. Exhibit 04 — obfuscated → clean sweep
   * ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------ *
   * 7. Exhibit 05 — execution trail, steps land one after another
   * ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------ *
   * 8. Exhibit 06 — THE signature moment: key/IV type out character by
   *    character with a cipher-cyan glow. This is the one place the
   *    page spends its boldness.
   * ------------------------------------------------------------------ */
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
      var key = document.getElementById("keyValue");
      var iv = document.getElementById("ivValue");
      typeOutKey(key);
      gsap.delayedCall(1.1, function () { typeOutKey(iv); });
      gsap.fromTo("#keyReveal", { filter: "brightness(1)" }, {
        filter: "brightness(1.4)", duration: 0.15, delay: 1.0, yoyo: true, repeat: 1
      });
    }
  });

  /* ------------------------------------------------------------------ *
   * 9. Exhibit 07 — single interactive file: click to encrypt/decrypt
   * ------------------------------------------------------------------ */
  (function () {
    var row = document.getElementById("demoFileRow");
    var name = document.getElementById("demoFileName");
    var state = document.getElementById("demoFileState");
    var encrypted = false;
    function toggle() {
      encrypted = !encrypted;
      gsap.to(row, {
        duration: 0.12, x: encrypted ? 4 : -4, onComplete: function () {
          gsap.to(row, { duration: 0.12, x: 0 });
        }
      });
      row.classList.toggle("is-encrypted", encrypted);
      row.setAttribute("aria-pressed", String(encrypted));
      name.textContent = encrypted ? "document.txt.fun" : "document.txt";
      state.textContent = encrypted ? "encrypted — original deleted" : "click to encrypt";
    }
    row.addEventListener("click", toggle);
    row.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  })();

  /* ------------------------------------------------------------------ *
   * 10. Exhibit 08 — "Run sample" detonates all five decoy files
   * ------------------------------------------------------------------ */
  (function () {
    var btn = document.getElementById("runSampleBtn");
    if (!btn) return;
    var rows = gsap.utils.toArray("#fleetDemo .file-row");
    btn.addEventListener("click", function () {
      btn.disabled = true;
      btn.textContent = "▶ running…";
      var tl = gsap.timeline({
        onComplete: function () {
          btn.textContent = "✓ sample finished — 5 files encrypted";
        }
      });
      rows.forEach(function (row, i) {
        var base = row.getAttribute("data-fname");
        tl.call(function () {
          var nameEl = row.querySelector(".file-row__name");
          var stateEl = row.querySelector(".file-row__state");
          row.classList.add("is-encrypted");
          nameEl.textContent = base + ".fun";
          stateEl.textContent = "encrypted";
        }, null, i * 0.4);
      });
    });
  })();

  /* ------------------------------------------------------------------ *
   * 11. Exhibit 10 — recovery: rows flip to recovered + counter ticks up
   * ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------ *
   * 12. Closing stamp — one deliberate stamp-down moment
   * ------------------------------------------------------------------ */
  ScrollTrigger.create({
    trigger: "#closingStamp",
    start: "top 80%",
    once: true,
    onEnter: function () {
      gsap.fromTo("#closingStamp",
        { opacity: 0, scale: 1.6, rotate: -3 },
        { opacity: 1, scale: 1, rotate: -3, duration: 0.35, ease: "back.out(2.2)" }
      );
    }
  });

})();
