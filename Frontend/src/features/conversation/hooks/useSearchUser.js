import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { searchUserByUsername } from "../services/user.api";
import { debounce } from "@/utils/debounce";

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
                console.log(searchUsername);
                const searchUserDebouncedFn = debounce(async (username) => {
                    const data = await searchUserByUsername(username);
                    setUsers(data.users);
                }, 400);
                searchUserDebouncedFn(searchUsername);
            } catch (err) {
                setError(err.message);
                setUsers(null);
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
