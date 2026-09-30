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

// Turns a server error body's `errors` into the form's own error object.
// fields maps each server field name to the key the form shows it under.
// Some errors are one message for the whole request ('Album not found'), and
// they, like an error on a field the form has no input for, go under `server`.
export const serverErrors = (errors, fields) => {
    if (typeof errors === 'string') return { server: errors };

    const mapped = {};
    for (const [field, message] of Object.entries(errors || {})) {
        mapped[fields[field] || 'server'] = message;
    }
    return mapped;
}

// What a thunk hands back when there is no usable response at all: the
// request never got an answer, or the answer was not our JSON
export const REQUEST_FAILED = { errors: 'Something went wrong. Please try again.' };

// GET one of our API routes. Resolves to the parsed body when the response is
// ok, and to { errors, status } when it is not, so a failed load is never
// dispatched into the store as if it were data. A request that got no
// response at all has status 0; it is caught here rather than left as an
// unhandled rejection inside a component's useEffect.
export const getJson = async (url) => {
    let status = 0;
    try {
        const response = await fetch(url);
        status = response.status;
        const body = await response.json();
        return response.ok ? body : { errors: body.errors || REQUEST_FAILED.errors, status };
    } catch {
        return { ...REQUEST_FAILED, status };
    }
};

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
