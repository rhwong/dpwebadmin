import React, { useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import { changeSession, terminateSession, changeUser, kickUser } from '../../api';

/** Modal building blocks */
const ModalContext = React.createContext({});

const ModalHeader = ({children}) => <h2>{children}</h2>
const ModalButtons = ({children}) => <p>{children}</p>

const OkButton = ({label, func, children}) => {
	const ctx = useContext(ModalContext);
	function clickHandler() {
		// TODO disable button while processing
		func().then(ctx.closeFunc);
	}
	return <button onClick={clickHandler} className="danger button">{label}</button>
}

const CancelButton = ({label="取消"}) => {
	const ctx = useContext(ModalContext);
	return <button onClick={e => ctx.closeFunc()} className="button">{label}</button>
}


/** Modal dialogs */
function SetPasswordModal({targetSetting, title}) {
	const [passwd, setPasswd] = useState('');
	const ctx = useContext(ModalContext);

	function setPassword() {
		return changeSession(ctx.sessionId, { [targetSetting]: passwd });
	}

	return <>
		<ModalHeader>设置会话 {title}</ModalHeader>
		<input
			type="password" 
			className="input-text"
			onChange={e => setPasswd(e.target.value)}
			/>
		<ModalButtons>
			<OkButton func={setPassword} label="设置" />
			<CancelButton />
		</ModalButtons>
		</>
}

function TerminateSessionModal() {
	const ctx = useContext(ModalContext);
	const history = useHistory();

	async function terminate() {
		await terminateSession(ctx.sessionId);
		history.replace('/sessions/');
	}

	return <>
		<ModalHeader>终止会话</ModalHeader>
		<p>真的终止会话吗?</p>
		<ModalButtons>
			<OkButton func={terminate} label="确定终止" />
			<CancelButton />
		</ModalButtons>
		</>
}

function KickUserModal() {
	const ctx = useContext(ModalContext);

	async function kick() {
		await kickUser(ctx.sessionId, ctx.userId);
	}

	return <>
		<ModalHeader>踢出用户</ModalHeader>
		<p>真的踢出 {ctx.userName} 吗?</p>
		<ModalButtons>
			<OkButton func={kick} label="确定踢出" />
			<CancelButton />
		</ModalButtons>
		</>
}

function MessageModal() {
	const [message, setMessage] = useState('');
	const ctx = useContext(ModalContext);

	function sendMessage() {
		if(ctx.userId) {
			return changeUser(ctx.sessionId, ctx.userId, { message });
		} else {
			return changeSession(ctx.sessionId, { alert: message });
		}
	}

	return <>
		<ModalHeader>发送消息给 {ctx.userName || "所有人"}</ModalHeader>
		<input
			type="text" 
			className="input-text"
			style={{width: "600px"}}
			onChange={e => setMessage(e.target.value)}
			/>
		<ModalButtons>
			<OkButton func={sendMessage} label="发送" />
			<CancelButton />
		</ModalButtons>
		</>
}

export function ModalContent({modal, closeFunc}) {
	let m;
	switch(modal.active) {
	case 'setPassword': m = <SetPasswordModal targetSetting='password' title="密码" />; break;
	case 'setOpword': m = <SetPasswordModal targetSetting='opword' title="房管密码" />; break;
	case 'terminate': m = <TerminateSessionModal />; break;
	case 'message': m = <MessageModal />; break;
	case 'kick': m = <KickUserModal />; break;
	default: return null;
	}

	return <ModalContext.Provider value={{...modal, closeFunc}}>
		{m}
		</ModalContext.Provider>
}


