const URL_PATTERN = /(https?:\/\/[^\s<>]*[^\s<>.,:;!?'")\]}])/;

export const splitLinks = (text: string) => text.split(URL_PATTERN);
