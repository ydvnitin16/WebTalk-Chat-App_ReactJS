import { useEffect } from 'react';
import Sidebar from '../components/bars/Sidebar.jsx';
import ChatBox from '../components/chat/ChatBox.jsx';
import ProfilePanel from '../components/profile/ProfilePanel.jsx';
import { UseContactStore } from '../stores/UseContactStore.jsx';
import VideoCall from './VideoCall.jsx';

const Chat = () => {
    const setContacts = UseContactStore((state) => state.setContacts);

    useEffect(() => {
        setContacts();
    }, []);

    return (
        <>
            <div className="flex flex-col md:flex-row h-screen bg-black md:px-2 py-2 font-sans relative">
                <Sidebar />

                <ChatBox />
                <VideoCall />
                {/* <VideoCallUI calleeName={"Nitin Yadav"}  /> */}
                {/* <OutgoingCallModal
                    calleeName="Nitin Yadav"
                    calleeAvatar="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?cs=srgb&dl=pexels-italo-melo-881954-2379004.jpg&fm=jpg"
                /> */}
                {/* <IncomingCallModal
                    callerName="Nitin Sharma"
                    callerAvatar="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?cs=srgb&dl=pexels-italo-melo-881954-2379004.jpg&fm=jpg"
                    onAccept={() => console.log('Call Accepted')}
                    onReject={() => console.log('Call Rejected')}
                /> */}

                <ProfilePanel />
            </div>
        </>
    );
};

export default Chat;
