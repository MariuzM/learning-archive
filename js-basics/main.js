// ---------------------------------------------------------------------------
// Calc volume of sphere
// ---------------------------------------------------------------------------

function calc(a) {
    let rad = Math.abs(a);
    let vol = (4 / 3) * Math.PI * Math.pow(rad, 3);
    return vol;
};

console.log(calc(15));