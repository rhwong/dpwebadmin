import React from 'react';
import Modal from 'react-modal';

import classNames from 'classnames';

import {
	InputGrid,
	Field,
	TextInput,
	IntegerInput,
	ReadOnly,
	CheckboxInput
} from '../../components/form.js';
import { ModalContent } from './modals.js';

import { formatFileSize,reformatSettings } from '../../api/format.js';
import { getSession, changeSession, changeUser } from '../../api/';


const MODAL_SMALL_STYLE = {
	content: {
		top: '20%',
		left: '50%',
		right: 'auto',
		bottom: 'auto',
		marginRight: '-50%',
		transform: 'translate(-50%, -50%)'
	}
}

const SessionInfo = ({session, openModal, vprops}) => {
	return <div>
		<InputGrid>
			<Field label="标题">
				<TextInput long {...vprops('title')} />
			</Field>
			<Field label="ID">
				<ReadOnly long value={session.id} />
			</Field>
			<Field label="别名">
				<ReadOnly value={session.alias} />
			</Field>
			<Field label="创建人">
				<ReadOnly value={session.founder} />
			</Field>
			<Field label="创建时间">
				<ReadOnly value={session.startTime} />
			</Field>
			<Field label="大小">
				<ReadOnly value={(session.size / (1024*1024)).toFixed(2) + " MB"} />
				/
				<ReadOnly value={(session.maxSize / (1024*1024)).toFixed(2) + " MB"} />
			</Field>
			<Field label="自动重置限制大小">
				<TextInput {...vprops('resetThreshold')} />
			</Field>
			<Field label="用户数量">
				<ReadOnly value={session.userCount} />
				/
				<IntegerInput {...vprops('maxUserCount')} />
			</Field>
			<Field>
				<CheckboxInput label="禁止新用户加入" {...vprops('closed')} />
				<CheckboxInput label="仅允许已注册用户加入" {...vprops('authOnly')} />
				<CheckboxInput label="无用户时保持开启" {...vprops('persistent')} />
				<CheckboxInput label="未成年人禁入标识(NSFW)" {...vprops('nsfm')} />
			</Field>
		</InputGrid>
		<p>
			<button onClick={e => openModal('setPassword')} className="button">{session.hasPassword ? "修改" : "设置"} 房间密码</button>
			<button onClick={e => openModal('setOpword')} className="button">{session.hasOpword ? "修改" : "设置"} 房管权限密码</button>
			<button onClick={e => openModal('terminate')} className="danger button">终止会话</button>
		</p>
	</div>
}

const UserListBox = ({sessionId, users, openModal}) => {
	function changeUserOp(user) {
		changeUser(sessionId, user.id, {op: !user.op});
	}

	return <div className="content-box">
		<h3>用户列表</h3>
		<table className="table">
			<thead>
				<tr>
					<th>ID</th>
					<th>名称</th>
					<th>IP</th>
					<th>身份标识</th>
					<th>状态</th>
					<th></th>
				</tr>
                </thead>
                <tbody>
					{users.map(u => <tr key={u.id} className={classNames({offline: !u.online})}>
						<td>{u.id}</td>
						<td>{u.name}</td>
						<td>{u.ip}</td>
						<td>{u.muted && "Muted"} {u.mod && "版主"} {u.op && "房管"}</td>
						<td>{u.online ? "在线" : "离线"}</td>
						<td>{u.online && <>
							{!u.mod && <button onClick={() => changeUserOp(u)} className="small button">{u.op ? "取消房管" : "设置房管"}</button>}
							<button onClick={() => openModal('message', {userName: u.name, userId: u.id})} className="small button">发送信息</button>
							<button onClick={() => openModal('kick', {userName: u.name, userId: u.id})} className="small danger button">踢出</button>
							</>}
						</td>
					</tr>)}
                </tbody>
        </table>
		<p>
			<button onClick={() => openModal('message')} className="button">广播信息</button>
		</p>
	</div>
}

const ListingsBox = ({listings}) => {
	return <div className="content-box">
		<h3>已推送的列表服务器</h3>
		<table className="table">
			<thead>
				<tr>
					<th>ID</th>
					<th>地址</th>
					<th>编码</th>
					<th>类型</th>
					<th></th>
				</tr>
                </thead>
                <tbody>
					{listings.map(l => <tr key={l.id}>
						<td>{l.id}</td>
						<td>{l.url}</td>
						<td>{l.roomcode}</td>
						<td>{l.private ? "私有" : "公开"}</td>
						<td>
							<button className="small danger button">取消推送</button>
						</td>
					</tr>)}
                </tbody>
        </table>
	</div>
}

export class SessionPage extends React.Component {
	state = {
		changed: {},
		modal: {
			active: null
		}
	}
	refreshTimer = null;
	debounceTimer = null;

	componentDidMount() {
		this.refreshList();
		this.timer = setInterval(this.refreshList, 10000);
	}

	componentWillUnmount() {
		clearInterval(this.timer);
		if(this.debounceTimer !== null) {
			clearTimeout(this.debounceTimer);
		}
	}

	refreshList = async () => {
		try {
			const session = await getSession(this.props.sessionId);
			this.setStateSession(session);
		} catch(e) {
			this.setState({error: e.toString()});
		}
	}

	setStateSession(session) {
		reformatSettings(session, {
			resetThreshold: formatFileSize,
		});

		this.setState({session, error: null});
	}

	updateSetting(key, value) {
		this.setState(d => ({
			session: {
				...d.session,
				[key]: value
			},
			changed: {
				...d.changed,
				[key]: value
			}
		}));

		if(this.debounceTimer !== null) {
			clearTimeout(this.debounceTimer);
		}

		this.debounceTimer = setTimeout(() => {
			this.updateSettings(this.state.session.id, this.state.changed);
			this.setState({changed: {}});
			this.debounceTimer = null;
		}, 1000);
	}

	async updateSettings(id, changed) {
		try {
			const session = await changeSession(id, changed);
			this.setStateSession(session);
		} catch(e) {
			this.setState({
				error: e.toString()
			});
		}
	}

	openModal = (dialog, opts={}) => {
		this.setState({
			modal: {
				...opts,
				active: dialog,
				sessionId: this.props.sessionId,
			}
		});
	}

	closeModal = () => {
		this.setState({
			modal: {
				active: null
			}
		});
	}

	render() {
		const { session, changed, error, modal } = this.state;
		const vprops = name => ({
			value: session[name],
			update: value => this.updateSetting(name, value),
			pending: changed[name] !== undefined
		});

		return <>
			<div className="content-box">
				<h2>会话</h2>
				{error && <p className="alert-box">{error}</p>}
				{session && <SessionInfo session={session} openModal={this.openModal} vprops={vprops} />}
			</div>
			{session &&
				<UserListBox sessionId={this.props.sessionId} users={session.users} openModal={this.openModal} />
			}
			{session &&
				<ListingsBox listings={session.listings} />
			}
			<Modal
				isOpen={modal.active !== null}
				onRequestClose={this.closeModal}
				style={MODAL_SMALL_STYLE}
			>
				<ModalContent modal={modal} closeFunc={this.closeModal} />
			</Modal>
		</>
	}
}

