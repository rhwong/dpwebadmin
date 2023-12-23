import React, { useState, useEffect } from 'react';

import { getLogs } from '../../api';

const LogListTable = ({logs}) => {
	return <table className="table">
		<thead>
			<tr>
				<th>时间</th>
				<th>等级</th>
				<th>类型</th>
				<th>会话</th>
				<th>用户</th>
				<th>信息</th>
			</tr>
		</thead>
		<tbody>
			{logs.map((l,idx) => <tr key={idx}>
				<td>{l.timestamp}</td>
				<td>{l.level}</td>
				<td>{l.topic}</td>
				<td>{l.session}</td>
				<td>{l.user}</td>
				<td>{l.message}</td>
			</tr>)}
		</tbody>
	</table>
}

export default function() {
	const [logs, setLogs] = useState([]);
	const [error, setError] = useState(null);

	function fetchLogList() {
		getLogs().then(setLogs).catch(setError);
	}

	useEffect(fetchLogList, []);

	return <div className="content-box">
		<h2>服务器日志</h2>
		{error && <p className="alert-box">{error}</p>}
		{logs && <LogListTable
			logs={logs}
			/>}
	</div>
}	
