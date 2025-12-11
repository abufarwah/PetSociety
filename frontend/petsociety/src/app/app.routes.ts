import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Signup } from './components/signup/signup';
<<<<<<< HEAD
import{Home}from './components/home/home';
export const routes: Routes = [
	{ path: 'login', component: Login },
	{ path: 'signup', component: Signup },
	{path:"", redirectTo:"/Home" , pathMatch:"full"},
	{path:'Home', component:Home}
=======
import { PetSocietyPlus } from './components/PetSocietyPlus/pet-society-plus/pet-society-plus';
export const routes: Routes = [
	{ path: 'login', component: Login },
	{ path: 'signup', component: Signup },
	{path : 'PetSocietyPlus', component:PetSocietyPlus },
>>>>>>> b3306279685c5fc8109495b6fcfc23e8db5e230f
];
