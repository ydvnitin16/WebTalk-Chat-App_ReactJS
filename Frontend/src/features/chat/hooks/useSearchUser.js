import { useEffect, useState } from "react";
import { searchUserByUsername } from "../services/user.api";

const useSearchUser = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [user, setUser] = useState();
    const [searchUsername, setSearchUsername] = useState("");

    useEffect(() => {
        const searchUser = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await searchUserByUsername(searchUsername);
                console.log(data.user);
                setUser(data.user);
            } catch (err) {
                console.log(err.message);
                setError(err.message);
                setUser(null)
                return null;
            } finally {
                setLoading(false);
            }
        };
        searchUser();
    }, [searchUsername]);

    return { searchUsername, setSearchUsername, user, loading, error };
};

export default useSearchUser;
