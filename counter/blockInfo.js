// ==============================
// BLOCK CONFIGURATION
// ==============================

// The block system starts on this calendar date.
const START_YEAR = 2024;
const START_MONTH_INDEX = 2; // March = 2 because JS months are 0-based
const START_DAY = 15;

// Locked display date for the block values
const LOCKED_YEAR = 2026;
const LOCKED_MONTH_INDEX = 2; // March
const LOCKED_DAY = 9;

// Exact text you asked to display
const LOCKED_DISPLAY_TEXT = "Locked at 14:00 CET March 9th, 2026";

// ==============================
// DATE HELPERS
// ==============================

// Create a date at LOCAL midnight.
// This avoids UTC conversion problems when showing the user's actual date.
function makeLocalDate(year, monthIndex, day) {
    return new Date(year, monthIndex, day, 0, 0, 0, 0);
}

// Return a copy of a Date normalized to LOCAL midnight.
function startOfLocalDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

// Difference in whole calendar days between two LOCAL dates.
function diffInLocalDays(laterDate, earlierDate) {
    const oneDay = 24 * 60 * 60 * 1000;
    const later = startOfLocalDay(laterDate);
    const earlier = startOfLocalDay(earlierDate);
    return Math.round((later - earlier) / oneDay);
}

// Nice local display for the current user.
function formatUserLocalDate(date) {
    return date.toLocaleDateString(undefined, {
        weekday: "short",
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

// ==============================
// BLOCK CALCULATION
// ==============================

function calculateBlockInfoFromDate(inputDate) {
    const startDate = makeLocalDate(START_YEAR, START_MONTH_INDEX, START_DAY);

    const daysPerBlock = 10;
    const blocksPerMegaBlock = 36;
    const daysPerMegaBlock = daysPerBlock * blocksPerMegaBlock;

    const totalDaysFromEpoch = diffInLocalDays(inputDate, startDate);

    let megaBlock = Math.floor(totalDaysFromEpoch / daysPerMegaBlock) + (totalDaysFromEpoch >= 0 ? 1 : 0);

    let dayWithinMegaBlock = totalDaysFromEpoch % daysPerMegaBlock;
    if (dayWithinMegaBlock < 0) {
        dayWithinMegaBlock += daysPerMegaBlock;
    }

    const block = Math.floor(dayWithinMegaBlock / daysPerBlock) + 1;
    const miniBlock = (dayWithinMegaBlock % daysPerBlock) + 1;

    return {
        megaBlock,
        block,
        miniBlock
    };
}

// ==============================
// DISPLAY
// ==============================

function displayBlockInfo() {
    // 1. Show the REAL current local date for the user opening the page
    const now = new Date();
    document.getElementById("currentDate").innerText = formatUserLocalDate(now);

    // 2. Freeze Mega-block / Block / Mini-block to the locked date
    const lockedDate = makeLocalDate(LOCKED_YEAR, LOCKED_MONTH_INDEX, LOCKED_DAY);
    const lockedInfo = calculateBlockInfoFromDate(lockedDate);

    document.getElementById("megaBlock").innerText = `${lockedInfo.megaBlock}`;
    document.getElementById("block").innerText = `${lockedInfo.block}`;
    document.getElementById("miniBlock").innerText = `${lockedInfo.miniBlock}`;

    // 3. Replace countdown with fixed lock text
    document.getElementById("countdown").innerText = LOCKED_DISPLAY_TEXT;
}

// Initial render
displayBlockInfo();