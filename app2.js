let currentTopLeftHand = '40%'; 
let currentTopRightHand = '40%'; 
const defaultTopR = currentTopRightHand;
const defaultTopL = currentTopLeftHand;

defaultW = 1366;
defaultL = 657;
let windowRatio = 1;
let tighterModifier = 1;

let XFactor = 30;
const defaultLFactor = XFactor * -1.3;
const defaultRFactor = XFactor * .6;
let LFactor = defaultLFactor;
let RFactor = defaultRFactor;
let actualR =  defaultRFactor;
let actualL =  defaultLFactor;

const screenWidth = window.innerWidth;

function adjustForScreenSize() {

    // Example breakpoint check - adjust values as necessary
    if (screenWidth < 768) { // For mobile devices
        XFactor = 15; // Smaller movement
        tighterModifier = 0.9; // Tighter movement
        // Adjust scale, position offsets, etc., as necessary for smaller screens
    } else { // For larger screens
        XFactor = 25;
        tighterModifier = 1;
        // Reset to default values for larger screens
    }

    // Recalculate factors based on adjusted XFactor and tighterModifier
    LFactor = defaultLFactor * tighterModifier;
    RFactor = defaultRFactor * tighterModifier;
    actualR = defaultRFactor;
    actualL = defaultLFactor;
}

// Initial adjustment
adjustForScreenSize();

// Adjust on window resize
window.addEventListener('resize', adjustForScreenSize);

function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

// Adjust on window resize with debounce
window.addEventListener('resize', debounce(adjustForScreenSize, 250));



document.querySelectorAll('.fancy-button').forEach(button => {
    button.addEventListener('mouseenter', function() {
        const newTop = this.getAttribute('data-top');
        // Update current top position for hands
        if(screenWidth > 768){

            currentTopLeftHand = newTop;
            currentTopRightHand = newTop;
        }

        actualL = (LFactor * tighterModifier * .4) ;
        actualR = (RFactor * tighterModifier * .01);
    });
    button.addEventListener('mouseleave', function() {
        // Reset positions
        //currentTopLeftHand = defaultTopL;
        //currentTopRightHand = defaultTopR;
        actualL = LFactor;
        actualR = RFactor;
    });
});

let hoverDelta = 0;
const hoverAmplitude = 5; // Max pixels to move up and down
const hoverSpeed = 0.025; // Speed of hover effect
const phaseOffset = Math.PI / 4; // Phase offset for the left hand

function updateHoverEffect() {
    hoverDelta += hoverSpeed;
    const fixOffset = -600;
    const baseHoverPosition = (Math.sin(hoverDelta) * hoverAmplitude) + fixOffset;

    const leftHand = document.querySelector('.left-hand');
    const rightHand = document.querySelector('.right-hand');


        if (leftHand) {
            leftHand.style.top = currentTopLeftHand; // Apply dynamic top value
            const leftEffectValue = `translateY(${baseHoverPosition}px)`;
            // Apply transform considering the new base position
            if (screenWidth >= 768) { // For mobile devices
                leftHand.style.transform = `translateX(${actualL}%) var(--hover-effect) ${leftEffectValue} 
                scale(40%)`; }
            else {
                leftHand.style.transform = `translateX(-55%) translateY(55%) var(--hover-effect) ${leftEffectValue} 
                scale(40%)`; 
            }
        }

        if (rightHand) {
            rightHand.style.top = currentTopRightHand; // Apply dynamic top value
            const rightEffectValue = `translateY(${baseHoverPosition}px) `;
            // Apply transform considering the new base position
            if (screenWidth <= 768) { // For mobile devices
                rightHand.style.transform = ` translateY(55%) var(--hover-effect) ${rightEffectValue} 
                translateX(45%) scale(40%)`;
            }
            else {
                rightHand.style.transform = `translateX(${actualR}%) var(--hover-effect) ${rightEffectValue} 
                translateX(${RFactor}%) scale(40%)`;
            }
        }

        else{}

        requestAnimationFrame(updateHoverEffect);
    
}


updateHoverEffect(); // Start the hover effect

