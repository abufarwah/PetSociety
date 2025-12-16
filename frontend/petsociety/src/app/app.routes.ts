import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Signup } from './components/signup/signup';
import { Home } from './components/home/home';
import { PetSocietyPlus } from './components/PetSocietyPlus/pet-society-plus/pet-society-plus';
import { Adoption } from './components/adoption/adoption';
import { PostPetModalComponent } from'./components/post-pet-modal/post-pet-modal';
import { Community } from './components/community/community';
import { LostFoundComponent } from './components/lost-found/lost-found';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'signup', component: Signup },
  { path: 'PetSocietyPlus', component: PetSocietyPlus },
  { path: '', redirectTo: '/Home', pathMatch: 'full' },
  { path: 'Home', component: Home },
  { path: 'Adoption', component: Adoption },
  {path:  'PostPetModalComponent', component: PostPetModalComponent},
  { path: 'community', component: Community },
  { path: 'lost-found', component: LostFoundComponent },
];