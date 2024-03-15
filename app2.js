document.getElementById('manifestoButton').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent the default download for now

    // Get the position of the hands
    const leftHand = document.querySelector('.left-hand');
    const rightHand = document.querySelector('.right-hand');

    const leftHandRect = leftHand.getBoundingClientRect();
    const rightHandRect = rightHand.getBoundingClientRect();

    // Calculate the position and length of the red string
    const stringStartX = leftHandRect.right; // Tip of the left hand
    const stringEndX = rightHandRect.left; // Tip of the right hand
    const stringLength = stringEndX - stringStartX;

    // Create the red string if it doesn't exist
    const handsContainer = document.getElementById('hands-container');
    let redString = document.querySelector('.red-string');

    if (!redString) {
        redString = document.createElement('div');
        redString.className = 'red-string';
        redString.style.position = 'absolute';
        redString.style.top = `${leftHandRect.top + leftHandRect.height / 2}px`; // Vertically center
        redString.style.left = `${stringStartX}px`;
        redString.style.width = `${stringLength}px`;
        redString.style.height = '2px';
        redString.style.backgroundColor = 'red';
        redString.style.zIndex = '10';
        handsContainer.appendChild(redString);
    }

    // Start the download manually
    setTimeout(() => {
        window.location.href = 'manifesto11.pdf';
    }, 1000); // Delay to allow animation to play
});
