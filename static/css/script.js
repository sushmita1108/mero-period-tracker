const calendarDays = document.querySelector('#calendar-days');
const moodButtons = document.querySelectorAll('[data-mood]');
const saveButton = document.querySelector('#save-log');
const saveStatus = document.querySelector('#save-status');
const calendarMonth = document.querySelector('#calendar-month');
const previousMonth = document.querySelector('#previous-month');
const nextMonth = document.querySelector('#next-month');
const cycleModal = document.querySelector('#cycle-modal');
const cycleForm = document.querySelector('#cycle-form');
const updateCycleButton = document.querySelector('#update-cycle');
const closeCycleModal = document.querySelector('#close-cycle-modal');
const lastPeriodInput = document.querySelector('#last-period');
const cycleLengthInput = document.querySelector('#cycle-length');
const periodLengthInput = document.querySelector('#period-length');
const cycleSaveStatus = document.querySelector('#cycle-save-status');

const today = new Date();
let displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
const formatInputDate = (date) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};
const parseDate = (value) => new Date(`${value}T00:00:00`);
const addDays = (date, days) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const dateLabel = (date, withYear = false) => date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', ...(withYear ? { year: 'numeric' } : {}) });
const savedCycle = JSON.parse(localStorage.getItem('cycle-settings') || 'null');
const cycle = savedCycle || { lastPeriod: formatInputDate(addDays(today, -22)), cycleLength: 28, periodLength: 5 };

lastPeriodInput.value = cycle.lastPeriod;
cycleLengthInput.value = cycle.cycleLength;
periodLengthInput.value = cycle.periodLength;

function getCycleDates() {
	const lastPeriod = parseDate(cycle.lastPeriod);
	const nextPeriod = addDays(lastPeriod, Number(cycle.cycleLength));
	const ovulation = addDays(nextPeriod, -14);
	return { lastPeriod, nextPeriod, ovulation, fertileStart: addDays(ovulation, -5), fertileEnd: addDays(ovulation, 1) };
}

function sameDate(first, second) {
	return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth() && first.getDate() === second.getDate();
}

function updateCycleSummary() {
	const dates = getCycleDates();
	const cycleDay = Math.max(1, Math.floor((today - dates.lastPeriod) / 86400000) + 1) % Number(cycle.cycleLength) || Number(cycle.cycleLength);
	let phase = 'luteal phase';
	if (today >= dates.lastPeriod && today < addDays(dates.lastPeriod, Number(cycle.periodLength))) phase = 'period days';
	else if (today >= dates.fertileStart && today <= dates.fertileEnd) phase = 'fertile window';
	else if (today < dates.fertileStart) phase = 'follicular phase';
	document.querySelector('#period-count').textContent = `in ${Math.max(0, Math.ceil((dates.nextPeriod - today) / 86400000))} days`;
	document.querySelector('#phase-name').textContent = phase;
	document.querySelector('#next-period-date').textContent = dateLabel(dates.nextPeriod, true);
	document.querySelector('#cycle-day').textContent = cycleDay;
	document.querySelector('#cycle-orbit').setAttribute('aria-label', `Cycle day ${cycleDay} of ${cycle.cycleLength}`);
	document.querySelector('#timing-period').textContent = dateLabel(dates.nextPeriod, true);
	document.querySelector('#timing-fertile').textContent = `${dateLabel(dates.fertileStart)} – ${dateLabel(dates.fertileEnd)}`;
	document.querySelector('#timing-ovulation').textContent = dateLabel(dates.ovulation, true);
}

function renderCalendar() {
	const year = displayedMonth.getFullYear();
	const month = displayedMonth.getMonth();
	const firstDay = new Date(year, month, 1);
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const mondayFirstOffset = (firstDay.getDay() + 6) % 7;
	const monthName = displayedMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

	calendarMonth.textContent = monthName;
	calendarDays.replaceChildren();

	for (let offset = mondayFirstOffset - 1; offset >= 0; offset -= 1) {
		const element = document.createElement('span');
		element.className = 'day muted';
		element.textContent = new Date(year, month, -offset).getDate();
		calendarDays.appendChild(element);
	}

	const dates = getCycleDates();
	for (let day = 1; day <= daysInMonth; day += 1) {
		const element = document.createElement('span');
		element.className = 'day';
		element.textContent = day;
		const currentDate = new Date(year, month, day);
		if (currentDate >= dates.lastPeriod && currentDate < addDays(dates.lastPeriod, Number(cycle.periodLength))) element.classList.add('period');
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
}

renderCalendar();
updateCycleSummary();
previousMonth.addEventListener('click', () => {
	displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() - 1, 1);
	renderCalendar();
});
nextMonth.addEventListener('click', () => {
	displayedMonth = new Date(displayedMonth.getFullYear(), displayedMonth.getMonth() + 1, 1);
	renderCalendar();
});

updateCycleButton.addEventListener('click', () => { cycleModal.hidden = false; lastPeriodInput.focus(); });
closeCycleModal.addEventListener('click', () => { cycleModal.hidden = true; });
cycleModal.addEventListener('click', (event) => { if (event.target === cycleModal) cycleModal.hidden = true; });
cycleForm.addEventListener('submit', (event) => {
	event.preventDefault();
	cycle.lastPeriod = lastPeriodInput.value;
	cycle.cycleLength = Number(cycleLengthInput.value);
	cycle.periodLength = Number(periodLengthInput.value);
	localStorage.setItem('cycle-settings', JSON.stringify(cycle));
	displayedMonth = new Date(today.getFullYear(), today.getMonth(), 1);
	renderCalendar();
	updateCycleSummary();
	cycleSaveStatus.textContent = 'Cycle updated';
	setTimeout(() => { cycleModal.hidden = true; cycleSaveStatus.textContent = ''; }, 700);
});

moodButtons.forEach((button) => {
	button.addEventListener('click', () => {
		moodButtons.forEach((item) => item.classList.remove('selected'));
		button.classList.add('selected');
	});
});

saveButton.addEventListener('click', () => {
	const selectedMood = document.querySelector('[data-mood].selected');
	const note = document.querySelector('#note').value.trim();
	if (!selectedMood && !note) {
		saveStatus.textContent = 'Choose a mood or add a note first.';
		saveStatus.style.color = '#c98278';
		return;
	}
	localStorage.setItem('cycle-check-in', JSON.stringify({ mood: selectedMood ? selectedMood.dataset.mood : '', note, date: new Date().toISOString() }));
	saveStatus.textContent = 'Saved just now';
	saveStatus.style.color = '#69a282';
});

document.querySelector('#log-period').addEventListener('click', () => document.querySelector('#calendar').scrollIntoView({ behavior: 'smooth' }));
document.querySelector('#details-button').addEventListener('click', () => document.querySelector('#insights').scrollIntoView({ behavior: 'smooth' }));
