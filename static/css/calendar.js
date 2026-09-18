const noteModal = document.querySelector('#note-modal');
const noteForm = document.querySelector('#date-note-form');
const noteInput = document.querySelector('#date-note');
const selectedNoteDate = document.querySelector('#selected-note-date');
const noteSaveStatus = document.querySelector('#note-save-status');
const closeNoteModal = document.querySelector('#close-note-modal');
const dateNotes = JSON.parse(localStorage.getItem('mero-cycle-date-notes') || '{}');
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
refreshNoteMarkers();