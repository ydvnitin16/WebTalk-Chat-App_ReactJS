import { useEffect, useState } from "react";
import { searchUserByUsername } from "../services/user.api";

const useSearchUser = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [users, setUsers] = useState();
    const [searchUsername, setSearchUsername] = useState("");

    useEffect(() => {
        if (!searchUsername.trim()) {
            setUsers(null);
            setError(null);
            setLoading(false);
            return;
        }

        const searchUsers = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await searchUserByUsername(searchUsername);
                setUsers(data.users);
            } catch (err) {
                console.log(err.message);
                setError(err.message);
                setUsers(null)
                return null;
            } finally {
                setLoading(false);
            }
        };
        searchUsers();
    }, [searchUsername]);

    return { searchUsername, setSearchUsername, users, loading, error };
};

export default useSearchUser;
