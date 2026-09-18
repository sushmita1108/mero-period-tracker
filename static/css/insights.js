const today = new Date();
const savedCycle = JSON.parse(localStorage.getItem('cycle-settings') || 'null') || { lastPeriod: '', cycleLength: 28, periodLength: 5 };
const cycleLength = Number(savedCycle.cycleLength || 28);
const periodLength = Number(savedCycle.periodLength || 5);
const lastPeriod = savedCycle.lastPeriod ? new Date(`${savedCycle.lastPeriod}T00:00:00`) : new Date(today.getFullYear(), today.getMonth(), today.getDate() - 22);
const nextPeriod = new Date(lastPeriod.getFullYear(), lastPeriod.getMonth(), lastPeriod.getDate() + cycleLength);
const ovulation = new Date(nextPeriod.getFullYear(), nextPeriod.getMonth(), nextPeriod.getDate() - 14);
const cycleDay = Math.max(1, Math.floor((today - lastPeriod) / 86400000) + 1) % cycleLength || cycleLength;
let currentPhase = 'luteal';
if (cycleDay <= periodLength) currentPhase = 'menstrual';
else if (today < new Date(ovulation.getFullYear(), ovulation.getMonth(), ovulation.getDate() - 5)) currentPhase = 'follicular';
else if (today <= new Date(ovulation.getFullYear(), ovulation.getMonth(), ovulation.getDate() + 1)) currentPhase = 'ovulation';

const phaseLabels = { menstrual: ['Menstrual', 'Rest and reset'], follicular: ['Follicular', 'Fresh energy is growing'], ovulation: ['Ovulation', 'Bright and social'], luteal: ['Luteal', 'A time to slow and settle'] };
document.querySelector('#insight-cycle-length').textContent = `${cycleLength} days`;
document.querySelector('#insight-period-length').textContent = `${periodLength} days`;
document.querySelector('#insight-current-phase').textContent = phaseLabels[currentPhase][0];
document.querySelector('#insight-phase-tip').textContent = phaseLabels[currentPhase][1];
document.querySelector(`[data-phase="${currentPhase}"]`).classList.add('current-phase');

function restoreChoices(selector, storageKey, statusSelector) {
    const saved = localStorage.getItem(storageKey);
    const buttons = document.querySelectorAll(selector);
    buttons.forEach((button) => {
        if (button.dataset[storageKey === 'mero-cycle-craving' ? 'craving' : 'pattern'] === saved) button.classList.add('selected');
        button.addEventListener('click', () => {
            buttons.forEach((item) => item.classList.remove('selected'));
            button.classList.add('selected');
            localStorage.setItem(storageKey, button.dataset[storageKey === 'mero-cycle-craving' ? 'craving' : 'pattern']);
            document.querySelector(statusSelector).textContent = 'Saved for today';
        });
    });
}

restoreChoices('[data-craving]', 'mero-cycle-craving', '#craving-status');
restoreChoices('[data-pattern]', 'mero-cycle-mood-pattern', '#pattern-status');