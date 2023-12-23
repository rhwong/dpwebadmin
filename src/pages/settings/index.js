import React from 'react';

import {
	InputGrid,
	Caption,
	Field,
	TextInput,
	CheckboxInput
} from '../../components/form.js';

import * as API from '../../api';
import { formatTime, formatFileSize, formatDays, reformatSettings } from '../../api/format.js';

export default class extends React.Component {
	state = {
		settings: null,
		changed: {},
		fetching: false,
		error: null
	}

	debounceTimer = null;

	updateSetting(key, value) {
		this.setState(d => ({
			settings: {
				...d.settings,
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
			this.refreshSettings(this.state.changed);
			this.setState({changed: {}});
			this.debounceTimer = null;
		}, 1000);
	}

	async refreshSettings(update=null) {
		try {
			this.setState({fetching: true});

			let settings;
			if(update) {
				settings = await API.setServerSettings(update);
			} else {
				settings = await API.getServerSettings();
			}

			reformatSettings(settings, {
				idleTimeLimit: formatTime,
				clientTimeout: formatTime,
				logpurgedays: formatDays,
				sessionSizeLimit: formatFileSize,
				autoResetThreshold: formatFileSize
			});

			this.setState({
				settings,
				fetching: false,
				error: null
			});
		} catch(e) {
			this.setState({
				fetching: false,
				error: e.toString()
			});
		}

	}
	componentDidMount() {
		this.refreshSettings();
	}

	componentWillUnmount() {
		if(this.debounceTimer !== null) {
			clearTimeout(this.debounceTimer);
		}
	}

	render() {
		const settings = this.state.settings;

		let inputGrid = null;
		if(settings !== null) {
			const changed = this.state.changed;
			const vprops = name => ({
				value: settings[name],
				update: value => this.updateSetting(name, value),
				pending: changed[name] !== undefined
			});
			const abuseReportAvailable = settings['abusereport'] !== undefined;
			const extAuthAvailable = settings['extauth'] !== undefined;

			inputGrid = <InputGrid>
				<Caption>服务器</Caption>

				<Field label="服务器名称">
					<TextInput long {...vprops('serverTitle')} />
				</Field>
				<Field label="连接超时时间(unlimited为无限制)">
					<TextInput {...vprops('clientTimeout')} />
				</Field>
				<Field label="日志保留时间(forever为永久)">
					<TextInput {...vprops('logpurgedays')} />
				</Field>
				<Field>
					<CheckboxInput label="允许游客用户" {...vprops('allowGuests')} />
					<CheckboxInput label="允许任何人建立会话" {...vprops('allowGuestHosts')} />
				</Field>

				<Caption>会话</Caption>
				<Field label="欢迎语">
					<TextInput long {...vprops('welcomeMessage')} />
				</Field>
				<Field label="会话大小限制">
					<TextInput {...vprops('sessionSizeLimit')} />
				</Field>
				<Field label="默认自动重置阈值">
					<TextInput {...vprops('autoResetThreshold')} />
				</Field>
				<Field label="最大会话数量">
					<TextInput {...vprops('sessionCountLimit')} />
				</Field>
				<Field label="会话空闲超时(unlimited为无限制)">
					<TextInput {...vprops('idleTimeLimit')} />
				</Field>
				<Field>
					<CheckboxInput label="允许会话在没有用户的情况下持续存在" {...vprops('persistence')} />
					<CheckboxInput label="存档已终止的会话" {...vprops('archive')} />
					<CheckboxInput label="会话公告中不包括已登录用户的列表" {...vprops('privateUserList')} />
					<CheckboxInput label="允许用户使用自定义头像" {...vprops('customAvatars')} />
				</Field>

				<Caption>滥用报告</Caption>
				<Field>
					<CheckboxInput label="开启" enabled={abuseReportAvailable} {...vprops('abusereport')} />
				</Field>
				<Field label="Auth token">
					<TextInput long enabled={abuseReportAvailable} {...vprops('reporttoken')} />
				</Field>

				<Caption>外部认证</Caption>
				<Field>
					<CheckboxInput label="开启" enabled={extAuthAvailable} {...vprops('extauth')} />
				</Field>
				<Field label="验证密钥">
					<TextInput long enabled={extAuthAvailable} {...vprops('extauthkey')} />
				</Field>
				<Field label="社区组">
					<TextInput enabled={extAuthAvailable} {...vprops('extauthgroup')} />
				</Field>
				<Field>
					<CheckboxInput label="当无法访问用户验证服务器时允许访客登录" enabled={extAuthAvailable} {...vprops('extauthfallback')} />
					<CheckboxInput label="允许验证服务器验证管理员权限" enabled={extAuthAvailable} {...vprops('extauthmod')} />
					<CheckboxInput label="允许验证服务器验证房间管理" enabled={extAuthAvailable} {...vprops('extauthhost')} />
					<CheckboxInput label="使用验证服务器头像" enabled={extAuthAvailable} {...vprops('extAuthAvatars')} />
				</Field>
			</InputGrid>;
		}

		return <div className="content-box">
			<h2>服务器设置</h2>
			{this.state.error && <p className="alert-box">{this.state.error}</p>}
			{inputGrid}
		</div>;
	}
}

