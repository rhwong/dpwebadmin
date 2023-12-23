import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

import { getAccounts, createAccount, changeAccount, deleteAccount } from '../../api';
import {
        InputGrid,
        Field,
        TextInput,
        CheckboxInput
} from '../../components/form.js';

const AccountListTable = ({accounts, editAccountFunc, deleteAccountFunc}) => {
	return <table className="table">
		<thead>
			<tr>
				<th>用户名</th>
				<th>状态</th>
				<th>角色标志</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{accounts.map(a => <tr key={a.id}>
				<td>{a.username}</td>
				<td>{a.locked && 'Locked'}</td>
				<td>{a.flags}</td>
				<td>
					<button onClick={() => editAccountFunc(a)} className="small button">编辑</button>
					<button onClick={() => deleteAccountFunc(a.id)} className="small danger button">删除</button>
				</td>
			</tr>)}
		</tbody>
	</table>
}

const EditAccountModal = ({title, user, closeFunc}) => {
	const [form, setForm] = useState(user);
	const vprops = name => ({
		value: form[name],
		update: value => setForm({...form, [name]: value}),
		pending: false
	});

	async function saveAccount() {
		if(!form.username)
			return;

		let flags = [];
		if(form.mod)
			flags.push('版主');
		if(form.host)
			flags.push('房管');
		flags = flags.join(',');

		try {
			if(!user.id) {
				/* No user ID set: we're creating a new user */
				if(!form.password)
					return;

				await createAccount({
					username: form.username,
					password: form.password,
					locked: form.locked,
					flags: flags
				});

			} else {
				await changeAccount(user.id, {
					username: form.username,
					password: form.password,
					locked: form.locked,
					flags: flags
				});
			}
		} catch(e) {
			setForm({...form, error: e.toString()});
			return;
		}

		closeFunc(true);
	}

	return <>
		<h2>{title}</h2>
		{form.error && <p className="alert-box">{form.error}</p>}
		<InputGrid>
			<Field label="账户名称">
				<TextInput {...vprops('username')} />
			</Field>
			<Field label="密码">
				<TextInput {...vprops('password')} />
			</Field>
			<Field label="选项">
				<CheckboxInput label="锁定" {...vprops('locked')} />
				<CheckboxInput label="服务器管理员（版主）" {...vprops('mod')} />
				<CheckboxInput label="可以创建会话" {...vprops('host')} />
			</Field>
		</InputGrid>
		<p>
			<button onClick={saveAccount} className="button">保存</button>
			<button onClick={e => closeFunc(false)} className="button">取消</button>
		</p>
		</>
}

export default function() {
	const [accounts, setAccounts] = useState([]);
	const [error, setError] = useState(null);
	const [editing, setEditing] = useState(null);
	const [confirmDelete, setConfirmDelete] = useState(null);

	function refreshAccountList() {
		getAccounts().then(setAccounts).catch(setError);
	}

	useEffect(refreshAccountList, []);

	function addAccount() {
		setEditing({
			title: '创建新用户',
			user: {
				username: '',
				password: '',
				locked: false,
				mod: false,
				host: true
			}
		});
	}

	function editAccount(user) {
		setEditing({
			title: 'Edit ' + user.username,
			user: {
				id: user.id,
				username: user.username,
				password: '',
				locked: user.locked,
				mod: user.flags.indexOf('MOD')>=0,
				host: user.flags.indexOf('HOST')>=0
			}
		});
	}

	function removeAccount() {
		deleteAccount(confirmDelete).then(refreshAccountList).catch(e => setError(e.toString()));
		setConfirmDelete(null);
	}

	return <div className="content-box">
		<h2>账号管理</h2>
		{error && <p className="alert-box">{error}</p>}
		{accounts && <AccountListTable
			accounts={accounts}
			editAccountFunc={editAccount}
			deleteAccountFunc={setConfirmDelete}
			/>}
		<p><button onClick={addAccount} className="button">创建</button></p>
		<Modal
			isOpen={editing !== null}
			onRequestClose={() => setEditing(null)}
		>
			{editing && <EditAccountModal
				title={editing.title}
				user={editing.user}
				closeFunc={(needRefresh) => {
					setEditing(null);
					if(needRefresh)
						refreshAccountList()
					}}
				/>}
		</Modal>
		<Modal
			isOpen={confirmDelete !== null}
			onRequestClose={() => setConfirmDelete(null)}
		>
			<h2>真的删除吗?</h2>
			<p>
				<button onClick={removeAccount} className="danger button">删除</button>
				<button onClick={e => setConfirmDelete(null)} className="button">取消</button>
			</p>
		</Modal>
	</div>
}

