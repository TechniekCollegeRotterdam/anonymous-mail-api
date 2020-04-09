// Check if email is Gmail
const isGmail = (email) => {
    // eslint-disable-next-line no-useless-escape
    const regExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@gmail.com/;
    // Valid gmail address
    if (email.match(regExp))
        return true
    // Non valid gmail address
    else
        return false
}

// Check if empty
const isEmpty = (string) => {
    if (string.trim() === '')
        return true
    else
        return false
}

exports.validateSignUpData = (data) => {
    let errors = {}

    if (isEmpty(data.email))
        errors.email = 'Must not be empty'
    else if (!isGmail(data.email))
        errors.email = 'Must be a valid gmail address'

    if (isEmpty(data.password))
        errors.password = 'Must not be empty'
    else if (data.password.length > 32)
        errors.password = 'Must not be longer than 32 characters'

    if (isEmpty(data.username))
        errors.username = 'Must not be empty'

    return {
        errors,
        valid: Object.keys(errors).length === 0 ? true : false
    }
}

