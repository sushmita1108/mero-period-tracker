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
    const nextPeriod = addDays(lastPeriod, Number(cycleSettings.cycleLength || 28));
    const ovulation = addDays(nextPeriod, -14);
    return { lastPeriod, nextPeriod, fertileStart: addDays(ovulation, -5), fertileEnd: addDays(ovulation, 1) };
}

function dateLabel(date, withYear = false) {
    return date.toLocaleDateString(undefined, { month: withYear ? 'long' : 'short', day: 'numeric', ...(withYear ? { year: 'numeric' } : {}) });
}

function updateCycleMap() {
    const dates = cycleDates();
    document.querySelector('#calendar-cycle-length').textContent = Number(cycleSettings.cycleLength || 28);
    document.querySelector('#calendar-next-period').textContent = dateLabel(dates.nextPeriod, true);
    document.querySelector('#calendar-fertile-window').textContent = `${dateLabel(dates.fertileStart)} – ${dateLabel(dates.fertileEnd)}`;
    document.querySelector('#calendar-ovulation').textContent = dateLabel(addDays(dates.fertileEnd, -1), true);
}

function renderCalendar() {
    const year = displayedMonth.getFullYear();
    const month = displayedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingDays = (firstDay.getDay() + 6) % 7;
    const dates = cycleDates();
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
        if (currentDate >= dates.lastPeriod && currentDate < addDays(dates.lastPeriod, Number(cycleSettings.periodLength || 5))) element.classList.add('period');
        if (currentDate >= dates.fertileStart && currentDate <= dates.fertileEnd) element.classList.add('fertile');
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
    cycleSettings.lastPeriod = activeDate;
    cycleSettings.periodLength = Number(periodDaysInput.value) || 5;
    cycleSettings.cycleLength = Number(averageCycleInput.value) || 28;
    localStorage.setItem('cycle-settings', JSON.stringify(cycleSettings));
    renderCalendar();
    updateCycleMap();
    setPeriodStart.textContent = 'Period updated ✓';
    setPeriodStart.classList.add('saved');
    setTimeout(() => { noteModal.hidden = true; setPeriodStart.textContent = 'Use this date as period start'; setPeriodStart.classList.remove('saved'); }, 700);
});
previousMonth.addEventListener('click', () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
    renderCalendar();
});
nextMonth.addEventListener('click', () => {
    displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
    renderCalendar();
});
renderCalendar();