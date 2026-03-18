import { create } from "zustand";

const UseCallStatus = create((set, get) => ({
    callStatus: {},

    setCallUser: (user) => {
        set({callStatus: {...get().callStatus, user: user}})
    },

    setCallStatus: (status) => {
        set({callStatus: {...get().callStatus, status: status}})
    },

}));

export { UseCallStatus };