import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';

import { getBanList, addBan, deleteBan } from '../../api';
import {
        InputGrid,
        Field,
        TextInput,
		IntegerInput
} from '../../components/form.js';

const BanListTable = ({bans, deleteBanFunc}) => {
	return <table className="table">
		<thead>
			<tr>
				<th>IP地址</th>
				<th>过期时间</th>
				<th>添加日期</th>
				<th>备注</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{bans.map(b => <tr key={b.id}>
				<td>{b.ip}{b.subnet > 0 ? ` / ${b.subnet}` : ''}</td>
				<td>{b.expires}</td>
				<td>{b.added}</td>
				<td>{b.comment}</td>
				<td>
					<button onClick={() => deleteBanFunc(b.id)} className="small danger button">删除</button>
				</td>
			</tr>)}
		</tbody>
	</table>
}

const AddBanModal = ({closeFunc}) => {
	const [form, setForm] = useState({
		'address': '',
		'subnet': '',
		'expires': '',
		'comment': ''
	});
	const [error, setError] = useState(null);

	const vprops = name => ({
		value: form[name],
		update: value => setForm({...form, [name]: value}),
		pending: false
	});

	async function saveBanEntry() {
		try {
			await addBan(form);
		} catch(e) {
			setError(e.toString());
			return;
		}

		closeFunc(true);
	}

	return <>
		<h2>添加一个新的封禁记录</h2>
		{error && <p className="alert-box">{error}</p>}
		<InputGrid>
			<Field label="IP地址">
				<TextInput {...vprops('ip')} />
			</Field>
			<Field label="子网掩码">
				<IntegerInput {...vprops('subnet')} />
			</Field>
			<Field label="过期时间">
				<TextInput {...vprops('expires')} />
			</Field>
			<Field label="备注">
				<TextInput long {...vprops('comment')} />
			</Field>
		</InputGrid>
		<p>
			<button onClick={saveBanEntry} className="button">添加</button>
			<button onClick={e => closeFunc(false)} className="button">取消</button>
		</p>
		</>
}

export default function() {
	const [bans, setBans] = useState([]);
	const [error, setError] = useState(null);
	const [editing, setEditing] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(null);

	function refreshBanList() {
		getBanList().then(setBans).catch(setError);
	}

	useEffect(refreshBanList, []);

	function removeBan() {
		deleteBan(confirmDelete).then(refreshBanList).catch(e => setError(e.toString()));
		setConfirmDelete(null);
	}

	return <div className="content-box">
		<h2>封禁记录</h2>
		{error && <p className="alert-box">{error}</p>}
		{bans && <BanListTable
			bans={bans}
			deleteBanFunc={setConfirmDelete}
			/>}
		<p><button onClick={e => setEditing(true)} className="button">添加</button></p>
		<Modal
			isOpen={editing}
			onRequestClose={() => setEditing(null)}
		>
			{editing && <AddBanModal
				closeFunc={(needRefresh) => {
					setEditing(false);
					if(needRefresh)
						refreshBanList()
					}}
				/>}
		</Modal>
		<Modal
			isOpen={confirmDelete !== null}
			onRequestClose={() => setConfirmDelete(null)}
		>
			<h2>确定要删除吗?</h2>
			<p>
				<button onClick={removeBan} className="danger button">删除</button>
				<button onClick={e => setConfirmDelete(null)} className="button">取消</button>
			</p>
		</Modal>
	</div>
}

