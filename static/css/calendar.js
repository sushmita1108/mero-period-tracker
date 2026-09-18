const noteModal = document.querySelector('#note-modal');
const noteForm = document.querySelector('#date-note-form');
const noteInput = document.querySelector('#date-note');
const selectedNoteDate = document.querySelector('#selected-note-date');
const noteSaveStatus = document.querySelector('#note-save-status');
const closeNoteModal = document.querySelector('#close-note-modal');
const periodDaysInput = document.querySelector('#period-days');
const setPeriodStart = document.querySelector('#set-period-start');
const dateNotes = JSON.parse(localStorage.getItem('mero-cycle-date-notes') || '{}');
const cycleSettings = JSON.parse(localStorage.getItem('cycle-settings') || 'null') || { cycleLength: 28, periodLength: 5 };
let activeDate = '';

function displayDate(value) {
    return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

function refreshNoteMarkers() {
    document.querySelectorAll('[data-date]').forEach((day) => {
        day.classList.toggle('has-note', Boolean(dateNotes[day.dataset.date]));
        day.title = dateNotes[day.dataset.date] || 'Add a note';
    });
}

document.querySelectorAll('[data-date]').forEach((day) => {
    day.addEventListener('click', () => {
        activeDate = day.dataset.date;
        selectedNoteDate.textContent = displayDate(activeDate);
        noteInput.value = dateNotes[activeDate] || '';
        periodDaysInput.value = cycleSettings.periodLength || 5;
        noteModal.hidden = false;
        noteInput.focus();
    });
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
    localStorage.setItem('cycle-settings', JSON.stringify(cycleSettings));
    setPeriodStart.textContent = 'Period updated ✓';
    setPeriodStart.classList.add('saved');
    setTimeout(() => { noteModal.hidden = true; setPeriodStart.textContent = 'Use this date as period start'; setPeriodStart.classList.remove('saved'); }, 700);
});
refreshNoteMarkers();