export interface UserProfileDto {
  name: string;
  email: string;
  memberSince: string;
  avatarInitial: string;
}

export interface AccountStatsDto {
  subscriptionsCount: number;
  adoptedCount: number;
}

export interface AdoptedPetDto {
  id: number;
  name: string;
  thumbnail: string;
  status: string;
}

export interface DashboardDto {
  user: UserProfileDto;
  stats: AccountStatsDto;
  adoptedPets: AdoptedPetDto[];
}
