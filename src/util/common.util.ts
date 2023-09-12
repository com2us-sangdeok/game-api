export const randomString = () => {
    return Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
}

export const customUuid = () => {
    let date = new Date().getTime();
    const uuid = 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = (date + Math.random()*16)%16 | 0;
        date = Math.floor(date/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid
}
