import React from 'react';

import { getStatus } from '../../api/';

export default class extends React.Component {
	state = {}
	timer = null;

	componentDidMount() {
		this.refreshStatus();
		this.timer = setInterval(this.refreshStatus, 10000);
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}

	refreshStatus = async () => {
		try {
			const status = await getStatus();
			this.setState({status, error: null});
		} catch(e) {
			this.setState({error: e.toString()});
		}
	}

	render() {
		const { error, status } = this.state;

		let content = null;
		if(status) {
			content = <>
				<p>服务器开启于 {status.started}</p>
				<p>地址: {status.ext_host}{status.ext_port !== 27750 ? `:${status.ext_port}` : ''}</p>
				<p>会话数量: {status.sessions} / {status.maxSessions}</p>
				<p>用户数量: {status.users}</p>
				</>;
		}

		return <div className="content-box">
			<h2>状态</h2>
			{error && <p className="alert-box">{error}</p>}
			{content}
			</div>
	}
}

