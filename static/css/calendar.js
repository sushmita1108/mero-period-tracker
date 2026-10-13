const noteModal = document.querySelector('#note-modal');
const calendarDays = document.querySelector('#standalone-calendar-days');
const calendarMonth = document.querySelector('#standalone-calendar-month');
const previousMonth = document.querySelector('#standalone-previous-month');
const nextMonth = document.querySelector('#standalone-next-month');
const noteForm = document.querySelector('#date-note-form');
const noteInput = document.querySelector('#date-note');
const selectedNoteDate = document.querySelector('#selected-note-date');
const noteSaveStatus = document.querySelector('#note-save-status');
const closeNoteModal = document.querySelector('#close-note-modal');
const periodDaysInput = document.querySelector('#period-days');
const averageCycleInput = document.querySelector('#average-cycle');
const setPeriodStart = document.querySelector('#set-period-start');
const setLastMonthPeriod = document.querySelector('#set-last-month-period');
const savedPeriodHint = document.querySelector('#saved-period-hint');
const dateNotes = JSON.parse(localStorage.getItem('mero-cycle-date-notes') || '{}');
const cycleSettings = JSON.parse(localStorage.getItem('cycle-settings') || 'null') || { cycleLength: 28, periodLength: 5 };
let activeDate = '';
const today = new Date();
let displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);

function parseDate(value) {
    return new Date(`${value}T00:00:00`);
}

function addDays(date, days) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function sameDate(first, second) {
    return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth() && first.getDate() === second.getDate();
}

function cycleDates() {
    const lastPeriod = parseDate(cycleSettings.lastPeriod || formatDate(addDays(today, -22)));
    const cycleLen = Number(cycleSettings.cycleLength || 28);
    const lastMonthPeriod = cycleSettings.lastMonthPeriod ? parseDate(cycleSettings.lastMonthPeriod) : addDays(lastPeriod, -cycleLen);
    const nextPeriod = addDays(lastPeriod, cycleLen);
    const ovulation = addDays(nextPeriod, -14);
    return {
        lastPeriod,
        lastMonthPeriod,
        nextPeriod,
        fertileStart: addDays(ovulation, -5),
        fertileEnd: addDays(ovulation, 1)
    };
}

function dateLabel(date, withYear = false) {
    return date.toLocaleDateString(undefined, { month: withYear ? 'long' : 'short', day: 'numeric', ...(withYear ? { year: 'numeric' } : {}) });
}

function updateCycleMap() {
    const dates = cycleDates();
    const cycleLen = Number(cycleSettings.cycleLength || 28);
    const cycleLenEl = document.querySelector('#calendar-cycle-length');
    const nextPeriodEl = document.querySelector('#calendar-next-period');
    const fertileWindowEl = document.querySelector('#calendar-fertile-window');
    const ovulationEl = document.querySelector('#calendar-ovulation');
    const lastMonthEl = document.querySelector('#calendar-last-month-period');

    if (cycleLenEl) cycleLenEl.textContent = cycleLen;
    if (nextPeriodEl) nextPeriodEl.textContent = dateLabel(dates.nextPeriod, true);
    if (fertileWindowEl) fertileWindowEl.textContent = `${dateLabel(dates.fertileStart)} – ${dateLabel(dates.fertileEnd)}`;
    if (ovulationEl) ovulationEl.textContent = dateLabel(addDays(dates.fertileEnd, -1), true);
    if (lastMonthEl) lastMonthEl.textContent = dateLabel(dates.lastMonthPeriod, true);
}

function updateSavedPeriodHint() {
    if (!savedPeriodHint) return;
    const dates = cycleDates();
    savedPeriodHint.textContent = `Last period: ${dateLabel(dates.lastPeriod, true)} · Last month: ${dateLabel(dates.lastMonthPeriod, true)}`;
}

function getDayStatus(currentDate) {
    const pLength = Number(cycleSettings.periodLength || 5);
    const cLength = Number(cycleSettings.cycleLength || 28);
    const baseDate = parseDate(cycleSettings.lastPeriod || formatDate(addDays(today, -22)));

    const periodStarts = new Set();
    if (cycleSettings.lastPeriod) periodStarts.add(cycleSettings.lastPeriod);
    if (cycleSettings.lastMonthPeriod) periodStarts.add(cycleSettings.lastMonthPeriod);
    if (Array.isArray(cycleSettings.periodDates)) {
        cycleSettings.periodDates.forEach(p => periodStarts.add(p));
    }

    // Project past cycles (including last month and prior) and future cycles
    for (let k = -6; k <= 6; k += 1) {
        periodStarts.add(formatDate(addDays(baseDate, k * cLength)));
    }

    for (const pStr of periodStarts) {
        const pDate = parseDate(pStr);
        if (currentDate >= pDate && currentDate < addDays(pDate, pLength)) {
            return { isPeriod: true, isFertile: false };
        }
    }

    for (const pStr of periodStarts) {
        const pDate = parseDate(pStr);
        const ovulation = addDays(pDate, -14);
        const fertileStart = addDays(ovulation, -5);
        const fertileEnd = addDays(ovulation, 1);
        if (currentDate >= fertileStart && currentDate <= fertileEnd) {
            return { isPeriod: false, isFertile: true };
        }
    }

    return { isPeriod: false, isFertile: false };
}

function renderCalendar() {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingDays = (firstDay.getDay() + 6) % 7;
    calendarMonth.textContent = displayedMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    calendarDays.replaceChildren();

    for (let offset = leadingDays - 1; offset >= 0; offset -= 1) {
        const element = document.createElement('span');
        element.className = 'day muted';
        element.textContent = new Date(year, month, -offset).getDate();
        calendarDays.appendChild(element);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        const currentDate = new Date(year, month, day);
        const element = document.createElement('button');
        element.type = 'button';
        element.className = 'day';
        element.dataset.date = formatDate(currentDate);
        element.textContent = day;
        const status = getDayStatus(currentDate);
        if (status.isPeriod) element.classList.add('period');
        if (status.isFertile) element.classList.add('fertile');
        if (sameDate(currentDate, today)) element.classList.add('today');
        calendarDays.appendChild(element);
    }

    const trailingDays = (7 - (calendarDays.children.length % 7)) % 7;
    for (let day = 1; day <= trailingDays; day += 1) {
        const element = document.createElement('span');
        element.className = 'day muted';
        element.textContent = day;
        calendarDays.appendChild(element);
    }
    refreshNoteMarkers();
}

function displayDate(value) {
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

function refreshNoteMarkers() {
    document.querySelectorAll('[data-date]').forEach((day) => {
        day.classList.toggle('has-note', Boolean(dateNotes[day.dataset.date]));
        day.title = dateNotes[day.dataset.date] || 'Add a note';
    });
}

calendarDays.addEventListener('click', (event) => {
    const day = event.target.closest('[data-date]');
    if (day) {
        activeDate = day.dataset.date;
        selectedNoteDate.textContent = displayDate(activeDate);
        noteInput.value = dateNotes[activeDate] || '';
        periodDaysInput.value = cycleSettings.periodLength || 5;
        averageCycleInput.value = cycleSettings.cycleLength || 28;
        updateSavedPeriodHint();
        noteModal.hidden = false;
        noteInput.focus();
    }
});

noteForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const note = noteInput.value.trim();
    if (note) dateNotes[activeDate] = note;
    else delete dateNotes[activeDate];
    localStorage.setItem('mero-cycle-date-notes', JSON.stringify(dateNotes));
    refreshNoteMarkers();
    noteSaveStatus.textContent = note ? 'Note saved' : 'Note removed';
    setTimeout(() => { noteModal.hidden = true; noteSaveStatus.textContent = ''; }, 650);
});

closeNoteModal.addEventListener('click', () => { noteModal.hidden = true; });
noteModal.addEventListener('click', (event) => { if (event.target === noteModal) noteModal.hidden = true; });

setPeriodStart.addEventListener('click', () => {
    const oldLastPeriod = cycleSettings.lastPeriod;
    if (oldLastPeriod && activeDate > oldLastPeriod) {
        cycleSettings.lastMonthPeriod = oldLastPeriod;
        const diffDays = Math.round((parseDate(activeDate) - parseDate(oldLastPeriod)) / 86400000);
        if (diffDays >= 20 && diffDays <= 45) {
            cycleSettings.cycleLength = diffDays;
            averageCycleInput.value = diffDays;
        }
    } else if (oldLastPeriod && activeDate < oldLastPeriod) {
        cycleSettings.lastMonthPeriod = activeDate;
    }
    cycleSettings.lastPeriod = activeDate;
    if (!cycleSettings.periodDates) cycleSettings.periodDates = [];
    if (!cycleSettings.periodDates.includes(activeDate)) cycleSettings.periodDates.push(activeDate);
    cycleSettings.periodLength = Number(periodDaysInput.value) || 5;
    cycleSettings.cycleLength = Number(averageCycleInput.value) || 28;
    localStorage.setItem('cycle-settings', JSON.stringify(cycleSettings));
    renderCalendar();
    updateCycleMap();
    updateSavedPeriodHint();
    setPeriodStart.textContent = 'Period saved to calendar ✓';
    setPeriodStart.classList.add('saved');
    setTimeout(() => { noteModal.hidden = true; setPeriodStart.textContent = 'Use this date as period start'; setPeriodStart.classList.remove('saved'); }, 700);
});

if (setLastMonthPeriod) {
    setLastMonthPeriod.addEventListener('click', () => {
        cycleSettings.lastMonthPeriod = activeDate;
        if (!cycleSettings.periodDates) cycleSettings.periodDates = [];
        if (!cycleSettings.periodDates.includes(activeDate)) cycleSettings.periodDates.push(activeDate);
        if (cycleSettings.lastPeriod) {
            const diffDays = Math.round((parseDate(cycleSettings.lastPeriod) - parseDate(activeDate)) / 86400000);
            if (diffDays >= 20 && diffDays <= 45) {
                cycleSettings.cycleLength = diffDays;
                averageCycleInput.value = diffDays;
            }
        }
        cycleSettings.periodLength = Number(periodDaysInput.value) || 5;
        localStorage.setItem('cycle-settings', JSON.stringify(cycleSettings));
        renderCalendar();
        updateCycleMap();
        updateSavedPeriodHint();
        setLastMonthPeriod.textContent = "Last month's period saved ✓";
        setLastMonthPeriod.classList.add('saved');
        setTimeout(() => {
            noteModal.hidden = true;
            setLastMonthPeriod.textContent = "Save as last month's period date";
            setLastMonthPeriod.classList.remove('saved');
        }, 700);
    });
}

previousMonth.addEventListener('click', () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
    renderCalendar();
});
nextMonth.addEventListener('click', () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
    renderCalendar();
});
renderCalendar();
updateCycleMap();