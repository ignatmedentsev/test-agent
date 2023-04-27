import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

import { OrganizationInfoComponent } from './organization-info.component';

@NgModule({
  declarations: [
    OrganizationInfoComponent,
  ],
  imports: [
    MatListModule,
    MatButtonModule,
    CommonModule,
  ],
  providers: [],
})
export class OrganizationInfoModule { }
