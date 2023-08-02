//  Time Conversion
export const secsToHrs = (time) => {
    const hours = Math.floor(time / 3600);
    time = time - hours * 3600;

    const minutes = Math.floor(time / 60);
    return hours ? `${hours} hr ${minutes} min` : `${minutes} min`
}

export const secsToMins = (time) => {
    const minutes = Math.floor(time / 60);
    let seconds = Math.round(time - minutes * 60);

    if (seconds < 10) {
        seconds = `0${seconds}`
    };

    return `${minutes}:${seconds}`
}
