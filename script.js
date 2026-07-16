/* =========================================================
   COS 106 Term Project — Akanni James Student Portfolio
   Shared JavaScript for the "Security Console" redesign.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initHud();
  initNavToggle();
  initTypingEffect();
  initReveal();
  initCounters();
  initSkillFills();
  initProjectFilters();
  initAudioFallback();
  initPlanner();
  initContactForm();
});

const reducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------
   1. Preloader — full boot sequence on first visit this
   session, a quick fade on every page after that.
--------------------------------------------------------- */
function initPreloader() {
  const el = document.querySelector('#preloader');
  if (!el) return;

  const linesEl = el.querySelector('.boot-lines');
  const fillEl = el.querySelector('.boot-fill');
  const pctEl = el.querySelector('.boot-pct');
  const alreadyBooted = sessionStorage.getItem('aj_booted') === '1';

  const finish = () => {
    el.classList.add('hide');
    sessionStorage.setItem('aj_booted', '1');
    setTimeout(() => el.remove(), 600);
  };

  if (reducedMotion()) {
    finish();
    return;
  }

  if (alreadyBooted) {
    // Quick fade only — full reload of a page the visitor already entered.
    setTimeout(finish, 220);
    return;
  }

  const steps = [
    'establishing secure connection...',
    'authenticating user: akanni james',
    'loading portfolio interface...',
    'render complete.',
  ];

  let stepIndex = 0;
  let printed = '';

  function printNextLine() {
    if (stepIndex >= steps.length) return;
    const line = steps[stepIndex];
    const isLast = stepIndex === steps.length - 1;
    printed += (printed ? '\n' : '') + (isLast ? '✔ ' : '$ ') + line;
    linesEl.innerHTML = printed.replace(steps[stepIndex], `<span>${line}</span>`);
    if (isLast) linesEl.classList.add('ok');
    stepIndex++;
    setTimeout(printNextLine, 320);
  }
  printNextLine();

  let pct = 0;
  const progressTimer = setInterval(() => {
    pct += Math.random() * 18 + 6;
    if (pct >= 100) {
      pct = 100;
      clearInterval(progressTimer);
      setTimeout(finish, 300);
    }
    fillEl.style.width = pct + '%';
    pctEl.textContent = Math.floor(pct) + '%';
  }, 180);
}

/* ---------------------------------------------------------
   2. Persistent HUD — top progress bar + live status readout
--------------------------------------------------------- */
function initHud() {
  const bar = document.querySelector('#hudProgress');
  if (bar) {
    const updateBar = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.width = max > 0 ? (scrolled / max) * 100 + '%' : '0%';
    };
    document.addEventListener('scroll', updateBar, { passive: true });
    updateBar();
  }

  const clockEl = document.querySelector('#hudClock');
  if (clockEl) {
    const tick = () => {
      const now = new Date();
      clockEl.textContent = now.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    };
    tick();
    setInterval(tick, 1000);
  }
}

/* ---------------------------------------------------------
   3. Mobile navigation toggle
--------------------------------------------------------- */
function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

/* ---------------------------------------------------------
   4. Typing effect for the homepage welcome message
--------------------------------------------------------- */
function initTypingEffect() {
  const el = document.querySelector('[data-typed]');
  if (!el) return;
  const fullText = el.getAttribute('data-typed');
  const cursor = document.createElement('span');
  cursor.className = 'cur';
  el.textContent = '';
  el.appendChild(cursor);

  if (reducedMotion()) {
    el.textContent = fullText;
    return;
  }

  let i = 0;
  function type() {
    if (i <= fullText.length) {
      el.textContent = fullText.slice(0, i);
      el.appendChild(cursor);
      i++;
      setTimeout(type, 16);
    }
  }
  type();
}

/* ---------------------------------------------------------
   5. Scroll-triggered reveal for .reveal elements
--------------------------------------------------------- */
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  if (reducedMotion() || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('in-view'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  items.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   6. Animated stat counters (count up when scrolled into view)
--------------------------------------------------------- */
function initCounters() {
  const nums = document.querySelectorAll('[data-count-to]');
  if (!nums.length) return;

  const animate = (el) => {
    const target = parseFloat(el.getAttribute('data-count-to'));
    const suffix = el.getAttribute('data-suffix') || '';
    if (reducedMotion()) {
      el.textContent = target + suffix;
      return;
    }
    const duration = 1100;
    const start = performance.now();
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      el.textContent = value + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };

  if (!('IntersectionObserver' in window)) {
    nums.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  nums.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   7. Skill / certification progress bars — animate fill on view
--------------------------------------------------------- */
function initSkillFills() {
  const fills = document.querySelectorAll('[data-fill-to]');
  if (!fills.length) return;

  const apply = (el) => {
    el.style.width = el.getAttribute('data-fill-to') + '%';
  };

  if (reducedMotion() || !('IntersectionObserver' in window)) {
    fills.forEach(apply);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          apply(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  fills.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   8. Projects page filter buttons
--------------------------------------------------------- */
function initProjectFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('[data-tags]');
  if (!buttons.length || !cards.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      cards.forEach((card) => {
        const tags = card.getAttribute('data-tags').split(' ');
        const show = filter === 'all' || tags.includes(filter);
        card.classList.toggle('filtered-out', !show);
      });
    });
  });
}

/* ---------------------------------------------------------
   9. Audio log — show a text fallback if the file is missing
--------------------------------------------------------- */
function initAudioFallback() {
  const audio = document.querySelector('#introAudio');
  const fallback = document.querySelector('#audioFallback');
  if (!audio || !fallback) return;
  audio.addEventListener('error', () => fallback.classList.add('show'));
}

/* ---------------------------------------------------------
   10. Academic Planner
   Tasks stored as an array of objects in localStorage.
   Each task now also carries a priority level.
--------------------------------------------------------- */
const PLANNER_KEY = 'aj_academic_planner_tasks';

function loadTasks() {
  try {
    const raw = localStorage.getItem(PLANNER_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Could not read saved tasks:', err);
    return [];
  }
}

function saveTasks(tasks) {
  try {
    localStorage.setItem(PLANNER_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Could not save tasks:', err);
  }
}

function initPlanner() {
  const form = document.querySelector('#plannerForm');
  const list = document.querySelector('#taskList');
  const emptyState = document.querySelector('#taskEmpty');
  const summary = document.querySelector('#plannerSummary');
  const input = document.querySelector('#taskInput');
  const dueInput = document.querySelector('#taskDue');
  const priorityInput = document.querySelector('#taskPriority');

  if (!form || !list) return; // not on the planner page

  let tasks = loadTasks();

  function render() {
    list.innerHTML = '';
    emptyState.style.display = tasks.length === 0 ? 'block' : 'none';

    tasks.forEach((task) => {
      const li = document.createElement('li');
      li.className = 'task-item' + (task.done ? ' done' : '');
      li.dataset.id = task.id;
      li.dataset.priority = task.priority || 'medium';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-checkbox';
      checkbox.checked = task.done;
      checkbox.setAttribute('aria-label', 'Mark task as completed');
      checkbox.addEventListener('change', () => toggleTask(task.id));

      const text = document.createElement('span');
      text.className = 'task-text';
      text.textContent = task.text;

      const priorityTag = document.createElement('span');
      priorityTag.className = 'task-priority-tag';
      priorityTag.textContent = task.priority || 'medium';

      const meta = document.createElement('span');
      meta.className = 'task-meta';
      meta.textContent = task.due ? `due ${task.due}` : 'no due date';

      const del = document.createElement('button');
      del.type = 'button';
      del.className = 'task-delete';
      del.textContent = 'Delete';
      del.addEventListener('click', () => deleteTask(task.id));

      li.appendChild(checkbox);
      li.appendChild(text);
      li.appendChild(priorityTag);
      li.appendChild(meta);
      li.appendChild(del);
      list.appendChild(li);
    });

    const completed = tasks.filter((t) => t.done).length;
    summary.textContent = `${completed}/${tasks.length} task(s) completed`;
  }

  function addTask(text, due, priority) {
    tasks.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text,
      due,
      priority,
      done: false,
    });
    saveTasks(tasks);
    render();
  }

  function toggleTask(id) {
    tasks = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
    saveTasks(tasks);
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter((t) => t.id !== id);
    saveTasks(tasks);
    render();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) {
      input.focus();
      return;
    }
    addTask(value, dueInput.value, priorityInput.value);
    form.reset();
    input.focus();
  });

  render();
}

/* ---------------------------------------------------------
   11. Contact form validation
   - No field may be empty
   - Email must be a valid format
   - Phone must be a valid Nigerian number
--------------------------------------------------------- */
function initContactForm() {
  const form = document.querySelector('#contactForm');
  if (!form) return;

  const status = document.querySelector('#formStatus');
  const fields = {
    name: form.querySelector('#name'),
    email: form.querySelector('#email'),
    phone: form.querySelector('#phone'),
    message: form.querySelector('#message'),
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const ngPhonePattern = /^(?:\+234|0)[789]\d{9}$/;

  function setError(field, message) {
    const errorEl = document.querySelector(`[data-error-for="${field}"]`);
    if (errorEl) errorEl.textContent = message;
  }

  function clearErrors() {
    Object.keys(fields).forEach((key) => setError(key, ''));
  }

  function validate() {
    clearErrors();
    let valid = true;

    if (!fields.name.value.trim()) {
      setError('name', 'Name is required.');
      valid = false;
    }

    const emailVal = fields.email.value.trim();
    if (!emailVal) {
      setError('email', 'Email address is required.');
      valid = false;
    } else if (!emailPattern.test(emailVal)) {
      setError('email', 'Enter a valid email address (e.g. name@example.com).');
      valid = false;
    }

    const phoneRaw = fields.phone.value.trim();
    const phoneVal = phoneRaw.replace(/[\s-]/g, '');
    if (!phoneRaw) {
      setError('phone', 'Phone number is required.');
      valid = false;
    } else if (!/^[0-9+]+$/.test(phoneVal)) {
      setError('phone', 'Phone number must contain digits only.');
      valid = false;
    } else if (!ngPhonePattern.test(phoneVal)) {
      setError('phone', 'Enter a valid Nigerian number, e.g. 08012345678 or +2348012345678.');
      valid = false;
    }

    if (!fields.message.value.trim()) {
      setError('message', 'Message cannot be empty.');
      valid = false;
    }

    return valid;
  }

  Object.values(fields).forEach((field) => {
    field.addEventListener('blur', validate);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const isValid = validate();
    status.classList.remove('show', 'success', 'error');

    if (!isValid) {
      status.textContent = 'Please fix the highlighted fields above.';
      status.classList.add('show', 'error');
      return;
    }

    status.textContent = `Thanks, ${fields.name.value.trim()}. Your message has been received and James will respond shortly.`;
    status.classList.add('show', 'success');
    form.reset();
  });
}
