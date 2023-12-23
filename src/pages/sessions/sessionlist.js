import React from 'react';
import {
  Link,
  useRouteMatch
} from "react-router-dom";

import { getSessions } from '../../api/';

const SessionTable = ({sessions}) => {
	const { path } = useRouteMatch();

	return <table className="table">
		<thead>
			<tr>
				<th>标题</th>
				<th>ID</th>
				<th>别名</th>
				<th>用户数量</th>
				<th>选项</th>
				<th>大小</th>
				<th>创建时间</th>
			</tr>
		</thead>
		<tbody>
			{sessions.map(s => <tr key={s.id}>
				<td><Link to={`${path}${s.id}`}>{s.title || "(untitled)"}</Link></td>
				<td><abbr title={s.id}>{s.id.substr(0, 8)}...</abbr></td>
				<td>{s.alias}</td>
				<td>{s.userCount} / {s.maxUserCount}</td>
				<td></td>
				<td>{(s.size / (1024 *1024)).toFixed(2)} MB</td>
				<td>{s.startTime}</td>
			</tr>)}
		</tbody>
	</table>
}

export class SessionListPage extends React.Component {
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
				const sessions = await getSessions();
				this.setState({sessions, error: null});
		} catch(e) {
				this.setState({error: e.toString()});
		}
	}

	render() {
		const { sessions, error } = this.state;
		return <div className="content-box">
			<h2>会话列表</h2>
			{error && <p className="alert-box">{error}</p>}
			{sessions && <SessionTable sessions={sessions} />}
		</div>
	}
}

