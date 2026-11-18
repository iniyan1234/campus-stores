(() => {
  const storageKey = "campus-stores.shift.v2";
  const root = document.getElementById("campus-stores");
  const q = (selector) => root.querySelector(selector);
  const requests = [
    {
      id: "RQ-214",
      club: "Film Society",
      event: "Courtyard screening",
      owner: "Isha Rao",
      due: "Fri 8 pm",
      items: ["HDMI projector", "Portable speaker", "USB-C → HDMI adapter"],
      note: "Playback is from a USB-C-only laptop. The host will collect at 4 pm.",
    },
    {
      id: "RQ-209",
      club: "Debate Union",
      event: "Finals rehearsal",
      owner: "Tara Shah",
      due: "Sat 10 am",
      items: ["Wireless microphone"],
      note: "Rehearsal runs into the evening.",
    },
    {
      id: "RQ-217",
      club: "Photo Circle",
      event: "Street portrait walk",
      owner: "Dev Menon",
      due: "Sat noon",
      items: ["Digital camera"],
      note: "Collection on Saturday morning.",
    },
  ];
  const assets = [
    { id: "PR-04", type: "HDMI projector", model: "BenQ MH550", bin: "A2" },
    {
      id: "PR-06",
      type: "HDMI projector",
      model: "Epson EB-X49",
      bin: "Workshop",
      repair: true,
    },
    { id: "SP-02", type: "Portable speaker", model: "JBL Eon One", bin: "B1" },
    { id: "SP-05", type: "Portable speaker", model: "Bose S1", bin: "B2" },
    {
      id: "AD-12",
      type: "USB-C → HDMI adapter",
      model: "Belkin AVC002",
      bin: "C4",
    },
    {
      id: "AD-15",
      type: "USB-C → HDMI adapter",
      model: "Anker A8312",
      bin: "C4",
    },
    { id: "MI-09", type: "Wireless microphone", model: "Shure BLX", bin: "B3" },
    { id: "CA-03", type: "Digital camera", model: "Sony A6400", bin: "D2" },
  ];
  const people = [
    "Isha Rao",
    "Kabir Sen",
    "Leela Das",
    "Tara Shah",
    "Dev Menon",
  ];
  // CHANGE: minutes since Friday 00:00, so the register can tell what is overdue.
  const dueOptions = ["Fri 8 pm", "Sat 9 am", "Sat 10 am", "Sat noon"];
  const minutes = {
    "Fri 8 pm": 20 * 60,
    "Sat 9 am": 24 * 60 + 9 * 60,
    "Sat 10 am": 24 * 60 + 10 * 60,
    "Sat noon": 24 * 60 + 12 * 60,
  };
  const shifts = [
    {
      time: "Friday · 3:45 pm",
      at: 15 * 60 + 45,
      title: "Pickup at the counter",
      text: "Kabir is here for the Film Society screening. The film starts at four. Can he leave with everything he needs?",
      next: "Move to return time",
    },
    {
      time: "Friday · 7:30 pm",
      at: 19 * 60 + 30,
      title: "The kit comes back in pieces",
      text: "Kabir has brought back the projector and speaker. “Leela still has the adapter. She’ll drop it off tomorrow at nine.” Take the return and hand over to the morning shift.",
      next: "Move to next morning",
    },
    {
      time: "Saturday · 9:00 am",
      at: 24 * 60 + 9 * 60,
      title: "Morning shift",
      text: "You’ve just taken over. Leela walks in with an adapter. Work out what was outstanding from the screening and close the loan for the right item.",
    },
  ];
  const pages = [
    ["Requests", "clipboard-list"],
    ["Inventory", "package"],
    ["Loan register", "book-open"],
    ["Desk book", "messages-square"],
  ];
  const original = () => ({
    version: 1,
    tab: "Requests",
    phase: 0,
    selected: "",
    filter: "All items",
    loans: [
      {
        num: 401,
        req: "RQ-209",
        asset: "MI-09",
        who: "Tara Shah",
        due: "Sat 10 am",
        holder: "Tara Shah", // CHANGE: who has the unit right now
        expected: "Sat 10 am", // CHANGE: when it is expected back
        back: false,
      },
    ],
    notes: [],
    editing: false,
    returning: 0, // CHANGE: slip number being returned, 0 = none
    returnMode: "", // CHANGE: "" | "here" | "out"
    onlyOpen: true,
    notice: "Sample shift · All records are fictional.",
  });
  let s = original();
  const getAsset = (id) => assets.find((x) => x.id === id);
  const getReq = (id) => requests.find((x) => x.id === id);
  const out = (id) => s.loans.find((l) => l.asset === id && !l.back);
  // CHANGE: a slip is overdue when its expected time is before the desk clock.
  const isLate = (l) => !l.back && minutes[l.expected] < shifts[s.phase].at;
  const esc = (x) =>
    String(x).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const opts = (list) =>
    list
      .map(([v, t]) => '<option value="' + esc(v) + '">' + esc(t) + "</option>")
      .join("");
  const btn = (label, act, val = "", style = "") =>
    '<button type="button" data-action="' +
    act +
    '" data-val="' +
    esc(val) +
    '" class="' +
    style +
    '">' +
    esc(label) +
    "</button>";
  const head = (title, sub, control = "") =>
    '<div class="sectionhead"><div><h2>' +
    title +
    "</h2><small>" +
    sub +
    "</small></div>" +
    control +
    "</div>";
  const row = (label, sub, right) =>
    '<div class="row"><div><strong>' +
    esc(label) +
    "</strong><small>" +
    esc(sub) +
    "</small></div><div>" +
    right +
    "</div></div>";
  const badge = (t, good = false) =>
    '<span class="tag' + (good ? " good" : "") + '">' + esc(t) + "</span>";
  const select = (label, key, options) =>
    "<label><span>" +
    label +
    '</span><select name="' +
    key +
    '" required><option value="">Select…</option>' +
    opts(options) +
    "</select></label>";

  // CHANGE: where is each approved item right now?
  function requestStatus(r) {
    return r.items.map((type) => {
      const slips = s.loans.filter(
        (l) => l.req === r.id && getAsset(l.asset).type === type,
      );
      return {
        type,
        open: slips.find((l) => !l.back),
        done: slips.find((l) => l.back),
      };
    });
  }
  function statusText(x) {
    if (x.open) {
      const l = x.open;
      return (
        "Out · " +
        l.asset +
        " with " +
        l.holder +
        " · expected " +
        l.expected +
        (isLate(l) ? " · overdue" : "")
      );
    }
    return x.done ? "Returned · " + x.done.asset : "Not issued yet";
  }
  function summary(r) {
    const lines = requestStatus(r);
    if (!lines.some((x) => x.open || x.done)) return "";
    const back = lines.filter((x) => !x.open && x.done).length;
    const still = lines.filter((x) => x.open).length;
    return (
      back +
      " of " +
      lines.length +
      " returned" +
      (still ? " · " + still + " still out" : "")
    );
  }

  function requestPage() {
    let html = head(
      "Approved requests",
      "Student Activities Office · 3 approved forms",
    );
    if (s.selected) {
      const r = getReq(s.selected);
      html +=
        btn("Back to list", "close") +
        '<div class="record"><small>' +
        r.id +
        " · Approved</small><h3>" +
        r.event +
        "</h3><p>" +
        r.club +
        " · Filed by " +
        r.owner +
        "</p><p><b>Return by</b> " +
        r.due +
        "</p><p><b>Approved equipment</b></p><ul>" +
        r.items.map((x) => "<li>" + x + "</li>").join("") +
        "</ul><p>" +
        r.note +
        "</p><p><b>Where it is now</b>" +
        (summary(r) ? " · " + esc(summary(r)) : "") +
        "</p><ul>" +
        requestStatus(r)
          .map(
            (x) =>
              "<li>" + esc(x.type) + ": " + esc(statusText(x)) + "</li>",
          )
          .join("") +
        "</ul></div>";
    } else
      html += requests
        .map((r) =>
          row(
            r.event,
            r.id + " · " + r.club + (summary(r) ? " · " + summary(r) : ""),
            btn("View form", "request", r.id),
          ),
        )
        .join("");
    return html;
  }
  function inventory() {
    let html = head(
      "Inventory",
      "Physical units · home shelf and current availability",
    );
    html +=
      '<div class="buttons"><label>Show <select data-filter>' +
      opts(
        ["All items", "On shelf", "On loan", "In repair"].map((f) => [f, f]),
      ) +
      "</select></label></div>";
    for (const a of assets) {
      const loan = out(a.id);
      const status = a.repair ? "In repair" : loan ? "On loan" : "On shelf";
      if (s.filter !== "All items" && s.filter !== status) continue;
      html += row(
        a.id + " · " + a.type,
        a.model +
          " · " +
          a.bin +
          (loan ? " · With " + loan.holder + ", expected " + loan.expected : ""),
        badge(status, status === "On shelf"),
      );
    }
    return html;
  }

  // CHANGE: returning a unit now asks where it is, instead of closing in one click.
  function returnPanel() {
    const l = s.loans.find((x) => x.num === s.returning);
    const unit = getAsset(l.asset);
    const same = assets.filter((a) => a.type === unit.type && !a.repair);
    let html = head(
      "Record return",
      esc(
        "Slip L-" +
          l.num +
          " · " +
          unit.type +
          " · issued as " +
          l.asset +
          " to " +
          l.who +
          " · now with " +
          l.holder,
      ),
      btn("Cancel", "cancelReturn"),
    );
    html +=
      "<p>Where is this unit right now?</p>" +
      '<div class="buttons">' +
      [
        ["here", "It is at the desk"],
        ["out", "Still out with someone"],
      ]
        .map(
          ([m, t]) =>
            '<button type="button" data-action="mode" data-val="' +
            m +
            '" aria-pressed="' +
            (s.returnMode === m) +
            '">' +
            t +
            "</button>",
        )
        .join("") +
      "</div>";
    if (s.returnMode === "here")
      html +=
        '<form data-confirm><div class="form">' +
        select(
          "Unit label on the item in front of you",
          "unit",
          same.map((a) => [a.id, a.id + " · " + a.model + " · " + a.bin]),
        ) +
        '</div><button type="submit" class="primary">Close slip L-' +
        l.num +
        "</button></form>";
    if (s.returnMode === "out")
      html +=
        '<form data-handoff><div class="form">' +
        select(
          "Currently with",
          "holder",
          people.map((p) => [p, p]),
        ) +
        select(
          "Expected back",
          "expected",
          dueOptions.map((d) => [d, d]),
        ) +
        '</div><button type="submit" class="primary">Keep slip L-' +
        l.num +
        " open</button></form>";
    return html;
  }

  function register() {
    if (s.returning) return returnPanel();
    let html = head(
      "Loan register",
      "One slip per physical unit",
      s.editing
        ? btn("Cancel", "cancel")
        : btn("New issue slip", "new", "", "primary"),
    );
    if (s.editing) {
      const available = assets.filter((a) => !a.repair && !out(a.id));
      return (
        html +
        '<form data-issue><div class="form">' +
        select(
          "Approved request",
          "req",
          requests.map((r) => [r.id, r.id + " · " + r.club]),
        ) +
        select(
          "Unit leaving the desk",
          "asset",
          available.map((a) => [a.id, a.id + " · " + a.type]),
        ) +
        select(
          "Collected by",
          "who",
          people.map((p) => [p, p]),
        ) +
        select(
          "Return by",
          "due",
          dueOptions.map((d) => [d, d]),
        ) +
        '</div><button type="submit" class="primary">Save issue slip</button></form>'
      );
    }
    html +=
      '<div class="buttons">' +
      ["Outstanding", "All slips"]
        .map(
          (v, i) =>
            '<button type="button" data-action="scope" data-val="' +
            i +
            '" aria-pressed="' +
            (s.onlyOpen === (i === 0)) +
            '">' +
            v +
            "</button>",
        )
        .join("") +
      "</div>";
    const shown = s.loans
      .filter((l) => !s.onlyOpen || !l.back)
      .slice()
      .reverse();
    if (!shown.length) html += "<p>No outstanding slips.</p>";
    for (const l of shown)
      html += row(
        "L-" + l.num + " · " + l.asset + " · " + getAsset(l.asset).type,
        l.req +
          " · " +
          (l.back
            ? "Collected by " + l.who
            : "With " +
              l.holder +
              " · Expected " +
              l.expected +
              (l.expected !== l.due ? " (was " + l.due + ")" : "")),
        l.back
          ? badge("Returned")
          : (isLate(l) ? badge("Overdue") + " " : "") +
              btn("Record return", "return", String(l.num)),
      );
    return html;
  }
  function deskbook() {
    let html = head(
      "Desk book",
      "Messages from clubs and notes for the next shift",
    );
    const entries = [
      [
        "Friday · 3:20 pm",
        "Isha Rao · Film Society",
        "Kabir Sen is picking up our whole screening kit. Please issue it in his name. I’m setting up in the courtyard.",
      ],
      [
        "Friday · 3:30 pm",
        "Tara Shah · Debate Union",
        "Our microphone stays with me overnight. I’ll return it by 10 am Saturday.",
      ],
    ];
    if (s.phase >= 1)
      entries.push([
        "Friday · 7:30 pm",
        "Kabir Sen · Film Society",
        "I brought the projector and speaker. Leela Das has our adapter. She’ll be at the counter at 9 am tomorrow.",
      ]);
    for (const n of s.notes)
      entries.push([shifts[n.phase].time, "Counter handover", n.text]);
    for (const [t, author, body] of entries.slice().reverse())
      html +=
        '<article class="record"><small>' +
        esc(t) +
        "</small><h3>" +
        esc(author) +
        "</h3><p>" +
        esc(body) +
        "</p></article>";
    return (
      html +
      '<form data-note><div class="form"><label class="full"><span>Note for the next shift</span><textarea name="note" rows="2" maxlength="400" required></textarea></label></div><button type="submit">Add handover note</button></form>'
    );
  }
  const screens = {
    Requests: requestPage,
    Inventory: inventory,
    "Loan register": register,
    "Desk book": deskbook,
  };
  function paint() {
    const phase = shifts[s.phase];
    q("[data-clock]").textContent = phase.time;
    q("[data-shift-title]").textContent = phase.title;
    q("[data-shift]").textContent = phase.text;
    const advance = q('[data-action="advance"]');
    advance.hidden = !phase.next;
    advance.textContent = phase.next || "";
    q("[data-nav]").innerHTML = pages
      .map(
        ([n, icon]) =>
          '<button type="button" data-action="tab" data-val="' +
          n +
          '" aria-pressed="' +
          (s.tab === n) +
          '"><svg aria-hidden="true" class="store-icon"><use href="#icon-' +
          icon +
          '"></use></svg>' +
          n +
          "</button>",
      )
      .join("");
    q("[data-page]").innerHTML = screens[s.tab]();
    if (q("[data-filter]")) q("[data-filter]").value = s.filter;
    q("[data-status]").textContent = s.notice;
  }
  function commit(msg) {
    if (msg) s.notice = msg;
    paint();
    try {
      localStorage.setItem(storageKey, JSON.stringify(s));
    } catch {
      q("[data-status]").textContent +=
        " Browser storage is unavailable. Progress lasts for this visit.";
    }
  }
  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    const v = b.dataset.val;
    switch (b.dataset.action) {
      case "restart":
        s = original();
        break;
      case "advance":
        if (s.phase < 2) s.phase++;
        s.notice = "Shift time updated.";
        break;
      case "tab":
        s.tab = v;
        s.editing = false;
        s.returning = 0;
        s.returnMode = "";
        break;
      case "close":
        s.selected = "";
        break;
      case "request":
        s.selected = v;
        break;
      case "new":
        s.editing = true;
        break;
      case "cancel":
        s.editing = false;
        break;
      case "scope":
        s.onlyOpen = v === "0";
        break;
      case "return": {
        // CHANGE: open the return panel instead of closing the slip at once.
        const l = s.loans.find((l) => l.num === Number(v));
        if (!l || l.back) return;
        s.returning = l.num;
        s.returnMode = "";
        break;
      }
      case "mode":
        s.returnMode = v;
        break;
      case "cancelReturn":
        s.returning = 0;
        s.returnMode = "";
        break;
    }
    commit();
  });
  root.addEventListener("change", (e) => {
    if (e.target.matches("[data-filter]")) {
      s.filter = e.target.value;
      commit();
    }
  });
  root.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target;
    const form = new FormData(f);
    if (f.matches("[data-note]")) {
      const text = String(form.get("note")).trim();
      if (!text) return;
      s.notes.push({ phase: s.phase, text });
      commit("Handover note saved.");
      return;
    }
    if (f.matches("[data-confirm]")) {
      const l = s.loans.find((x) => x.num === s.returning);
      if (!l || l.back) return;
      const label = String(form.get("unit"));
      if (label !== l.asset) {
        const other = out(label);
        q("[data-status]").textContent =
          "That label reads " +
          label +
          ", but slip L-" +
          l.num +
          " is for " +
          l.asset +
          "." +
          (other
            ? " " +
              label +
              " is on slip L-" +
              other.num +
              " with " +
              other.holder +
              ", so check which unit you are holding."
            : " Check the label, or close the slip that matches it.");
        return;
      }
      l.back = true;
      s.returning = 0;
      s.returnMode = "";
      commit(l.asset + " returned to stock. Slip L-" + l.num + " closed.");
      return;
    }
    if (f.matches("[data-handoff]")) {
      const l = s.loans.find((x) => x.num === s.returning);
      const holder = String(form.get("holder"));
      const expected = String(form.get("expected"));
      if (!l || l.back || !people.includes(holder) || !(expected in minutes))
        return;
      l.holder = holder;
      l.expected = expected;
      s.returning = 0;
      s.returnMode = "";
      commit(
        "Slip L-" +
          l.num +
          " stays open: " +
          l.asset +
          " is with " +
          holder +
          ", expected " +
          expected +
          ".",
      );
      return;
    }
    if (!f.matches("[data-issue]")) return;
    const [req, asset, who, due] = ["req", "asset", "who", "due"].map((k) =>
      form.get(k),
    );
    const unit = getAsset(asset),
      r = getReq(req);
    if (!r || !unit || unit.repair || out(asset) || !people.includes(who))
      return;
    if (!r.items.includes(unit.type)) {
      q("[data-status]").textContent =
        "This equipment type is outside the approved request. Choose an approved unit.";
      return;
    }
    if (
      s.loans.some(
        (l) => l.req === req && !l.back && getAsset(l.asset).type === unit.type,
      )
    ) {
      q("[data-status]").textContent =
        "The approved quantity of this equipment type is already on loan.";
      return;
    }
    const num = Math.max(...s.loans.map((l) => l.num)) + 1;
    s.loans.push({
      num,
      req,
      asset,
      who,
      due,
      holder: who,
      expected: due,
      back: false,
    });
    s.editing = false;
    commit("Issued " + asset + " to " + who + " on slip L-" + num + ".");
  });
  function restore(d) {
    if (
      !d ||
      d.version !== 1 ||
      !Object.hasOwn(screens, d.tab) ||
      !shifts[d.phase] ||
      (d.selected && !getReq(d.selected)) ||
      !Array.isArray(d.notes) ||
      !d.notes.every(
        (n) => n && shifts[n.phase] && typeof n.text === "string",
      ) ||
      !Array.isArray(d.loans) ||
      !d.loans.length ||
      !d.loans.every(
        (l) =>
          l && getReq(l.req) && getAsset(l.asset) && Number.isInteger(l.num),
      )
    )
      return;
    s = {
      ...original(),
      ...d,
      // Older saves have no holder or expected fields, so fall back to the issue slip values.
      loans: d.loans.map((l) => ({ holder: l.who, expected: l.due, ...l })),
      notes: d.notes.map((n) => ({ ...n })),
      returning: 0,
      returnMode: "",
    };
    paint();
  }
  paint();
  try {
    restore(JSON.parse(localStorage.getItem(storageKey)));
  } catch {
    // Keep the fresh shift when storage is unavailable or the saved data is invalid.
  }
})();
