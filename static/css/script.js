const calendarDays = document.querySelector('#calendar-days');
const moodButtons = document.querySelectorAll('[data-mood]');
const saveButton = document.querySelector('#save-log');
const saveStatus = document.querySelector('#save-status');

const periodDays = new Set([1, 2, 3, 4, 5]);
const fertileDays = new Set([11, 12, 13, 14, 15, 16]);

for (let day = 1; day <= 30; day += 1) {
	const element = document.createElement('span');
	element.className = 'day';
	element.textContent = day;
	if (periodDays.has(day)) element.classList.add('period');
	if (fertileDays.has(day)) element.classList.add('fertile');
	if (day === 18) element.classList.add('today');
	calendarDays.appendChild(element);
}

for (let day = 1; day <= 2; day += 1) {
	const element = document.createElement('span');
	element.className = 'day muted';
	element.textContent = day;
	calendarDays.appendChild(element);
}

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
