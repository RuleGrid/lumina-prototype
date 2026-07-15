/* Lumina prototype interactions
   - mobile nav
   - wine shelf arrows
   - SamiAI chat (keyword demo, no backend)
   - Wine Tree + subscription overlays
*/

(function () {
  "use strict";

  /* ---------- locale ---------- */

  var LANG = document.documentElement.lang === "uk" ? "uk" : "en";

  var STRINGS = {
    en: {
      pour: function (wine) {
        return "Got it. I'd pour you " + wine.name + " from " + wine.origin.split(" · ")[0] + ". " + wine.pitch;
      },
      winemaker: "Winemaker",
      buy: "Buy this can",
      subscribe: "Subscribe",
      added: function (wine) {
        return "Added " + wine.name + " to your order. (Prototype: checkout comes later.)";
      },
      vineReserved: function (value) {
        return "Reserved: " + value + ". Your winemaker's first video arrives this month. (Prototype)";
      },
      subscribed: function (plan) {
        return "Subscribed to " + plan + ". First box ships Friday. (Prototype: no payment taken.)";
      }
    },
    uk: {
      pour: function (wine) {
        return "Зрозуміло. Я б налив тобі " + wine.name + " з країни: " + wine.origin.split(" · ")[0] + ". " + wine.pitch;
      },
      winemaker: "Винороб",
      buy: "Купити цю банку",
      subscribe: "Підписатися",
      added: function (wine) {
        return "Додано " + wine.name + " до замовлення. (Прототип: оплата з'явиться пізніше.)";
      },
      vineReserved: function (value) {
        return "Зарезервовано: " + value + ". Перше відео від винороба прийде цього місяця. (Прототип)";
      },
      subscribed: function (plan) {
        return "Підписка оформлена: " + plan + ". Перша коробка їде в п'ятницю. (Прототип: без оплати.)";
      }
    }
  };

  var T = STRINGS[LANG];

  /* ---------- wines data for SamiAI ---------- */
  /* keys include English and Ukrainian stems so chat works in both */

  var WINES_RAW = [
    {
      name: "Gold Fizz", color: "#F0C75E", maker: { en: "Marco Rossi", uk: "Марко Россі" },
      origin: { en: "Italy · Prosecco", uk: "Італія · Просекко" },
      pitch: {
        en: "Bubbles for dancing. Soft pear, easy toast.",
        uk: "Просекко, з якого починаються танці. Груша, бульбашки і жодного приводу чекати."
      },
      keys: ["bubbl", "sparkl", "fizz", "party", "birthday", "toast", "celebrat", "dance", "prosecco", "italy",
             "ігрист", "бульбаш", "вечірк", "день народж", "тост", "танц", "просекко", "італ", "свят"]
    },
    {
      name: "Green Pulse", color: "#1E5C46", maker: { en: "Javier Morales", uk: "Хав'єр Моралес" },
      origin: { en: "Spain · Albariño", uk: "Іспанія · Альбаріньо" },
      pitch: {
        en: "Salt-kissed white, built for hot roofs and late arrivals.",
        uk: "Біле, що пахне морем. Для спекотного даху і друзів, які завжди спізнюються."
      },
      keys: ["white", "fresh", "crisp", "roof", "hot", "summer", "spain", "light",
             "біле", "біл", "свіж", "дах", "спек", "літо", "іспан", "легк"]
    },
    {
      name: "Island Light", color: "#3AA9D6", maker: { en: "Nikos Papadopoulos", uk: "Нікос Пападопулос" },
      origin: { en: "Greece · Assyrtiko", uk: "Греція · Ассіртіко" },
      pitch: {
        en: "Sea-breeze citrus. The beach hero's can.",
        uk: "Сонце Егейського моря в алюмінії. Бери на пляж — келих не потрібен."
      },
      keys: ["beach", "sea", "island", "citrus", "greece", "swim", "boat", "sun",
             "пляж", "море", "острів", "цитрус", "грец", "плав", "човен", "сонц"]
    },
    {
      name: "Amber Night", color: "#8B1E3F", maker: { en: "Nino Beridze", uk: "Ніно Берідзе" },
      origin: { en: "Georgia · Saperavi", uk: "Грузія · Сапераві" },
      pitch: {
        en: "Where wine began. Deep, spicy, made for long tables.",
        uk: "Сапераві з батьківщини вина. Глибоке, пряне, для розмов до ранку."
      },
      keys: ["deep", "spicy", "dinner", "night", "georgia", "history", "bold", "table", "meat",
             "глибок", "прян", "гостр", "вечер", "ніч", "груз", "історі", "стіл", "м'яс"]
    },
    {
      name: "Coast Line", color: "#C0392B", maker: { en: "Sofia Martinez", uk: "Софія Мартінес" },
      origin: { en: "California · Pinot Noir", uk: "Каліфорнія · Піно Нуар" },
      pitch: {
        en: "Light-bodied red with golden-hour ease. Never takes itself seriously.",
        uk: "Каліфорнійське легке червоне кольору заходу сонця. Несерйозне — і цим прекрасне."
      },
      keys: ["light red", "pinot", "sunset", "california", "golden", "picnic", "brunch", "easy red",
             "легке червоне", "піно", "захід", "каліфорн", "золот", "бранч"]
    },
    {
      name: "Sunset Crush", color: "#C97A2E", maker: { en: "Claire Dubois", uk: "Клер Дюбуа" },
      origin: { en: "France · Gamay", uk: "Франція · Гаме" },
      pitch: {
        en: "Bright cherry, low drama. Party red that stays light on its feet.",
        uk: "Червоне без пафосу: яскрава вишня, легкі ноги, гучна музика."
      },
      keys: ["red", "cherry", "france", "chill", "cozy", "movie", "friends",
             "червон", "вишн", "франц", "чіл", "затишн", "кіно", "друз"]
    },
    {
      name: "River Fizz", color: "#7C8F3A", maker: { en: "João Ferreira", uk: "Жуан Феррейра" },
      origin: { en: "Portugal · Vinho Verde", uk: "Португалія · Віньйо Верде" },
      pitch: {
        en: "A little gas, a lot of picnic energy.",
        uk: "Грає бульбашками, як річка на порогах. Народжене для пікніків."
      },
      keys: ["picnic", "gas", "petillant", "portugal", "park", "day", "lunch", "green",
             "пікнік", "газ", "португал", "парк", "день", "обід", "зелен"]
    },
    {
      name: "High Altitude", color: "#4A2E68", maker: { en: "Lucía Mendoza", uk: "Лусія Мендоса" },
      origin: { en: "Argentina · Malbec", uk: "Аргентина · Мальбек" },
      pitch: {
        en: "Plush and dark. For wins that deserve a real pour.",
        uk: "Мальбек з гір Мендоси. Для перемог — великих і не дуже."
      },
      keys: ["win", "victory", "malbec", "argentina", "dark", "steak", "big", "promotion", "finish",
             "перемог", "виграв", "мальбек", "аргентин", "темн", "стейк", "фініш", "підвищ"]
    },
    {
      name: "Steppe Spark", color: "#223A63", maker: { en: "Oleh Kovalenko", uk: "Олег Коваленко" },
      origin: { en: "Ukraine · Odessa Black", uk: "Україна · Одеса Блек" },
      pitch: {
        en: "Sparkling red, crisp and electric under a wide-open sky.",
        uk: "Іскристе червоне з-під широкого степового неба. Хрустке, як перший мороз."
      },
      keys: ["odessa black", "sparkling red", "ukraine", "electric", "crisp", "cold", "fridge", "spark",
             "одеса блек", "іскристе червоне", "україн", "електрич", "хрустк", "холодн", "холодильник", "іскр"]
    },
    {
      name: "Wild Cape", color: "#E4D8BC", maker: { en: "Thandi Mbeki", uk: "Танді Мбекі" },
      origin: { en: "South Africa · Chenin Blanc", uk: "ПАР · Шенен Блан" },
      pitch: {
        en: "Sun-ripe orchard fruit with a wild edge.",
        uk: "Шенен блан з краю світу. Стиглий фрукт із диким характером."
      },
      keys: ["africa", "chenin", "wild", "adventure", "fruit", "orchard", "new", "surprise",
             "африк", "шенен", "дик", "пригод", "фрукт", "сад", "нов", "сюрприз"]
    }
  ];

  var WINES = WINES_RAW.map(function (w) {
    return {
      name: w.name,
      color: w.color,
      maker: w.maker[LANG],
      origin: w.origin[LANG],
      pitch: w.pitch[LANG],
      keys: w.keys
    };
  });

  /* ---------- helpers ---------- */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function openOverlay(el) {
    el.hidden = false;
    document.body.style.overflow = "hidden";
    var focusable = el.querySelector("input, button:not([aria-label='Close'])");
    if (focusable) focusable.focus();
  }

  function closeOverlay(el) {
    el.hidden = true;
    document.body.style.overflow = "";
  }

  function wireOverlayDismiss(overlay, closeBtnSel) {
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeOverlay(overlay);
    });
    $all(closeBtnSel, overlay).forEach(function (btn) {
      btn.addEventListener("click", function () { closeOverlay(overlay); });
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    $all(".overlay").forEach(function (ov) {
      if (!ov.hidden) closeOverlay(ov);
    });
  });

  /* ---------- mobile nav ---------- */

  var navToggle = $("[data-nav-toggle]");
  var nav = $("[data-nav]");

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.matches("a, button")) {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- wine shelf: infinite, auto-playing, smooth carousel ---------- */

  var shelf = $("[data-shelf]");
  var prevBtn = $("[data-shelf-prev]");
  var nextBtn = $("[data-shelf-next]");

  if (shelf) {
    var originalCards = Array.prototype.slice.call(shelf.children);
    var setCount = originalCards.length;

    if (setCount > 0) {
      var cloneSet = function () {
        return originalCards.map(function (card) {
          var clone = card.cloneNode(true);
          clone.setAttribute("aria-hidden", "true");
          clone.setAttribute("tabindex", "-1");
          return clone;
        });
      };

      cloneSet().forEach(function (c) { shelf.insertBefore(c, shelf.firstChild); });
      cloneSet().forEach(function (c) { shelf.appendChild(c); });

      var allCards = Array.prototype.slice.call(shelf.children);
      var firstOriginalIdx = setCount;
      var lastOriginalIdx = setCount * 2 - 1;
      var setWidth = 0;

      var measure = function () {
        var firstOriginal = allCards[firstOriginalIdx];
        var firstAfterClone = allCards[lastOriginalIdx + 1];
        setWidth = firstAfterClone.offsetLeft - firstOriginal.offsetLeft;
      };

      measure();
      shelf.scrollLeft = allCards[firstOriginalIdx].offsetLeft;

      var wrap = function () {
        if (setWidth <= 0) return;
        var firstOriginalLeft = allCards[firstOriginalIdx].offsetLeft;
        var guard = 0;
        while (shelf.scrollLeft >= firstOriginalLeft + setWidth - 2 && guard++ < 20) {
          shelf.scrollLeft -= setWidth;
        }
        guard = 0;
        while (shelf.scrollLeft <= firstOriginalLeft - setWidth + 2 && guard++ < 20) {
          shelf.scrollLeft += setWidth;
        }
      };

      var resizeTimer = null;
      window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
          measure();
          wrap();
        }, 150);
      });

      /* -------- gentle autoplay marquee -------- */

      var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var AUTOPLAY_SPEED = 0.55; // px per animation frame
      var autoplayOn = !reduceMotion;
      var resumeTimer = null;

      var pauseAutoplay = function () {
        autoplayOn = false;
        if (resumeTimer) { clearTimeout(resumeTimer); resumeTimer = null; }
      };
      var scheduleResume = function (delay) {
        if (reduceMotion) return;
        if (resumeTimer) clearTimeout(resumeTimer);
        resumeTimer = setTimeout(function () { autoplayOn = true; }, delay || 1500);
      };

      var tick = function () {
        if (autoplayOn && !document.hidden) {
          shelf.scrollLeft += AUTOPLAY_SPEED;
          wrap();
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);

      shelf.addEventListener("mouseenter", pauseAutoplay);
      shelf.addEventListener("mouseleave", function () { scheduleResume(500); });
      shelf.addEventListener("focusin", pauseAutoplay);
      shelf.addEventListener("focusout", function () { scheduleResume(500); });
      shelf.addEventListener("scroll", wrap, { passive: true });

      /* -------- eased smooth-scroll for the arrow buttons -------- */

      var arrowAnimId = null;
      var easeInOutCubic = function (t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };
      var smoothScrollBy = function (delta) {
        pauseAutoplay();
        if (arrowAnimId) cancelAnimationFrame(arrowAnimId);
        var from = shelf.scrollLeft;
        var duration = 560;
        var startTime = null;
        var frame = function (ts) {
          if (startTime === null) startTime = ts;
          var progress = Math.min((ts - startTime) / duration, 1);
          shelf.scrollLeft = from + delta * easeInOutCubic(progress);
          wrap();
          if (progress < 1) {
            arrowAnimId = requestAnimationFrame(frame);
          } else {
            scheduleResume(1400);
          }
        };
        arrowAnimId = requestAnimationFrame(frame);
      };

      if (prevBtn && nextBtn) {
        var stepSize = function () { return Math.round(shelf.clientWidth * 0.7); };
        prevBtn.addEventListener("click", function () { smoothScrollBy(-stepSize()); });
        nextBtn.addEventListener("click", function () { smoothScrollBy(stepSize()); });
      }

      /* -------- drag-to-scroll with momentum -------- */

      var dragging = false;
      var startX = 0;
      var startScroll = 0;
      var lastX = 0;
      var velocity = 0;
      var momentumId = null;

      var stopMomentum = function () {
        if (momentumId) { cancelAnimationFrame(momentumId); momentumId = null; }
      };

      var momentum = function () {
        if (Math.abs(velocity) < 0.4) {
          shelf.classList.remove("is-dragging");
          scheduleResume(1200);
          return;
        }
        shelf.scrollLeft -= velocity;
        wrap();
        velocity *= 0.94;
        momentumId = requestAnimationFrame(momentum);
      };

      shelf.addEventListener("pointerdown", function (e) {
        pauseAutoplay();
        if (e.pointerType !== "mouse") return; // touch already has native momentum
        dragging = true;
        startX = e.clientX;
        lastX = e.clientX;
        startScroll = shelf.scrollLeft;
        velocity = 0;
        stopMomentum();
        shelf.setPointerCapture(e.pointerId);
      });

      shelf.addEventListener("pointermove", function (e) {
        if (!dragging) return;
        var dx = e.clientX - startX;
        if (Math.abs(dx) > 4) shelf.classList.add("is-dragging");
        shelf.scrollLeft = startScroll - dx;
        wrap();
        velocity = e.clientX - lastX;
        lastX = e.clientX;
      });

      var endDrag = function () {
        if (!dragging) return;
        dragging = false;
        if (shelf.classList.contains("is-dragging")) {
          momentum();
        } else {
          scheduleResume(1000);
        }
      };

      shelf.addEventListener("pointerup", endDrag);
      shelf.addEventListener("pointercancel", endDrag);
    }
  }

  /* ---------- SamiAI ---------- */

  var samiOverlay = $("[data-overlay]");
  var chat = $("[data-chat]");
  var chatForm = $("[data-chat-form]");
  var reco = $("[data-chat-reco]");

  $all("[data-open-samiklie]").forEach(function (btn) {
    btn.addEventListener("click", function () { openOverlay(samiOverlay); });
  });
  wireOverlayDismiss(samiOverlay, "[data-close-overlay]");

  function addBubble(text, who) {
    var div = document.createElement("div");
    div.className = "bubble bubble--" + who;
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
  }

  function pickWine(message) {
    var msg = message.toLowerCase();
    var best = null;
    var bestScore = 0;
    WINES.forEach(function (wine) {
      var score = 0;
      wine.keys.forEach(function (k) {
        if (msg.indexOf(k) !== -1) score += 1;
      });
      if (score > bestScore) { bestScore = score; best = wine; }
    });
    return best || WINES[Math.floor(Math.random() * WINES.length)];
  }

  function showReco(wine) {
    reco.hidden = false;
    reco.style.setProperty("--reco", wine.color);
    reco.innerHTML =
      "<h3>" + wine.name + "</h3>" +
      "<p class='reco-origin'>" + wine.origin + " · " + T.winemaker + ": " + wine.maker + "</p>" +
      "<p>" + wine.pitch + "</p>" +
      "<div class='reco-actions'>" +
      "<button type='button' class='btn btn--crush btn--small' data-reco-buy>" + T.buy + "</button>" +
      "<button type='button' class='btn btn--ghost btn--small' data-reco-sub>" + T.subscribe + "</button>" +
      "</div>";

    $("[data-reco-buy]", reco).addEventListener("click", function () {
      addBubble(T.added(wine), "bot");
    });
    $("[data-reco-sub]", reco).addEventListener("click", function () {
      closeOverlay(samiOverlay);
      openOverlay(subscribeOverlay);
    });
  }

  if (chatForm) {
    chatForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = $("#chat-input");
      var text = input.value.trim();
      if (!text) return;
      addBubble(text, "user");
      input.value = "";

      var wine = pickWine(text);
      window.setTimeout(function () {
        addBubble(T.pour(wine), "bot");
        showReco(wine);
      }, 450);
    });
  }

  /* ---------- Wine Tree overlay ---------- */

  var treeOverlay = $("[data-tree-overlay]");

  if (treeOverlay) {
    $all("[data-open-tree]").forEach(function (btn) {
      btn.addEventListener("click", function () { openOverlay(treeOverlay); });
    });
    wireOverlayDismiss(treeOverlay, "[data-close-tree]");

    var confirmVine = $("[data-confirm-vine]");
    if (confirmVine) {
      confirmVine.addEventListener("click", function () {
        var chosen = $("input[name='vine']:checked", treeOverlay);
        $("[data-vine-status]").textContent = T.vineReserved(chosen.value);
      });
    }
  }

  /* ---------- ages timeline: scroll-driven story ---------- */

  var agesScroller = $("[data-ages]");

  if (agesScroller) {
    var steps = $all("[data-age-step]", agesScroller);
    var images = $all("[data-age-img]", agesScroller);
    var dots = $all("[data-age-jump]", agesScroller);
    var activeIndex = -1;

    function setActive(index) {
      if (index === activeIndex) return;
      activeIndex = index;

      images.forEach(function (img) {
        img.classList.toggle("is-active", img.getAttribute("data-age-img") === String(index));
      });
      dots.forEach(function (dot) {
        dot.classList.toggle("is-active", dot.getAttribute("data-age-jump") === String(index));
      });
    }

    // Steps can be short, so pick whichever step's midpoint is closest to the
    // viewport centre on every scroll tick instead of relying on IntersectionObserver
    // (a narrow band can jump straight over a short step during a fast scroll flick).
    var tickPending = false;
    function updateActiveFromScroll() {
      tickPending = false;
      var centerY = window.innerHeight / 2;
      var bestIndex = 0;
      var bestDist = Infinity;
      steps.forEach(function (step, i) {
        var rect = step.getBoundingClientRect();
        var mid = rect.top + rect.height / 2;
        var dist = Math.abs(mid - centerY);
        if (dist < bestDist) {
          bestDist = dist;
          bestIndex = i;
        }
      });
      setActive(bestIndex);
    }
    function onScroll() {
      if (!tickPending) {
        tickPending = true;
        requestAnimationFrame(updateActiveFromScroll);
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    updateActiveFromScroll();

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var idx = Number(dot.getAttribute("data-age-jump"));
        steps[idx].scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });
  }

  /* ---------- Subscription overlay ---------- */

  var subscribeOverlay = $("[data-subscribe-overlay]");

  $all("[data-open-subscribe]").forEach(function (btn) {
    btn.addEventListener("click", function () { openOverlay(subscribeOverlay); });
  });
  wireOverlayDismiss(subscribeOverlay, "[data-close-subscribe]");

  var subscribeForm = $("[data-subscribe-form]");
  if (subscribeForm) {
    subscribeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var plan = $("input[name='plan']:checked", subscribeForm).value;
      $("[data-subscribe-status]").textContent = T.subscribed(plan);
    });
  }
})();
