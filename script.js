// DOM Elements
const fundNameInput = document.getElementById('fundName');
const monthlyInput = document.getElementById('monthlyInvestment');
const rateInput = document.getElementById('returnRate');
const yearsInput = document.getElementById('timePeriod');

const amountVal = document.getElementById('amountVal');
const rateVal = document.getElementById('rateVal');
const yearsVal = document.getElementById('yearsVal');

const investedDisplay = document.getElementById('investedDisplay');
const returnsDisplay = document.getElementById('returnsDisplay');
const totalDisplay = document.getElementById('totalDisplay');

const saveSipBtn = document.getElementById('saveSipBtn');
const portfolioBody = document.getElementById('portfolioBody');
const portfolioTotal = document.getElementById('portfolioTotal');

let sipChart;
let savedSips = JSON.parse(localStorage.getItem('mySips')) || [];

// Format currency in Indian Rupees
function formatINR(num) {
    return '₹ ' + Math.round(num).toLocaleString('en-IN');
}

// Calculate SIP Returns
function calculateSIP(monthly, rate, years) {
    const months = years * 12;
    const monthlyRate = rate / 12 / 100;
    const invested = monthly * months;
    
    // Standard SIP Formula: M = P × ({[1 + i]^n – 1} / i) × (1 + i)
    const totalValue = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const estReturns = totalValue - invested;

    return { invested, estReturns, totalValue };
}

// Update UI & Chart
function updateDashboard() {
    const monthly = parseFloat(monthlyInput.value);
    const rate = parseFloat(rateInput.value);
    const years = parseFloat(yearsInput.value);

    amountVal.textContent = formatINR(monthly);
    rateVal.textContent = rate + '%';
    yearsVal.textContent = years + (years === 1 ? ' Yr' : ' Yrs');

    const { invested, estReturns, totalValue } = calculateSIP(monthly, rate, years);

    investedDisplay.textContent = formatINR(invested);
    returnsDisplay.textContent = formatINR(estReturns);
    totalDisplay.textContent = formatINR(totalValue);

    updateChart(invested, estReturns);
}

// Initialize / Update Chart.js
function updateChart(invested, returns) {
    const ctx = document.getElementById('sipChart').getContext('2d');
    
    if (sipChart) {
        sipChart.destroy();
    }

    sipChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Invested Amount', 'Est. Returns'],
            datasets: [{
                data: [invested, returns],
                backgroundColor: ['#cbd5e1', '#00b386'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            },
            cutout: '70%'
        }
    });
}

// Render Saved Portfolio Table
function renderPortfolio() {
    portfolioBody.innerHTML = '';
    let totalMonthly = 0;

    if (savedSips.length === 0) {
        portfolioBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:#64748b;">No SIPs added yet. Use the calculator above to add one!</td></tr>`;
    }

    savedSips.forEach((sip, index) => {
        totalMonthly += sip.monthly;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${sip.name}</strong></td>
            <td>${formatINR(sip.monthly)}</td>
            <td>${sip.rate}%</td>
            <td>${sip.years} Yrs</td>
            <td class="green-text"><strong>${formatINR(sip.totalValue)}</strong></td>
            <td><button class="btn-delete" onclick="deleteSip(${index})">Remove</button></td>
        `;
        portfolioBody.appendChild(row);
    });

    portfolioTotal.textContent = `Total Monthly SIP: ${formatINR(totalMonthly)}`;
    localStorage.setItem('mySips', JSON.stringify(savedSips));
}

// Add SIP to Portfolio
saveSipBtn.addEventListener('click', () => {
    const name = fundNameInput.value.trim() || 'Mutual Fund SIP';
    const monthly = parseFloat(monthlyInput.value);
    const rate = parseFloat(rateInput.value);
    const years = parseFloat(yearsInput.value);
    const { totalValue } = calculateSIP(monthly, rate, years);

    savedSips.push({ name, monthly, rate, years, totalValue });
    renderPortfolio();
});

// Delete SIP
window.deleteSip = function(index) {
    savedSips.splice(index, 1);
    renderPortfolio();
};

// Event Listeners for Sliders
monthlyInput.addEventListener('input', updateDashboard);
rateInput.addEventListener('input', updateDashboard);
yearsInput.addEventListener('input', updateDashboard);

// Initial Load
updateDashboard();
renderPortfolio();
