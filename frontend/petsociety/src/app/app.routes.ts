import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Signup } from './components/signup/signup';
import { PetSocietyPlus } from './components/PetSocietyPlus/pet-society-plus/pet-society-plus';
export const routes: Routes = [
	{ path: 'login', component: Login },
	{ path: 'signup', component: Signup },
	{path : 'PetSocietyPlus', component:PetSocietyPlus },
];
