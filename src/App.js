import React from 'react';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	NavLink
} from "react-router-dom";

import LoginPage from './pages/login/';
import StatusPage from './pages/status/';
import SettingsPage from './pages/settings/';
import ListServerPage from './pages/listservers/';
import SessionsPage from './pages/sessions/';
import UsersPage from './pages/users/';
import BanListPage from './pages/bans/';
import AccountsPage from './pages/accounts/';
import LogsPage from './pages/logs/';

import './App.css';

function App() {
	return <Router basename={process.env.REACT_APP_BASENAME}>
		<header id="header">
			<nav>
				<h1>管理员控制台</h1>
				<ul>
					<li><NavLink exact to="/">状态</NavLink></li>
					<li><NavLink to="/settings/">服务器设置</NavLink></li>
					<li><NavLink to="/listservers/">列表白名单</NavLink></li>
					<li><NavLink to="/sessions/">会话列表</NavLink></li>
					<li><NavLink to="/users/">用户列表</NavLink></li>
					<li><NavLink to="/bans/">封禁记录</NavLink></li>
					<li><NavLink to="/accounts/">账号管理</NavLink></li>
					<li><NavLink to="/logs/">服务器日志</NavLink></li>
				</ul>
			</nav>
		</header>
		<section id="content">
			<Switch>
				<Route exact path="/"><StatusPage /></Route>
				<Route path="/login/"><LoginPage /></Route>
				<Route path="/settings/"><SettingsPage /></Route>
				<Route path="/listservers/"><ListServerPage /></Route>
				<Route path="/sessions/"><SessionsPage /></Route>
				<Route path="/users/"><UsersPage /></Route>
				<Route path="/bans/"><BanListPage /></Route>
				<Route path="/accounts/"><AccountsPage /></Route>
				<Route path="/logs/"><LogsPage /></Route>
			</Switch>
		</section>
	</Router>
}

export default App;
