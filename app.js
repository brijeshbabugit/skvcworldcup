// --- Configuration ---
const GOOGLE_SHEET_ID = '1vgi0F6iFLq2ACUHknp7_bF2-NxE6gxhY'; 
const CSV_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/export?format=csv`;
const SHEET_WEB_URL = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}`;

// --- Mock Data (Fallback if fetch fails) ---
const MOCK_LEADERBOARD = [
    { rank: 1, name: "SVP", points: 179.87, wonPredictions: 8, totalPredictions: 19 },
    { rank: 2, name: "Satheesh", points: 80.67, wonPredictions: 6, totalPredictions: 15 },
    { rank: 3, name: "Brijesh", points: 65.11, wonPredictions: 9, totalPredictions: 19 },
    { rank: 4, name: "Sheeba", points: 33.68, wonPredictions: 10, totalPredictions: 19 },
    { rank: 5, name: "Biju", points: 21.14, wonPredictions: 2, totalPredictions: 2 },
    { rank: 6, name: "Arun", points: 18.57, wonPredictions: 7, totalPredictions: 17 },
    { rank: 7, name: "jayasree", points: -2.75, wonPredictions: 9, totalPredictions: 19 },
    { rank: 8, name: "Suma", points: -2.98, wonPredictions: 4, totalPredictions: 6 },
    { rank: 9, name: "Balan", points: -15.56, wonPredictions: 4, totalPredictions: 18 },
    { rank: 10, name: "Adarsh", points: -42.86, wonPredictions: 1, totalPredictions: 4 },
    { rank: 11, name: "Vinayachandran", points: -60.00, wonPredictions: 1, totalPredictions: 5 },
    { rank: 12, name: "Vinod", points: -111.32, wonPredictions: 8, totalPredictions: 19 },
    { rank: 13, name: "Shejil", points: -128.46, wonPredictions: 7, totalPredictions: 18 },
    { rank: 14, name: "Rejani", points: -235.13, wonPredictions: 5, totalPredictions: 18 }
];

let leaderboardData = [];

// --- Initialize Lucide Icons ---
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    initApp();
});

function initApp() {
    initNavigation();
    initCountdown();
    initLeaderboard();
    initContactForm();
}

// --- Mobile Navigation Drawer ---
function initNavigation() {
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const mobileClose = document.querySelector('.mobile-drawer-close');
    const drawer = document.querySelector('.mobile-drawer');
    const drawerLinks = document.querySelectorAll('.mobile-link');

    const openDrawer = () => drawer.classList.add('open');
    const closeDrawer = () => drawer.classList.remove('open');

    mobileToggle.addEventListener('click', openDrawer);
    mobileClose.addEventListener('click', closeDrawer);
    drawerLinks.forEach(link => link.addEventListener('click', closeDrawer));
}

// --- Next Match Countdown ---
function initCountdown() {
    const daysEl = document.getElementById('days');
    if (!daysEl) return; // Countdown elements not present, exit cleanly

    const matchDate = new Date('2026-06-20T20:00:00Z').getTime();

    const updateTimer = () => {
        const now = new Date().getTime();
        const distance = matchDate - now;

        if (distance < 0) {
            const container = document.querySelector('.countdown-container');
            if (container) {
                container.innerHTML = `
                    <div style="grid-column: span 4; font-family: var(--font-heading); font-weight:700; color: var(--color-gold); font-size:1.25rem;">
                        MATCH IN PROGRESS / FINISHED
                    </div>
                `;
            }
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    };

    updateTimer();
    setInterval(updateTimer, 1000);
}

// --- Leaderboard Integration ---
async function initLeaderboard() {
    const table = document.getElementById('leaderboard-table');
    const loading = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    const retryBtn = document.getElementById('retry-btn');
    const searchInput = document.getElementById('player-search');
    const sheetLink = document.getElementById('sheet-link');

    sheetLink.href = SHEET_WEB_URL;

    const loadData = async () => {
        loading.classList.remove('hidden');
        table.classList.add('hidden');
        errorState.classList.add('hidden');

        try {
            // Check if user has updated the placeholder ID
            if (GOOGLE_SHEET_ID === '1Z_Fk_O4l09cK6zZf1Qd27FvjGg-6P1v2s7r8d9o0m1s') {
                // Using mock data automatically if the ID is placeholder
                console.log("Using local mock leaderboard data. To connect your Google Sheet, update GOOGLE_SHEET_ID in app.js.");
                leaderboardData = [...MOCK_LEADERBOARD];
                // Simulate network latency for natural experience
                await new Promise(resolve => setTimeout(resolve, 800));
            } else {
                const response = await fetch(CSV_URL);
                if (!response.ok) throw new Error("Sheet fetching failed");
                const csvText = await response.text();
                leaderboardData = parseCSV(csvText);
            }

            renderLeaderboard(leaderboardData);
            loading.classList.add('hidden');
            table.classList.remove('hidden');
        } catch (err) {
            console.warn("Error fetching spreadsheet data, using mock fallback:", err);
            // Graceful fallback to mock data so the app always looks polished
            leaderboardData = [...MOCK_LEADERBOARD];
            renderLeaderboard(leaderboardData);
            loading.classList.add('hidden');
            table.classList.remove('hidden');
            
            // Add a small toast or inline notification indicating mock data fallback
            const sourceContainer = document.querySelector('.source-link-container');
            const alertText = document.createElement('span');
            alertText.style.cssText = "font-size:0.75rem; color:var(--text-muted); margin-right:1rem;";
            alertText.textContent = "⚠️ Showing offline data";
            if (!document.getElementById('offline-warn')) {
                alertText.id = 'offline-warn';
                sourceContainer.insertBefore(alertText, sheetLink);
            }
        }
    };

    retryBtn.addEventListener('click', loadData);
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const filtered = leaderboardData.filter(item => 
            item.name.toLowerCase().includes(query)
        );
        renderLeaderboard(filtered);
    });

    await loadData();
}

// Simple CSV Parser for Columns CX (101) and CY (102)
function parseCSV(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length <= 5) return [];

    const items = [];
    // Data rows start from line index 5
    for (let i = 5; i < lines.length; i++) {
        const cols = splitCSVLine(lines[i]);
        if (cols.length < 103) continue;

        const name = cols[102] || cols[1] || '';
        const trimmedName = name.trim();
        
        // Remove empty or summary rows
        if (!trimmedName || 
            trimmedName === 'Total Bets' || 
            trimmedName === 'Total Amount' || 
            trimmedName === 'Bet Won Count' || 
            trimmedName === 'Bet Won Amount' || 
            trimmedName === 'Name') {
            continue;
        }

        const rawPoints = cols[101];
        if (rawPoints === undefined || rawPoints === null || rawPoints.trim() === '') continue;

        const points = parseFloat(rawPoints) || 0;

        // Calculate won and total predictions
        let totalPredictions = 0;
        let wonPredictions = 0;

        // Column C (2) to Column CS (96) are the prediction columns
        for (let j = 2; j <= 96; j += 2) {
            if (cols[j] && cols[j].trim() !== '') {
                totalPredictions++;
            }
        }

        // Payout columns are at index j + 1 (3, 5, 7 ... 97)
        for (let j = 3; j <= 97; j += 2) {
            if (cols[j] && cols[j].trim() !== '') {
                const payout = parseFloat(cols[j]);
                if (payout > 0) {
                    wonPredictions++;
                }
            }
        }

        if (totalPredictions > 0) {
            items.push({ 
                name: trimmedName, 
                points, 
                wonPredictions, 
                totalPredictions 
            });
        }
    }

    // Sort items by points descending
    items.sort((a, b) => b.points - a.points);

    // Map ranks
    return items.map((item, idx) => ({
        rank: idx + 1,
        ...item
    }));
}

function splitCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

// Render Table Rows
function renderLeaderboard(data) {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 3rem;">
                    No predictors found.
                </td>
            </tr>
        `;
        return;
    }

    data.forEach(player => {
        const tr = document.createElement('tr');
        
        let rankContent = player.rank;
        if (player.rank === 1) rankContent = `<span class="rank-badge rank-1">1</span>`;
        else if (player.rank === 2) rankContent = `<span class="rank-badge rank-2">2</span>`;
        else if (player.rank === 3) rankContent = `<span class="rank-badge rank-3">3</span>`;

        // Generate Initials Avatar
        const initials = player.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

        // Color profit or loss differently
        const pointsVal = player.points.toFixed(2);
        const pointsClass = player.points >= 0 ? 'profit-pos' : 'profit-neg';
        const pointsSign = player.points > 0 ? '+' : '';

        tr.innerHTML = `
            <td class="col-rank">${rankContent}</td>
            <td>
                <div class="player-info">
                    <div class="player-avatar">${initials}</div>
                    <span class="player-name">${player.name}</span>
                </div>
            </td>
            <td class="col-wins">${player.wonPredictions} / ${player.totalPredictions}</td>
            <td class="col-points ${pointsClass}">${pointsSign}${pointsVal}</td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Contact Form Submission ---
function initContactForm() {
    const form = document.getElementById('query-form');
    const successMsg = document.getElementById('form-success');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Hide form inputs and show success message
        form.classList.add('hidden');
        successMsg.classList.remove('hidden');

        // Optional: Send data to an endpoint or just log it
        console.log("Contact form submitted:", {
            name: document.getElementById('form-name').value,
            email: document.getElementById('form-email').value,
            message: document.getElementById('form-message').value
        });
    });
}
