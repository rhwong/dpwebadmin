import React from 'react';
import { Link } from "react-router-dom";

import { getUsers } from '../../api';

const UserListTable = ({users}) => {
	return <table className="table">
		<thead>
			<tr>
				<th>用户名称</th>
				<th>ID</th>
				<th>会话</th>
				<th>IP</th>
				<th>用户角色</th>
			</tr>
		</thead>
		<tbody>
			{users.map(u => <tr key={`${u.session}.${u.id}`}>
				<td>{u.name}</td>
				<td>{u.id}</td>
				<td><Link to={`/sessions/${u.session}`}>{u.session}</Link></td>
				<td>{u.ip}</td>
				<td>{u.mod && 'MOD'} {u.op && 'OP'}</td>
			</tr>)}
		</tbody>
	</table>
}

export default class extends React.Component {
	state = {}
	timer = null;

	componentDidMount() {
		this.refreshList();
		this.timer = setInterval(this.refreshList, 10000);
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}

	refreshList = async () => {
		try {
			const users = await getUsers();
			this.setState({users, error: null});
		} catch(e) {
			this.setState({error: e.toString()});
		}
	}

	render() {
		const { users, error } = this.state;
		return <div className="content-box">
			<h2>用户列表</h2>
			{error && <p className="alert-box">{error}</p>}
			{users && <UserListTable users={users} />}
		</div>
	}
}

