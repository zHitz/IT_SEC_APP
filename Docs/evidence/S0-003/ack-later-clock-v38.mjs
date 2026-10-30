const simulated=Date.parse('2026-12-01T12:00:00.000Z');
Date.now=()=>simulated;
console.log('SIMULATED_CLOCK_ONLY',new Date(Date.now()).toISOString());
