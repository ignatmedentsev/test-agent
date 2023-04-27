import { NgModule } from '@angular/core';
import type { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { MainGuard } from './guards/main.guard';
import { MainComponent } from './pages/main/main.component';
import { OrganizationInfoComponent } from './pages/organization-info/organization-info.component';
import { UpdateComponent } from './pages/update/update.component';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    canActivate: [MainGuard],
  },
  {
    path: 'organization-info',
    component: OrganizationInfoComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'update',
    component: UpdateComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
