export const optimizeUrl = (url, size = "medium") => {
    const transformations = {
        small: "w_100,h_100,c_fill,q_auto,f_auto",
        medium: "w_400,c_limit,q_auto,f_auto",
        large: "w_1000,c_limit,q_auto,f_auto",
    };

    return url.replace("/upload/", `/upload/${transformations[size]}/`);
};
