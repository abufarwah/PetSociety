import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Signup } from './components/signup/signup';
import{Home}from './components/home/home';
export const routes: Routes = [
	{ path: 'login', component: Login },
	{ path: 'signup', component: Signup },
	{path:"", redirectTo:"/Home" , pathMatch:"full"},
	{path:'Home', component:Home}
];
