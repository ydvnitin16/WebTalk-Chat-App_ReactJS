export const optimizeUrl = (url, size = "medium") => {
    if (!url || typeof url !== "string") return "";

    const transformations = {
        small: "w_100,h_100,c_fill,q_auto,f_auto",
        medium: "w_400,c_limit,q_auto,f_auto",
        large: "w_1000,c_limit,q_auto,f_auto",
    };

    const transformation = transformations[size] || transformations.medium;

    // Return non cloudinary urls without update
    if (!url.includes("/upload/")) {
        return url;
    }

    return url.replace("/upload/", `/upload/${transformation}/`);
};
