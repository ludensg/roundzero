// Define the isLeapYear function to check for leap years
const isLeapYear = (year) => new Date(year, 1, 29).getMonth() === 1;

// Helper function to validate date
function isValidDate(dateString) {
    const dateParts = dateString.split("-");
    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const day = parseInt(dateParts[2], 10);
    const dateObj = new Date(year, month, day);
    return dateObj.getFullYear() === year && dateObj.getMonth() === month && dateObj.getDate() === day;
}

// Calculate block info based on the current date
function calculateCurrentBlockInfo() {
    const startDate = new Date('2024-03-15');
    const currentDate = new Date();
    return calculateBlockInfo(currentDate.toISOString().split('T')[0], startDate);
}

// Function to calculate the start time of the next block
function getNextBlockStartTime(currentDate, daysUntilNextBlock) {
    const nextBlockDate = new Date(currentDate.getTime() + daysUntilNextBlock * 24 * 60 * 60 * 1000);
    nextBlockDate.setHours(0, 0, 0, 0); // Normalize to the start of the next block day
    return nextBlockDate;
}


// Main function adapted for web usage
function calculateBlockInfo(inputDateStr, startDate) {
    if (!isValidDate(inputDateStr)) {
        return "Invalid date input. Please enter a valid date in the format YYYY-MM-DD.";
    }

    const inputDate = new Date(inputDateStr);
    const oneDay = 24 * 60 * 60 * 1000; // Milliseconds in one day
    let daysDifference = Math.round((inputDate - startDate) / oneDay);

    const daysPerBlock = 10;
    const blocksPerMegaBlock = 36;
    const daysPerMegaBlock = daysPerBlock * blocksPerMegaBlock;

    let totalDaysFromEpoch = daysDifference;
    let megaBlock = Math.floor(totalDaysFromEpoch / daysPerMegaBlock) + (totalDaysFromEpoch >= 0 ? 1 : 0);
    let dayWithinMegaBlock = totalDaysFromEpoch % daysPerMegaBlock;
    if (dayWithinMegaBlock < 0) dayWithinMegaBlock += daysPerMegaBlock;

    let block = Math.floor(dayWithinMegaBlock / daysPerBlock) + 1;
    let miniBlock = dayWithinMegaBlock % daysPerBlock + 1;

    const daysUntilNextBlock = daysPerBlock - (dayWithinMegaBlock % daysPerBlock);

    // Calculate the start time of the next block
    const nextBlockStartTime = getNextBlockStartTime(inputDate, daysUntilNextBlock);

    return {
        date: inputDate.toDateString(),
        megaBlock: megaBlock,
        block: block,
        miniBlock: miniBlock,
        daysUntilNextBlock: daysUntilNextBlock,
        nextBlockStartTime: nextBlockStartTime
    };
}


// Function to update the countdown live
function updateCountdown(nextBlockStartTime) {
    const now = new Date();
    const timeDiff = nextBlockStartTime - now;

    // Calculate time components
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    // Update HTML
    const countdownDisplay = document.getElementById('countdown');
    countdownDisplay.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;

    // Update the countdown every second
    setTimeout(() => updateCountdown(nextBlockStartTime), 1000);
}

// Display function now also initiates countdown
function displayBlockInfo() {
    const info = calculateCurrentBlockInfo();
        document.getElementById('currentDate').innerText = info.date;
        document.getElementById('megaBlock').innerText = `${info.megaBlock}`;
        document.getElementById('block').innerText = `${info.block}`;
        document.getElementById('miniBlock').innerText = `${info.miniBlock}`;
        // The updateCountdown function already targets the countdown ID correctly.

    updateCountdown(info.nextBlockStartTime);
}

//document.getElementById('refreshButton').addEventListener('click', displayBlockInfo);

// Initial display
displayBlockInfo();
