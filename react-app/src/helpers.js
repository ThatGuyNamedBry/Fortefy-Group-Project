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

/************       Error Validation        ************/

//Image Validation
export const checkImageErrors = (url) => {
    const isValidUrl = urlString=> {
        try {
            return Boolean(new URL(urlString));
        }
        catch(e){
            return false;
        }
    }

    if (!isValidUrl(url)) {
        return 'Image URL must be a valid URL that starts with "https://"'
    } else if (!url.toLowerCase().endsWith('.png')
        && !url.toLowerCase().endsWith('.jpg')
        && !url.toLowerCase().endsWith('.jpeg')
        && !url.toLowerCase().endsWith('.gif')
        && !url.toLowerCase().endsWith('.bmp')
        && !url.toLowerCase().endsWith('.svg')
    ) {
        return 'Image URL must end in .jpg, .png, .gif, .bmp, .svg, or .jpeg';
    } else {
        return false;
    }
}

//Playlist Form
export const playlistValidation = (title, artUrl, description) => {
    const errors = { flag: false };
    if (!title.length) {
        errors.flag = true;
        errors.title = 'Playlist Name is required';
    } else if (title.length > 60) {
        errors.flag = true;
        errors.title = 'Name cannot exceed 60 characters';
    }

    if (artUrl && checkImageErrors(artUrl)) {
        errors.flag = true;
        errors.art = checkImageErrors(artUrl);
    }

    if (description.length > 254) {
        errors.flag = true;
        errors.description = 'Description cannot exceed 255 characters'
    }

    return errors;
}
