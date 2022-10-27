const gpio = require("pi-pins");

// Configuration
const threashold = 5000;
const initialToggleTime = 500;
const minToggleTime = 100;
const toggleDelta = 30;
const ledPin = process.env.LED_PIN || 3;
const buttonPin = process.env.BUTTON_PIN || 2;

// Setup led and button
let led = gpio.connect(ledPin);
let button = gpio.connect(buttonPin);

led.mode('out');
button.mode('in');

// Initial values
let active = false;
let toggle = false;
led.value(toggle);
let pressTime = Date.now();
let timeout = null;

/**
 * Button presseed
 * Activate led and start alternating timer
 */
button.on('fall', function() {
    // If receiving pressed event when allready pressed
    if (timeout !== null)
        return;
    
    pressTime = Date.now();
    let toggleTime = reset(active);

    timeout = setTimeout(alternate, toggleTime, toggleTime);
    led.value(true);
    console.log('pressed');
});

/**
 * Button released
 */
button.on('rise', function () {
    reset();
    console.log('released');
    led.value(active);
});

/**
 * Cancel timer
 * @param {boolean} active current state 
 * @returns initial toggle time
 */
function reset(active) {
    clearTimeout(timeout);
    timeout = null;
    if (active)
        return minToggleTime;
    else
        return initialToggleTime;
}

/**
 * Change the length of time in current state
 * @param {int} toggleTime current length
 * @param {boolean} active current state
 * @returns the updated time
 */
function updateToggleTime(toggleTime, active) {
    if (active)
        toggleTime += toggleDelta;
    else
        toggleTime -= toggleDelta;

    if (toggleTime < minToggleTime)
        toggleTime = minToggleTime;
    else if (toggleTime > initialToggleTime)
        toggleTime = initialToggleTime;

    return toggleTime;
};

/**
 * Change led state or active state if button held long enough
 * @param {int} toggleTime current length
 * @returns nothing
 */
function alternate(toggleTime) {
    // Hold for long eough
    if (Date.now() > (pressTime + threashold)) {
        if (active) {
            console.log('deactivate');
            active = false;
        } else {
            console.log('activate');
            active = true;
        }
        
        led.value(active);
        clearTimeout(timeout);
        return;
    }

    // Blink led
    toggle = !toggle;
    led.value(toggle);
    toggleTime = updateToggleTime(toggleTime, active);
    timeout = setTimeout(alternate, toggleTime, toggleTime);
}

console.log('Gong Remote started');